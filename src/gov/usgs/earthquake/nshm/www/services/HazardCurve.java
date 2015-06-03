package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.StandardSystemProperty.LINE_SEPARATOR;
import static com.google.common.base.Strings.isNullOrEmpty;
import static gov.usgs.earthquake.nshm.www.services.Util.readDoubleValue;
import static gov.usgs.earthquake.nshm.www.services.Util.readValue;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.EDITION;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.IMT;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.LATITUDE;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.LONGITUDE;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.REGION;
import static gov.usgs.earthquake.nshm.www.services.Util.Key.VS30;
import static gov.usgs.earthquake.nshm.www.services.meta.Metadata.HAZARD_CURVE_USAGE;
import static gov.usgs.earthquake.nshm.www.services.meta.Metadata.errorMessage;
import static org.opensha2.programs.HazardCurve.calc;
import gov.usgs.earthquake.nshm.www.services.meta.Edition;
import gov.usgs.earthquake.nshm.www.services.meta.Region;
import gov.usgs.earthquake.nshm.www.services.meta.Vs30;
import gov.usgs.earthquake.nshm.www.util.Models;
import gov.usgs.earthquake.nshm.www.util.Models.Id;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha2.calc.CalcConfig;
import org.opensha2.calc.HazardResult;
import org.opensha2.calc.Site;
import org.opensha2.data.ArrayXY_Sequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.util.Parsing;
import org.opensha2.util.Parsing.Delimiter;

import com.google.common.base.Throwables;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet implementation class HazardCurve
 */
@WebServlet(urlPatterns = { "/HazardCurve", "/HazardCurve/*" })
public class HazardCurve extends HttpServlet {

	private static final String NEWLINE = LINE_SEPARATOR.value();
	private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");

		String query = request.getQueryString();
		String pathInfo = request.getPathInfo();

		if (isNullOrEmpty(query) && isNullOrEmpty(pathInfo)) {
			response.getWriter().print(HAZARD_CURVE_USAGE);
			return;
		}

		String result;
		try {
			if (query != null) { // process query '?'
				result = processRequest(request.getParameterMap());
			} else { // process slash-delimited request
				result = processRequest(pathInfo);
			}
			response.getWriter().print(result);

		} catch (Exception e) {
			StringBuffer url = request.getRequestURL();
			if (query != null) url.append('?').append(query);
			String message = errorMessage(url.toString(), e);
			response.getWriter().print(message);
		}

	}

	/* Process query string key-value pairs */
	private String processRequest(Map<String, String[]> paramMap) {
		Edition edition = readValue(paramMap, EDITION, Edition.class);
		Region region = readValue(paramMap, REGION, Region.class);
		double lon = readDoubleValue(paramMap, LONGITUDE);
		double lat = readDoubleValue(paramMap, LATITUDE);
		Imt imt = readValue(paramMap, IMT, Imt.class);
		Vs30 vs30 = Vs30.fromValue(readDoubleValue(paramMap, VS30));
		return processCalculation(edition, region, lon, lat, imt, vs30);
	}

	/* Process slash-delimited request */
	private String processRequest(String paramStr) {
		List<String> params = Parsing.splitToList(paramStr, Delimiter.SLASH);
		if (params.size() < 6) return HAZARD_CURVE_USAGE;
		Edition edition = readValue(params.get(0), Edition.class);
		Region region = readValue(params.get(1), Region.class);
		double lon = Double.valueOf(params.get(2));
		double lat = Double.valueOf(params.get(3));
		Imt imt = readValue(params.get(4), Imt.class);
		Vs30 vs30 = Vs30.fromValue(Double.valueOf(params.get(5)));
		return processCalculation(edition, region, lon, lat, imt, vs30);
	}

	private String processCalculation(Edition edition, Region region, double lon, double lat,
			Imt imt, Vs30 vs30) {
		String modelStr = region.name() + "_" + edition.year();
		Models.Id modelId = Id.valueOf(modelStr);
		Models models = (Models) getServletContext().getAttribute(Models.CONTEXT_ID);

		HazardModel model = null;
		try {
			model = models.get(modelId);
		} catch (ExecutionException ee) {
			// TODO improve/log
			ee.printStackTrace();
			Throwables.propagate(ee);
		}

		// Optional<Model> modelId = Enums.getIfPresent(Model.class, modelStr);
		// checkState(modelId.isPresent(),
		// "Unkown or unsupported model: \"%s\"", modelStr);
		// HazardModel model = modelId.get().instance();
		// HazardModel model = null; //modelId.get().instance();

		Location loc = Location.create(lat, lon);
		Site site = Site.builder().location(loc).vs30(vs30.value()).build();

		// calculate
		Set<Imt> imts = Sets.immutableEnumSet(imt);
		CalcConfig config = CalcConfig.copyWithImts(model.config(), imts);
		HazardResult result = calc(model, config, site);

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
	 * IMTs: PGA, SA0P20, SA1P00 TODO this need to be updated to the result of
	 * polling all models and supports needs to be updated to specific models
	 * 
	 * Editions: E2008, E2014 (maybe for dynamic calcs we just call this year
	 * because we'll only be running the most current model, as opposed to a
	 * specific release)
	 * 
	 * Regions: COUS, WUS, CEUS, [HI, AK, GM, AS, SAM, ...]
	 * 
	 * vs30: 180, 259, 360, 537, 760, 1150, 2000
	 */

	// TODO clean
	public static void main(String[] args) {

		// HazardModel model = Model.WUS_2008.instance();
		// URL url = HazardCurve.class.getResource("/models/2008/Western US");
		// URL url = Model.class.getResource("/");
		// System.out.println(url);

		// Parameters p = new Parameters();
		// JsonObject meta = new JsonObject();
		// meta.addProperty("application", "HazardCurve");
		// meta.add("parameters", p.pList.state());
		// System.out.println(GSON.toJson(meta));

	}

}
