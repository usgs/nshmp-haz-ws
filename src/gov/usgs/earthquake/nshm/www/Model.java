package gov.usgs.earthquake.nshm.www;

import static gov.usgs.earthquake.nshm.www.meta.Region.*;

import gov.usgs.earthquake.nshm.www.meta.Region;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.opensha2.internal.Parsing;
import org.opensha2.internal.Parsing.Delimiter;

import com.google.common.collect.ImmutableList;

enum Model {
  AK_2007,
  CEUS_2008,
  WUS_2008,
  CEUS_2014,
  WUS_2014;

  private static final String MODEL_DIR = "models";
  private static final String AK_NAME = "Alaska";
  private static final String CEUS_NAME = "Central & Eastern US";
  private static final String WUS_NAME = "Western US";

  final String path;
  final String name;

  private Model() {
    Region region = deriveRegion(name());
    String regionName = deriveRegionName(region);
    String year = name().substring(name().lastIndexOf('_') + 1);
    path = deriveModelPath(region, regionName, year);
    name = Parsing.join(
        ImmutableList.of(year, "NSHM", regionName, "Hazard Model"),
        Delimiter.SPACE);
  }

  private static Region deriveRegion(String s) {
    return s.startsWith("AK") ? AK : s.startsWith("WUS") ? WUS : CEUS;
  }
  
  private static String deriveRegionName(Region region) {
    return (region == AK) ? AK_NAME : (region == WUS) ? WUS_NAME : CEUS_NAME;
  }

  private static String deriveModelPath(Region region, String regionName, String year) {
    Path dir = Paths.get("/", MODEL_DIR);
    if (region == AK) {
      dir = dir.resolve("ak").resolve(year);
    } else {
      dir = dir.resolve("cous").resolve(year).resolve(regionName);
    }
    return dir.toString();
  }
  
  static Model valueOf(Region region, int year) {
    return valueOf(region.name() + "_" + year);
  }

  // TODO clean
  public static void main(String[] args) {
    for (Model model : Model.values()) {
      System.out.println(model.path);
      System.out.println(model.name);
    }
  }

}
