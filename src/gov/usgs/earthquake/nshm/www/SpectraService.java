package gov.usgs.earthquake.nshm.www;

import static com.google.common.base.Preconditions.checkArgument;
import static gov.usgs.earthquake.nshm.www.meta.Metadata.errorMessage;

import static org.opensha2.ResponseSpectra.spectra;
import static org.opensha2.gmm.GmmInput.Field.DIP;
import static org.opensha2.gmm.GmmInput.Field.MW;
import static org.opensha2.gmm.GmmInput.Field.RAKE;
import static org.opensha2.gmm.GmmInput.Field.RJB;
import static org.opensha2.gmm.GmmInput.Field.RRUP;
import static org.opensha2.gmm.GmmInput.Field.RX;
import static org.opensha2.gmm.GmmInput.Field.VS30;
import static org.opensha2.gmm.GmmInput.Field.VSINF;
import static org.opensha2.gmm.GmmInput.Field.WIDTH;
import static org.opensha2.gmm.GmmInput.Field.Z1P0;
import static org.opensha2.gmm.GmmInput.Field.Z2P5;
import static org.opensha2.gmm.GmmInput.Field.ZHYP;
import static org.opensha2.gmm.GmmInput.Field.ZTOP;

import org.opensha2.ResponseSpectra.MultiResult;
import org.opensha2.data.Data;
import org.opensha2.data.XySequence;
import org.opensha2.gmm.Gmm;
import org.opensha2.gmm.Gmm.Group;
import org.opensha2.gmm.GmmInput;
import org.opensha2.gmm.GmmInput.Builder;
import org.opensha2.gmm.GmmInput.Constraints;
import org.opensha2.gmm.GmmInput.Field;

import com.google.common.base.Enums;
import com.google.common.base.Function;
import com.google.common.base.Optional;
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

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshm.www.meta.Status;

