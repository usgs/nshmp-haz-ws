package gov.usgs.earthquake.nshmp.www;

import static gov.usgs.earthquake.nshmp.www.ServletUtil.GSON;
import static java.lang.Math.log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.google.common.base.Enums;
import com.google.common.base.Throwables;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.usgs.earthquake.nshmp.calc.DataType;
import gov.usgs.earthquake.nshmp.calc.Site;
import gov.usgs.earthquake.nshmp.calc.ThreadCount;
import gov.usgs.earthquake.nshmp.eq.model.SourceType;
import gov.usgs.earthquake.nshmp.gmm.Gmm;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Status;

/**
 * AWS Lambda function to read in hazard results zip files from S3 and to create
 * CSV files of return periods of interest.
 */
@SuppressWarnings("unused")
public class HazardResultsSlicerLambda implements RequestStreamHandler {

  private static final int IMT_DIR_BACK_FROM_TOTAL = 2;
  private static final int IMT_DIR_BACK_FROM_SOURCE = 4;
  private static final int NUMBER_OF_HEADERS = 3;
  private static final String OUTPUT_DIR = "slices";
  private static final String RATE_FMT = "%.8e";

  @Override
  public void handleRequest(
      InputStream input,
      OutputStream output,
      Context context) throws IOException {
    LambdaHelper lambdaHelper = new LambdaHelper(input, output, context);
    String requestBucket = "";

    try {
      AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
      RequestData request = GSON.fromJson(lambdaHelper.requestJson, RequestData.class);
      requestBucket = request.bucket + "/" + request.file;
      lambdaHelper.logger.log("Request Data: " + GSON.toJson(request) + "\n\n");
      checkRequest(request);
      checkBucket(s3, request);
      Response response = processRequest(s3, lambdaHelper, request);
      output.write(GSON.toJson(response, Response.class).getBytes());
    } catch (Exception e) {
      lambdaHelper.logger.log("\nError: " + Throwables.getStackTraceAsString(e) + "\n\n");
      String message = Metadata.errorMessage(requestBucket, e, false);
      output.write(message.getBytes());
    }
  }

  private static Response processRequest(
      AmazonS3 s3,
      LambdaHelper lambdaHelper,
      RequestData request) throws IOException {
    S3Object object = s3.getObject(request.bucket, request.file);
    S3ObjectInputStream input = object.getObjectContent();
    ZipInputStream zipStream = new ZipInputStream(input);
    ZipEntry zipEntry;
    ExecutorService exec = Executors.newFixedThreadPool(ThreadCount.ALL.value());
    List<CompletableFuture<PutObjectResult>> futures = new ArrayList<>();
    String outputBucket = String.format("%s/%s", request.bucket, request.file.split(".zip")[0]);

    while ((zipEntry = zipStream.getNextEntry()) != null) {
      String name = zipEntry.getName();

      if (name.endsWith(Keys.CURVES_FILE)) {
        lambdaHelper.logger.log("Reading: " + name + "\n");
        HazardData hazardData = processCurveFile(request, name, zipStream);
        futures.add(writeResults(s3, lambdaHelper, request, hazardData, outputBucket, exec));
      }
    }

    input.abort();
    input.close();
    zipStream.close();
    futures.forEach(CompletableFuture::join);

    return new Response(request, outputBucket);
  }

