package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Custom NSHMP servlet implementation.
 * 
 * <p>All nshmp-haz-ws services should extend this class. This class sets custom
 * response headers and provides access to updated host,
 * {@code request.getServerName()} and protocol, {@code request.getScheme()},
 * values to support (possible forwarded) requests on USGS servers. To construct
 * the correct request URLs use the host() and protocol() methods as in the
 * example below:
 * 
 * <pre>
 * response.getWriter().printf("%s://%s/service-name/...", protocol(), host());
 * </pre>
 * 
 * @author Peter Powers
 */
abstract class NshmpServlet extends HttpServlet {

  
  @Override
  protected void service(
      HttpServletRequest req,
      HttpServletResponse resp)
      throws ServletException, IOException {

    super.service(req, resp);
  }

  String host() {
    return null;
  }

  String protocol() {
    return null;
  }
}
