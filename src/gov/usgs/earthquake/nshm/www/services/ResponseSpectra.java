package gov.usgs.earthquake.nshm.www.services;

import static java.lang.Double.NaN;
import gov.usgs.earthquake.nshm.www.util.XY_DataGroup;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.opensha.calc.ScalarGroundMotion;
import org.opensha.gmm.Gmm;
import org.opensha.gmm.GmmInput;
import org.opensha.gmm.Imt;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.common.primitives.Doubles;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Handler for determinisitic and probabilisitic response spectra.
 * 
 * @author Peter Powers
 */
public class ResponseSpectra {

	// TODO logging

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

	/*
	 * Standard request: [Imt, Gmm] return [mu, sigma]
	 * 
	 * Deterministic: ResponseSpectra.Request <-- Json Single :: Gmm, GmmInput;
	 * loop all SA periods Multi :: Set<Gmm>, GmmInput; loop all gmm's and SA
	 * periods
	 * 
	 * Deterministic result: ResponseSpectra.Result --> Json xs[], ys[{name:
	 * "name", values : []}]}
	 */

	public static void main(String[] args) {
		testGmmGson();
	}

	static void testGmmGson() {
		//
		// String gmmJson = GSON.toJson(gmmIn);
		// System.out.println(gmmJson);
		//
		// GmmInput gmmOut = GSON.fromJson(gmmJson, GmmInput.class);
		// System.out.println(gmmOut);

		// Request request = new Request();
		// String requestStr = GSON.toJson(request);
		// System.out.println(requestStr);
		// Request requestRev = GSON.fromJson(requestStr, Request.class);
		// System.out.println(requestRev);
		//
		// Response response = new Response();
		// String responseStr = GSON.toJson(response);
		// System.out.println(responseStr);
		// Response responseRev = GSON.fromJson(responseStr, Response.class);
		// System.out.println(responseRev);

		fetchTest();
//		dataSetTest();
	}

	/*
	 * Well apparantly GSON converts basic collections to arrays and back.
	 */
	
	private static final String NAME = "Hazard Spectra";
	private static final String RESULT_NAME = NAME + " Results";
	private static final String GROUP_NAME_MEAN = "Means";
	private static final String GROUP_NAME_SIGMA = "Sigmas";
	private static final String X_LABEL = "Period (s)";
	private static final String Y_LABEL_MEAN = "Mean ground motion [log(g)]";
	private static final String Y_LABEL_SIGMA = "Standard deviation [log(g)]";

	public static Response processRequest(final Request request) {
		
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
//		response.means = XY_DataGroup.create(GROUP_NAME_MEAN, X_LABEL, Y_LABEL_MEAN);
//		response.sigmas = XY_DataGroup.create(GROUP_NAME_SIGMA, X_LABEL, Y_LABEL_SIGMA);
//
//		// populate response
//		for (Gmm gmm : meanMap.keySet()) {
//			response.means.add(gmm.name(), gmm.toString(), periods, meanMap.get(gmm));
//			response.sigmas.add(gmm.name(), gmm.toString(), periods, sigmaMap.get(gmm));
//		}
		return response;
	}
	
//	public static void dataSetTest() {
//		XY_DataGroup dataGroup = XY_DataGroup.create();
//		dataGroup.add("ENUM1", "test series 1", d1, d3);
//		dataGroup.add("ENUM2", "test series 2", d3, d3);
//		dataGroup.add("ENUM3", "test series 3", d3, d5);
//		dataGroup.add("ENUM4", "test series 4", d2, d1);
//		dataGroup.add("ENUM5", "test series 5", d5, d4);
//		
//		String result = GSON.toJson(dataGroup);
//		System.out.println(result);
//	}

	static List<Double> d1 = Lists.newArrayList(1.0, 2.0, 3.0);
	static List<Double> d2 = Lists.newArrayList(0.0, -0.2, 1e19);
	static List<Double> d3 = Lists.newArrayList(1.0, 2.0, 3.0);
	static List<Double> d4 = Lists.newArrayList(0.0, -0.2, 1e19);
	static List<Double> d5 = Lists.newArrayList(0.356, NaN, 0.5);

	static void fetchTest() {
		
		
		Request request = new Request();
		request.ids = EnumSet.of(Gmm.ASK_14, Gmm.BSSA_14, Gmm.CB_14, Gmm.CY_14, Gmm.IDRISS_14);
		request.input = GmmInput.create(6.5, 10.0, 10.3, 10.0, 90, 14.0, 0.5, 7.5, 0.0, 760.0,
			true, NaN, NaN);

		System.out.println(GSON.toJson(request));
		
//
//		Response response = new Response();
//		response.periods = Lists.newArrayList(1.0, 2.0, 3.0);
//		response.means = Maps.newEnumMap(Gmm.class);
//		response.means.put(Gmm.ASK_14, Lists.newArrayList(0.2, 0.3, 0.4));
//		response.means.put(Gmm.BSSA_14, Lists.newArrayList(0.1, 0.2, 0.5));
//		response.sigmas = Maps.newEnumMap(Gmm.class);
//		response.sigmas.put(Gmm.ASK_14, Lists.newArrayList(0.356, NaN, 0.5));
//		response.sigmas.put(Gmm.BSSA_14, Lists.newArrayList(0.0, -0.2, 1e19));
//
//		String responseStr = GSON.toJson(response);
//		System.out.println(responseStr);

		// Response response2 = GSON.fromJson(responseStr, Response.class);
		// System.out.println(response2);

	}

	/*
	 * TODO Does this class also serve up a parameter list to configure
	 * interface.
	 */

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

}
