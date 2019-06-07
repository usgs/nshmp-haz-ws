package gov.usgs.earthquake.nshmp.www;

import static gov.usgs.earthquake.nshmp.www.ServletUtil.GSON;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.calc.Site;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Status;

/**
 * Servlet implementation class HazardImportService
 */
@SuppressWarnings("unused")
@WebServlet(
    name = "Hazard importer",
    description = "Read hazard output from zip file",
    urlPatterns = {
        "/hazard-import",
        "/hazard-import/*"})
public class HazardImportService extends NshmpServlet {
       
	protected void doGet(
	    HttpServletRequest request,
	    HttpServletResponse response) throws ServletException, IOException {
	  
	  UrlHelper urlHelper = urlHelper(request, response);
	  
	  if (ServletUtil.emptyRequest(request)) {
	    return;
	  }
	  
    try {
      RequestData requestData = buildRequestData(request);
      Result result = processRequest(requestData, urlHelper.url);
      urlHelper.writeResponse((GSON.toJson(result, Result.class)));
    } catch (IOException e) {
      String message = Metadata.errorMessage(urlHelper.url, e, false);
      urlHelper.writeResponse(message);
    }
	}

  private static RequestData buildRequestData(HttpServletRequest request) {
    try {
      return new RequestData(request.getParameter("url"));
    } catch (Exception e) {
      throw new IllegalStateException("Error parsing request URL", e);
    }
  }
  
  private static Result processRequest(RequestData requestData, String url) throws IOException {
    HttpURLConnection con = (HttpURLConnection) new URL(requestData.url)
        .openConnection();
    InputStream stream = con.getInputStream();
    ZipInputStream zipStream = new ZipInputStream(stream);
    
    ZipEntry zipEntry = zipStream.getNextEntry();
    
    Map<Imt, HazardCurves> curves = new TreeMap<>();
    
    while (zipEntry != null) {
      String name = zipEntry.getName();
      
      if (name.contains("csv")) {
        String[] names = name.split("/");
        Imt imt = Imt.valueOf(names[names.length - 2]);
        curves.put(imt, readCurveFile(imt, zipStream, name));
      }
      
      zipEntry = zipStream.getNextEntry();
    }
    
    zipStream.close();
    
    Response response = new Response(curves);
    
    return new Result(requestData, response, url);
  }
  
  private static HazardCurves readCurveFile(
      Imt imt,
      ZipInputStream zipStream,
      String file) throws IOException {
    List<HazardData> hazardData =  new ArrayList<>();
    BufferedReader reader = new BufferedReader(new InputStreamReader(zipStream));
    StringBuilder sb = new StringBuilder();
    List<String> keys = null;
    List<Double> imls = null;
    List<Site> sites = new ArrayList<>();
    
    String line;
    int counter = 0;
    while((line = reader.readLine()) != null) {
      sb.append(line + "\n");
      
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
  
  private static class Response {
    Set<Imt> imts;
    List<HazardCurves> data;
    
    Response(Map<Imt, HazardCurves> curves) {
      imts = curves.keySet();
      data = curves.entrySet()
          .stream()
          .map(curve -> curve.getValue())
          .collect(Collectors.toList());
    }
  }
  
  private static class Result {
    final String status;
    final String date;
    final String url;
    RequestData request;
    Response response;
    
    Result(RequestData request, Response response, String url) {
      status = Status.SUCCESS.toString();
      date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
      this.url = url;
      this.request = request;
      this.response = response;
    }
  }
  
}
