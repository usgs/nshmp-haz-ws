package gov.usgs.earthquake.nshm.www.meta;

import static gov.usgs.earthquake.nshm.www.meta.Region.*;

import java.util.EnumSet;
import java.util.Set;

@SuppressWarnings("javadoc")
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
  final transient Set<Region> regions;

  private final Constraints constraints;

  final int displayOrder;

  private Edition(
      String label,
      int year,
      int displayOrder,
      Set<Region> regions) {

    this.year = year;
    this.label = label + " (" + Metadata.MODEL_VERSIONS.get(this) + ")";
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

  @Override
  public Constraints constraints() {
    return constraints;
  }

}
