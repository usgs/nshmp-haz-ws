package gov.usgs.earthquake.nshmp.www;

import static com.google.common.base.Strings.isNullOrEmpty;
import static gov.usgs.earthquake.nshmp.www.ServletUtil.GSON;
import static gov.usgs.earthquake.nshmp.www.ServletUtil.MODEL_CACHE_CONTEXT_ID;
import static gov.usgs.earthquake.nshmp.www.ServletUtil.emptyRequest;
import static gov.usgs.earthquake.nshmp.www.Util.readDouble;
import static gov.usgs.earthquake.nshmp.www.Util.readValue;
import static gov.usgs.earthquake.nshmp.www.Util.Key.LATITUDE;
import static gov.usgs.earthquake.nshmp.www.Util.Key.LONGITUDE;
import static gov.usgs.earthquake.nshmp.www.Util.Key.MODEL;
import static gov.usgs.earthquake.nshmp.www.Util.Key.IMT;
import static gov.usgs.earthquake.nshmp.www.Util.Key.VS30;
import static gov.usgs.earthquake.nshmp.www.Util.Key.RETURNPERIOD;

import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.calc.CalcConfig;
import gov.usgs.earthquake.nshmp.calc.Deaggregation;
import gov.usgs.earthquake.nshmp.calc.Hazard;
import gov.usgs.earthquake.nshmp.calc.HazardCalcs;
import gov.usgs.earthquake.nshmp.calc.Site;
import gov.usgs.earthquake.nshmp.calc.Vs30;
import gov.usgs.earthquake.nshmp.calc.CalcConfig.Builder;
import gov.usgs.earthquake.nshmp.eq.model.HazardModel;
import gov.usgs.earthquake.nshmp.geo.Location;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;
import gov.usgs.earthquake.nshmp.www.HazardService.RequestData;
import gov.usgs.earthquake.nshmp.www.NshmpServlet.UrlHelper;
import gov.usgs.earthquake.nshmp.www.ServletUtil.TimedTask;
import gov.usgs.earthquake.nshmp.www.ServletUtil.Timer;
import gov.usgs.earthquake.nshmp.www.meta.Metadata;
import gov.usgs.earthquake.nshmp.www.meta.Region;
import gov.usgs.earthquake.nshmp.www.meta.Status;

/**
 * Hazard deaggregation service.
 *
 * @author Peter Powers
 */
@SuppressWarnings("unused")
@WebServlet(
    name = "Deaggregation Service (new)",
    description = "USGS NSHMP Hazard Deaggregator",
    urlPatterns = {
        "/deagg2",
        "/deagg2/*" })
public final class DeaggService2 extends NshmpServlet {

  /* Developer notes: See HazardService. */

  private LoadingCache<Model, HazardModel> modelCache;
  
  private static final String USAGE = SourceServices.GSON.toJson(
	    new SourceServices.ResponseData());

  @Override
  @SuppressWarnings("unchecked")
  public void init() {
    ServletContext context = getServletConfig().getServletContext();
    Object modelCache = context.getAttribute(MODEL_CACHE_CONTEXT_ID);
    this.modelCache = (LoadingCache<Model, HazardModel>) modelCache;
  }

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {

    UrlHelper urlHelper = urlHelper(request, response);
    
    if (emptyRequest(request)) {
      urlHelper.writeResponse(USAGE);
      return;
    }
    
    try {
      RequestData requestData = buildRequestData(request);

      /* Submit as task to job executor */
      Deagg2Task task = new Deagg2Task(urlHelper.url, getServletContext(), requestData);
      Result result = ServletUtil.TASK_EXECUTOR.submit(task).get();
      GSON.toJson(result, response.getWriter());

    } catch (Exception e) {
      String message = Metadata.errorMessage(urlHelper.url, e, false);
      response.getWriter().print(message);
      getServletContext().log(urlHelper.url, e);
    }
  }

  /* Reduce query string key-value pairs. */
  static RequestData buildRequestData(HttpServletRequest request) {

    try {

      Model model;
      double lon;
      double lat;
      Imt imt;
      Vs30 vs30;
      double returnPeriod;

      if (request.getQueryString() != null) {
        /* process query '?' request */
        model = readValue(MODEL, request, Model.class);
        lon = readDouble(LONGITUDE, request);
        lat = readDouble(LATITUDE, request);
        imt = readValue(IMT, request, Imt.class);
        vs30 = Vs30.fromValue(readDouble(VS30, request));
        returnPeriod = readDouble(RETURNPERIOD, request);

      } else {
        /* process slash-delimited request */
        List<String> params = Parsing.splitToList(
            request.getPathInfo(),
            Delimiter.SLASH);
        model = Model.valueOf(params.get(0));
        lon = Double.valueOf(params.get(1));
        lat = Double.valueOf(params.get(2));
        imt = Imt.valueOf(params.get(3));
        vs30 = Vs30.fromValue(Double.valueOf(params.get(4)));
        returnPeriod = Double.valueOf(params.get(5));
      }

      return new RequestData(
          model,
          lon,
          lat,
          imt,
          vs30,
          returnPeriod);

    } catch (Exception e) {
      throw new IllegalArgumentException("Error parsing request URL", e);
    }
  }

