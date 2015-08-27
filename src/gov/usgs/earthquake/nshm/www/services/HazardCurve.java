package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.Strings.isNullOrEmpty;
import static gov.usgs.earthquake.nshm.www.services.ServletUtil.MODEL_CACHE_CONTEXT_ID;
import static gov.usgs.earthquake.nshm.www.services.Util.readDoubleValue;
import static gov.usgs.earthquake.nshm.www.services.Util.readValue;
import static gov.usgs.earthquake.nshm.www.services.Util.readValues;
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

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.Executor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha2.calc.CalcConfig;
import org.opensha2.calc.CalcConfig.Builder;
import org.opensha2.calc.HazardResult;
import org.opensha2.calc.Results;
import org.opensha2.calc.Site;
import org.opensha2.data.ArrayXY_Sequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.eq.model.SourceType;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.util.Parsing;
import org.opensha2.util.Parsing.Delimiter;

import com.google.common.base.Optional;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;

/**
 * Hazard curve service.
 * @author Peter Powers
 */
@SuppressWarnings("unused")
@WebServlet(
		name = "Hazard Curve Service",
		description = "USGS NSHMP Hazard Curve Calculator",
		urlPatterns = {
			"/HazardCurve",
			"/HazardCurve/*" })
public class HazardCurve extends HttpServlet {

	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("application/json");

		String query = request.getQueryString();
		String pathInfo = request.getPathInfo();

		if (isNullOrEmpty(query) && isNullOrEmpty(pathInfo)) {
			response.getWriter().print(HAZARD_CURVE_USAGE);
			return;
		}

		StringBuffer urlBuf = request.getRequestURL();
		if (query != null) urlBuf.append('?').append(query);
		String url = urlBuf.toString();

