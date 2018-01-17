package gov.usgs.earthquake.nshmp.www;



//.................... Import .....................
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
import static gov.usgs.earthquake.nshmp.gmm.Imt.PGA;
import static gov.usgs.earthquake.nshmp.gmm.Imt.PGV;
import static gov.usgs.earthquake.nshmp.gmm.Imt.AI;

import static gov.usgs.earthquake.nshmp.www.meta.Metadata.errorMessage;

import static gov.usgs.earthquake.nshmp.www.Util.readValue;
import static gov.usgs.earthquake.nshmp.www.Util.Key.IMT;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Date;
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
//-------------------------------------------------------



//............................ Class: GroundMotionService .................................
@WebServlet(
  name = "Ground Motion Vs. Distance",
  description = "USGS NSHMP Ground Motion Vs. Distance Calculator",
  urlPatterns = {"/gmm", 
  			"/gmm/*"}
)
public class GroundMotionService extends HttpServlet {
  private static final long serialVersionUID = 1L;
  
  private static final String DISTANCE = "/distance";
  private static final String SPECTRA = "/spectra";
  
  private static final String DISTANCE_DESCRIPTION = 
  			"Compute ground motion Vs. distance";
  private static final String SPECTRA_DESCRIPTION = 
  			"Compute deterministic response spectra";
 
