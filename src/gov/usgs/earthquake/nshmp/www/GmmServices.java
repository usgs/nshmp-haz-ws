package gov.usgs.earthquake.nshmp.www;

import static gov.usgs.earthquake.nshmp.ResponseSpectra.spectra;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.DIP;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.MW;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.RAKE;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.RJB;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.RRUP;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.RX;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.VS30;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.VSINF;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.WIDTH;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.Z1P0;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.Z2P5;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.ZHYP;
import static gov.usgs.earthquake.nshmp.gmm.GmmInput.Field.ZTOP;
import static gov.usgs.earthquake.nshmp.gmm.Imt.PGV;
import static gov.usgs.earthquake.nshmp.gmm.Imt.AI;

import static gov.usgs.earthquake.nshmp.www.meta.Metadata.errorMessage;

import static gov.usgs.earthquake.nshmp.www.Util.readValue;
import static gov.usgs.earthquake.nshmp.www.Util.Key.IMT;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.base.Enums;
import java.util.function.Function;
import java.util.Optional;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.Ordering;
import com.google.common.collect.Range;
import com.google.common.collect.Sets;
import com.google.common.primitives.Doubles;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import static com.google.common.base.Preconditions.checkArgument;

import gov.usgs.earthquake.nshmp.GroundMotions;
import gov.usgs.earthquake.nshmp.GroundMotions.DistanceResult;
import gov.usgs.earthquake.nshmp.ResponseSpectra.MultiResult;
import gov.usgs.earthquake.nshmp.data.Data;
import gov.usgs.earthquake.nshmp.data.XySequence;

import gov.usgs.earthquake.nshmp.gmm.Gmm;
import gov.usgs.earthquake.nshmp.gmm.GmmInput;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.gmm.Gmm.Group;
import gov.usgs.earthquake.nshmp.gmm.GmmInput.Builder;
import gov.usgs.earthquake.nshmp.gmm.GmmInput.Constraints;
import gov.usgs.earthquake.nshmp.gmm.GmmInput.Field;
import gov.usgs.earthquake.nshmp.www.meta.EnumParameter;
import gov.usgs.earthquake.nshmp.www.meta.ParamType;
import gov.usgs.earthquake.nshmp.www.meta.Status;
import gov.usgs.earthquake.nshmp.www.meta.Util;

@WebServlet(
    name = "Ground Motion Model Services",
    description = "Utilities for working with ground motion models",
    urlPatterns = {
        "/gmm",
        "/gmm/*" })
public class GmmServices extends HttpServlet {
  private static final long serialVersionUID = 1L;

  private static final String GMM_KEY = "gmm";
  private static final String RMIN_KEY = "rMin";
  private static final String RMAX_KEY = "rMax";
  private static final String IMT_KEY = "imt";
  private static final int ROUND = 5;

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
          throws ServletException, IOException {
    
    ServletUtil.setCorsHeadersAndContentType(response);

    PrintWriter writer = response.getWriter();     
    
    String query = request.getQueryString();
    String pathInfo = request.getPathInfo();
    String host = request.getServerName();

    Service service = null;
    if (pathInfo.matches(Service.DISTANCE.pathInfo)) {
      service = Service.DISTANCE;
    } else if (pathInfo.matches(Service.HW_FW.pathInfo)) {
      service = Service.HW_FW;
    } else if (pathInfo.matches(Service.SPECTRA.pathInfo)) {
      service = Service.SPECTRA;
    }

    Gson gson = new GsonBuilder()
        .setPrettyPrinting()
        .serializeNulls()
        .disableHtmlEscaping()
        .registerTypeAdapter(
            Metadata.Parameters.class,
            new Metadata.Parameters.Serializer())
        .registerTypeAdapter(
            GmmInput.class,
            new InputSerializer(service))
        .registerTypeAdapter(
            Imt.class,
            new Util.EnumSerializer<Imt>())
        .create();

    /*
     * Checking custom header for a forwarded protocol so generated links can
     * use the same protocol and not cause mixed content errors.
     */
    String protocol = request.getHeader("X-FORWARDED-PROTO");
    if (protocol == null) {
      /* Not a forwarded request. Honor reported protocol and port. */
      protocol = request.getScheme();
      host += ":" + request.getServerPort();
    }

    /* At a minimum, Gmms must be defined. */
    final String USAGE_STR = gson.toJson(new Metadata(service));
    String gmmParam = request.getParameter(GMM_KEY);
    if (gmmParam == null) {
      writer.printf(USAGE_STR, protocol, host);
      return;
    }

    String url = request.getRequestURL()
        .append("?")
        .append(query)
        .toString();

    ResponseData svcResponse = null;
    try {
      Map<String, String[]> params = request.getParameterMap();
      if (service.equals(Service.DISTANCE)) {
        svcResponse = processRequestDistance(service, params);
      } else if (service.equals(Service.HW_FW)) {
        svcResponse = processRequestDistance(service, params);
      } else if (service.equals(Service.SPECTRA)) {
        svcResponse = processRequestSpectra(service, params);
      }
      svcResponse.url = url;
      String jsonString = gson.toJson(svcResponse);
      writer.print(jsonString);
    } catch (Exception e) {
      String message = errorMessage(url, e, false);
      writer.print(message);
      e.printStackTrace();
    }
  }