		RequestData requestData;
		try {
			if (query != null) { // process query '?'
				requestData = buildRequest(request.getParameterMap());
			} else { // process slash-delimited request
				List<String> params = Parsing.splitToList(pathInfo, Delimiter.SLASH);
				if (params.size() < 6) {
					response.getWriter().print(HAZARD_CURVE_USAGE);
					return;
				}
				requestData = buildRequest(params);
			}
			Result result = processCalculation(url, requestData);

			String resultStr = ServletUtil.GSON.toJson(result);
			response.getWriter().print(resultStr);

		} catch (Exception e) {
			String message = errorMessage(url, e);
			response.getWriter().print(message);
		}
	}

	/* Reduce query string key-value pairs */
	private RequestData buildRequest(Map<String, String[]> paramMap) {
		Optional<Set<Imt>> imts = paramMap.containsKey(IMT.toString()) ?
			Optional.of(readValues(paramMap, IMT, Imt.class)) :
			Optional.<Set<Imt>> absent();

		return new RequestData(
			readValue(paramMap, EDITION, Edition.class),
			readValue(paramMap, REGION, Region.class),
			readDoubleValue(paramMap, LONGITUDE),
			readDoubleValue(paramMap, LATITUDE),
			imts,
			Vs30.fromValue(readDoubleValue(paramMap, VS30)));
	}

	/* Reduce slash-delimited request */
	private RequestData buildRequest(List<String> params) {
		Optional<Set<Imt>> imts = (params.get(4).equalsIgnoreCase("any")) ?
			Optional.<Set<Imt>> absent() :
			Optional.of(readValues(params.get(4), Imt.class));

		return new RequestData(
			readValue(params.get(0), Edition.class),
			readValue(params.get(1), Region.class),
			Double.valueOf(params.get(2)),
			Double.valueOf(params.get(3)),
			imts,
			Vs30.fromValue(Double.valueOf(params.get(5))));
	}

	private Result processCalculation(String url, RequestData data) {
		String modelStr = data.region.name() + "_" + data.edition.year();
		Model modelId = Model.valueOf(modelStr);

		@SuppressWarnings("unchecked")
		LoadingCache<Model, HazardModel> modelCache = (LoadingCache<Model, HazardModel>)
			getServletContext().getAttribute(MODEL_CACHE_CONTEXT_ID);
		// TODO improve or log; should be using get(id) instead (checked)
		HazardModel model = modelCache.getUnchecked(modelId);

		Location loc = Location.create(data.latitude, data.longitude);
		Site site = Site.builder().location(loc).vs30(data.vs30.value()).build();

		// calculate
		Builder configBuilder = CalcConfig.builder().copy(model.config());
		if (data.imts.isPresent()) configBuilder.imts(data.imts.get());
		CalcConfig config = configBuilder.build();

		Optional<Executor> executor = Optional.<Executor> of(ServletUtil.EXEC);
		HazardResult hazResult = calc(model, config, site, executor);

		return new Result(url, data, hazResult);
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

	private final static class RequestData {

		final Edition edition;
		final Region region;
		final double latitude;
		final double longitude;
		final Optional<Set<Imt>> imts;
		final Vs30 vs30;

		private RequestData(
				Edition edition,
				Region region,
				double longitude,
				double latitude,
				Optional<Set<Imt>> imts,
				Vs30 vs30) {

			this.edition = edition;
			this.region = region;
			this.latitude = latitude;
			this.longitude = longitude;
			this.imts = imts;
			this.vs30 = vs30;
		}
	}

	private final static class ResponseData {

		final Edition edition;
		final Region region;
		final double latitude;
		final double longitude;
		final Imt imt;
		final Vs30 vs30;
		final String xlabel = "Ground Motion (g)";
		final String ylabel = "Annual Frequency of Exceedence";
		final List<Double> xvalues;

		ResponseData(RequestData request, Imt imt, List<Double> xvalues) {
			this.edition = request.edition;
			this.region = request.region;
			this.longitude = request.longitude;
			this.latitude = request.latitude;
			this.imt = imt;
			this.vs30 = request.vs30;
			this.xvalues = xvalues;
		}
	}

	private final static class Response {

		final ResponseData metadata;
		final List<Curve> data;

		Response(ResponseData metadata, List<Curve> data) {
			this.metadata = metadata;
			this.data = data;
		}
	}

	private final static class Curve {

		final String component;
		final List<Double> yvalues;

		Curve(String component, List<Double> yvalues) {
			this.component = component;
			this.yvalues = yvalues;
		}
	}

	private static class Result {

		final String status = "success";
		final String date = ServletUtil.formatDate(new Date()); // TODO time
		final String url;
		final List<Response> response;

		Result(String url, RequestData requestData, HazardResult hazResult) {

			this.url = url;

			ImmutableList.Builder<Response> responseListBuilder = ImmutableList.builder();

			Map<Imt, Map<SourceType, ArrayXY_Sequence>> typeTotals =
				Results.totalsByType(hazResult);

			for (Entry<Imt, ArrayXY_Sequence> imtTotal : hazResult.curves().entrySet()) {
				Imt imt = imtTotal.getKey();
				ArrayXY_Sequence sequence = imtTotal.getValue();
				ImmutableList.Builder<Curve> typeCurvesBuilder = ImmutableList.builder();

				// total curve
				Curve totalCurve = new Curve("Total", sequence.yValues());
				typeCurvesBuilder.add(totalCurve);

				// component curves
				for (Entry<SourceType, ArrayXY_Sequence> typeTotal : typeTotals.get(imt).entrySet()) {
					String component = typeTotal.getKey().toString();
					Curve componentCurve = new Curve(component, typeTotal.getValue().yValues());
					typeCurvesBuilder.add(componentCurve);
				}

				// metadata
				List<Double> xValsLinear = hazResult.config().modelCurve(imt).xValues();
				ResponseData rData = new ResponseData(requestData, imt, xValsLinear);
				Response r = new Response(rData, typeCurvesBuilder.build());
				responseListBuilder.add(r);
			}

			this.response = responseListBuilder.build();
		}
	}

}