  private static HazardData processCurveFile(
      RequestData request,
      String name,
      ZipInputStream zipStream) throws IOException {
    String[] names = name.split("/");
    String sourceType = names[names.length - IMT_DIR_BACK_FROM_TOTAL];
    HazardDataType<?> dataType = null;
    Imt imt = null;

    if (Enums.getIfPresent(SourceType.class, sourceType).isPresent()) {
      imt = Imt.valueOf(names[names.length - IMT_DIR_BACK_FROM_SOURCE]);
      SourceType type = SourceType.valueOf(sourceType);
      dataType = new HazardDataType<SourceType>(DataType.SOURCE, type);
    } else if (Enums.getIfPresent(Gmm.class, sourceType).isPresent()) {
      imt = Imt.valueOf(names[names.length - IMT_DIR_BACK_FROM_SOURCE]);
      Gmm type = Gmm.valueOf(sourceType);
      dataType = new HazardDataType<Gmm>(DataType.GMM, type);
    } else if (Enums.getIfPresent(Imt.class, sourceType).isPresent()) {
      Imt type = Imt.valueOf(sourceType);
      imt = type;;
      dataType = new HazardDataType<Imt>(DataType.TOTAL, type);
    } else {
      throw new RuntimeException("Source type [" + sourceType + "] not supported");
    }

    return readCurveFile(request, imt, dataType, zipStream, name);
  }

  private static HazardData readCurveFile(
      RequestData request,
      Imt imt,
      HazardDataType<?> dataType,
      ZipInputStream zipStream,
      String file) throws IOException {
    List<InterpolatedData> data = new ArrayList<>();
    BufferedReader reader = new BufferedReader(new InputStreamReader(zipStream));
    String line = reader.readLine();

    List<String> keys = Parsing.splitToList(line, Delimiter.COMMA);
    List<Double> imls = keys.subList(NUMBER_OF_HEADERS, keys.size())
        .stream()
        .map(iml -> Double.parseDouble(iml))
        .collect(Collectors.toList());
    keys = keys.subList(0, NUMBER_OF_HEADERS);

    while ((line = reader.readLine()) != null) {
      List<String> values = Parsing.splitToList(line, Delimiter.COMMA);
      List<Double> gms = values.subList(NUMBER_OF_HEADERS, values.size())
          .stream()
          .map(gm -> Double.parseDouble(gm))
          .collect(Collectors.toList());
      values = values.subList(0, NUMBER_OF_HEADERS);

      Site site = buildSite(keys, values);
      List<Double> interpolatedValues = request.slices.stream()
          .map(returnPeriod -> interpolate(imls, gms, returnPeriod))
          .collect(Collectors.toList());

      data.add(new InterpolatedData(site, interpolatedValues));
    }

    return new HazardData(imt, dataType, data);
  }

  private static Site buildSite(List<String> keys, List<String> values) {
    Double lat = null;
    Double lon = null;
    String name = null;

    for (int index = 0; index < keys.size(); index++) {
      String key = keys.get(index);
      String value = values.get(index);

      switch (key) {
        case Keys.LAT:
          lat = Double.parseDouble(value);
          break;
        case Keys.LON:
          lon = Double.parseDouble(value);
          break;
        case Keys.NAME:
          name = value;
          break;
        default:
          throw new IllegalStateException("Unsupported site key: " + key);
      }
    }

    return Site.builder()
        .location(lat, lon)
        .name(name)
        .build();
  }

  private static double interpolate(List<Double> xs, List<Double> ys, double returnPeriod) {
    int index = IntStream.range(0, ys.size())
        .filter(i -> ys.get(i) < returnPeriod)
        .findFirst()
        .orElse(-1);

    if (index <= 0) {
      return 0.0;
    }

    double x1 = xs.get(index - 1);
    double x2 = xs.get(index);
    double y1 = ys.get(index - 1);
    double y2 = ys.get(index);

    return x1 + (log(returnPeriod / y1) * (x2 - x1) / log(y2 / y1));
  }

  private static void checkRequest(RequestData request) {
    if (request.bucket == null) {
      throw new RuntimeException("Request does not contain a S3 bucket");
    }

    if (request.file == null) {
      throw new RuntimeException("Request does not contain a S3 file");
    }

    if (request.slices == null) {
      throw new RuntimeException("Request does not contain returnPeriods");
    }
  }

  private static void checkBucket(AmazonS3 s3, RequestData request) {
    if (!s3.doesBucketExistV2(request.bucket)) {
      throw new RuntimeException(String.format("S3 bucket [%s] does not exist", request.bucket));
    }

    if (!s3.doesObjectExist(request.bucket, request.file)) {
      throw new RuntimeException(String.format(
          "S3 file [%s] does not exist in bucket [%s]",
          request.file, request.bucket));
    }
  }

