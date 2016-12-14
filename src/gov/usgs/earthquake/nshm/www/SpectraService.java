package gov.usgs.earthquake.nshm.www;

import static com.google.common.base.Preconditions.checkArgument;
import static org.opensha2.ResponseSpectra.spectra;
import static org.opensha2.calc.Site.VS_30_MAX;
import static org.opensha2.calc.Site.VS_30_MIN;
import static org.opensha2.calc.Site.Z1P0_MAX;
import static org.opensha2.calc.Site.Z1P0_MIN;
import static org.opensha2.calc.Site.Z2P5_MAX;
import static org.opensha2.calc.Site.Z2P5_MIN;
import static org.opensha2.eq.Magnitudes.MAX_MAG;
import static org.opensha2.eq.Magnitudes.MIN_MAG;
import static org.opensha2.eq.fault.Faults.DIP_RANGE;
import static org.opensha2.eq.fault.Faults.RAKE_RANGE;
import static org.opensha2.eq.fault.Faults.INTERFACE_WIDTH_RANGE;
import static org.opensha2.eq.fault.Faults.CRUSTAL_DEPTH_RANGE;
import static org.opensha2.gmm.GmmInput.Field.DIP;
import static org.opensha2.gmm.GmmInput.Field.MAG;
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

import java.io.IOException;
import java.io.ObjectInputStream.GetField;
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

import org.opensha2.ResponseSpectra.MultiResult;
import org.opensha2.data.Data;
import org.opensha2.gmm.Gmm;
import org.opensha2.gmm.Gmm.Group;
import org.opensha2.gmm.GmmInput;
import org.opensha2.gmm.GmmInput.Builder;
import org.opensha2.gmm.GmmInput.Constraints;
import org.opensha2.gmm.GmmInput.Field;
import org.opensha2.internal.Parsing;
import org.opensha2.internal.Parsing.Delimiter;

