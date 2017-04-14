package gov.usgs.earthquake.nshm.www.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;
import static org.opensha2.gmm.Imt.SA2P0;

import org.opensha2.HazardCalc;
import org.opensha2.calc.Vs30;
import org.opensha2.geo.Coordinates;
import org.opensha2.gmm.Imt;
import org.opensha2.mfd.Mfds;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import com.google.gson.annotations.SerializedName;

import java.io.InputStream;
import java.util.EnumSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import gov.usgs.earthquake.nshm.www.ServletUtil;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public final class Metadata {

  static final String NSHMP_HAZ_VERSION = HazardCalc.VERSION;
  static final String NSHMP_HAZ_WS_VERSION;
  static final Map<Edition, String> MODEL_VERSIONS;

  /*
   * TODO: Ultimately this should come from the intersection of those IMTs
   * supported by a model.
   */
  public static final Set<Imt> HAZARD_IMTS = Sets.immutableEnumSet(PGA, SA0P2, SA1P0, SA2P0);

  static {
    String nshmpHazWsVersion = "unknown";
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

  public static final Object VERSION = new AppVersion();

  public static final String HAZARD_USAGE = ServletUtil.GSON.toJson(new Default(
      "Compute hazard curve data at a location",
      "%s://%s/nshmp-haz-ws/hazard/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}",
      new HazardParameters()));

  public static final String DEAGG_USAGE = ServletUtil.GSON.toJson(new Deagg(
      "Deaggregate hazard at a location",
      "%s://%s/nshmp-haz-ws/deagg/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}/{returnPeriod}",
      new DeaggParameters()));

  public static final String RATE_USAGE = ServletUtil.GSON.toJson(new Rate(
      "Compute incremental earthquake annual-rates at a location",
      "%s://%s/nshmp-haz-ws/rate/{edition}/{region}/{longitude}/{latitude}/{distance}",
      new RateParameters()));

  public static final String PROBABILITY_USAGE = ServletUtil.GSON.toJson(new Probability(
      "Compute cumulative earthquake probabilities P(M ≥ x) at a location",
      "%s://%s/nshmp-haz-ws/probability/{edition}/{region}/{longitude}/{latitude}/{distance}/{timespan}",
      new ProbabilityParameters()));

  @SuppressWarnings("unused")
  private static class Default {

    final String status;
    final String description;
    final String syntax;
    final Object version;
    final DefaultParameters parameters;

    private Default(
        String description,
        String syntax,
        DefaultParameters parameters) {
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
  private static class DefaultParameters {

    final EnumParameter<Edition> edition;
    final EnumParameter<Region> region;
    final DoubleParameter longitude;
    final DoubleParameter latitude;

    DefaultParameters() {

      edition = new EnumParameter<>(
          "Model edition",
          ParamType.STRING,
          EnumSet.allOf(Edition.class));

      region = new EnumParameter<>(
          "Model region",
          ParamType.STRING,
          EnumSet.allOf(Region.class));

      longitude = new DoubleParameter(
          "Longitude (in decimal degrees)",
          ParamType.NUMBER,
          Coordinates.LON_RANGE.lowerEndpoint(),
          Coordinates.LON_RANGE.upperEndpoint());

      latitude = new DoubleParameter(
          "Latitude (in decimal degrees)",
          ParamType.NUMBER,
          Coordinates.LAT_RANGE.lowerEndpoint(),
          Coordinates.LAT_RANGE.upperEndpoint());
    }
  }

  @SuppressWarnings("unused")
  private static class HazardParameters extends DefaultParameters {

    final EnumParameter<Imt> imt;
    final EnumParameter<Vs30> vs30;

    HazardParameters() {

      imt = new EnumParameter<>(
          "Intensity measure type",
          ParamType.STRING,
          HAZARD_IMTS);

      vs30 = new EnumParameter<>(
          "Site soil (Vs30)",
          ParamType.STRING,
          EnumSet.allOf(Vs30.class));
    }
  }

  private static class Deagg extends Default {
    private Deagg(
        String description,
        String syntax,
        DeaggParameters parameters) {
      super(description, syntax, parameters);
    }
  }

  @SuppressWarnings("unused")
  private static class DeaggParameters extends HazardParameters {

    final DoubleParameter returnPeriod;

    DeaggParameters() {

      returnPeriod = new DoubleParameter(
          "Return period (in years)",
          ParamType.NUMBER,
          1.0,
          4000.0);
    }
  }

  private static class Rate extends Default {
    private Rate(
        String description,
        String syntax,
        RateParameters parameters) {
      super(description, syntax, parameters);
    }
  }

  @SuppressWarnings("unused")
  private static class RateParameters extends DefaultParameters {

    final DoubleParameter distance;

    RateParameters() {
      distance = new DoubleParameter(
          "Cutoff distance (in km)",
          ParamType.NUMBER,
          0.01,
          1000.0);
    }
  }

  private static class Probability extends Default {
    private Probability(
        String description,
        String syntax,
        ProbabilityParameters parameters) {
      super(description, syntax, parameters);
    }
  }

  @SuppressWarnings("unused")
  private static class ProbabilityParameters extends RateParameters {

    final DoubleParameter timespan;

    ProbabilityParameters() {
      timespan = new DoubleParameter(
          "Forecast time span (in years)",
          ParamType.NUMBER,
          Mfds.TIMESPAN_RANGE.lowerEndpoint(),
          Mfds.TIMESPAN_RANGE.upperEndpoint());
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

}
