package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Custom NSHMP servlet implementation and URL helper class.
 * 
 * <p>All nshmp-haz-ws services should extend this class. This class sets custom
 * response headers and provides a helper class to ensure serialized response
 * URLs propagate the correct host and protocol from requests on USGS servers
 * and caches that may have been forwarded.
 * 
 * <p>Class provides one convenience method,
 * {@code urlHelper.writeResponse(String)}, to write a servlet response wherein
 * any URL strings may be formatted with the correct protocol and host. Such URL
 * strings should start with:
 * 
 * "%s://%s/service-name/..."
 * 
 * @author Peter Powers
 */
public abstract class NshmpServlet extends HttpServlet {

  @Override
  protected void service(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {

    /*
     * Set CORS headers and content type.
     * 
     * Because nshmp-haz-ws services may be called by both the USGS website,
     * other websites, and directly by 3rd party applications, reponses
     * generated by direct requests will not have the necessary header
     * information that would be required by security protocols for web
     * requests. This means that any initial direct request will pollute
     * intermediate caches with a response that a browser will deem invalid.
     */
    response.setContentType("application/json; charset=UTF-8");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "*");
    response.setHeader("Access-Control-Allow-Headers", "accept,origin,authorization,content-type");

    super.service(request, response);
  }

  public static UrlHelper urlHelper(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    return new UrlHelper(request, response);
  }

  public static class UrlHelper {

    private final HttpServletResponse response;
    private final String host;
    private final String protocol;
    public final String url;

    UrlHelper(HttpServletRequest request, HttpServletResponse response) {
      /*
       * Check custom header for a forwarded protocol so generated links can use
       * the same protocol and not cause mixed content errors.
       */
      String sourceHost = request.getHeader("x-source-host");
      String host = sourceHost == null ? request.getServerName() : sourceHost;
      String sourceProtocol = request.getHeader("x-source-proto");
      String protocol = sourceProtocol == null
          ? request.getHeader("X-FORWARDED-PROTO")
          : sourceProtocol;
      if (protocol == null) {
        /* Not a forwarded request. Honor reported protocol and port. */
        protocol = request.getScheme();
        host += ":" + request.getServerPort();
      }

      /*
       * For convenience, store a url field with the (possibly updated) request
       * protocol and
       */
      String url = String.format("%s://%s%s", protocol, host, request.getPathInfo());
      String query = request.getQueryString();
      if (query != null) url = String.format("%s?%s", url, query);

      this.response = response;
      this.host = host;
      this.protocol = protocol;
      this.url = url;
    }

    /**
     * Convenience method to update a string response with the correct protocol
     * and host in URLs. URL strings should start with:
     * 
     * "%s://%s/service-name/..."
     */
    public void writeResponse(String usage) throws IOException {
      // TODO had to add duplicate fields to handle haz and g syntax strings
      response.getWriter().printf(usage, protocol, host, protocol, host);
    }
  }

}