  private static final String GMM_KEY = "gmm";
  private static final String RMAX_KEY = "rMax";
  private static final String IMT_KEY = "imt"; 

  
  //................................. Method: doGet .......................................
  @Override
  protected void doGet(
      HttpServletRequest request, 
      HttpServletResponse response)
          throws ServletException, IOException {
    
    PrintWriter writer = response.getWriter();     
    
    String query = request.getQueryString();
    String pathInfo = request.getPathInfo();
    String host = request.getServerName();
    
    Gson gson = new GsonBuilder() 
        .setPrettyPrinting()
        .serializeNulls()
        .disableHtmlEscaping() 
        .registerTypeAdapter(
            Metadata.Parameters.class, 
            new Metadata.Parameters.Serializer())
        .registerTypeAdapter(
            GmmInput.class,
            new InputSerializer(pathInfo))
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
    final String USAGE_STR = gson.toJson(new Metadata(pathInfo));
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
      RequestData requestData = new RequestData();
      requestData.gmms = buildGmmSet(params);
      requestData.input = buildInput(params);
      if (pathInfo.matches(DISTANCE)) {
      		svcResponse = processRequestDistance(requestData, params);
      }else if (pathInfo.matches(SPECTRA)){
      		svcResponse = processRequestSpectra(requestData);
      }
      svcResponse.url = url;
			String jsonString = gson.toJson(svcResponse);
      writer.print(jsonString); 
    }catch (Exception e) {
      String message = errorMessage(url, e, false);
      writer.print(message);
      e.printStackTrace();
    }
  }
  //------------------------------- End Method: doGet -------------------------------------
  
  
  
  //............................. Class: RequestData ......................................
  static class RequestData{
    Set<Gmm> gmms;
    //RequestInputs inputs = new RequestInputs(); 
    GmmInput input;
  }
  //------------------------------ End Class: RequestData ---------------------------------
  
  
  
  //............................. Class: ResponseData .....................................
  static class ResponseData{
    String name; 
    String status = Status.SUCCESS.toString();
    String date = ServletUtil.formatDate(new Date());
    String url;
    Object server;
    RequestData request;
    XY_DataGroup means;
    XY_DataGroup sigmas;  
  }
  //----------------------------- End Class: ResponseData ---------------------------------
  
  
  
  //............................ Class: Inputs ............................................
  static class RequestInputs{
    double maxRuptureDistance;
    String imt;
    GmmInput input;
    List<Double> rJBs;
    List<Double> rRups;
    List<Double> rXs;
  }
  //----------------------- End Class: Inputs ---------------------------------------------
  
 
  
  //......................... Method: proccessRequestDistance .............................
  static ResponseData processRequestDistance(
  			final RequestData request,
  			Map<String, String[]> params) {
  	
    final String NAME = "Ground Motion Vs. Distance";
    final String RESULT_NAME = NAME + " Results";
    final String GROUP_NAME_MEAN = "Means";
    final String GROUP_NAME_SIGMA = "Sigmas";
    final String X_LABEL = "Distance (km)";
    final String Y_LABEL_MEDIAN = "Median ground motion (g)";
    final String Y_LABEL_SIGMA = "Standard deviation";
   
    Imt imt = readValue(params, IMT, Imt.class);
    double rMax = Double.valueOf(params.get("rMax")[0]);
    
    
    DistanceResult result = GroundMotions.distanceGroundMotions(
        request.gmms, request.input, imt, rMax);
    /*
    request.inputs.rJBs = result.rJBs;
    request.inputs.rRups = result.rRups;
    request.inputs.rXs = result.rXs;
    request.inputs.imt = imt.toString();
    request.inputs.maxRuptureDistance = rMax;
    */
    
    ResponseData response = new ResponseData();
    response.name = RESULT_NAME;
    response.request = request;
    response.server =
        gov.usgs.earthquake.nshmp.www.meta.Metadata.serverData(1, ServletUtil.timer());
    
    response.means = XY_DataGroup.create(GROUP_NAME_MEAN, X_LABEL, Y_LABEL_MEDIAN);
    response.sigmas = XY_DataGroup.create(GROUP_NAME_SIGMA, X_LABEL , Y_LABEL_SIGMA);
    
    for(Gmm gmm : result.means.keySet()) {
      XySequence xyMeans = XySequence.create(
          result.distance.get(gmm), 
          Data.exp(new ArrayList<>(result.means.get(gmm))));
      response.means.add(gmm.name(), gmm.toString(), xyMeans);
      
      XySequence xySigmas = XySequence.create(
          result.distance.get(gmm), 
          Data.exp(new ArrayList<>(result.sigmas.get(gmm))));
      response.sigmas.add(gmm.name(), gmm.toString(), xySigmas);          
    }
    
    return response;
  }
  //----------------------- End Method: processRequestDistance ----------------------------
  
  
  
  //...................... Method: processRequestSpectra ..................................
  private static ResponseData processRequestSpectra(final RequestData request) {
  	
  		final String NAME = "Deterministic Response Spectra";
    final String RESULT_NAME = NAME + " Results";
    final String GROUP_NAME_MEAN = "Means";
    final String GROUP_NAME_SIGMA = "Sigmas";
    final String X_LABEL = "Periods (s)";
    final String Y_LABEL_MEDIAN = "Median ground motion (g)";
    final String Y_LABEL_SIGMA = "Standard deviation";

    MultiResult result = spectra(request.gmms, request.input, false);

    // set up response
    ResponseData response = new ResponseData();
    response.name = RESULT_NAME;
    response.request = request;
    response.server =
        gov.usgs.earthquake.nshmp.www.meta.Metadata.serverData(1, ServletUtil.timer());

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
  //------------------------- End Method: processRequestSpectra ---------------------------

  
  
  //......................... Method: buildGmmSet .........................................
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
  //---------------------- End Method: buildGmmSet ----------------------------------------
  
  
  
  //............................ Method: buildInput .......................................
  static GmmInput buildInput(Map<String, String[]> params) {
    
    Builder builder = GmmInput.builder().withDefaults();
    for (Entry<String, String[]> entry : params.entrySet()) {
      if (entry.getKey().equals(GMM_KEY)  
          || entry.getKey().equals(IMT_KEY)
          || entry.getKey().equals(RMAX_KEY))  continue;
      Field id = Field.fromString(entry.getKey());
      String value = entry.getValue()[0];
      if (value.equals("")) {
        continue;
      }
      builder.set(id, value);
    }
    return builder.build();
  }
  //------------------------- End Method: buildInput --------------------------------------
  
  
  
  //............................. Class: InputSerializer ..................................
  static final class InputSerializer implements JsonSerializer<GmmInput> {
  		
  		String pathInfo;
  		
  		InputSerializer(String pathInfo){
  			this.pathInfo = pathInfo;
  		}
  		
    @Override
    public JsonElement serialize(
    			GmmInput input, 
    			Type type, 
    			JsonSerializationContext context) {
    		JsonObject root = new JsonObject();
      root.addProperty(MW.toString(), input.Mw);
      if (pathInfo.matches(SPECTRA)){
      		root.addProperty(RJB.toString(), input.rJB);
      		root.addProperty(RRUP.toString(), input.rRup);
      		root.addProperty(RX.toString(), input.rX);
      }
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
  //------------------------- End Class: InputSerializer ----------------------------------
  
  
  
  //.............................. Class: Metadata ........................................
  static final class Metadata {

    final String status = Status.USAGE.toString();
    String description; 
    String syntax; 
    
    static String pathInfo;

    Metadata(String pathInfo){
    		this.pathInfo = pathInfo;
    		this.syntax = "http://%s/nshmp-haz-ws" + pathInfo+ "?";
    		if (pathInfo.matches(DISTANCE)) {
    			this.description = DISTANCE_DESCRIPTION;
    		} else if (pathInfo.matches(SPECTRA)) {
    			this.description = SPECTRA_DESCRIPTION;
    		}
    		
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
          
          if (pathInfo.matches(DISTANCE)) { 
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
        final ArrayList<String> supportedImts;

        Value(Gmm gmm) {
          this.id = gmm.name();
          this.label = gmm.toString();
          this.supportedImts = SupportedImts(gmm.supportedIMTs());
        }
      }
      
      
      private static ArrayList<String> SupportedImts(Set<Imt> imts){
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
  //----------------------------- End Class: Metadata -------------------------------------
  

  
  
  
}
//---------------------------- End Class: GroundMotionService -----------------------------