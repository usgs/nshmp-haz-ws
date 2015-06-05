package gov.usgs.earthquake.nshm.www.services;

import static gov.usgs.earthquake.nshm.www.services.Models.CONTEXT_ID;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha2.calc.Calcs;

@WebListener
@SuppressWarnings("javadoc")
public class ServletUtil implements ServletContextListener {

	private static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX");
	
	static String formatDate(Date d) {
		// TODO switch to Java 8 time
	    synchronized(SDF) {
	        return SDF.format(d);
	    }
	}

	// TODO clean
	//  2015-04-13T17:02:02+00:00
	// "yyyy-MM-dd'T'HH:mm:ssXXX"

	@Override public void contextDestroyed(ServletContextEvent e) {
		Calcs.shutdown();
	}

	@Override public void contextInitialized(ServletContextEvent e) {
		ServletContext context = e.getServletContext();
		Models models = new Models(context, false);
		context.setAttribute(CONTEXT_ID, models);
	}

}
