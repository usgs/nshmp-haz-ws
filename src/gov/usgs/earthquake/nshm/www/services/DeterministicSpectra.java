package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.Preconditions.checkArgument;
import static org.opensha.calc.Site.MAX_VS30;
import static org.opensha.calc.Site.MAX_Z1P0;
import static org.opensha.calc.Site.MAX_Z2P5;
import static org.opensha.calc.Site.MIN_VS30;
import static org.opensha.calc.Site.MIN_Z1P0;
import static org.opensha.calc.Site.MIN_Z2P5;
import static org.opensha.eq.Magnitudes.MAX_MAG;
import static org.opensha.eq.Magnitudes.MIN_MAG;
import static org.opensha.eq.fault.Faults.MAX_DEPTH_SUB_SLAB;
import static org.opensha.eq.fault.Faults.MAX_DIP;
import static org.opensha.eq.fault.Faults.MAX_RAKE;
import static org.opensha.eq.fault.Faults.MAX_WIDTH_SUB_INTERFACE;
import static org.opensha.eq.fault.Faults.MIN_DEPTH;
import static org.opensha.eq.fault.Faults.MIN_DIP;
import static org.opensha.eq.fault.Faults.MIN_RAKE;
import static org.opensha.eq.fault.Faults.MIN_WIDTH;
import static org.opensha.gmm.GmmInput.Field.DIP;
import static org.opensha.gmm.GmmInput.Field.MAG;
import static org.opensha.gmm.GmmInput.Field.RAKE;
import static org.opensha.gmm.GmmInput.Field.RJB;
import static org.opensha.gmm.GmmInput.Field.RRUP;
import static org.opensha.gmm.GmmInput.Field.RX;
import static org.opensha.gmm.GmmInput.Field.VS30;
import static org.opensha.gmm.GmmInput.Field.VSINF;
import static org.opensha.gmm.GmmInput.Field.WIDTH;
import static org.opensha.gmm.GmmInput.Field.Z1P0;
import static org.opensha.gmm.GmmInput.Field.Z2P5;
import static org.opensha.gmm.GmmInput.Field.ZHYP;
import static org.opensha.gmm.GmmInput.Field.ZTOP;
import static org.opensha.programs.DeterministicSpectra.spectra;
import gov.usgs.earthquake.nshm.www.util.XY_DataGroup;
import gov.usgs.earthquake.param.Param;
import gov.usgs.earthquake.param.ParamList;
import gov.usgs.earthquake.param.Params;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha.data.DataUtils;
import org.opensha.gmm.Gmm;
import org.opensha.gmm.GmmInput;
import org.opensha.gmm.GmmInput.Builder;
import org.opensha.gmm.GmmInput.Field;
import org.opensha.programs.DeterministicSpectra.MultiResult;
import org.opensha.util.Parsing;
import org.opensha.util.Parsing.Delimiter;

import com.google.common.base.Converter;
import com.google.common.base.Enums;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/**
 * DeterministicSpectra servlet implementation.
 */
