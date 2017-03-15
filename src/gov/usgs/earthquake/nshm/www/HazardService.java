package gov.usgs.earthquake.nshm.www;

import static com.google.common.base.Preconditions.checkState;
import static com.google.common.base.Strings.isNullOrEmpty;
import static gov.usgs.earthquake.nshm.www.ServletUtil.GSON;
import static gov.usgs.earthquake.nshm.www.ServletUtil.MODEL_CACHE_CONTEXT_ID;
import static gov.usgs.earthquake.nshm.www.Util.readDoubleValue;
import static gov.usgs.earthquake.nshm.www.Util.readValue;
import static gov.usgs.earthquake.nshm.www.Util.readValues;
import static gov.usgs.earthquake.nshm.www.Util.Key.EDITION;
import static gov.usgs.earthquake.nshm.www.Util.Key.IMT;
import static gov.usgs.earthquake.nshm.www.Util.Key.LATITUDE;
import static gov.usgs.earthquake.nshm.www.Util.Key.LONGITUDE;
import static gov.usgs.earthquake.nshm.www.Util.Key.REGION;
import static gov.usgs.earthquake.nshm.www.Util.Key.VS30;
import static org.opensha2.calc.ResultHandler.curvesBySource;
import gov.usgs.earthquake.nshm.www.meta.Edition;
import gov.usgs.earthquake.nshm.www.meta.Metadata;
import gov.usgs.earthquake.nshm.www.meta.Region;
import gov.usgs.earthquake.nshm.www.meta.Status;

import java.io.IOException;
import java.util.Date;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.Future;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha2.HazardCalc;
import org.opensha2.calc.CalcConfig;
import org.opensha2.calc.CalcConfig.Builder;
import org.opensha2.calc.Hazard;
import org.opensha2.calc.Site;
import org.opensha2.calc.Vs30;
import org.opensha2.data.XySequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.eq.model.SourceType;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.internal.Parsing;
import org.opensha2.internal.Parsing.Delimiter;

import com.google.common.base.Optional;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;

/**
 * Probabilisitic seismic hazard calculation service.
 *
 * @author Peter Powers
 */
@SuppressWarnings("unused")
@WebServlet(
    name = "Hazard Service",
    description = "USGS NSHMP Hazard Curve Calculator",
    urlPatterns = {
        "/hazard",
        "/hazard/*" })
public final class HazardService extends HttpServlet {

  /*
   * Developer notes:
   *
   * The HazardService and DeaggService are very similar. Deagg delegates to a
   * package method HazardService.haardCalc() to obtain a Hazard object, which
   * it then deaggregates. This method may combine Hazard objects from CEUS and
   * WUS models, otherwise it runs a single model. HazardService.RequestData
   * objects are common to both services, with the understanding that Optional
   * fields (1) 'imts' will always contain a Set<Imt> with a single entry for
   * deagg, and that (2) 'returnPeriod' will be absent for hazard.
   *
   * Nshmp-haz calculations are designed to leverage all available processors by
   * default distributing work using the ServletUtil.CALC_EXECUTOR. This can
   * create problems in a servlet environment, however, because Tomcat does not
   * support a single threaded request queue where requests are processed as
   * they are received with the next task starting only once the prior has
   * finished. One can really only limit the maximum number of somultaneous
   * requests. When multiple requests are received in a short span, Tomcat will
   * attempt to run hazard or deagg calculations simultaneously. The net effect
   * is that there can be out of memory problesm as too many results are
   * retained, and multiple requests do not return until all are finished.
   *
   * To address this, requests of HazardService and DeaggService are submitted
   * as tasks to the single-threaded ServletUtil.TASK_EXECUTOR and are processed
   * one-at-a-time in the order received.
   */

