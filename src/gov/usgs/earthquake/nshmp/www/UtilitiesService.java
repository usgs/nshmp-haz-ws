package gov.usgs.earthquake.nshmp.www;

//..................... Import .........................
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static com.google.common.base.Strings.isNullOrEmpty;
//----------------------------------------------------------



@WebServlet(
    name = "Utilities Service",
    description = "USGS NSHMP Web Service Utilities",
    urlPatterns = {
        "/util",
        "/util/*"})
public class UtilitiesService extends HttpServlet {

  @Override
  protected void doGet(
      HttpServletRequest request, 
      HttpServletResponse response)
      throws ServletException, IOException {
      
    PrintWriter out = response.getWriter();     
    String utilUrl  = "util.html";
    
    String pathInfo  = request.getPathInfo();
    String queryInfo = request.getQueryString();
    
    if (isNullOrEmpty(pathInfo)) {            
      response.sendRedirect(utilUrl);
    }else if (pathInfo.toLowerCase().equals("/testsites")){
      if (isNullOrEmpty(queryInfo)) queryInfo = "";
      out.println(TestSites.Sites(queryInfo.toUpperCase()));
    }else {
      response.sendRedirect("../"+utilUrl);
    }
   
  }
  

}




