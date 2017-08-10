package gov.usgs.earthquake.nshmp.www.meta;

import static gov.usgs.earthquake.nshmp.www.meta.Region.AK;
import static gov.usgs.earthquake.nshmp.www.meta.Region.CEUS;
import static gov.usgs.earthquake.nshmp.www.meta.Region.COUS;
import static gov.usgs.earthquake.nshmp.www.meta.Region.WUS;

import java.util.EnumSet;
import java.util.Set;

@SuppressWarnings({ "javadoc", "unused" })
public enum Edition implements Constrained {

  E2008(
      "Dynamic: Conterminous U.S. 2008",
      2008,
      100,
      EnumSet.of(COUS, CEUS, WUS)),

  E2014(
      "Dynamic: Conterminous U.S. 2014",
      2014,
      0,
      EnumSet.of(COUS, CEUS, WUS)),

  E2007(
      "Dynamic: Alaska 2007",
      2007,
      -100,
      EnumSet.of(AK));

  private final String label;
  private final int year;

  /* not serialized */
  private final transient String version;
  private final transient Set<Region> regions;

  private final Constraints constraints;

  final int displayOrder;

  private Edition(
      String label,
      int year,
      int displayOrder,
      Set<Region> regions) {

    this.year = year;
    this.version = Versions.modelVersion(name());
    this.label = label + " (" + version + ")";
    this.displayOrder = displayOrder;
    this.regions = regions;
    this.constraints = new EditionConstraints(regions);
  }

  @Override
  public String toString() {
    return label;
  }

  public int year() {
    return year;
  }

  public String version() {
    return version;
  }

  @Override
  public Constraints constraints() {
    return constraints;
  }

}
