package gov.usgs.earthquake.nshm.www.util;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha2.calc.Calcs;

/**
 * Add comments here
 *
 * @author Peter Powers
 */
@WebListener
public class ServiceUtil implements ServletContextListener {

	@Override public void contextDestroyed(ServletContextEvent arg0) {
		Calcs.shutdown();
	}

	@Override public void contextInitialized(ServletContextEvent arg0) {
	}

}
