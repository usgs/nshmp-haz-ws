package gov.usgs.earthquake.nshm.www.meta;

import java.util.EnumSet;
import java.util.Set;

@SuppressWarnings("javadoc")
public enum Edition implements Constrained {

  E2008(
      "Dynamic: Conterminous U.S. 2008 (v3.3.0)",
      2008,
      100,
      EnumSet.allOf(Region.class)),

  E2014(
      "Dynamic: Conterminous U.S. 2014 (v4.1.0)",
      2014,
      0,
      EnumSet.allOf(Region.class));

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
    this.label = label;
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
