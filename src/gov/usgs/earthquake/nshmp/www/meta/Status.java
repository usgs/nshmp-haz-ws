package gov.usgs.earthquake.nshmp.www.meta;

/**
 * Service request status identifier.
 *
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public enum Status {

  USAGE,
  SUCCESS,
  ERROR;

  @Override
  public String toString() {
    return name().toLowerCase();
  }
}
