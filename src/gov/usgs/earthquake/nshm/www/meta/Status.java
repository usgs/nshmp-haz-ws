package gov.usgs.earthquake.nshm.www.meta;

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