  static class RequestData {
    Set<Gmm> gmms;
    GmmInput input;

    RequestData(Map<String, String[]> params) {
      this.gmms = buildGmmSet(params);
      this.input = buildInput(params);
    }
  }

  static class RequestDataDistance extends RequestData {
    String imt;
    double minDistance;
    double maxDistance;

    RequestDataDistance(
        Map<String, String[]> params,
        String imt,
        double rMin,
        double rMax) {

      super(params);
      this.imt = imt;
      this.minDistance = rMin;
      this.maxDistance = rMax;
    }
  }

  static class ResponseData {
    String name;
    String status = Status.SUCCESS.toString();
    String date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
    String url;
    Object server;
    RequestData request;
    XY_DataGroup means;
    XY_DataGroup sigmas;

    ResponseData(Service service, RequestData request) {
      this.name = service.resultName;
      this.request = request;
      this.server =
          gov.usgs.earthquake.nshmp.www.meta.Metadata.serverData(1, ServletUtil.timer());

      this.means = XY_DataGroup.create(
          service.groupNameMean,
          service.xLabel,
          service.yLabelMedian);

      this.sigmas = XY_DataGroup.create(
          service.groupNameSigma,
          service.xLabel,
          service.yLabelSigma);
    }

    void setXY(
        Map<Gmm, List<Double>> x,
        Map<Gmm, List<Double>> means,
        Map<Gmm, List<Double>> sigmas) {

      for (Gmm gmm : means.keySet()) {
        XySequence xyMeans = XySequence.create(
            x.get(gmm),
            Data.round(ROUND, Data.exp(new ArrayList<>(means.get(gmm)))));
        this.means.add(gmm.name(), gmm.toString(), xyMeans);

        XySequence xySigmas = XySequence.create(
            x.get(gmm),
            Data.round(ROUND, new ArrayList<>(sigmas.get(gmm))));
        this.sigmas.add(gmm.name(), gmm.toString(), xySigmas);
      }
    }

  }

  static ResponseData processRequestDistance(
      Service service, Map<String, String[]> params) {

    boolean isLogSpace = service.equals(Service.DISTANCE) ? true : false;
    Imt imt = readValue(params, IMT, Imt.class);
    double rMin = Double.valueOf(params.get(RMIN_KEY)[0]);
    double rMax = Double.valueOf(params.get(RMAX_KEY)[0]);

    RequestDataDistance request = new RequestDataDistance(
        params, imt.toString(), rMin, rMax);

    DistanceResult result = GroundMotions.distanceGroundMotions(
        request.gmms, request.input, imt, rMin, rMax, isLogSpace);

    ResponseData response = new ResponseData(service, request);
    response.setXY(result.distance, result.means, result.sigmas);

    return response;
  }

  private static ResponseData processRequestSpectra(
      Service service, Map<String, String[]> params) {

    RequestData request = new RequestData(params);
    MultiResult result = spectra(request.gmms, request.input, false);

    // set up response
    ResponseData response = new ResponseData(service, request);
    response.setXY(result.periods, result.means, result.sigmas);

    return response;
  }

  static Set<Gmm> buildGmmSet(Map<String, String[]> params) {
    checkArgument(params.containsKey(Metadata.GMM_KEY),
        "Missing ground motion model key: " +
            Metadata.GMM_KEY);
    return Sets.newEnumSet(
        FluentIterable
            .from(params.get(Metadata.GMM_KEY))
            .transform(Enums.stringConverter(Gmm.class)),
        Gmm.class);
  }

