package gov.usgs.earthquake.nshm.www.meta;

import static gov.usgs.earthquake.nshm.www.meta.Region.CEUS;
import static gov.usgs.earthquake.nshm.www.meta.Region.COUS;
import static gov.usgs.earthquake.nshm.www.meta.Region.WUS;
import static gov.usgs.earthquake.nshmp.gmm.Imt.PGA;
import static gov.usgs.earthquake.nshmp.gmm.Imt.SA0P2;
import static gov.usgs.earthquake.nshmp.gmm.Imt.SA1P0;
import static gov.usgs.earthquake.nshmp.gmm.Imt.SA2P0;

import com.google.common.base.Throwables;
import com.google.common.collect.Sets;
import com.google.gson.annotations.SerializedName;

import java.util.EnumSet;
import java.util.Set;

import gov.usgs.earthquake.nshm.www.ServletUtil;
import gov.usgs.earthquake.nshm.www.ServletUtil.Timer;
import gov.usgs.earthquake.nshmp.calc.Vs30;
import gov.usgs.earthquake.nshmp.geo.Coordinates;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.mfd.Mfds;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public final class Metadata {

  static final String NSHMP_HAZ_URL = "https://github.com/usgs/nshmp-haz";
  static final String NSHMP_HAZ_WS_URL = "https://github.com/usgs/nshmp-haz-ws";

  /*
   * TODO: Ultimately this should come from the intersection of those IMTs
   * supported by a model.
   */
  public static final Set<Imt> HAZARD_IMTS = Sets.immutableEnumSet(PGA, SA0P2, SA1P0, SA2P0);

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
    final Object server;
    final DefaultParameters parameters;

    private Default(
        String description,
        String syntax,
        DefaultParameters parameters) {
      this.status = Status.USAGE.toString();
      this.description = description;
      this.syntax = syntax;
      this.server = serverData(1, new Timer());
      this.parameters = parameters;
    }
  }

  public static Object serverData(int threads, Timer timer) {
    return new Server(threads, timer);
  }

  @SuppressWarnings("unused")
  private static class Server {

    final int threads;
    final String servlet;
    final String calc;

    @SerializedName("nshmp-haz")
    final Component nshmpHaz = NSHMP_HAZ_COMPONENT;

    @SerializedName("nshmp-haz-ws")
    final Component nshmpHazWs = NSHMP_HAZ_WS_COMPONENT;

    Server(int threads, Timer timer) {
      this.threads = threads;
      this.servlet = timer.servletTime();
      this.calc = timer.calcTime();
    }

    static Component NSHMP_HAZ_COMPONENT = new Component(
        NSHMP_HAZ_URL,
        Versions.NSHMP_HAZ_VERSION);

    static Component NSHMP_HAZ_WS_COMPONENT = new Component(
        NSHMP_HAZ_WS_URL,
        Versions.NSHMP_HAZ_WS_VERSION);

    static final class Component {

      final String url;
      final String version;

      Component(String url, String version) {
        this.url = url;
        this.version = version;
      }
    }
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
  
  public static Region checkRegion(double lon) {
    return (lon <= WUS.uimaxlongitude) ? WUS : (lon >= CEUS.uiminlongitude) ? CEUS : COUS;
  }
  
  public static void main(String[] args) {
    System.out.println(checkRegion(-122));
  }

}