@WebServlet("/DeterministicSpectra")
public class DeterministicSpectra extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final String NAME = "DeterministicSpectra";
	private static final String RESULT_NAME = NAME + " Results";
	private static final String GROUP_NAME_MEAN = "Means";
	private static final String GROUP_NAME_SIGMA = "Sigmas";
	private static final String X_LABEL = "Period (s)";
	private static final String Y_LABEL_MEDIAN = "Median ground motion (g)";
	private static final String Y_LABEL_SIGMA = "Standard deviation";

	private static final String KEY_IDS = "ids";

	private static final Gson GSON;

	// @formatter:off
	static {
				
		GSON = new GsonBuilder()
			.serializeSpecialFloatingPointValues()
			.setPrettyPrinting()
			.registerTypeAdapter(Double.class, new JsonSerializer<Double>() {
				@Override public JsonElement serialize(Double src, Type typeOfSrc,
						JsonSerializationContext context) {
					if (src.isNaN() || src.isInfinite()) return new JsonPrimitive(src.toString());
					return new JsonPrimitive(src);
				}
            })
			.create();
	}
	
	/*
	 * TODO
	 * This service was initially set up to take name-value pairs
	 * 		- this approach does not provide necessary metadata
	 * 
	 * It will actually be much more complicated to provide services, that are dependent
	 * on knowing which GMMs are intended to be used. However, perhaps the servlet is
	 * structured to provide:
	 * 		- absolute ranges (JSON meta) and the supported GMMs for nothing provided
	 * 		- collective ranges (JSON meta)for 1 or more GMM supplied (only GMM suplied)
	 * 		- a result for fully specified rupture-site-Gmms
	 */

	/*
	 * Example get requests:
	 *  
	 * DeterministicSpectra?ids=CB_14
	 * DeterministicSpectra?ids=CB_14,BSSA_14,CB_14,CY_14,IDRISS_14
	 * DeterministicSpectra?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN
	 */

	// @formatter:on

	/*
	 * GET requests must have at least an "ids" key. The supplied key-values for
	 * GmmInput parameters will be mapped to GmmInput fields as appropriate,
	 * using defaults for all missing key-value pairs. An exception will be
	 * thrown for keys that do not match "ids" or any of the GmmInput fields.
	 */
	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");

		String gmmParam = request.getParameter(KEY_IDS);
		if (gmmParam == null) {
			response.getWriter().print(USAGE);
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

	private static final String USAGE;

	static {
		StringBuilder sb = new StringBuilder("DeterministicSpectra usage:<br/><br/>");
		sb.append("At a minimum, ground motion model <a href=\"http://usgs.github.io/nshmp-haz/index.html?org/opensha/gmm/Gmm.html\">identifiers</a> must be supplied. For <a href=\"/nshmp-haz-ws/DeterministicSpectra?ids=CB_14\"</a>example</a>:<br/><br/>");
		sb.append("&nbsp;&nbsp;<code>http://.../nshmp-haz-ws/DeterministicSpectra?ids=CB_14</code><br/><br/>");
		sb.append("'ids' may be a comma-separated list of model ids, no spaces.<br/><br/>");
		sb.append("Additional parameters that may optionally be supplied, in order, are:<br/><br/>");
		sb.append("&nbsp;&nbsp;<code>[mag, rJB, rRup, rX, dip, width, zTop, zHyp, rake, vs30, vsInf, z2p5, z1p0]</code><br/><br/>");
		sb.append("For <a href=\"/nshmp-haz-ws/DeterministicSpectra?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN\">example</a>:<br/><br/>");
		sb.append("&nbsp;&nbsp;<code>http://.../nshmp-haz-ws/DeterministicSpectra?ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14...</code>");
		sb.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5...</code>");
		sb.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code>&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN</code><br/><br/>");
		sb.append("Default values will be used for any parameters not supplied.");
		USAGE = sb.toString();
	}

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
		response.means = XY_DataGroup.create(GROUP_NAME_MEAN, X_LABEL, Y_LABEL_MEDIAN,
			result.periods);
		response.sigmas = XY_DataGroup.create(GROUP_NAME_SIGMA, X_LABEL, Y_LABEL_SIGMA,
			result.periods);

		// populate response
		for (Gmm gmm : result.meanMap.keySet()) {
			// result contains immutable lists so copy in order to modify
			response.means.add(gmm.name(), gmm.toString(),
				DataUtils.exp(new ArrayList<>(result.meanMap.get(gmm))));
			response.sigmas.add(gmm.name(), gmm.toString(), result.sigmaMap.get(gmm));
		}
		return response;
	}

	private static Set<Gmm> buildGmmSet(Map<String, String[]> params) {
		checkArgument(params.containsKey(KEY_IDS), "Missing ground motion model key: " + KEY_IDS);
		Iterable<String> gmmStrings = Parsing.split(params.get(KEY_IDS)[0], Delimiter.COMMA);
		Converter<String, Gmm> converter = Enums.stringConverter(Gmm.class);
		return Sets.newEnumSet(Iterables.transform(gmmStrings, converter), Gmm.class);
	}

	private static GmmInput buildInput(Map<String, String[]> params) {

		Builder builder = GmmInput.builder().withDefaults();

		for (Entry<String, String[]> entry : params.entrySet()) {
			if (entry.getKey().equals(KEY_IDS)) continue;
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

	// TODO holding on to code below in the event that GET is updated to
	// handle JSON requests.
	
	/*
	 * POST expects JSON of the form:
	 * 
	 * { "ids":["ASK_14","BSSA_14","CB_14","CY_14","IDRISS_14"], "input":{
	 * "rate":0.0, "Mw":6.5, "rJB":10.0, "rRup":10.3, "rX":10.0, "dip":90.0,
	 * "width":14.0, "zTop":0.5, "zHyp":7.5, "rake":0.0, "vs30":760.0,
	 * "vsInf":true, "z2p5":NaN, "z1p0":NaN } };
	 */

	// Old test POST implementation that would receive JSON
	// @Override protected void doPost(HttpServletRequest request,
	// HttpServletResponse response)
	// throws ServletException, IOException {
	//
	// InputStream stream = request.getInputStream();
	// String data = CharStreams.toString(new InputStreamReader(stream,
	// Charsets.UTF_8));
	// Closeables.closeQuietly(stream);
	//
	// Request svcRequest = GSON.fromJson(data, Request.class);
	// Response svcResponse = processRequest(svcRequest);
	// GSON.toJson(svcResponse, response.getWriter());
	// }

	static class Parameters {

		ParamList pList;

		// @formatter:off
		
		Parameters() {
			
			Param<Gmm> gmmParam = Params.newEnumParam(
				"Ground Motion Model",
				"Choose a ground motion model",
				Gmm.ASK_14,
				EnumSet.of(Gmm.ASK_14, Gmm.BSSA_14, Gmm.CB_14, Gmm.CY_14, Gmm.IDRISS_14));
			
			// @formatter:on

			// TODO this should really be polling the Gmms for supported
			// magnitude range
			Param<Double> magParam = Params.newDoubleParamWithBounds(MAG.label, MAG.info, MAG.unit,
				MAG.defaultValue, MIN_MAG, MAX_MAG);

			Param<Double> rjbParam = Params.newDoubleParamWithBounds(RJB.label, RJB.label,
				RJB.unit, RJB.defaultValue, 0.0, 300.0);

			Param<Double> rrupParam = Params.newDoubleParamWithBounds(RRUP.label, RRUP.info,
				RRUP.unit, RRUP.defaultValue, 0.0, 300.0);

			Param<Double> rxParam = Params.newDoubleParamWithBounds(RX.label, RX.info, RX.unit,
				RX.defaultValue, 0.0, 300.0);

			Param<Double> dipParam = Params.newDoubleParamWithBounds(DIP.label, DIP.info, DIP.unit,
				DIP.defaultValue, MIN_DIP, MAX_DIP);

			Param<Double> widthParam = Params.newDoubleParamWithBounds(WIDTH.label, WIDTH.info,
				WIDTH.unit, WIDTH.defaultValue, MIN_WIDTH, MAX_WIDTH_SUB_INTERFACE);

			Param<Double> ztopParam = Params.newDoubleParamWithBounds(ZTOP.label, ZTOP.info,
				ZTOP.unit, ZTOP.defaultValue, MIN_DEPTH, MAX_DEPTH_SUB_SLAB);

			Param<Double> zhypParam = Params.newDoubleParamWithBounds(ZHYP.label, ZHYP.info,
				ZHYP.unit, ZHYP.defaultValue, MIN_DEPTH, MAX_DEPTH_SUB_SLAB);

			Param<Double> rakeParam = Params.newDoubleParamWithBounds(RAKE.label, RAKE.info,
				RAKE.unit, RAKE.defaultValue, MIN_RAKE, MAX_RAKE);

			Param<Double> vs30Param = Params.newDoubleParamWithBounds(VS30.label, VS30.info,
				VS30.unit, VS30.defaultValue, MIN_VS30, MAX_VS30);

			Param<Boolean> vsinfParam = Params.newBooleanParam(VSINF.label, VSINF.info,
				VSINF.defaultValue > 0.0);

			// TODO basin depth defaults; should
			Param<Double> z2p5Param = Params.newDoubleParamWithBounds(Z2P5.label, Z2P5.info,
				Z2P5.unit, Z2P5.defaultValue, MIN_Z2P5, MAX_Z2P5);

			Param<Double> z1p0Param = Params.newDoubleParamWithBounds(Z1P0.label, Z1P0.info,
				Z1P0.unit, Z1P0.defaultValue, MIN_Z1P0, MAX_Z1P0);

			pList = ParamList.of(gmmParam, magParam, rjbParam, rrupParam, rxParam, dipParam,
				widthParam, ztopParam, zhypParam, rakeParam, vs30Param, vsinfParam, z2p5Param,
				z1p0Param);

		}
	}

}
