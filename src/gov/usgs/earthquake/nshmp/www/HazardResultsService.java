package gov.usgs.earthquake.nshmp.www;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gov.usgs.earthquake.nshmp.calc.Site;
import gov.usgs.earthquake.nshmp.calc.ThreadCount;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Status;
import gov.usgs.earthquake.nshmp.www.meta.Util;

/**
 * Creates a WebSocket to read a zip file containing hazard results. <br>
 * 
 * Each message sent is a single curves.csv file in binary.
 *
 * @author Brandon Clayton
 */
@SuppressWarnings("unused")
@ServerEndpoint(value = "/hazard-results")
public class HazardResultsService {

  private static final Gson GSON;

  static {
    GSON = new GsonBuilder()
        .serializeNulls()
        .registerTypeAdapter(Site.class, new Util.SiteSerializer())
        .registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
        .create();
  }

  /**
   * Download a zip file from the url and send the curve files.
   * 
   * @param session The WebSocket session
   * @param url The url to the zip file to download
   * @throws IOException
   */
  @OnMessage
  public void onMessage(Session session, String url) throws IOException {
    try {
      RequestData requestData = new RequestData(url);
      processRequest(session, requestData);
      session.close();
    } catch (Exception e) {
      String message = Metadata.errorMessage(url, e, false);
      sendMessage(session, message, false);
    }
  }

  /**
   * Close the WebSocket session.
   * 
   * @param session The WebSocket session
   * @throws IOException
   */
  @OnClose
  public void onClose(Session session) throws IOException {
    session.close();
  }

  /**
   * Handle WebSocket errors.
   * 
   * @param session The WebSocket session
   * @param throwable The exception
   */
  @OnError
  public void onError(Session session, Throwable throwable) {
    String message = Metadata.errorMessage("", throwable, false);
    sendMessage(session, message, false);
  }

  private static void processRequest(
      Session session,
      RequestData requestData)
      throws IOException, InterruptedException, ExecutionException {
    HttpURLConnection connection = (HttpURLConnection) new URL(requestData.url)
        .openConnection();
    InputStream stream = connection.getInputStream();
    ZipInputStream zipStream = new ZipInputStream(stream);
    ZipEntry zipEntry;
    ExecutorService exec = Executors.newFixedThreadPool(ThreadCount.ALL.value());
    List<CompletableFuture<Void>> futures = new ArrayList<>();

    while ((zipEntry = zipStream.getNextEntry()) != null) {
      String name = zipEntry.getName();

      if (name.contains("csv")) {
        futures.add(processCurveFile(session, requestData, name, zipStream, exec));
      }
    }

    zipStream.close();
    futures.forEach(CompletableFuture::join);
    exec.shutdown();
  }

  private static void sendMessage(Session session, String message, boolean isBinary) {
    Basic remote = session.getBasicRemote();

    try {
      if (isBinary) {
        remote.sendBinary(ByteBuffer.wrap(message.getBytes()));
      } else {
        remote.sendText(message);
      }
    } catch (IOException e) {
      throw new RuntimeException(e.getMessage());
    }
  }

  private static CompletableFuture<Void> processCurveFile(
      Session session,
      RequestData requestData,
      String name,
      ZipInputStream zipStream,
      ExecutorService exec) throws IOException {
    String[] names = name.split("/");
    Imt imt = Imt.valueOf(names[names.length - 2]);
    HazardCurves curves = readCurveFile(imt, zipStream, name);
    Result result = new Result(requestData, curves);

    return CompletableFuture.supplyAsync(() -> {
      return GSON.toJson(result, Result.class);
    }, exec).thenAcceptAsync((json) -> {
      sendMessage(session, json, true);
    }, exec);
  }

  private static HazardCurves readCurveFile(
      Imt imt,
      ZipInputStream zipStream,
      String file) throws IOException {
    List<HazardData> hazardData = new ArrayList<>();
    BufferedReader reader = new BufferedReader(new InputStreamReader(zipStream));
    List<String> keys = null;
    List<Double> imls = null;
    List<Site> sites = new ArrayList<>();

    String line;
    int counter = 0;
    while ((line = reader.readLine()) != null) {
      if (counter++ == 0) {
        keys = Parsing.splitToList(line, Delimiter.COMMA);
        imls = keys.subList(3, keys.size())
            .stream()
            .map(iml -> Double.parseDouble(iml))
            .collect(Collectors.toList());
        keys = keys.subList(0, 3);
        continue;
      }

      List<String> values = Parsing.splitToList(line, Delimiter.COMMA);
      List<Double> gms = values.subList(3, values.size())
          .stream()
          .map(gm -> Double.parseDouble(gm))
          .collect(Collectors.toList());
      values = values.subList(0, 3);
      Site site = buildSite(keys, values);
      sites.add(site);

      hazardData.add(new HazardData(site, gms));
    }

    return new HazardCurves(imt, imls, hazardData);
  }

  private static Site buildSite(List<String> keys, List<String> values) {
    Double lat = null;
    Double lon = null;
    String name = null;

    for (int index = 0; index < keys.size(); index++) {
      String key = keys.get(index);
      String value = values.get(index);

      switch (key) {
        case "lon":
          lon = Double.parseDouble(value);
          break;
        case "lat":
          lat = Double.parseDouble(value);
          break;
        case "name":
          name = value;
          break;
        default:
          throw new IllegalStateException("Unsupported Key: " + key);
      }
    }

    return Site.builder()
        .location(lat, lon)
        .name(name)
        .build();
  }

  private static class RequestData {
    final String url;

    RequestData(String url) {
      this.url = url;
    }
  }

  private static class HazardData {
    final Site site;
    final List<Double> values;

    HazardData(Site site, List<Double> values) {
      this.site = site;
      this.values = values;
    }
  }

  private static class HazardCurves {
    final Imt imt;
    final List<Double> imls;
    final List<HazardData> data;

    HazardCurves(Imt imt, List<Double> imls, List<HazardData> data) {
      this.imt = imt;
      this.imls = imls;
      this.data = data;
    }
  }

  private static class Result {
    final String status;
    final String date;
    final RequestData request;
    final HazardCurves response;

    Result(RequestData request, HazardCurves response) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.request = request;
      this.response = response;
    }
  }

}
