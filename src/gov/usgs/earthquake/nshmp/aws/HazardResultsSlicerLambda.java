package gov.usgs.earthquake.nshmp.aws;

import static gov.usgs.earthquake.nshmp.www.ServletUtil.GSON;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import com.amazonaws.services.lambda.AWSLambda;
import com.amazonaws.services.lambda.AWSLambdaClientBuilder;
import com.amazonaws.services.lambda.model.InvokeRequest;
import com.amazonaws.services.lambda.model.InvokeResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectListing;
import com.google.common.base.Throwables;
import com.google.gson.JsonObject;

import gov.usgs.earthquake.nshmp.aws.Util.LambdaHelper;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.ServletUtil;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Status;

/**
 * AWS Lambda function to read in hazard results from S3 and to create slices of
 * return periods of interest.
 * 
 * @see HazardResultSliceLambda
 */
@SuppressWarnings("unused")
public class HazardResultsSlicerLambda implements RequestStreamHandler {

  static final String CURVES_FILE = "curves.csv";

  private static final String LAMBDA_CALL = "nshmp-haz-result-slice";
  private static final AmazonS3 S3 = AmazonS3ClientBuilder.defaultClient();
  private static final AWSLambda LAMBDA_CLIENT = AWSLambdaClientBuilder.defaultClient();

  @Override
  public void handleRequest(
      InputStream input,
      OutputStream output,
      Context context) throws IOException {
    LambdaHelper lambdaHelper = new LambdaHelper(input, output, context);
    String requestBucket = "";

    try {
      RequestData request = GSON.fromJson(lambdaHelper.requestJson, RequestData.class);
      requestBucket = String.format("%s/%s", request.bucket, request.key);
      lambdaHelper.logger.log("Request Data: " + GSON.toJson(request) + "\n\n");
      checkRequest(request);
      checkBucket(request);
      Response response = processRequest(lambdaHelper, request);
      output.write(GSON.toJson(response, Response.class).getBytes());
    } catch (Exception e) {
      lambdaHelper.logger.log("\nError: " + Throwables.getStackTraceAsString(e) + "\n\n");
      String message = Metadata.errorMessage(requestBucket, e, false);
      output.write(message.getBytes());
    }
  }

  private static Response processRequest(
      LambdaHelper lambdaHelper,
      RequestData request) throws IOException {
    ObjectListing objectListing = S3.listObjects(request.bucket, request.key);
    List<CompletableFuture<Void>> futures = new ArrayList<>();

    objectListing.getObjectSummaries()
        .parallelStream()
        .filter(summary -> summary.getKey().endsWith(CURVES_FILE))
        .forEach(summary -> {
          String name = summary.getKey();
          lambdaHelper.logger.log("Reading: " + name + "\n");
          try {
            futures.add(processCurveFile(request, lambdaHelper, name));
          } catch (IOException e) {
            throw new RuntimeException(e);
          }
        });

    futures.forEach(CompletableFuture::join);
    return new Response(request);
  }

  private static CompletableFuture<Void> processCurveFile(
      RequestData request,
      LambdaHelper lambdaHelper,
      String curvesPath) throws IOException {
    return readCurveFile(request, curvesPath)
        .thenAcceptAsync(result -> {
          try {
            Object object = GSON.fromJson(
                new String(result.getPayload().array(), "UTF-8"),
                Object.class);
            JsonObject json = GSON.toJsonTree(object).getAsJsonObject();
            String status = json.get("status").getAsString();
            if (Status.ERROR.toString().equals(status)) {
              throw new RuntimeException(json.get("message").getAsString());
            }
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
        });
  }

  private static CompletableFuture<InvokeResult> readCurveFile(
      RequestData request,
      String curvesPath) throws IOException {
    List<String> names = Arrays.stream(curvesPath.split("/"))
        .collect(Collectors.toList());
    names.remove(names.size() - 1);
    String key = Parsing.join(names, Delimiter.SLASH);

    HazardResultSliceLambda.RequestData lambdaRequest = HazardResultSliceLambda.RequestData
        .builder()
        .bucket(request.bucket)
        .key(key)
        .slices(request.slices)
        .build();

    InvokeRequest invokeRequest = new InvokeRequest()
        .withFunctionName(LAMBDA_CALL)
        .withPayload(GSON.toJson(lambdaRequest));

    return CompletableFuture.supplyAsync(() -> {
      return LAMBDA_CLIENT.invoke(invokeRequest);
    });
  }

  private static void checkRequest(RequestData request) {
    if (request.bucket == null) {
      throw new RuntimeException("Request does not contain a S3 bucket");
    }

    if (request.key == null) {
      throw new RuntimeException("Request does not contain a S3 key");
    }

    if (request.slices == null) {
      throw new RuntimeException("Request does not contain slices");
    }
  }

  private static void checkBucket(RequestData request) {
    if (!S3.doesBucketExistV2(request.bucket)) {
      throw new RuntimeException(String.format("S3 bucket [%s] does not exist", request.bucket));
    }
  }

  private static class RequestData {
    String bucket;
    String key;
    List<Double> slices;
  }

  private static class Response {
    final String status;
    final String date;
    final RequestData request;
    final String outputBucket;

    Response(RequestData request) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.request = request;
      this.outputBucket = String.format("%s/%s", request.bucket, request.key);
    }
  }

}