  static GmmInput buildInput(Map<String, String[]> params) {

    Builder builder = GmmInput.builder().withDefaults();
    for (Entry<String, String[]> entry : params.entrySet()) {
      if (entry.getKey().equals(GMM_KEY) || entry.getKey().equals(IMT_KEY) ||
          entry.getKey().equals(RMAX_KEY) || entry.getKey().equals(RMIN_KEY))
        continue;
      Field id = Field.fromString(entry.getKey());
      String value = entry.getValue()[0];
      if (value.equals("")) {
        continue;
      }
      builder.set(id, value);
    }
    return builder.build();
  }

  static final class InputSerializer implements JsonSerializer<GmmInput> {

    Service service;

    InputSerializer(Service service) {
      this.service = service;
    }

    @Override
    public JsonElement serialize(
        GmmInput input,
        Type type,
        JsonSerializationContext context) {

      boolean printDistance = !service.equals(Service.SPECTRA) ? true : false;
      JsonObject root = new JsonObject();
      root.addProperty(MW.toString(), input.Mw);
      root.addProperty(RJB.toString(), printDistance ? input.rJB : null);
      root.addProperty(RRUP.toString(), printDistance ? input.rRup : null);
      root.addProperty(RX.toString(), printDistance ? input.rX : null);
      root.addProperty(DIP.toString(), input.dip);
      root.addProperty(WIDTH.toString(), input.width);
      root.addProperty(ZTOP.toString(), input.zTop);
      root.addProperty(ZHYP.toString(), input.zHyp);
      root.addProperty(RAKE.toString(), input.rake);
      root.addProperty(VS30.toString(), input.vs30);
      root.addProperty(VSINF.toString(), input.vsInf);
      root.addProperty(Z1P0.toString(), Double.isNaN(input.z1p0) ? null : input.z1p0);
      root.addProperty(Z2P5.toString(), Double.isNaN(input.z2p5) ? null : input.z2p5);

      return root;
    }
  }

  static final class Metadata {

    final String status = Status.USAGE.toString();
    String description;
    String syntax;
    static Service service;

    Metadata(Service service) {
      this.service = service;
      this.syntax = "%s://%s/nshmp-haz-ws/gmm" + service.pathInfo + "?";
      this.description = service.description;
    }

    final Parameters parameters = new Parameters();

    /*
     * Placeholder class; all parameter serialization is done via the custom
     * Serializer.
     */
    static final class Parameters {

      static final class Serializer implements JsonSerializer<Parameters> {

        @Override
        public JsonElement serialize(
            Parameters meta, Type type,
            JsonSerializationContext context) {
          JsonObject root = new JsonObject();

          if (!service.equals(Service.SPECTRA)) {
            Set<Imt> imtSet = EnumSet.complementOf(EnumSet.range(PGV, AI));
            final EnumParameter<Imt> imts;
            imts = new EnumParameter<>(
                "Intensity measure type",
                ParamType.STRING,
                imtSet);
            root.add(IMT_KEY, context.serialize(imts));
          }

          /* Serialize input fields. */
          Constraints defaults = Constraints.defaults();
          for (Field field : Field.values()) {
            Param param = createGmmInputParam(field, defaults.get(field));
            JsonElement fieldElem = context.serialize(param);
            root.add(field.id, fieldElem);
          }

          /* Add only add those Gmms that belong to a Group. */
          Set<Gmm> gmms = FluentIterable
              .from(Gmm.Group.values())
              .transformAndConcat(
                  new Function<Gmm.Group, List<Gmm>>() {
                    @Override
                    public List<Gmm> apply(Group group) {
                      return group.gmms();
                    }
                  }::apply)
              .toSortedSet(Ordering.usingToString());
          GmmParam gmmParam = new GmmParam(
              GMM_NAME,
              GMM_INFO,
              gmms);
          root.add(GMM_KEY, context.serialize(gmmParam));

          /* Add gmm groups. */
          GroupParam groups = new GroupParam(
              GROUP_NAME,
              GROUP_INFO,
              EnumSet.allOf(Gmm.Group.class));
          root.add(GROUP_KEY, context.serialize(groups));

          return root;
        }
      }
    };

    @SuppressWarnings("unchecked")
    private static Param createGmmInputParam(
        Field field,
        Optional<?> constraint) {
      return (field == VSINF) ? new BooleanParam(field)
          : new NumberParam(field, (Range<Double>) constraint.get());
    }