  private static CompletableFuture<PutObjectResult> writeResults(
      AmazonS3 s3,
      LambdaHelper lambdaHelper,
      RequestData request,
      HazardData hazardData,
      String outputBucket,
      ExecutorService exec) {
    StringBuilder builder = new StringBuilder();
    createHeaderString(builder, request);
    createDataString(builder, hazardData);

    Imt imt = hazardData.imt;
    HazardDataType<?> dataType = hazardData.dataType;
    String fileName = imt.name().equals(dataType.sourceType.name())
        ? imt.name()
        : String.format("%s-%s-%s", imt.name(), dataType.type.name(), dataType.sourceType.name());

    return CompletableFuture.supplyAsync(() -> {
      return s3.putObject(
          outputBucket,
          String.format("%s/%s/%s.csv", OUTPUT_DIR, imt.name(), fileName),
          builder.toString());
    }, exec);
  }

  private static void createDataString(StringBuilder builder, HazardData hazardData) {
    Function<Double, String> formatter = Parsing.formatDoubleFunction(RATE_FMT);

    hazardData.data.forEach(data -> {
      List<String> locData = Lists.newArrayList(
          data.site.name,
          String.format("%.5f", data.site.location.lon()),
          String.format("%.5f", data.site.location.lat()));
      builder.append(toLine(locData, data.values, formatter) + "\n");
    });
  }

  private static String toLine(
      Iterable<String> strings,
      Iterable<Double> values,
      Function<Double, String> formatter) {
    return Parsing.join(
        Iterables.concat(strings, Iterables.transform(values, formatter::apply)),
        Delimiter.COMMA);
  }

  private static void createHeaderString(StringBuilder builder, RequestData request) {
    Function<Double, String> formatter = Parsing.formatDoubleFunction(RATE_FMT);
    List<String> header = Lists.newArrayList(Keys.LON, Keys.LAT, Keys.NAME);
    builder.append(toLine(header, request.slices, formatter) + "\n");
  }

  private static class Keys {
    static final String LAT = "lat";
    static final String LON = "lon";
    static final String NAME = "name";
    static final String CURVES_FILE = "curves.csv";
  }

  private static class RequestData {
    String bucket;
    String file;
    List<Double> slices;
  }

  private static class HazardDataType<E extends Enum<E>> {
    final DataType type;
    final E sourceType;

    HazardDataType(DataType type, E sourceType) {
      this.type = type;
      this.sourceType = sourceType;
    }
  }

  private static class InterpolatedData {
    Site site;
    List<Double> values;

    InterpolatedData(Site site, List<Double> values) {
      this.site = site;
      this.values = values;
    }
  }

  private static class HazardData {
    final Imt imt;
    final HazardDataType<?> dataType;
    final List<InterpolatedData> data;

    HazardData(Imt imt, HazardDataType<?> dataType, List<InterpolatedData> data) {
      this.imt = imt;
      this.dataType = dataType;
      this.data = data;
    }
  }

  private static class Response {
    final String status;
    final String date;
    final RequestData request;
    final String outputBucket;
    final String slicesDirectory;

    Response(RequestData request, String outputBucket) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.request = request;
      this.outputBucket = outputBucket;
      this.slicesDirectory = OUTPUT_DIR;
    }
  }

  /**
   * Parse the Lambda function {@code InputStream} into an {@code JsonObject}.
   */
  private static class LambdaHelper {
    JsonObject requestJson;
    Context context;
    LambdaLogger logger;
    OutputStream output;

    LambdaHelper(InputStream input, OutputStream output, Context context)
        throws UnsupportedEncodingException {
      logger = context.getLogger();
      this.context = context;
      this.output = output;

      BufferedReader reader = new BufferedReader(new InputStreamReader(input));
      JsonParser parser = new JsonParser();

      requestJson = parser.parse(reader).getAsJsonObject();
    }
  }

}
