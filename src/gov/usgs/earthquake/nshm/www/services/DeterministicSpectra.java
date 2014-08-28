package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.Preconditions.checkArgument;
import static org.opensha.programs.DeterministicSpectra.spectra;
import gov.usgs.earthquake.nshm.www.util.XY_DataGroup;

import java.io.IOException;
import java.util.ArrayList;
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
import org.opensha.gmm.GmmInput.GmmField;
import org.opensha.programs.DeterministicSpectra.MultiResult;
import org.opensha.util.Parsing;

import com.google.common.base.Converter;
import com.google.common.base.Enums;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

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
			.create();
	}

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
		sb.append("At a minimum, ground motion model identifiers must be supplied:<br/>");
		sb.append("&nbsp;&nbsp;&nbsp;&nbsp;e.g.  DeterministicSpectra?ids=CB_14<br/><br/>");
		sb.append("'ids' may be a comma-separated list of model ids, no spaces.<br/><br/>");
		sb.append("Additional parameters that may optionally be supplied are:<br/>");
		sb.append("&nbsp;&nbsp;&nbsp;&nbsp;[mag, rJB, rRup, rX, dip, width, zTop, zHyp, rake, vs30, vsInf, z2p5, z1p0]<br/><br/>");
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
		Iterable<String> gmmStrings = Parsing.splitOnCommas(params.get(KEY_IDS)[0]);
		Converter<String, Gmm> converter = Enums.stringConverter(Gmm.class);
		return Sets.newEnumSet(Iterables.transform(gmmStrings, converter), Gmm.class);
	}

	private static GmmInput buildInput(Map<String, String[]> params) {

		Builder builder = GmmInput.builder().withDefaults();

		for (Entry<String, String[]> entry : params.entrySet()) {
			if (entry.getKey().equals(KEY_IDS)) continue;
			String key = entry.getKey();
			String value = entry.getValue()[0];
			GmmField field = GmmField.fromString(key);
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

}