    /*
     * Marker interface for spectra parameters. This was previously implemented
     * as an abstract class for label, info, and units, but Gson serialized
     * subclass fields before parent fields. To maintain a preferred order, one
     * can write custom serializers or repeat these four fields in each
     * implementation.
     */
    private static interface Param {}

    private static final class NumberParam implements Param {

      final String label;
      final String info;
      final String units;
      final Double min;
      final Double max;
      final Double value;

      NumberParam(GmmInput.Field field, Range<Double> constraint) {
        this(field, constraint, field.defaultValue);
      }

      NumberParam(GmmInput.Field field, Range<Double> constraint, Double value) {
        this.label = field.label;
        this.info = field.info;
        this.units = field.units.orElse(null);
        this.min = constraint.lowerEndpoint();
        this.max = constraint.upperEndpoint();
        this.value = Doubles.isFinite(value) ? value : null;
      }
    }

    private static final class BooleanParam implements Param {

      final String label;
      final String info;
      final boolean value;

      BooleanParam(GmmInput.Field field) {
        this(field, field.defaultValue == 1.0);
      }

      BooleanParam(GmmInput.Field field, boolean value) {
        this.label = field.label;
        this.info = field.info;
        this.value = value;
      }
    }

    private static final String GMM_KEY = "gmm";
    private static final String GMM_NAME = "Ground Motion Models";
    private static final String GMM_INFO = "Empirical models of ground motion";

    private static class GmmParam implements Param {

      final String label;
      final String info;
      final List<Value> values;

      GmmParam(String label, String info, Set<Gmm> values) {
        this.label = label;
        this.info = info;
        this.values = new ArrayList<>();
        for (Gmm value : values) {
          this.values.add(new Value(value));
        }
      }

      private static class Value {

        final String id;
        final String label;
        final ArrayList<String> supportedImts;

        Value(Gmm gmm) {
          this.id = gmm.name();
          this.label = gmm.toString();
          this.supportedImts = SupportedImts(gmm.supportedIMTs());
        }
      }

      private static ArrayList<String> SupportedImts(Set<Imt> imts) {
        ArrayList<String> supportedImts = new ArrayList<>();

        for (Imt imt : imts) {
          supportedImts.add(imt.name());
        }

        return supportedImts;
      }

    }

    private static final String GROUP_KEY = "group";
    private static final String GROUP_NAME = "Ground Motion Model Groups";
    private static final String GROUP_INFO = "Groups of related ground motion models ";

    private static final class GroupParam implements Param {

      final String label;
      final String info;
      final List<Value> values;

      GroupParam(String label, String info, Set<Gmm.Group> groups) {
        this.label = label;
        this.info = info;
        this.values = new ArrayList<>();
        for (Gmm.Group group : groups) {
          this.values.add(new Value(group));
        }
      }

      private static class Value {

        final String id;
        final String label;
        final List<Gmm> data;

        Value(Gmm.Group group) {
          this.id = group.name();
          this.label = group.toString();
          this.data = group.gmms();
        }
      }
    }
  }

  static enum Service {

    DISTANCE(
        "Ground Motion Vs. Distance",
        "Compute ground motion Vs. distance",
        "/distance",
        "Means",
        "Sigmas",
        "Distance (km)",
        "Median ground motion (g)",
        "Standard deviation"),

    HW_FW(
        "Hanging Wall Effect",
        "Compute hanging wall effect on ground motion Vs. distance",
        "/hw-fw",
        "Means",
        "Sigmas",
        "Distance (km)",
        "Median ground motion (g)",
        "Standard deviation"),

    SPECTRA(
        "Deterministic Response Spectra",
        "Compute deterministic response spectra",
        "/spectra",
        "Means",
        "Sigmas",
        "Period (s)",
        "Median ground motion (g)",
        "Standard deviation");

    final String name;
    final String description;
    final String pathInfo;
    final String resultName;
    final String groupNameMean;
    final String groupNameSigma;
    final String xLabel;
    final String yLabelMedian;
    final String yLabelSigma;

    private Service(
        String name, String description,
        String pathInfo, String groupNameMean,
        String groupNameSigma, String xLabel,
        String yLabelMedian, String yLabelSigma) {
      this.name = name;
      this.description = description;
      this.resultName = name + " Results";
      this.pathInfo = pathInfo;
      this.groupNameMean = groupNameMean;
      this.groupNameSigma = groupNameSigma;
      this.xLabel = xLabel;
      this.yLabelMedian = yLabelMedian;
      this.yLabelSigma = yLabelSigma;
    }

  }

}