  /*
   * IMTs: PGA, SA0P20, SA1P00 TODO this need to be updated to the result of
   * polling all models and supports needs to be updated to specific models
   *
   * Regions: COUS, WUS, CEUS, [HI, AK, GM, AS, SAM, ...]
   *
   * vs30: 180, 259, 360, 537, 760, 1150, 2000
   *
   * 2014 updated values
   *
   * vs30: 185, 260, 365, 530, 760, 1080, 2000
   *
   */

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {

    response.setContentType("application/json; charset=UTF-8");

    String query = request.getQueryString();
    String pathInfo = request.getPathInfo();
    String host = request.getServerName();
    String protocol = request.getHeader("X_FORWARDED_PROTO");

    if (protocol == null) {
      // Not a forwarded request. Honor reported protocol and port
      protocol = request.getScheme() + "://";
      host += ":" + request.getServerPort();
    }

    if (isNullOrEmpty(query) && isNullOrEmpty(pathInfo)) {
      response.getWriter().printf(Metadata.HAZARD_USAGE, protocol, host);
      return;
    }

    StringBuffer urlBuf = request.getRequestURL();
    if (query != null) urlBuf.append('?').append(query);
    String url = urlBuf.toString();

    RequestData requestData;
    try {
      if (query != null) {
        /* process query '?' request */
        requestData = buildRequest(request.getParameterMap());
      } else {
        /* process slash-delimited request */
        List<String> params = Parsing.splitToList(pathInfo, Delimiter.SLASH);
        if (params.size() < 6) {
          response.getWriter().printf(Metadata.HAZARD_USAGE, protocol, host);
          return;
        }
        requestData = buildRequest(params);
      }

      /* Submit as task to job executor */
      HazardTask task = new HazardTask(url, requestData, getServletContext());
      Result result = ServletUtil.TASK_EXECUTOR.submit(task).get();
      String resultStr = GSON.toJson(result);
      response.getWriter().print(resultStr);

    } catch (Exception e) {
      String message = Metadata.errorMessage(url, e, false);
      response.getWriter().print(message);
      getServletContext().log(url, e);
    }
  }

  /* Reduce query string key-value pairs */
  private RequestData buildRequest(Map<String, String[]> paramMap) {
    Optional<Set<Imt>> imts = paramMap.containsKey(IMT.toString())
        ? Optional.of(readValues(paramMap, IMT, Imt.class)) : Optional.<Set<Imt>> absent();

    return new RequestData(
        readValue(paramMap, EDITION, Edition.class),
        readValue(paramMap, REGION, Region.class),
        readDoubleValue(paramMap, LONGITUDE),
        readDoubleValue(paramMap, LATITUDE),
        imts,
        Vs30.fromValue(readDoubleValue(paramMap, VS30)),
        Optional.<Double> absent());
  }

  /* Reduce slash-delimited request */
  private RequestData buildRequest(List<String> params) {
    Optional<Set<Imt>> imts = (params.get(4).equalsIgnoreCase("any"))
        ? Optional.<Set<Imt>> absent() : Optional.of(readValues(params.get(4), Imt.class));

    return new RequestData(
        readValue(params.get(0), Edition.class),
        readValue(params.get(1), Region.class),
        Double.valueOf(params.get(2)),
        Double.valueOf(params.get(3)),
        imts,
        Vs30.fromValue(Double.valueOf(params.get(5))),
        Optional.<Double> absent());
  }

  private static class HazardTask implements Callable<Result> {

    final String url;
    final RequestData data;
    final ServletContext context;

    HazardTask(String url, RequestData data, ServletContext context) {
      this.url = url;
      this.data = data;
      this.context = context;
    }

    @Override
    public Result call() throws Exception {
      Hazard hazard = calcHazard(data, context);
      return new Result.Builder()
          .requestData(data)
          .url(url)
          .hazard(hazard)
          .build();
    }
  }

  /* Also used by DeaggService */
  static Hazard calcHazard(RequestData data, ServletContext context) {

    Location loc = Location.create(data.latitude, data.longitude);
    Site site = Site.builder().location(loc).vs30(data.vs30.value()).build();

    @SuppressWarnings("unchecked")
    LoadingCache<Model, HazardModel> modelCache =
        (LoadingCache<Model, HazardModel>) context.getAttribute(MODEL_CACHE_CONTEXT_ID);
    Hazard hazard;

    // TODO cache calls should be using checked get(id)

    if (data.region == Region.COUS) {

      Model wusId = Model.valueOf(Region.WUS, data.edition.year());
      HazardModel wusModel = modelCache.getUnchecked(wusId);
      Hazard wusResult = process(wusModel, site, data.imts);

      Model ceusId = Model.valueOf(Region.CEUS, data.edition.year());
      HazardModel ceusModel = modelCache.getUnchecked(ceusId);
      Hazard ceusResult = process(ceusModel, site, data.imts);

      return Hazard.merge(wusResult, ceusResult);
    }

    Model modelId = Model.valueOf(data.region, data.edition.year());
    HazardModel model = modelCache.getUnchecked(modelId);
    return process(model, site, data.imts);
  }

