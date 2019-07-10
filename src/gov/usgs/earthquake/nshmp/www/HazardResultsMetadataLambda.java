package gov.usgs.earthquake.nshmp.www;

import static gov.usgs.earthquake.nshmp.www.HazardResultSliceLambda.MAP_FILE;
import static gov.usgs.earthquake.nshmp.www.ServletUtil.GSON;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.google.common.base.Enums;
import com.google.common.base.Throwables;

import gov.usgs.earthquake.nshmp.calc.DataType;
import gov.usgs.earthquake.nshmp.eq.model.SourceType;
import gov.usgs.earthquake.nshmp.gmm.Gmm;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.Util.LambdaHelper;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Status;

/**
 * AWS Lambda function to list all hazard results in the nshmp-hazout S3 bucket
 * that contain a map.csv file.
 */
@SuppressWarnings("unused")
public class HazardResultsMetadataLambda implements RequestStreamHandler {

  private static final int IMT_DIR_BACK_FROM_TOTAL = 2;
  private static final int IMT_DIR_BACK_FROM_SOURCE = 4;
  private static final String S3_BUCKET = "nshmp-hazout";
  private static final AmazonS3 S3 = AmazonS3ClientBuilder.defaultClient();

  @Override
  public void handleRequest(
      InputStream input,
      OutputStream output,
      Context context) throws IOException {
    LambdaHelper lambdaHelper = new LambdaHelper(input, output, context);

    try {
      Response response = processRequest();
      String json = GSON.toJson(response, Response.class);
      lambdaHelper.logger.log("Response: " + json + "\n");
      output.write(json.getBytes());
      output.close();
    } catch (Exception e) {
      lambdaHelper.logger.log("\nError: " + Throwables.getStackTraceAsString(e) + "\n\n");
      String message = Metadata.errorMessage("", e, false);
      output.write(message.getBytes());
    }
  }

  private static Response processRequest() {
    Set<String> users = getUsers();
    List<HazardListing> listing = listObjects();

    Result result = new Result(users, listing);
    return new Response(result);
  }

  private static List<HazardListing> listObjects() {
    ListObjectsV2Request request = new ListObjectsV2Request()
        .withBucketName(S3_BUCKET)
        .withDelimiter(MAP_FILE);
    ListObjectsV2Result s3Listing;
    List<HazardListing> hazardListing = new ArrayList<>();

    do {
      s3Listing = S3.listObjectsV2(request);
      s3Listing.getCommonPrefixes()
          .stream()
          .map(key -> keyToHazardListing(key))
          .forEach(listing -> hazardListing.add(listing));

      request.setContinuationToken(s3Listing.getNextContinuationToken());
    } while (s3Listing.isTruncated());

    return hazardListing;
  }

  private static HazardListing keyToHazardListing(String key) {
    List<String> keys = Parsing.splitToList(key, Delimiter.SLASH);
    HazardDataType<?> dataType = getDataType(keys);
    String user = keys.get(0);
    String path = keys.subList(1, keys.size() - 1)
        .stream()
        .collect(Collectors.joining("/"));

    return new HazardListing(user, S3_BUCKET, path, dataType);
  }

  private static Set<String> getUsers() {
    ListObjectsV2Request request = new ListObjectsV2Request()
        .withBucketName(S3_BUCKET)
        .withDelimiter("/");

    ListObjectsV2Result listing = S3.listObjectsV2(request);

    return listing.getCommonPrefixes().stream()
        .map(prefix -> prefix.replace("/", ""))
        .collect(Collectors.toCollection(TreeSet::new));
  }

  private static HazardDataType<?> getDataType(List<String> keys) {
    String sourceType = keys.get(keys.size() - IMT_DIR_BACK_FROM_TOTAL);
    HazardDataType<?> dataType = null;
    Imt imt = null;

    if (Enums.getIfPresent(SourceType.class, sourceType).isPresent()) {
      imt = Imt.valueOf(keys.get(keys.size() - IMT_DIR_BACK_FROM_SOURCE));
      SourceType type = SourceType.valueOf(sourceType);
      dataType = new HazardDataType<SourceType>(imt, DataType.SOURCE, type);
    } else if (Enums.getIfPresent(Gmm.class, sourceType).isPresent()) {
      imt = Imt.valueOf(keys.get(keys.size() - IMT_DIR_BACK_FROM_SOURCE));
      Gmm type = Gmm.valueOf(sourceType);
      dataType = new HazardDataType<Gmm>(imt, DataType.GMM, type);
    } else if (Enums.getIfPresent(Imt.class, sourceType).isPresent()) {
      Imt type = Imt.valueOf(sourceType);
      imt = type;
      dataType = new HazardDataType<Imt>(imt, DataType.TOTAL, type);
    } else {
      throw new RuntimeException("Source type [" + sourceType + "] not supported");
    }

    return dataType;
  }

  static class HazardDataType<E extends Enum<E>> {
    final Imt imt;
    final DataType type;
    final E sourceType;

    HazardDataType(Imt imt, DataType type, E sourceType) {
      this.imt = imt;
      this.type = type;
      this.sourceType = sourceType;
    }
  }

  private static class HazardListing {
    final String user;
    final String bucket;
    final String path;
    final String file;
    final HazardDataType<?> dataType;

    HazardListing(String user, String bucket, String path, HazardDataType<?> dataType) {
      this.user = user;
      this.bucket = bucket;
      this.path = path;
      this.file = MAP_FILE;
      this.dataType = dataType;
    }
  }

  private static class Result {
    final Set<String> users;
    final List<HazardListing> listing;

    Result(Set<String> users, List<HazardListing> listing) {
      this.users = users;
      this.listing = listing;
    }
  }

  private static class Response {
    final String status;
    final String date;
    final Result result;

    Response(Result result) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.result = result;
    }
  }
}
