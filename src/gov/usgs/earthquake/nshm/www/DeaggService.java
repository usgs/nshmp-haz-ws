package gov.usgs.earthquake.nshm.www;

import static com.google.common.base.Strings.isNullOrEmpty;
import static gov.usgs.earthquake.nshm.www.ServletUtil.GSON;
import static gov.usgs.earthquake.nshm.www.ServletUtil.MODEL_CACHE_CONTEXT_ID;
import static gov.usgs.earthquake.nshm.www.Util.readDoubleValue;
import static gov.usgs.earthquake.nshm.www.Util.readValue;
import static gov.usgs.earthquake.nshm.www.Util.Key.EDITION;
import static gov.usgs.earthquake.nshm.www.Util.Key.IMT;
import static gov.usgs.earthquake.nshm.www.Util.Key.LATITUDE;
import static gov.usgs.earthquake.nshm.www.Util.Key.LONGITUDE;
import static gov.usgs.earthquake.nshm.www.Util.Key.REGION;
import static gov.usgs.earthquake.nshm.www.Util.Key.RETURNPERIOD;
import static gov.usgs.earthquake.nshm.www.Util.Key.VS30;
import static gov.usgs.earthquake.nshm.www.meta.Metadata.DEAGG_USAGE;
import static gov.usgs.earthquake.nshm.www.meta.Metadata.errorMessage;
import static org.opensha2.util.Parsing.Delimiter.SLASH;
import gov.usgs.earthquake.nshm.www.meta.Edition;
import gov.usgs.earthquake.nshm.www.meta.Region;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha2.calc.CalcConfig;
import org.opensha2.calc.CalcConfig.Builder;
import org.opensha2.calc.Calcs;
import org.opensha2.calc.Deaggregation;
import org.opensha2.calc.Deaggregation.Exporter;
import org.opensha2.calc.Hazard;
import org.opensha2.calc.Site;
import org.opensha2.calc.Vs30;
import org.opensha2.data.XySequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.programs.HazardCalc;
import org.opensha2.util.Parsing;

import com.google.common.base.Optional;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

