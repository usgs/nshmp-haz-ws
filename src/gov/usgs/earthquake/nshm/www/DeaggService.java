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

import org.opensha2.HazardCalc;
import org.opensha2.calc.CalcConfig;
import org.opensha2.calc.CalcConfig.Builder;
import org.opensha2.calc.Calcs;
import org.opensha2.calc.Deaggregation;
import org.opensha2.calc.Hazard;
import org.opensha2.calc.Site;
import org.opensha2.calc.Vs30;
import org.opensha2.data.XySequence;
import org.opensha2.eq.model.HazardModel;
import org.opensha2.geo.Location;
import org.opensha2.gmm.Imt;
import org.opensha2.internal.Parsing;
import org.opensha2.internal.Parsing.Delimiter;

import com.google.common.base.Optional;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Executor;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshm.www.HazardService.RequestData;
import gov.usgs.earthquake.nshm.www.meta.Edition;
import gov.usgs.earthquake.nshm.www.meta.Metadata;
import gov.usgs.earthquake.nshm.www.meta.Region;
import gov.usgs.earthquake.nshm.www.meta.Status;

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

  /* Developer notes: See HazardService. */

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {

    response.setContentType("application/json; charset=UTF-8");

    String query = request.getQueryString();
    String pathInfo = request.getPathInfo();
    String host = request.getServerName();

    // Checking custom header for a forwarded protocol so generated links
    // can use the same protocol and not cause mixed content errors.
    String protocol = request.getHeader("X-FORWARDED-PROTO");

    if (protocol == null) {
      // Not a forwarded request. Honor reported protocol and port
      protocol = request.getScheme();
      host += ":" + request.getServerPort();
    }

    if (isNullOrEmpty(query) && isNullOrEmpty(pathInfo)) {
      response.getWriter().printf(Metadata.DEAGG_USAGE, protocol, host);
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
        if (params.size() < 7) {
          response.getWriter().printf(Metadata.DEAGG_USAGE, protocol, host);
          return;
        }
        requestData = buildRequest(params);
      }

      /* Submit as task to job executor */
      DeaggTask task = new DeaggTask(url, requestData, getServletContext());
      Result result = ServletUtil.TASK_EXECUTOR.submit(task).get();
      String resultStr = GSON.toJson(result);
      response.getWriter().print(resultStr);

    } catch (Exception e) {
      String message = Metadata.errorMessage(url, e, false);
      response.getWriter().print(message);
    }
  }

  /* Reduce query string key-value pairs */
  private RequestData buildRequest(Map<String, String[]> paramMap) {
    /* Deagg imts will always be a singleton Set. */
    Set<Imt> imts = Sets.immutableEnumSet(readValue(paramMap, IMT, Imt.class));
    return new RequestData(
        readValue(paramMap, EDITION, Edition.class),
        readValue(paramMap, REGION, Region.class),
        readDoubleValue(paramMap, LONGITUDE),
        readDoubleValue(paramMap, LATITUDE),
        Optional.of(imts),
        Vs30.fromValue(readDoubleValue(paramMap, VS30)),
        Optional.of(readDoubleValue(paramMap, RETURNPERIOD)));
  }

  /* Reduce slash-delimited request */
  private RequestData buildRequest(List<String> params) {
    /* Deagg imts will always be a singleton Set. */
    Set<Imt> imts = Sets.immutableEnumSet(readValue(params.get(4), Imt.class));
    return new RequestData(
        readValue(params.get(0), Edition.class),
        readValue(params.get(1), Region.class),
        Double.valueOf(params.get(2)),
        Double.valueOf(params.get(3)),
        Optional.of(imts),
        Vs30.fromValue(Double.valueOf(params.get(5))),
        Optional.of(Double.valueOf(params.get(6))));
  }

  private static class DeaggTask implements Callable<Result> {

    final String url;
    final RequestData data;
    final ServletContext context;

    DeaggTask(String url, RequestData data, ServletContext context) {
      this.url = url;
      this.data = data;
      this.context = context;
    }

    @Override
    public Result call() throws Exception {
      return process(url, data, context);
    }
  }

  private static Result process(String url, RequestData data, ServletContext context) {
    Hazard hazard = HazardService.calcHazard(data, context);
    Deaggregation deagg = Calcs.deaggregation(hazard, data.returnPeriod.get());
    return new Result.Builder()
        .requestData(data)
        .url(url)
        .deagg(deagg)
        .build();
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
    final Object εbins;

    ResponseData(Deaggregation deagg, RequestData request, Imt imt) {
      this.edition = request.edition;
      this.region = request.region;
      this.longitude = request.longitude;
      this.latitude = request.latitude;
      this.imt = imt;
      this.returnperiod = request.returnPeriod.get();
      this.vs30 = request.vs30;
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

      Builder deagg(Deaggregation deagg) {
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
        Imt imt = Iterables.getOnlyElement(request.imts.get());
        ResponseData responseData = new ResponseData(
            deagg,
            request,
            imt);
        Object deaggs = deagg.toJson(imt);
        Response response = new Response(responseData, deaggs);
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
