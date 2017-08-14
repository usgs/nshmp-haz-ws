package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Admin utility service.
 *
 * @author Peter Powers
 */
@WebServlet(
    name = "Admin Service",
    description = "USGS NSHMP Web Service Admin Utility",
    urlPatterns = "/admin")
public class AdminService extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    ServletUtil.setCorsHeadersAndContentType(response);
    response.getWriter().print("{\"hello\" : \"admin\"}");
  }
}