/**
 * Hazard deaggregation service.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("unused")
@WebServlet(
		name = "Deaggregation Service",
		description = "USGS NSHMP Hazard Deaggregator",
		urlPatterns = {
			"/deagg",
			"/deagg/*" })
public final class DeaggService extends HttpServlet {

	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("application/json; charset=UTF-8");

		String query = request.getQueryString();
		String pathInfo = request.getPathInfo();
		String host = request.getServerName() + ":" + request.getServerPort();

		if (isNullOrEmpty(query) && isNullOrEmpty(pathInfo)) {
			response.getWriter().printf(DEAGG_USAGE, host);
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
				List<String> params = Parsing.splitToList(pathInfo, SLASH);
				if (params.size() < 7) {
					response.getWriter().printf(DEAGG_USAGE, host);
					return;
				}
				requestData = buildRequest(params);
			}
			Result result = process(url, requestData);

			String resultStr = GSON.toJson(result);
			response.getWriter().print(resultStr);

		} catch (Exception e) {
			String message = errorMessage(url, e);
			response.getWriter().print(message);
		}
	}

	/* Reduce query string key-value pairs */
	private RequestData buildRequest(Map<String, String[]> paramMap) {
		return new RequestData(
			readValue(paramMap, EDITION, Edition.class),
			readValue(paramMap, REGION, Region.class),
			readDoubleValue(paramMap, LONGITUDE),
			readDoubleValue(paramMap, LATITUDE),
			readValue(paramMap, IMT, Imt.class),
			Vs30.fromValue(readDoubleValue(paramMap, VS30)),
			readDoubleValue(paramMap, RETURNPERIOD));
	}

	/* Reduce slash-delimited request */
	private RequestData buildRequest(List<String> params) {
		return new RequestData(
			readValue(params.get(0), Edition.class),
			readValue(params.get(1), Region.class),
			Double.valueOf(params.get(2)),
			Double.valueOf(params.get(3)),
			readValue(params.get(4), Imt.class),
			Vs30.fromValue(Double.valueOf(params.get(5))),
			Double.valueOf(params.get(6)));
	}

	private Result process(String url, RequestData data) {

		Location loc = Location.create(data.latitude, data.longitude);
		Site site = Site.builder().location(loc).vs30(data.vs30.value()).build();

		Result.Builder resultBuilder = new Result.Builder()
			.requestData(data)
			.url(url);

		if (data.region == Region.COUS) {

			Model wusId = Model.valueOf(Region.WUS, data.edition.year());
			Hazard wusResult = process(wusId, site, data);
			Deaggregation wusDeagg = Calcs.deaggregation(wusResult, data.returnPeriod);
			resultBuilder.addResult(wusDeagg);

			Model ceusId = Model.valueOf(Region.CEUS, data.edition.year());
			Hazard ceusResult = process(ceusId, site, data);
			Deaggregation ceusDeagg = Calcs.deaggregation(ceusResult, data.returnPeriod);
			resultBuilder.addResult(ceusDeagg);

		} else {
			Model modelId = Model.valueOf(data.region, data.edition.year());
			Hazard result = process(modelId, site, data);
			Deaggregation deagg = Calcs.deaggregation(result, data.returnPeriod);
			resultBuilder.addResult(deagg);
		}

		return resultBuilder.build();
	}

	private Hazard process(Model modelId, Site site, RequestData data) {
		@SuppressWarnings("unchecked")
		LoadingCache<Model, HazardModel> modelCache = (LoadingCache<Model, HazardModel>)
			getServletContext().getAttribute(MODEL_CACHE_CONTEXT_ID);

		// TODO should be using checked get(id)
		HazardModel model = modelCache.getUnchecked(modelId);
		Builder configBuilder = CalcConfig.builder()
			.copy(model.config())
			.imts(ImmutableSet.of(data.imt));
		CalcConfig config = configBuilder.build();
		Optional<Executor> executor = Optional.<Executor> of(ServletUtil.EXEC);
		return HazardCalc.calc(model, config, site, executor);
	}

	/*
	 * IMTs: PGA, SA0P20, SA1P00 TODO this need to be updated to the result of
	 * polling all models and supports needs to be updated to specific models
	 * 
	 * Regions: COUS, WUS, CEUS, [HI, AK, GM, AS, SAM, ...]
	 * 
	 * vs30: 180, 259, 360, 537, 760, 1150, 2000
	 */

	private static final class RequestData {

		final Edition edition;
		final Region region;
		final double latitude;
		final double longitude;
		final Imt imt;
		final Vs30 vs30;
		final double returnPeriod;

		RequestData(
				Edition edition,
				Region region,
				double longitude,
				double latitude,
				Imt imt,
				Vs30 vs30,
				double returnPeriod) {

			this.edition = edition;
			this.region = region;
			this.latitude = latitude;
			this.longitude = longitude;
			this.imt = imt;
			this.vs30 = vs30;
			this.returnPeriod = returnPeriod;
		}
	}

	private static final class ResponseData {

		final Edition edition;
		final Region region;
		final double latitude;
		final double longitude;
		final Imt imt;
		final double returnperiod;
		final Vs30 vs30;
		final String rlabel = "Closest Distance, rRup (km)";
		final String mlabel = "Magnitude (Mw)";
		final String εlabel = "% Contribution to Hazard";
		final List<?> εbins;

		ResponseData(Deaggregation deagg, RequestData request, Imt imt) {
			this.edition = request.edition;
			this.region = request.region;
			this.longitude = request.longitude;
			this.latitude = request.latitude;
			this.imt = imt;
			this.returnperiod = request.returnPeriod;
			this.vs30 = request.vs30;

			this.εbins = deagg.εBins();
		}
	}

	private static final class Response {

		final ResponseData metadata;
		final List<Exporter> data;

		Response(ResponseData metadata, List<Exporter> data) {
			this.metadata = metadata;
			this.data = data;
		}
	}

	private static final String TOTAL_KEY = "Total";

	private static final class Result {

		final String status = "success";
		final String date = ServletUtil.formatDate(new Date()); // TODO time
		final String url;
		final List<Response> response;

		Result(String url, List<Response> response) {
			this.url = url;
			this.response = response;
		}

		static final class Builder {

			String url;
			RequestData request;
			Deaggregation deagg;

			Builder addResult(Deaggregation deagg) {
				this.deagg = deagg;
				return this;
			}

			Builder url(String url) {
				this.url = url;
				return this;
			}

			Builder requestData(RequestData request) {
				this.request = request;
				return this;
			}

			Result build() {

				ImmutableList.Builder<Response> responseListBuilder = ImmutableList.builder();
				ResponseData responseData = new ResponseData(
					deagg,
					request,
					request.imt);
				ImmutableList.Builder<Exporter> curveListBuilder = ImmutableList.builder();
				curveListBuilder.add(deagg.export(request.imt));
				Response response = new Response(responseData, curveListBuilder.build());
				responseListBuilder.add(response);

				return new Result(
					url,
					responseListBuilder.build());
			}

			private static <E extends Enum<E>> void addOrPut(
					Map<E, XySequence> map,
					E key,
					XySequence sequence) {

				if (map.containsKey(key)) {
					map.get(key).add(sequence);
				} else {
					map.put(key, XySequence.copyOf(sequence));
				}
			}
		}
	}
}
