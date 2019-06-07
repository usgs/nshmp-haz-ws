package gov.usgs.earthquake.nshmp.www;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.common.util.concurrent.MoreExecutors;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import gov.usgs.earthquake.nshmp.calc.Site;
import gov.usgs.earthquake.nshmp.calc.ThreadCount;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.meta.Status;
import gov.usgs.earthquake.nshmp.www.meta.Util;

@ServerEndpoint(value = "/hazard-socket")
public class HazardImportSocket {
  
  private static final Gson GSON;
  
  static {
    GSON = new GsonBuilder()
        .serializeNulls()
        .registerTypeAdapter(Site.class, new Util.SiteSerializer())
        .registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
        .create();
  }
  
  @OnOpen
  public void onOpen(Session session) throws IOException {
  }

  @OnMessage
  public void onMessage(Session session, String url) throws IOException {
    RequestData requestData = new RequestData(url);
    processRequest(session, requestData);
    session.close();
  }

  @OnClose
  public void onClose(Session session) throws IOException {
    session.close();
  }

  @OnError
  public void onError(Session session, Throwable throwable) {
  }
  
  private static void sendMessage(Session session, String message) {
    try {
      session.getBasicRemote().sendText(message);
    } catch(IOException e) {
      e.printStackTrace();
    }
  }
  
  private static void processRequest(Session session, RequestData requestData) throws IOException {
    HttpURLConnection connection = (HttpURLConnection) new URL(requestData.url)
        .openConnection();
    InputStream stream = connection.getInputStream();
    ZipInputStream zipStream = new ZipInputStream(stream);
    ZipEntry zipEntry;
    
    while ((zipEntry = zipStream.getNextEntry()) != null) {
      String name = zipEntry.getName();
      
      if (name.contains("csv")) {
        CompletableFuture.supplyAsync(() -> {
          try {
            String[] names = name.split("/");
            Imt imt = Imt.valueOf(names[names.length - 2]);
            System.out.println("imt: " + imt);
            return readCurveFile(imt, new ZipInputStream(zipStream), name);
          } catch (IOException e) {
            e.printStackTrace();
          }
          return null;
        }).thenApplyAsync((curves) -> {
          return new Result(requestData, curves);
        }).thenApplyAsync((result) -> {
          return GSON.toJson(result, Result.class);
        }).thenAcceptAsync((json) -> {
          sendMessage(session, json);
        });
        
//        HazardCurves curves = readCurveFile(imt, zipStream, name);
//        Result result = new Result(requestData, curves);
//        String json = GSON.toJson(result, Result.class);
//        sendMessage(session, json);
      }
    }
    
    zipStream.close();
  }
  
  private static HazardCurves readCurveFile(
      Imt imt,
      ZipInputStream zipStream,
      String file) throws IOException {
    List<HazardData> hazardData =  new ArrayList<>();
    BufferedReader reader = new BufferedReader(new InputStreamReader(zipStream));
    List<String> keys = null;
    List<Double> imls = null;
    List<Site> sites = new ArrayList<>();
    
    String line;
    int counter = 0;
    while((line = reader.readLine()) != null) {
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
      
      Double lat = null;
      Double lon = null;
      String name = null;
      
      for (int index = 0; index < keys.size(); index++) {
        String key = keys.get(index);
        String value = values.get(index);
        
        switch(key) {
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
      
      Site site = Site.builder()
          .location(lat, lon)
          .name(name)
          .build();
      
      sites.add(site);
      
      hazardData.add(new HazardData(site, gms));
    }
    
    return new HazardCurves(imt, imls, hazardData); 
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
    RequestData request;
    HazardCurves response;
    
    Result(RequestData request, HazardCurves response) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.request = request;
      this.response = response;
    }
  }
  
}
