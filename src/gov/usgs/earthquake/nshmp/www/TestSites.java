package gov.usgs.earthquake.nshmp.www;


//....................................... Import ..........................................
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
//--------------------------------------- End Import --------------------------------------


//................................. Class: TestSites ......................................
public class TestSites{
  
  
  //............................. Method: Sites ...........................................
  public static String sites(String queryInfo){
    
  		Gson gson = new GsonBuilder()
       .setPrettyPrinting()
       .create();   
   
    Map<String,EnumSet<NshmpSite>> nshmpSites = new HashMap<>();
    nshmpSites.put("ceus",NshmpSite.ceus());  
    nshmpSites.put("cous", NshmpSite.cous());
    nshmpSites.put("wus", NshmpSite.wus());
    nshmpSites.put("ak", NshmpSite.alaska());
    nshmpSites.put("facilities", NshmpSite.facilities());
    nshmpSites.put("nehrp", NshmpSite.nehrp());
    nshmpSites.put("nrc", NshmpSite.nrc());
    
    
    List<FeatureCollection<Feature>> regionCollection = new ArrayList<>();

    for(String key : nshmpSites.keySet()) {
     List<Feature> features = new ArrayList<>();
     for (NshmpSite site : nshmpSites.get(key)) {
        features.add(GeoJson.createPoint(site, site.id()));
      }  
      FeatureCollection<Feature> region = new FeatureCollection<>();
      CollectionProperties prop = new CollectionProperties(key);
      region.properties = prop;
      region.features = features;
      regionCollection.add(region);
    }      
    FeatureCollection<FeatureCollection<Feature>> 
    			featureCollection = new FeatureCollection<>();
    featureCollection.features = regionCollection;
    String jsonString = gson.toJson(featureCollection);
    
    for (FeatureCollection<Feature> fc: regionCollection ) {
      CollectionProperties cp = (CollectionProperties) fc.properties;
      if (cp.regionId.equals(queryInfo)) {
        jsonString = gson.toJson(fc);
      }
    }
    
    return jsonString;
    
  }
  //------------------------------- End Method: sites -------------------------------------


  
  //............................ Class: CollectionProperties ..............................
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
      this.minlongitude = this.region.minlongitude <= -180 ? -179 
      			: this.region.minlongitude;
      this.maxlongitude = this.region.maxlongitude;
      
      this.uiminlatitude  = this.region.uiminlatitude;
      this.uimaxlatitude  = this.region.uimaxlatitude;
      this.uiminlongitude = this.region.uiminlongitude <= -180 ? -179 
      			: this.region.uiminlongitude;
      this.uimaxlongitude = this.region.uimaxlongitude;
      
      this.regionFeatures.add(GeoJson.regionBounds( 
      			this.minlongitude, this.minlatitude));
      this.regionFeatures.add(GeoJson.regionBounds( 
      			this.maxlongitude, this.maxlatitude));
      this.regionBounds.features = this.regionFeatures;     
    }
  }
  //-------------------------- End Class: CollectionProperties ----------------------------
  
  
  
}
//---------------------------- End Class: TestSites --------------------------------------
