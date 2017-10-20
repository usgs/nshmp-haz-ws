package gov.usgs.earthquake.nshmp.www;

//..................... Import .........................
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.internal.NshmpSite;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
//----------------------------------------------------------
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;


/*
 * Web servlet produces a JSON file of the test sites at 
 * nshmp-haz-ws/testsites
 */

@WebServlet("/testsites")
public class TestSites extends HttpServlet{
  
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
    ArrayList<Object> regions = new ArrayList<>();            // Create a array list of objects to hold each region
    
    for(String key : nshmpSites.keySet()) {                   // Loop through each region 
      Map<NshmpSite,double[]> siteMap = new HashMap<>();      // Create a map of site names and locations
      
      for (NshmpSite site : nshmpSites.get(key)) {            // Loop through each site
        double siteLat = site.location().lat();               // Get lat
        double siteLon = site.location().lon();               // Get lon
        double[] siteLoc = {siteLat,siteLon};                 // Create a array for lat,lon
        siteMap.put(site, siteLoc);                           // Add site name and location to map
      }  
      TestSite<Map<NshmpSite,double[]>> site = new TestSite<>(key,siteMap);   // Create new map with site names, locations, site id, and display (See TestSite below)
      regions.add(site);                                      // Add the new map to regions array list
    }
    SiteValues<Object> testSites = new SiteValues<>(regions); // Create the final object              
    
    out.println(gson.toJson(testSites));                      // Print test site object in JSON format to webpage
    //------------------------------------------------------------------------------------
  }
}


//................ Final Test Sites Object .............
class SiteValues<T>{
  private T testsites;
  private String desciption;
  
  public SiteValues(T regions) {
    this.desciption = "Test sites";
    this.testsites = regions;
  }
}
//--------------------------------------------------------



//.............. Create a Object for Test Site ...........
class TestSite<T>{
  private T values;
  private String id;
  private String display;
  
  public TestSite(String siteKey, T siteMap) {
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
    this.values = siteMap;
    this.id = siteInfo[0];
    this.display = siteInfo[1];
  }
  
}
//-------------------------------------------------------








  