package gov.usgs.earthquake.nshmp.www;


//..................... Import .........................
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gov.usgs.earthquake.nshmp.internal.NshmpSite;
import gov.usgs.earthquake.nshmp.www.meta.Region;
import gov.usgs.earthquake.nshmp.internal.GeoJson.FeatureCollection;
import gov.usgs.earthquake.nshmp.internal.GeoJson;
import gov.usgs.earthquake.nshmp.internal.GeoJson.Feature;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
//----------------------------------------------------------


public class TestSites{
  
  
  //....................... Return Json String of Test Sites ......................................
  public static String Sites(String queryInfo){
    
    //................ Initial Setup ...................
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
    EnumSet<NshmpSite> cous = NshmpSite.ceus();
    cous.addAll(NshmpSite.wus());
    nshmpSites.put("cous", cous);
    //--------------------------------------------------------
  
    
    //................... Create Object With All Regions and Locations ...................
    
    List<FeatureCollection<Feature>> regionCollection = new ArrayList<>();    // Array list of FeatureCollection

    for(String key : nshmpSites.keySet()) {                                   // Loop through each region   
     List<Feature> features = new ArrayList<>();                              // Array list of Feature
     for (NshmpSite site : nshmpSites.get(key)) {                             // Loop through all sites in a region
        features.add(GeoJson.createPoint(site, site.id()));                   // Create a feature for each site
      }  
      FeatureCollection<Feature> region = new FeatureCollection<>();          // Create a feature collection for each region
      CollectionProperties prop = new CollectionProperties(key);              // Create feature collection properties
      region.properties = prop;               // Set properties for the feature collection
      region.features = features;             // Set features for the feature collection
      regionCollection.add(region);           // Add the feature collection of a region to array list of collections
    }      
    FeatureCollection<FeatureCollection<Feature>> featureCollection = new FeatureCollection<>();    // Create a feature collection of feature collection
    featureCollection.features = regionCollection;        // Set the features
    String jsonString = gson.toJson(featureCollection);   // Create JSON string
    
    for (FeatureCollection<Feature> fc: regionCollection ) {          // Loop through each feature collection
      CollectionProperties cp = (CollectionProperties) fc.properties; // Create collection properties obejct
      if (cp.regionId.equals(queryInfo)) {                            // Check if region id matches url query
        jsonString = gson.toJson(fc);                                 // Return feature collection of searched region
      }
    }
    
    return jsonString;
    //------------------------------------------------------------------------------------ 
  }
  //-----------------------------------------------------------------------------------------------


  //............. Properties Object for each Feature ................
  static class CollectionProperties{
    
    private String regionId;
    private String regionDisplay;
   
    private FeatureCollection<Feature>  regionBounds = new FeatureCollection<>();
    private transient List<Feature> regionFeatures= new ArrayList<>();
    
    private final double minlatitude;
    private final double maxlatitude;
    private final double minlongitude;
    private final double maxlongitude;
    
    private final double uiminlatitude;
    private final double uimaxlatitude;
    private final double uiminlongitude;
    private final double uimaxlongitude;
    
    private transient Region region;  // transient = Don't serialize 
  
    public CollectionProperties(String regionId) {
      switch(regionId) {
        case "ceus":
          this.regionId      = "CEUS";
          this.regionDisplay = "Central & Eastern US";
          this.region        = Region.CEUS;
          break;
        case "cous":
          this.regionId      = "COUS";
          this.regionDisplay = "Conterminous US";
          this.region        = Region.COUS;
          break;
        case "wus":
          this.regionId      = "WUS";
          this.regionDisplay = "Western US";
          this.region        = Region.WUS;
          break;
        case "ak":
          this.regionId      = "AK";
          this.regionDisplay = "Alaska";
          this.region        = Region.AK;
          break;
        case "facilities":
          this.regionId      = "FACILITIES";
          this.regionDisplay = "US National Labs";
          this.region        = Region.WUS;
          break;
        case "nehrp":
          this.regionId      = "NEHRP";
          this.regionDisplay = "NEHRP";
          this.region        =  Region.COUS;
          break;
        case "nrc":
          this.regionId      = "NRC";
          this.regionDisplay = "NRC";
          this.region        = Region.CEUS;
          break;
        default:
          this.regionId      = "NA";
          this.regionDisplay = "Not Defined";
          this.region        = Region.COUS;
      }
      
      
      this.minlatitude  = this.region.minlatitude;
      this.maxlatitude  = this.region.maxlatitude;
      this.minlongitude = this.region.minlongitude <= -180 ? -179 : this.region.minlongitude;
      this.maxlongitude = this.region.maxlongitude;
      
      this.uiminlatitude  = this.region.uiminlatitude;
      this.uimaxlatitude  = this.region.uimaxlatitude;
      this.uiminlongitude = this.region.uiminlongitude <= -180 ? -179 : this.region.uiminlongitude;
      this.uimaxlongitude = this.region.uimaxlongitude;
      
      this.regionFeatures.add(GeoJson.regionBounds( this.minlongitude, this.minlatitude));
      this.regionFeatures.add(GeoJson.regionBounds( this.maxlongitude, this.maxlatitude));
      this.regionBounds.features = this.regionFeatures;     
    }
  }
  //---------------------------------------------------------------
  
}