import com.google.common.base.Converter;
import com.google.common.base.Enums;
import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.ImmutableRangeSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Ordering;
import com.google.common.collect.Range;
import com.google.common.collect.RangeSet;
import com.google.common.collect.Sets;
import com.google.common.primitives.Doubles;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

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

  private static final String NAME = "DeterministicSpectra";
  private static final String RESULT_NAME = NAME + " Results";
  private static final String GROUP_NAME_MEAN = "Means";
  private static final String GROUP_NAME_SIGMA = "Sigmas";
  private static final String X_LABEL = "Period (s)";
  private static final String Y_LABEL_MEDIAN = "Median ground motion (g)";
  private static final String Y_LABEL_SIGMA = "Standard deviation";

  private static final String GMM_KEY = "gmms";
  private static final String GMM_NAME = "Ground Motion Models";
  private static final String GMM_INFO = "Empirical models of ground motion";

  private static final Gson GSON;

  static {

    GSON = new GsonBuilder()
        // .serializeSpecialFloatingPointValues()
        .setPrettyPrinting()
        .disableHtmlEscaping()
        .serializeNulls()
        // .registerTypeAdapter(Double.class, new JsonSerializer<Double>() {
        // @Override public JsonElement serialize(Double src, Type
        // typeOfSrc,
        // JsonSerializationContext context) {
        // if (src.isNaN() || src.isInfinite()) return new
        // JsonPrimitive(src.toString());
        // return new JsonPrimitive(src);
        // }
        // })
        .create();
  }

  /*
   * 
   * service name value pairs TODO This service was initially set up to take
   * name-value pairs - this approach does not provide necessary metadata
   * 
   * It will actually be much more complicated to provide services, that are
   * dependent on knowing which GMMs are intended to be used. However, perhaps
   * the servlet is structured to provide: - absolute ranges (JSON meta) and the
   * supported GMMs for nothing provided - collective ranges (JSON meta)for 1 or
   * more GMM supplied (only GMM suplied) - a result for fully specified
   * rupture-site-Gmms
   */

  /*
   * Example get requests:
   * 
   * DeterministicSpectra?ids=CB_14
   * DeterministicSpectra?ids=CB_14,BSSA_14,CB_14,CY_14,IDRISS_14
   * DeterministicSpectra ?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&mag=6.5&rjb=
   * 10.0&rrup=10.3&rx=10.0 &dip=90.0&width=14.0&ztop=0.5&zhyp=7.5&rake=0.0&vs30
   * =760.0&vsinf=true&z2p5=NaN&z1p0=NaN
   * 
   * Refactor ids to gmms.
   * 
   * No args and error: usage, includes default ranges for params
   * 
   * Just gmms: return valid ranges for gmms, need constraints intersection
   * 
   * All required args: result
   * 
   * For analysis purposes, we probably want to be able force gmms outside their
   * recommended ranges
   */

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

    /* At a minimum, Gmms must be defined. */
    String gmmParam = request.getParameter(GMM_KEY);

    if (gmmParam == null) {
      /*
       * If they're not, check to see if a list of Gmm is supplied and return
       * the intersection of their input parameter constraints.
       */

      /*
       * Otherwise, return usage with absolute constraints for each input
       * parameter.
       */
      response.getWriter().print(USAGE_STR);
      return;
    }

    RequestData requestData = new RequestData();
    Map<String, String[]> params = request.getParameterMap();
    try {
      requestData.gmms = buildGmmSet(params);
      requestData.input = buildInput(params);
    } catch (Exception e) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
      // TODO stack trace?
    }

    ResponseData svcResponse = processRequest(requestData);
    GSON.toJson(svcResponse, response.getWriter());

  }

  private static final String USAGE_STR;

  static {
    USAGE_STR = GSON.toJson(new Metadata());

  }

  // static {
  // StringBuilder sb = new
  // StringBuilder("DeterministicSpectra usage:<br/><br/>");
  // sb.append("At a minimum, ground motion model <a
  // href=\"http://usgs.github.io/nshmp-haz/index.html?org/opensha/gmm/Gmm.html\">identifiers</a>
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

    MultiResult result = spectra(request.gmms, request.input);

    // set up response
    ResponseData response = new ResponseData();
    response.request = request;
    response.name = RESULT_NAME;

    response.means = XY_DataGroup.create(
        GROUP_NAME_MEAN,
        X_LABEL,
        Y_LABEL_MEDIAN,
        result.periods);

    response.sigmas = XY_DataGroup.create(
        GROUP_NAME_SIGMA,
        X_LABEL,
        Y_LABEL_SIGMA,
        result.periods);

    // populate response
    for (Gmm gmm : result.meanMap.keySet()) {
      // result contains immutable lists so copy in order to modify
      response.means.add(gmm.name(), gmm.toString(),
          Data.exp(new ArrayList<>(result.meanMap.get(gmm))));
      response.sigmas.add(gmm.name(), gmm.toString(), result.sigmaMap.get(gmm));
    }
    return response;
  }

  private static Set<Gmm> buildGmmSet(Map<String, String[]> params) {
    checkArgument(params.containsKey(GMM_KEY), "Missing ground motion model key: " +
        GMM_KEY);
    Iterable<String> gmmStrings = Parsing.split(params.get(GMM_KEY)[0], Delimiter.COMMA);
    Converter<String, Gmm> converter = Enums.stringConverter(Gmm.class);
    return Sets.newEnumSet(Iterables.transform(gmmStrings, converter), Gmm.class);
  }

  private static GmmInput buildInput(Map<String, String[]> params) {

    Builder builder = GmmInput.builder().withDefaults();

    for (Entry<String, String[]> entry : params.entrySet()) {
      if (entry.getKey().equals(GMM_KEY)) continue;
      String key = entry.getKey();
      String value = entry.getValue()[0];
      Field field = Field.fromString(key);
      checkArgument(field != null, "Invalid key: %s", key);

      switch (field) {
        case MAG:
          builder.mag(Double.valueOf(value));
          break;
        case RJB:
          builder.rJB(Double.valueOf(value));
          break;
        case RRUP:
          builder.rRup(Double.valueOf(value));
          break;
        case RX:
          builder.rX(Double.valueOf(value));
          break;
        case DIP:
          builder.dip(Double.valueOf(value));
          break;
        case WIDTH:
          builder.width(Double.valueOf(value));
          break;
        case ZTOP:
          builder.zTop(Double.valueOf(value));
          break;
        case ZHYP:
          builder.zHyp(Double.valueOf(value));
          break;
        case RAKE:
          builder.rake(Double.valueOf(value));
          break;
        case VS30:
          builder.vs30(Double.valueOf(value));
          break;
        case VSINF:
          builder.vsInf(Boolean.valueOf(value));
          break;
        case Z2P5:
          builder.z2p5(Double.valueOf(value));
          break;
        case Z1P0:
          builder.z1p0(Double.valueOf(value));
          break;
        default:
          throw new IllegalStateException("Unhandled field: " + field);
      }
    }
    return builder.build();
  }

  private static final String GROUPS_KEY = "groups";
  private static final String GROUPS_NAME = "Ground Motion Model Groups";
  private static final String GROUPS_INFO = "Groups of related ground motion models ";

  private static final String GMMS_KEY = "gmms";
  private static final String GMMS_NAME = "Ground Motion Models";
  private static final String GMMS_INFO = "Empirical models of ground motion";

  public static void main(String[] args) {
    new Metadata();
  }

  private static final class Metadata {

    final Status status = Status.USAGE;
    final String description = "Compute deterministic response spectra";
    final String syntax = "http://%s/nshmp-haz-ws/spectra?gmms=CB_14";
    final List<Param> parameters;

    Metadata() {
      parameters = new ArrayList<>();

      /* Add gmm groups. */
      parameters.add(new GroupParam(
          GROUPS_KEY, GROUPS_NAME, GROUPS_INFO,
          EnumSet.allOf(Gmm.Group.class)));

      /* Add only add those Gmms that belong to a Group. */
      Set<Gmm> gmms = FluentIterable
          .of(Gmm.Group.values())
          .transformAndConcat(
              new Function<Gmm.Group, List<Gmm>>() {
                @Override
                public List<Gmm> apply(Group group) {
                  return group.gmms();
                }
              })
          .toSortedSet(Ordering.usingToString());
      parameters.add(new GmmParam(GMM_KEY, GMM_NAME, GMM_INFO, gmms));

      /* Add all GmmInput fields. */
      Constraints defaults = Constraints.defaults();
      for (Field field : Field.values()) {
        parameters.add(createGmmInputParam(field, defaults.get(field)));
      }
    }

    static enum Status {
      USAGE,
      GMM_CONSTRAINTS,
      SUCCESS,
      FAILURE;
    }
  }

  // public static void main(String[] args) {
  // Set<Gmm> gmms = EnumSet.allOf(Gmm.class);
  // System.out.println(gmms);
  // }

  @SuppressWarnings("unchecked")
  private static Param createGmmInputParam(
      Field field,
      Optional<?> constraint) {
    return (field == VSINF) ? new BooleanFieldParam(field)
        : new NumberFieldParam(field, (Range<Double>) constraint.get());
  }

  /*
   * Marker interface for spectra parameters. This was previously implemented as
   * an abstract class for id, name, info, and units, but Gson serialized
   * subclass fields before parent fields. To maintain a preferred order, one
   * can write custom serializers or repeat these four fields in each
   * implementation.
   */
  private static interface Param {}

  private static final class NumberFieldParam implements Param {

    final String id;
    final String name;
    final String shortName;
    final String info;
    final String units;
    final Double min;
    final Double max;
    final Double value;

    NumberFieldParam(GmmInput.Field field, Range<Double> constraint) {
      this(field, constraint, field.defaultValue);
    }

    NumberFieldParam(GmmInput.Field field, Range<Double> constraint, Double value) {
      this.id = field.toString();
      this.name = field.label;
      this.shortName = field.shortLabel;
      this.info = field.info;
      this.units = field.units.orNull();
      this.min = constraint.lowerEndpoint();
      this.max = constraint.upperEndpoint();
      this.value = Doubles.isFinite(value) ? value : null;
    }
  }

  private static final class BooleanFieldParam implements Param {

    final String id;
    final String name;
    final String info;
    final boolean value;

    BooleanFieldParam(GmmInput.Field field) {
      this(field, field.defaultValue == 1.0);
    }

    BooleanFieldParam(GmmInput.Field field, boolean value) {
      this.id = field.toString();
      this.name = field.label;
      this.info = field.info;
      this.value = value;
    }
  }

  private static class GmmParam implements Param {

    final String id;
    final String name;
    final String info;
    final List<Value> values;

    GmmParam(String id, String name, String info, Set<Gmm> values) {
      this.id = id;
      this.name = name;
      this.info = info;
      this.values = new ArrayList<>();
      for (Gmm value : values) {
        this.values.add(new Value(value));
      }
    }

    private static class Value {

      final String id;
      final String name;

      Value(Gmm gmm) {
        this.id = gmm.name();
        this.name = gmm.toString();
      }
    }
  }

  private static final class GroupParam implements Param {

    final String id;
    final String name;
    final String info;
    final List<Value> values;

    GroupParam(String id, String name, String info, Set<Gmm.Group> groups) {
      this.id = id;
      this.name = name;
      this.info = info;
      this.values = new ArrayList<>();
      for (Gmm.Group group : groups) {
        this.values.add(new Value(group));
      }
    }

    private static class Value {

      final String id;
      final String name;
      final List<Gmm> data;

      Value(Gmm.Group group) {
        this.id = group.name();
        this.name = group.toString();
        this.data = group.gmms();
      }
    }
  }

}