  private class Deagg2Task extends TimedTask<Result> {

    RequestData data;
    
    Deagg2Task(String url, ServletContext context, RequestData data) {
      super(url, context);
      this.data = data;
    }

    @Override
    Result calc() throws Exception {
      Deaggregation deagg = calcDeagg(data, context);
      
      return new Result.Builder()
          .requestData(data)
          .url(url)
          .timer(timer)
          .deagg(deagg)
          .build();
    }
  }

  Deaggregation calcDeagg(RequestData data, ServletContext context) {
    Location loc = Location.create(data.latitude, data.longitude);
    Site site = Site.builder().location(loc).vs30(data.vs30.value()).build();
    HazardModel model = modelCache.getUnchecked(data.model);
    Builder configBuilder = CalcConfig.Builder.copyOf(model.config());
    configBuilder.imts(EnumSet.of(data.imt));
    CalcConfig config = configBuilder.build();
    Optional<Executor> executor = Optional.of(ServletUtil.CALC_EXECUTOR);
    Hazard hazard = HazardCalcs.hazard(model, config, site, executor);
    return HazardCalcs.deaggregation(hazard, data.returnPeriod, Optional.of(data.imt));
  }


  static final class RequestData {

    final Model model;
    final double latitude;
    final double longitude;
    final Imt imt;
    final Vs30 vs30;
    final double returnPeriod;

    RequestData(
        Model model,
        double longitude,
        double latitude,
        Imt imt,
        Vs30 vs30,
        double returnPeriod) {

      this.model = model;
      this.latitude = latitude;
      this.longitude = longitude;
      this.imt = imt;
      this.vs30 = vs30;
      this.returnPeriod = returnPeriod;
    }
  }

  private static final class ResponseData {

    final Model model;
    final double longitude;
    final double latitude;
    final Imt imt;
    final Vs30 vs30;
    final double returnperiod;
    final String rlabel = "Closest Distance, rRup (km)";
    final String mlabel = "Magnitude (Mw)";
    final String εlabel = "% Contribution to Hazard";
    final Object εbins;

    ResponseData(Deaggregation deagg, RequestData request, Imt imt) {
      this.model = request.model;
      this.longitude = request.longitude;
      this.latitude = request.latitude;
      this.imt = imt;
      this.vs30 = request.vs30;
      this.returnperiod = request.returnPeriod;
      this.εbins = deagg.εBins();
    }
  }

  private static final class Response {

    final ResponseData metadata;
    final Object data;

    Response(ResponseData metadata, Object data) {
      this.metadata = metadata;
      this.data = data;
    }
  }

  private static final String TOTAL_KEY = "Total";

  private static final class Result {

    final String status = Status.SUCCESS.toString();
    final String date = ZonedDateTime.now().format(ServletUtil.DATE_FMT);
    final String url;
    final Object server;
    final List<Response> response;

    Result(String url, Object server, List<Response> response) {
      this.url = url;
      this.server = server;
      this.response = response;
    }

    static final class Builder {

      String url;
      Timer timer;
      RequestData request;
      Deaggregation deagg;

      Builder deagg(Deaggregation deagg) {
        this.deagg = deagg;
        return this;
      }

      Builder url(String url) {
        this.url = url;
        return this;
      }

      Builder timer(Timer timer) {
        this.timer = timer;
        return this;
      }

      Builder requestData(RequestData request) {
        this.request = request;
        return this;
      }

      Result build() {

        ImmutableList.Builder<Response> responseListBuilder = ImmutableList.builder();
        Imt imt = request.imt;
        ResponseData responseData = new ResponseData(
            deagg,
            request,
            imt);
        Object deaggs = deagg.toJson(imt);
        Response response = new Response(responseData, deaggs);
        responseListBuilder.add(response);

        List<Response> responseList = responseListBuilder.build();
        Object server = Metadata.serverData(ServletUtil.THREAD_COUNT, timer);

        return new Result(url, server, responseList);
      }
    }
  }

}
