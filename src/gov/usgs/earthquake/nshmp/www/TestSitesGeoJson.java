package gov.usgs.earthquake.nshmp.www;

import java.io.BufferedWriter;
import java.io.FileWriter;
//..................... Import .........................
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.internal.NshmpSite;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
//----------------------------------------------------------



/*
 * Web servlet produces a GeoJSON file of the test sites at 
 * nshmp-haz-ws/testsitesGeo
 */

@WebServlet("/testsitesGeo")
public class TestSitesGeoJson extends HttpServlet{
  
  @Override
  public void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
    throws ServletException, IOException{
    
    //................ Initial Setup ...................
    PrintWriter out = response.getWriter();   // Create object to print to web page
   
    Gson gson = new GsonBuilder()             // Create gson object to print in JSON format
       .setPrettyPrinting()
       .create();   
    //--------------------------------------------------
   
    //.............. Get All Test Site Regions ..............
    Map<String,EnumSet<NshmpSite>> nshmpSites = new HashMap<>();    // Create map of region ids and the region from NshmpSite
    nshmpSites.put("ceus",NshmpSite.ceus());                        
    nshmpSites.put("wus", NshmpSite.wus());
    nshmpSites.put("ak", NshmpSite.alaska());
    nshmpSites.put("facilities", NshmpSite.facilities());
    nshmpSites.put("nehrp", NshmpSite.nehrp());
    nshmpSites.put("nrc", NshmpSite.nrc());
    //--------------------------------------------------------
  
    
    //................... Create Object With All Regions and Locations ...................
    ArrayList<Object> features = new ArrayList<>();            
    
    for(String key : nshmpSites.keySet()) {                     
      for (NshmpSite site : nshmpSites.get(key)) {            
        Feature<Object> feature = new Feature<>(key,site);
        features.add(feature);                           
      }  
    }           
    FeatureCollection<Object> featureCollection = new FeatureCollection<>(features);
    String jsonString = gson.toJson(featureCollection);
    out.println(jsonString);                      // Print test site object in JSON format to webpage
    //------------------------------------------------------------------------------------
    
    //............................. Make GeoJson File .....................................
    /*
    String FgeoJson = "testSites.geojson";
    try(BufferedWriter writer = new BufferedWriter(new FileWriter(FgeoJson))){
      writer.write(jsonString);
    }catch(IOException e) {
      System.out.println("ERROR: " + e.getMessage());
    }
    */
    //--------------------------------------------------------------------------------------
    
  }
}


//................ Final Test Sites Object .............
class FeatureCollection<T>{
  private String type;
  private T features;
  
  public FeatureCollection(T features) {
    this.type     = "FeatureCollection";
    this.features = features;
  }
}
//--------------------------------------------------------



//.............. Create a Object for Test Site ...........
class Feature<T>{
  private String type;
  private Geometry geometry;
  private Properties properties;
  
  public Feature(String siteKey, NshmpSite site) {
    type = "Feature";
    this.geometry   = new Geometry(site);
    this.properties = new Properties(siteKey,site);
    
  }
  
}
//-------------------------------------------------------


class Geometry{
  private String type;
  private double[] coordinates = new double[2];
  
  public Geometry(NshmpSite site) {
    this.type = "Point";
    this.coordinates[0] = site.location().lon();
    this.coordinates[1] = site.location().lat();
  }
}




class Properties{
  private String siteName;
  private String siteId;
  private String region;
  private String regionId;
 
  
  public Properties(String siteKey,NshmpSite site) {
    String[] siteInfo = new String[2];
    switch(siteKey) {
      case "ceus":
        siteInfo = new String[]{"CEUS","Central & Eastern US"};
        break;
      case "wus":
        siteInfo = new String[]{"WUS","Western US"};
        break;
      case "ak":
        siteInfo = new String[]{"AK"," Alaska"};
        break;
      case "facilities":
        siteInfo = new String[]{"FACILITIES","US National Labs"};
        break;
      case "nehrp":
        siteInfo = new String[]{"NEHRP","NEHRP Sites"};
        break;
      case "nrc":
        siteInfo = new String[]{"NRC","Restricted CEUS Set"};
        break;
      default:
        siteInfo = new String[] {"NA","Not Defined"};
    }
   
    this.siteName = site.toString();
    this.siteId   = site.id();
    this.regionId = siteInfo[0];
    this.region   = siteInfo[1];
    
  }
  
}

  