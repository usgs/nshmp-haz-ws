package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.EnumSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import gov.usgs.earthquake.nshmp.internal.NshmpSite;


@WebServlet("/Test")
public class NshmpTest extends HttpServlet{
  
  @Override
  public void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
    throws ServletException, IOException{
    
    PrintWriter out = response.getWriter();
    out.println("This is a test \n");
    
    
    NshmpSite[] testSites = NshmpSite.values();
    for(NshmpSite site : testSites) {
      out.println(site + " \t (" + site.location() +")" );
    }
    
    out.println("\n\n Alaska");
    EnumSet<NshmpSite> ak = NshmpSite.alaska();
    for (NshmpSite akSite : ak) {
      out.println(akSite + " \t\t (" + akSite.location() + ")");
    }
    
    
  }
}