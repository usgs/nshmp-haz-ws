package gov.usgs.earthquake.nshm.www.util;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha.calc.Calcs;

/**
 * Add comments here
 *
 * @author Peter Powers
 */
@WebListener
public class ServiceUtil implements ServletContextListener {

	@Override public void contextDestroyed(ServletContextEvent arg0) {
//		Calcs.
		// TODO do nothing

	}

	@Override public void contextInitialized(ServletContextEvent arg0) {
		// TODO do nothing

	}

}
