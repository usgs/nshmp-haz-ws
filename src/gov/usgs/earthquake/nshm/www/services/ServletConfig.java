package gov.usgs.earthquake.nshm.www.services;

import static gov.usgs.earthquake.nshm.www.services.Models.CONTEXT_ID;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha2.calc.Calcs;

@WebListener
@SuppressWarnings("javadoc")
public class ServletConfig implements ServletContextListener {

	@Override public void contextDestroyed(ServletContextEvent e) {
		Calcs.shutdown();
	}

	@Override public void contextInitialized(ServletContextEvent e) {
		ServletContext context = e.getServletContext();
		Models models = new Models(context, false);
		context.setAttribute(CONTEXT_ID, models);
	}

}
