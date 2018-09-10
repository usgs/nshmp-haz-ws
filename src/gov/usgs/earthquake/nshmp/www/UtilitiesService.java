package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.internal.NshmpSite;
import gov.usgs.earthquake.nshmp.geo.json.FeatureCollection;
import gov.usgs.earthquake.nshmp.geo.json.Properties;
import gov.usgs.earthquake.nshmp.www.meta.Region;

@WebServlet(
    name = "Utilities Service",
    description = "USGS NSHMP Web Service Utilities",
    urlPatterns = {
        "/util",
        "/util/*" })
public class UtilitiesService extends HttpServlet {

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {

    ServletUtil.setCorsHeadersAndContentType(response);
    PrintWriter out = response.getWriter();
    String utilUrl = "/nshmp-haz-ws/apps/util.html";

    String pathInfo = request.getPathInfo();

    switch (pathInfo) {
      case "/testsites":
        out.println(proccessTestSites());
        break;
      default:
        response.sendRedirect(utilUrl);
    }
  }

  private static String proccessTestSites() {
    Map<String, EnumSet<NshmpSite>> nshmpSites = new HashMap<>();
    nshmpSites.put("ceus", NshmpSite.ceus());
    nshmpSites.put("cous", NshmpSite.cous());
    nshmpSites.put("wus", NshmpSite.wus());
    nshmpSites.put("ak", NshmpSite.alaska());
    nshmpSites.put("facilities", NshmpSite.facilities());
    nshmpSites.put("nehrp", NshmpSite.nehrp());
    nshmpSites.put("nrc", NshmpSite.nrc());

    FeatureCollection.Builder fc = FeatureCollection.builder();

    for (String regionKey : nshmpSites.keySet()) {
      RegionInfo regionInfo = getRegionInfo(regionKey);
      for (NshmpSite site : nshmpSites.get(regionKey)) {
        Properties siteProperties = Properties.builder()
            .put(Key.LOCATION, site.toString())
            .put(Key.LOCATION_ID, site.id())
            .put(Key.REGION_ID, regionInfo.regionId)
            .put(Key.REGION_DISPLAY, regionInfo.regionDisplay)
            .build();

        fc.addPoint(
            site.location(),
            siteProperties,
            Optional.empty(),
            Optional.of(regionInfo.bbox));
      }
    }

    return fc.build().toJsonString();
  }

  private static class Key {
    private static final String LOCATION = "location";
    private static final String LOCATION_ID = "locationId";
    private static final String REGION_ID = "regionId";
    private static final String REGION_DISPLAY = "regionDisplay";
  }

  private static class RegionInfo {
    private String regionId;
    private String regionDisplay;
    private double[] bbox;

    private RegionInfo(Region region, String regionDisplay, String regionId) {
      this.regionId = regionId.toUpperCase();
      this.regionDisplay = regionDisplay;
      this.bbox = getBbox(region);
    }

    private static double[] getBbox(Region region) {
      double minlatitude = region.minlatitude;
      double maxlatitude = region.maxlatitude;
      double minlongitude = region.minlongitude <= -180 ? -179 : region.minlongitude;
      double maxlongitude = region.maxlongitude;

      return new double[] { minlatitude, minlongitude, maxlatitude, maxlongitude };
    }
  }

  private static RegionInfo getRegionInfo(String regionId) {
    Region region = null;
    String regionDisplay = "";

    switch (regionId) {
      case "ceus":
        regionDisplay = "Central & Eastern US";
        region = Region.CEUS;
        break;
      case "cous":
        regionDisplay = "Conterminous US";
        region = Region.COUS;
        break;
      case "wus":
        regionDisplay = "Western US";
        region = Region.WUS;
        break;
      case "ak":
        regionDisplay = "Alaska";
        region = Region.AK;
        break;
      case "facilities":
        regionDisplay = "US National Labs";
        region = Region.WUS;
        break;
      case "nehrp":
        regionDisplay = "NEHRP";
        region = Region.COUS;
        break;
      case "nrc":
        regionDisplay = "NRC";
        region = Region.CEUS;
        break;
      default:
        throw new RuntimeException("Region [" + regionId + "] not found");
    }

    return new RegionInfo(region, regionDisplay, regionId);
  }

}