  private static Hazard process(HazardModel model, Site site, Optional<Set<Imt>> imts) {
    Builder configBuilder = CalcConfig.Builder.copyOf(model.config());
    if (imts.isPresent()) {
      configBuilder.imts(imts.get());
    }
    CalcConfig config = configBuilder.build();
    Optional<Executor> executor = Optional.<Executor> of(ServletUtil.CALC_EXECUTOR);
    return HazardCalc.calc(model, config, site, executor);
  }


  static final class RequestData {

    final Edition edition;
    final Region region;
    final double latitude;
    final double longitude;
    final Optional<Set<Imt>> imts;
    final Vs30 vs30;
    final Optional<Double> returnPeriod;

    RequestData(
        Edition edition,
        Region region,
        double longitude,
        double latitude,
        Optional<Set<Imt>> imts,
        Vs30 vs30,
        Optional<Double> returnPeriod) {

      this.edition = edition;
      this.region = region;
      this.latitude = latitude;
      this.longitude = longitude;
      this.imts = imts;
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

  private static final class Response {

    final ResponseData metadata;
    final List<Curve> data;

    Response(ResponseData metadata, List<Curve> data) {
      this.metadata = metadata;
      this.data = data;
    }
  }

  private static final class Curve {

    final String component;
    final List<Double> yvalues;

    Curve(String component, List<Double> yvalues) {
      this.component = component;
      this.yvalues = yvalues;
    }
  }

  private static final String TOTAL_KEY = "Total";

  private static final class Result {

    final String status = Status.SUCCESS.toString();
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

      Map<Imt, Map<SourceType, XySequence>> componentMaps;
      Map<Imt, XySequence> totalMap;
      Map<Imt, List<Double>> xValuesLinearMap;

      Builder hazard(Hazard hazardResult) {
        checkState(totalMap == null, "Hazard has already been added to this builder");

        componentMaps = new EnumMap<>(Imt.class);
        totalMap = new EnumMap<>(Imt.class);
        xValuesLinearMap = new EnumMap<>(Imt.class);

        Map<Imt, Map<SourceType, XySequence>> typeTotalMaps = curvesBySource(hazardResult);

        for (Imt imt : hazardResult.curves().keySet()) {

          // total curve
          addOrPut(totalMap, imt, hazardResult.curves().get(imt));

          // component curves
          Map<SourceType, XySequence> typeTotalMap = typeTotalMaps.get(imt);
          Map<SourceType, XySequence> componentMap = componentMaps.get(imt);
          if (componentMap == null) {
            componentMap = new EnumMap<>(SourceType.class);
            componentMaps.put(imt, componentMap);
          }

          for (SourceType type : typeTotalMap.keySet()) {
            addOrPut(componentMap, type, typeTotalMap.get(type));
          }

          xValuesLinearMap.put(
              imt,
              hazardResult.config().curve.modelCurve(imt).xValues());
        }
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

        for (Imt imt : totalMap.keySet()) {

          ResponseData responseData = new ResponseData(
              request,
              imt,
              xValuesLinearMap.get(imt));

          ImmutableList.Builder<Curve> curveListBuilder = ImmutableList.builder();

          // total curve
          Curve totalCurve = new Curve(
              TOTAL_KEY,
              totalMap.get(imt).yValues());
          curveListBuilder.add(totalCurve);

          // component curves
          Map<SourceType, XySequence> typeMap = componentMaps.get(imt);
          for (SourceType type : typeMap.keySet()) {
            Curve curve = new Curve(
                type.toString(),
                typeMap.get(type).yValues());
            curveListBuilder.add(curve);
          }

          Response response = new Response(responseData, curveListBuilder.build());
          responseListBuilder.add(response);
        }
        return new Result(url, responseListBuilder.build());
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