/**
 * Deterministic response spectra calculation service.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("unused")
@WebServlet(
    name = "Response Spectra Service",
    description = "USGS NSHMP Response Spectra Calculator",
    urlPatterns = "/spectra")
public class SpectraService extends HttpServlet {
  private static final long serialVersionUID = 1L;

  private static final String NAME = "Deterministic Response Spectra";
  private static final String RESULT_NAME = NAME + " Results";
  private static final String GROUP_NAME_MEAN = "Means";
  private static final String GROUP_NAME_SIGMA = "Sigmas";
  private static final String X_LABEL = "Period (s)";
  private static final String Y_LABEL_MEDIAN = "Median ground motion (g)";
  private static final String Y_LABEL_SIGMA = "Standard deviation";

  private static final Gson GSON;

  static {
    GSON = new GsonBuilder()
        .setPrettyPrinting()
        .disableHtmlEscaping()
        .serializeNulls()
        .registerTypeAdapter(
            Metadata.Parameters.class,
            new Metadata.Parameters.Serializer())
        .registerTypeAdapter(
            GmmInput.class,
            new InputSerializer())
        .create();
  }

  // TODO cache json usage once created?

  // TODO clean - move to service index page docs
  // static {
  // StringBuilder sb = new
  // StringBuilder("DeterministicSpectra usage:<br/><br/>");
  // sb.append("At a minimum, ground motion model
  // <ahref=\"http://usgs.github.io/nshmp-haz/index.html?org/opensha/gmm/Gmm.html\">identifiers</a>
  // must be supplied. For <a
  // href=\"/nshmp-haz-ws/DeterministicSpectra?ids=CB_14\"</a>example</a>:<br/><br/>");
  // sb.append("&nbsp;&nbsp;<code>http://.../nshmp-haz-ws/DeterministicSpectra?ids=CB_14</code><br/><br/>");
  // sb.append("'ids' may be a comma-separated list of model ids, no
  // spaces.<br/><br/>");
  // sb.append("Additional parameters that may optionally be supplied, in order,
  // are:<br/><br/>");
  // sb.append("&nbsp;&nbsp;<code>[mag, rJB, rRup, rX, dip, width, zTop, zHyp,
  // rake, vs30, vsInf, z2p5, z1p0]</code><br/><br/>");
  // sb.append("For <a
  // href=\"/nshmp-haz-ws/DeterministicSpectra?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN\">example</a>:<br/><br/>");
  // sb.append("&nbsp;&nbsp;<code>http://.../nshmp-haz-ws/DeterministicSpectra?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14...</code><br/>");
  // sb.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5...</code><br/>");
  // sb.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN</code><br/><br/>");
  // sb.append("Default values will be used for any parameters not supplied.");
  // USAGE = sb.toString();
  // }
  //

  /*
   * GET requests must have at least an "ids" key. The supplied key-values for
   * GmmInput parameters will be mapped to GmmInput fields as appropriate, using
   * defaults for all missing key-value pairs. An exception will be thrown for
   * keys that do not match "ids" or any of the GmmInput fields.
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    response.setContentType("application/json; charset=UTF-8");

    String query = request.getQueryString();
    String pathInfo = request.getPathInfo();
    String host = request.getServerName() + ":" + request.getServerPort();

    /* At a minimum, Gmms must be defined. */
    String gmmParam = request.getParameter(Metadata.GMM_KEY);

    if (gmmParam == null) {
      response.getWriter().printf(USAGE_STR, host);
      return;
    }

    StringBuffer urlBuf = request.getRequestURL();
    if (query != null) urlBuf.append('?').append(query);
    String url = urlBuf.toString();

    RequestData requestData = new RequestData();
    Map<String, String[]> params = request.getParameterMap();
    try {
      requestData.gmms = buildGmmSet(params);
      requestData.input = buildInput(params);
      ResponseData svcResponse = processRequest(requestData);
      GSON.toJson(svcResponse, response.getWriter());
    } catch (Exception e) {
      String message = errorMessage(url, e, false);
      response.getWriter().print(message);
      e.printStackTrace();
    }
  }

  private static final String USAGE_STR = GSON.toJson(new Metadata());

  static class RequestData {
    Set<Gmm> gmms;
    GmmInput input;
  }

  static class ResponseData {
    String name;
    RequestData request;
    XY_DataGroup means;
    XY_DataGroup sigmas;
  }

  private static ResponseData processRequest(final RequestData request) {

    MultiResult result = spectra(request.gmms, request.input, false);

    // set up response
    ResponseData response = new ResponseData();
    response.request = request;
    response.name = RESULT_NAME;

    response.means = XY_DataGroup.create(
        GROUP_NAME_MEAN,
        X_LABEL,
        Y_LABEL_MEDIAN);

    response.sigmas = XY_DataGroup.create(
        GROUP_NAME_SIGMA,
        X_LABEL,
        Y_LABEL_SIGMA);

    // populate response
    for (Gmm gmm : result.means.keySet()) {

      // result contains immutable lists so copy in order to modify
      XySequence xyMeans = XySequence.create(
          result.periods.get(gmm),
          Data.exp(new ArrayList<>(result.means.get(gmm))));
      response.means.add(gmm.name(), gmm.toString(), xyMeans);

      XySequence xySigmas = XySequence.create(
          result.periods.get(gmm),
          result.sigmas.get(gmm));
      response.sigmas.add(gmm.name(), gmm.toString(), xySigmas);
    }

    return response;
  }

  private static Set<Gmm> buildGmmSet(Map<String, String[]> params) {
    checkArgument(params.containsKey(Metadata.GMM_KEY),
        "Missing ground motion model key: " +
            Metadata.GMM_KEY);
    return Sets.newEnumSet(
        FluentIterable
            .from(params.get(Metadata.GMM_KEY))
            .transform(Enums.stringConverter(Gmm.class)),
        Gmm.class);

    // TODO clean
    // Iterable<String> gmmStrings =
    // Parsing.split(params.get(Metadata.GMM_KEY)[0], Delimiter.COMMA);
    // Converter<String, Gmm> converter = Enums.stringConverter(Gmm.class);
    // return Sets.newEnumSet(Iterables.transform(gmmStrings, converter),
    // Gmm.class);
  }

  private static GmmInput buildInput(Map<String, String[]> params) {
    Builder builder = GmmInput.builder().withDefaults();
    for (Entry<String, String[]> entry : params.entrySet()) {
      if (entry.getKey().equals(Metadata.GMM_KEY)) continue;
      Field id = Field.fromString(entry.getKey());
      String value = entry.getValue()[0];
      if (value.equals("")) {
        continue;
      }
      builder.set(id, value);
    }
    return builder.build();
  }

  /*
   * Custom serializer is used to handle commonly used basin terms defaults:
   * z1p0=NaN and z2p5=NaN. This ends up being a little cleaner than registering
   * a custom type adapter that would then apply to all DOubles. Perhaps
   * relocate to GmmInput if broader need required.
   */
  private static final class InputSerializer implements JsonSerializer<GmmInput> {

    @Override
    public JsonElement serialize(GmmInput input, Type type, JsonSerializationContext context) {
      JsonObject root = new JsonObject();
      root.addProperty(MW.toString(), input.Mw);
      root.addProperty(RJB.toString(), input.rJB);
      root.addProperty(RRUP.toString(), input.rRup);
      root.addProperty(RX.toString(), input.rX);
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

  private static final class Metadata {

    final String status = Status.USAGE.toString();
    final String description = "Compute deterministic response spectra";
    final String syntax = "http://%s/nshmp-haz-ws/spectra?";
    final Parameters parameters = new Parameters();

    /*
     * Placeholder class; all parameter serialization is done via the custom
     * Serializer.
     */
    static final class Parameters {

      static final class Serializer implements JsonSerializer<Parameters> {

        @Override
        public JsonElement serialize(Parameters meta, Type type, JsonSerializationContext context) {
          JsonObject root = new JsonObject();

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
                  })
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
        this.units = field.units.orNull();
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

        Value(Gmm gmm) {
          this.id = gmm.name();
          this.label = gmm.toString();
        }
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

}
