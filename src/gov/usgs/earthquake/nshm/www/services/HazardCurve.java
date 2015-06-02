package gov.usgs.earthquake.nshm.www.services;

import static gov.usgs.earthquake.nshm.www.services.Util.Key.*;
import static gov.usgs.earthquake.nshm.www.services.Util.*;
import static gov.usgs.earthquake.nshm.www.services.meta.Metadata.*;
import static org.opensha2.gmm.Imt.*;
import static com.google.common.base.Preconditions.checkState;
import static com.google.common.base.StandardSystemProperty.LINE_SEPARATOR;
import static org.opensha2.programs.HazardCurve.calc;
import gov.usgs.earthquake.nshm.www.services.meta.Edition;
import gov.usgs.earthquake.nshm.www.services.meta.Region;
import gov.usgs.earthquake.nshm.www.services.meta.Vs30;
import gov.usgs.earthquake.nshm.www.util.Model;
import gov.usgs.earthquake.param.Param;
import gov.usgs.earthquake.param.ParamList;
import gov.usgs.earthquake.param.Params;

import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha2.calc.HazardResult;
import org.opensha2.calc.Site;
import org.opensha2.data.ArrayXY_Sequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.geo.GeoTools;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.util.Parsing;
import org.opensha2.util.Parsing.Delimiter;

import com.google.common.base.Enums;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

/**
 * Servlet implementation class HazardCurve
 */
@WebServlet("/HazardCurve/*")
public class HazardCurve extends HttpServlet {

	private static final String NEWLINE = LINE_SEPARATOR.value();
	private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

	// TODO logging; servlet will only use system ConsoleHandler
	// and Formatter; need to set up our custom console handler as a
	// fileHandler independent of tomcat request logs; config
	// should be automagically read from classes/logging.properties
	
	// TODO revisit slash-delimited queries

	// The first additional parameters that could be exposed for
	// dynamic calculations are site params

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");

		String query = request.getPathInfo();
		if (query == null) {
			response.getWriter().print(HAZARD_CURVE_USAGE);
			return;
		}

		List<String> args = Parsing.splitToList(query, Delimiter.SLASH);
		
		if (args.size() == 0) {
			response.getWriter().print(HAZARD_CURVE_USAGE);
			return;
		}
		if (args.size() != 5) {
			response.getWriter().print(HAZARD_CURVE_USAGE);
			return;
		}

		String result = processRequest(args);
		response.getWriter().print(result);
		
		
//		Maprequest.getParameterMap()
	}

	private String processRequest(List<String> args) {
		String modelStr = args.get(1) + "_" + args.get(0);
		Model modelId = Model.valueOf(modelStr);
		HazardModel model = modelId.instance();
		if (model == null) return "Model " + modelId + " not currently supported";
		// Imt imt = Imt.valueOf(args.get(2));
		double lon = Double.valueOf(args.get(3));
		double lat = Double.valueOf(args.get(4));
		Location loc = Location.create(lat, lon);
		Site site = Site.builder().location(loc).vs30(760.0).build();
		HazardResult result = calc(model, model.config(), site);
		StringBuilder sb = new StringBuilder();
		for (Entry<Imt, ArrayXY_Sequence> entry : result.curves().entrySet()) {
			sb.append(entry.getKey()).append(":").append(NEWLINE);
			ArrayXY_Sequence curve = entry.getValue();
			sb.append(Parsing.join(curve.xValues(), Delimiter.COMMA));
			sb.append(NEWLINE);
			sb.append(Parsing.join(curve.yValues(), Delimiter.COMMA));
			sb.append(NEWLINE);
		}
		return sb.toString();
	}
	
	private String processRequest(Map<String, String[]> paramMap) {
		
		// read request parameters
		Edition edition = readValue(paramMap, EDITION, Edition.class);
		Region region = readValue(paramMap, REGION, Region.class);
		Imt imt = readValue(paramMap, IMT, Imt.class);
		double lon = readDoubleValue(paramMap, LONGITUDE);
		double lat = readDoubleValue(paramMap, LATITUDE);
		Vs30 vs30 = readValue(paramMap, VS30, Vs30.class);
		
		// assemble calc components
		String modelStr = region + "_" + edition.year();
		Optional<Model> modelId = Enums.getIfPresent(Model.class, modelStr);
		checkState(modelId.isPresent(), "Unkown or unsupported model: \"%s\"", modelStr);
		HazardModel model = modelId.get().instance();
		Location loc = Location.create(lat, lon);
		Site site = Site.builder().location(loc).vs30(760.0).build();
		
		// calculate
		HazardResult result = calc(model, model.config(), site);
		
		// return response
		StringBuilder sb = new StringBuilder();
		for (Entry<Imt, ArrayXY_Sequence> entry : result.curves().entrySet()) {
			sb.append(entry.getKey()).append(":").append(NEWLINE);
			ArrayXY_Sequence curve = entry.getValue();
			sb.append(Parsing.join(curve.xValues(), Delimiter.COMMA));
			sb.append(NEWLINE);
			sb.append(Parsing.join(curve.yValues(), Delimiter.COMMA));
			sb.append(NEWLINE);
		}
		return sb.toString();
	}
	
	

	
	
	/*
	 * IMTs: PGA, SA0P20, SA1P00
	 * TODO this need to be updated to the result of polling all models and supports
	 * needs to be updated to specific models
	 * 
	 * Editions: E2008, E2014 (maybe for dynamic calcs we just call this year because
	 * 		we'll only be running the most current model, as opposed to a specific release)
	 * 
	 * Regions: COUS, WUS, CEUS, [HI, AK, GM, AS, SAM, ...]
	 * 
	 * 
	 * vs30: 180, 259, 360, 537, 760, 1150, 2000
	 * 		aka 'soil'
	 */
	
	public static void main(String[] args) {
		
//		HazardModel model = Model.WUS_2008.instance();
//	    URL url = HazardCurve.class.getResource("/models/2008/Western US");
//	    URL url = Model.class.getResource("/");
//		System.out.println(url);
		
//		Parameters p = new Parameters();
//		JsonObject meta = new JsonObject();
//		meta.addProperty("application", "HazardCurve");
//		meta.add("parameters", p.pList.state());
//		System.out.println(GSON.toJson(meta));
		
	}

}
