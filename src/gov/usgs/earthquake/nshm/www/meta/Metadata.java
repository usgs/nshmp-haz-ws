package gov.usgs.earthquake.nshm.www.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;
import static org.opensha2.gmm.Imt.SA2P0;

import org.opensha2.HazardCalc;
import org.opensha2.calc.Vs30;
import org.opensha2.geo.Coordinates;
import org.opensha2.gmm.Imt;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.gson.annotations.SerializedName;

import java.io.InputStream;
import java.util.EnumSet;
import java.util.Map;
import java.util.Properties;

import gov.usgs.earthquake.nshm.www.ServletUtil;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public final class Metadata {

  public static final Object VERSION = new AppVersion();

  public static final String HAZARD_USAGE = ServletUtil.GSON.toJson(new Hazard(
      "Compute hazard curve data for an input location",
      "%s://%s/nshmp-haz-ws/hazard/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}",
      new HazardParameters()));

  public static final String DEAGG_USAGE = ServletUtil.GSON.toJson(new Deagg(
      "Deaggregate hazard at an input location",
      "%s://%s/nshmp-haz-ws/deagg/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}/{returnPeriod}",
      new DeaggParameters()));

  @SuppressWarnings("unused")
  private static class Hazard {

    final String status;
    final String description;
    final String syntax;
    final Object version;
    final HazardParameters parameters;

    private Hazard(
        String description,
        String syntax,
        HazardParameters parameters) {
      this.status = Status.USAGE.toString();
      this.description = description;
      this.syntax = syntax;
      this.version = VERSION;
      this.parameters = parameters;
    }
  }

  private static class AppVersion {
    @SerializedName("nshmp-haz")
    final String nshmpHaz = NSHMP_HAZ_VERSION;
    @SerializedName("nshmp-haz-ws")
    final String nshmpHazWs = NSHMP_HAZ_WS_VERSION;
  }

  @SuppressWarnings("unused")
  private static class HazardParameters {

    final EnumParameter<Edition> edition;
    final EnumParameter<Region> region;
    final DoubleParameter<Double> longitude;
    final DoubleParameter<Double> latitude;
    final EnumParameter<Imt> imt;
    final EnumParameter<Vs30> vs30;

    HazardParameters() {

      edition = new EnumParameter<>(
          "Model edition",
          ParamType.STRING,
          EnumSet.allOf(Edition.class));

      region = new EnumParameter<>(
          "Model region",
          ParamType.STRING,
          EnumSet.allOf(Region.class));

      longitude = new DoubleParameter<>(
          "Longitude (in decimal degrees)",
          ParamType.NUMBER,
          Coordinates.LON_RANGE.lowerEndpoint(),
          Coordinates.LON_RANGE.upperEndpoint());

      latitude = new DoubleParameter<>(
          "Latitude (in decimal degrees)",
          ParamType.NUMBER,
          Coordinates.LAT_RANGE.lowerEndpoint(),
          Coordinates.LAT_RANGE.upperEndpoint());

      imt = new EnumParameter<>(
          "Intensity measure type",
          ParamType.STRING,
          EnumSet.of(PGA, SA0P2, SA1P0, SA2P0));

      vs30 = new EnumParameter<>(
          "Site soil (Vs30)",
          ParamType.STRING,
          EnumSet.allOf(Vs30.class));
    }
  }

  private static class Deagg extends Hazard {
    private Deagg(
        String description,
        String syntax,
        DeaggParameters parameters) {
      super(description, syntax, parameters);
    }
  }

  @SuppressWarnings("unused")
  private static class DeaggParameters extends HazardParameters {

    final DoubleParameter<Double> returnPeriod;

    DeaggParameters() {
      returnPeriod = new DoubleParameter<>(
          "Return period (in years)",
          ParamType.NUMBER,
          1.0,
          4000.0);
    }
  }

  public static String errorMessage(String url, Throwable e, boolean trace) {
    Error error = new Error(url, e, trace);
    return ServletUtil.GSON.toJson(error);
  }

  @SuppressWarnings("unused")
  private static class Error {

    final String status = Status.ERROR.toString();
    final String request;
    final String message;

    private Error(String request, Throwable e, boolean trace) {
      this.request = request;
      String message = e.getMessage() + " (see logs)";
      if (trace) {
        message += "\n" + Throwables.getStackTraceAsString(e);
      }
      this.message = message;
    }
  }

  static final String NSHMP_HAZ_VERSION = HazardCalc.VERSION;
  static final String NSHMP_HAZ_WS_VERSION;
  static final Map<Edition, String> MODEL_VERSIONS;

  static {
    String nshmpHazWsVersion = "unkown";
    ImmutableMap.Builder<Edition, String> modelMap = ImmutableMap.builder();

    /* Always runs from a war (possibly unpacked). */
    InputStream in = null;
    try {
      /* Web-services version. */
      in = Metadata.class.getResourceAsStream("/service.properties");
      Properties props = new Properties();
      props.load(in);
      in.close();
      nshmpHazWsVersion = props.getProperty("app.version");

      /* Model versions. */
      for (Edition edition : Edition.values()) {
        String modelKey = edition.name() + ".version";
        String modelVersion = props.getProperty(modelKey);
        modelMap.put(edition, modelVersion);
      }

    } catch (Exception e1) {
      /* Probably running outside standard webservice environment. */
      if (in != null) {
        try {
          in.close();
        } catch (Exception e2) {}
      }
    }
    NSHMP_HAZ_WS_VERSION = nshmpHazWsVersion;
    MODEL_VERSIONS = modelMap.build();
  }

}
