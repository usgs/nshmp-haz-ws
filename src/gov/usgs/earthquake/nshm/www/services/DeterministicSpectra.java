package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.Preconditions.checkArgument;
import gov.usgs.earthquake.nshm.www.util.XY_DataGroup;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha.calc.ScalarGroundMotion;
import org.opensha.data.DataUtils;
import org.opensha.gmm.Gmm;
import org.opensha.gmm.GmmInput;
import org.opensha.gmm.GmmInput.Builder;
import org.opensha.gmm.GmmInput.GmmField;
import org.opensha.gmm.Imt;
import org.opensha.util.Parsing;

import com.google.common.base.Charsets;
import com.google.common.base.Converter;
import com.google.common.base.Enums;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.common.io.CharStreams;
import com.google.common.io.Closeables;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet implementation class DeterministicSpectra
 */
@WebServlet("/DeterministicSpectra")
public class DeterministicSpectra extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final String NAME = "Hazard Spectra";
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
//			.setPrettyPrinting()
//			.enableComplexMapKeySerialization()
			.create();
	}
	// @formatter:on

	public DeterministicSpectra() {}

	private static final String DEFAULT_QUERY = "ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&mag=6.5&rjb=10.0&rrup=10.3&rx=10.0&dip=90.0&width=14.0&ztop=0.5&zhyp=7.5&rake=0.0&vs30=760.0&vsinf=true&z2p5=NaN&z1p0=NaN";
	
	/*
	 * GET requests must have at least and "ids" key. The supplied key-values for
	 * GmmInput parameters will be mapped to GmmInput fields as appropriate, using
	 * defaults for all missing key-value pairs. An exception will be thrown for
	 * keys that do not match "ids" or any of the GmmInput fields.
	 */
	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// TODO hold on to this for other services
		// Iterator<String> args =
		// Parsing.splitOnSlash(request.getQueryString()).iterator();
		// Iterable<Gmm> gmms =
		// Iterables.transform(Parsing.splitOnCommas(args.next()),
		// Enums.stringConverter(Gmm.class));
		// Iterable

		
		String query = request.getQueryString();
		if (Strings.isNullOrEmpty(query)) query = DEFAULT_QUERY;
		Map<String, String[]> params = request.getParameterMap();
		
		Request svcRequest = new Request();
		try {
			svcRequest.ids = buildGmmSet(params);
			svcRequest.input = buildInput(params);
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
		Response svcResponse = processRequest(svcRequest);
		
		response.setContentType("text/html");
//		PrintWriter printWriter = response.getWriter();
//		printWriter.println("<h1>Hello Get!</h1>");
		GSON.toJson(svcResponse, response.getWriter());

	}

	/* 
	 * @formatter:off
	 * 
	 * POST expects JSON of the form:
	 * 
	 * {
	 * 		"ids":["ASK_14","BSSA_14","CB_14","CY_14","IDRISS_14"],
	 * 		"input":{
	 * 			"rate":0.0,
	 * 			"Mw":6.5,
	 * 			"rJB":10.0,
	 * 			"rRup":10.3,
	 * 			"rX":10.0,
	 * 			"dip":90.0,
	 * 			"width":14.0,
	 * 			"zTop":0.5,
	 * 			"zHyp":7.5,
	 * 			"rake":0.0,
	 * 			"vs30":760.0,
	 * 			"vsInf":true,
	 * 			"z2p5":NaN,
	 * 			"z1p0":NaN
	 * 		}
	 * };
	 * 
	 * @formatter:on
	 */

	@Override protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		InputStream stream = request.getInputStream();
		String data = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
		Closeables.closeQuietly(stream);

		Request svcRequest = GSON.fromJson(data, Request.class);
		Response svcResponse = processRequest(svcRequest);
		GSON.toJson(svcResponse, response.getWriter());
	}

	static class Request {
		Set<Gmm> ids;
		GmmInput input;
	}

	static class Response {
		String name;
		Request request;
		XY_DataGroup means;
		XY_DataGroup sigmas;
	}

	// sample JSON
	// {"ids":["ASK_14","BSSA_14","CB_14","CY_14","IDRISS_14"],"input":{"rate":0.0,"Mw":6.5,"rJB":10.0,"rRup":10.3,"rX":10.0,"dip":90.0,"width":14.0,"zTop":0.5,"zHyp":7.5,"rake":0.0,"vs30":760.0,"vsInf":true,"z2p5":NaN,"z1p0":NaN}};
	// sample query
	// ids=ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14&Mw=6.5&rJB=10.0&rRup=10.3&rX=10.0&dip=90.0&width=14.0&zTop=0.5&zHyp=7.5&rake=0.0&vs30=760.0&vsInf=true&z2p5=NaN&z1p0=NaN
	// ASK_14,BSSA_14,CB_14,CY_14,IDRISS_14/6.5/10.0/10.0/10.0/90.0/14.0/0.5/7.5/0.0/760.0/true/NaN/NaN

	// private static readParams()

	private static Response processRequest(final Request request) {

		// set up result aggregators
		Set<Imt> imts = Gmm.responseSpectrumIMTs(request.ids);
		List<Double> periods = Imt.periods(imts);
		Map<Gmm, List<Double>> meanMap = Maps.newEnumMap(Gmm.class);
		Map<Gmm, List<Double>> sigmaMap = Maps.newEnumMap(Gmm.class);

		// compute spectra
		for (Gmm gmm : request.ids) {
			List<Double> means = new ArrayList<>();
			List<Double> sigmas = new ArrayList<>();
			meanMap.put(gmm, means);
			sigmaMap.put(gmm, sigmas);
			for (Imt imt : imts) {
				ScalarGroundMotion sgm = gmm.instance(imt).calc(request.input);
				means.add(sgm.mean());
				sigmas.add(sgm.sigma());
			}
		}

		// set up response
		Response response = new Response();
		response.request = request;
		response.name = RESULT_NAME;
		response.means = XY_DataGroup.create(GROUP_NAME_MEAN, X_LABEL, Y_LABEL_MEDIAN, periods);
		response.sigmas = XY_DataGroup.create(GROUP_NAME_SIGMA, X_LABEL, Y_LABEL_SIGMA, periods);

		// populate response
		for (Gmm gmm : meanMap.keySet()) {
			response.means.add(gmm.name(), gmm.toString(), DataUtils.exp(meanMap.get(gmm)));
			response.sigmas.add(gmm.name(), gmm.toString(), sigmaMap.get(gmm));
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
				case RATE:
					// ignore me for determinisitic
					break;
				case MAG:
					builder.mag(Double.valueOf(value));
					break;
				case RJB:
					builder.rjb(Double.valueOf(value));
					break;
				case RRUP:
					builder.rrup(Double.valueOf(value));
					break;
				case RX:
					builder.rx(Double.valueOf(value));
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

}
