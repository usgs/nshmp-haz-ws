package gov.usgs.earthquake.nshm.www.services;

import static com.google.common.base.StandardSystemProperty.LINE_SEPARATOR;
import static org.opensha.programs.HazardCurve.calc;
import gov.usgs.earthquake.nshm.www.util.ModelID;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.opensha.calc.HazardResult;
import org.opensha.calc.Site;
import org.opensha.eq.model.HazardModel;
import org.opensha.geo.Location;
import org.opensha.gmm.Imt;
import org.opensha.util.Parsing;

/**
 * Servlet implementation class HazardCurve
 */
@WebServlet("/HazardCurve/*")
public class HazardCurve extends HttpServlet {

	// TODO logging; servlet will only use system ConsoleHandler
	// and Formatter; need to set up our custom console handler as a
	// fileHandler independent of tomcat request logs; config
	// should be automagically read from classes/logging.properties
	
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		response.setContentType("text/html");
		
		String query = request.getPathInfo();
		if (query == null) {
			response.getWriter().print(USAGE);
			return;
		}
		
		List<String> args = Parsing.splitOnSlashesToList(query);
		if (args.size() != 5) {
			response.getWriter().print(USAGE);
			return;
		}
		
		String result = processRequest(args);
		response.getWriter().print(result);
	}

	private String processRequest(List<String> args) {
		String modelStr = "NSHMP_" + args.get(1) + "_" + args.get(0);
		ModelID modelId = ModelID.valueOf(modelStr);
		HazardModel model = modelId.instance();
		if (model == null) return "Model " + modelId + " not currently supported";
		Imt imt = Imt.valueOf(args.get(2));
		double lon = Double.valueOf(args.get(3));
		double lat = Double.valueOf(args.get(4));
		Location loc = Location.create(lat, lon);
		Site site = Site.create(loc, 760.0);
		HazardResult result = calc(model, imt, site);
		String curve = Parsing.joinOnCommas(result.curve().xValues()) + LINE_SEPARATOR.value() +
			Parsing.joinOnCommas(result.curve().yValues());
		return curve;
	}

	private static final String USAGE;

	static {
		StringBuilder sb = new StringBuilder("HazardCurve usage:<br/><br/>");
		sb.append("A USGS hazard curve may be computed by supplying a slash-delimited<br/>");
		sb.append("query consisting of year, model, intensity measure type (imt), longitude,<br/>");
		sb.append("and latitude. For <a href=\"/nshmp-haz-ws/HazardCurve/2008/WUS/PGA/-118.25/34.05\">example</a>:<br/><br/>");
		sb.append("&nbsp;&nbsp;<code>http://.../nshmp-haz-ws/HazardCurve/2008/WUS/PGA/-118.25/34.05</code><br/><br/>");
		sb.append("where:<br/>");
		sb.append("&nbsp;&nbsp;year = [2008, 2014]<br/>");
		sb.append("&nbsp;&nbsp;model = [WUS, CEUS]<br/>");
		sb.append("&nbsp;&nbsp;imt = see <a href=\"http://usgs.github.io/nshmp-haz/index.html?org/opensha/gmm/Imt.html\">docs</a> for options<br/>");
		USAGE = sb.toString();
	}

}
