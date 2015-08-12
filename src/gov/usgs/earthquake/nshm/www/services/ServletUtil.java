package gov.usgs.earthquake.nshm.www.services;

import static java.lang.Runtime.getRuntime;
import static java.util.concurrent.Executors.newFixedThreadPool;
import gov.usgs.earthquake.nshm.www.services.meta.Edition;
import gov.usgs.earthquake.nshm.www.services.meta.Region;
import gov.usgs.earthquake.nshm.www.services.meta.Util;
import gov.usgs.earthquake.nshm.www.services.meta.Vs30;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha2.eq.model.HazardModel;
import org.opensha2.gmm.Imt;

import com.google.common.base.Throwables;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet utility objects and methods.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
@WebListener
public class ServletUtil implements ServletContextListener {

	/*
	 * Some shared resources may be accessed statically, others, such as models,
	 * depend on a context-param and may be accessed as context attributes.
	 */

	private static final SimpleDateFormat dateFormat = new SimpleDateFormat(
		"yyyy-MM-dd'T'HH:mm:ssXXX");

	static final ExecutorService EXEC;
	public static final Gson GSON;

	static final String MODEL_CACHE_CONTEXT_ID = "model.cache";
	
	static {
		EXEC = newFixedThreadPool(getRuntime().availableProcessors());
		GSON = new GsonBuilder()
			.registerTypeAdapter(Edition.class, new Util.EnumSerializer<Edition>())
			.registerTypeAdapter(Region.class, new Util.EnumSerializer<Region>())
			.registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
			.registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
			.disableHtmlEscaping()
			.setPrettyPrinting()
			.create();
	}

	@Override public void contextDestroyed(ServletContextEvent e) {
		EXEC.shutdown();
	}

	@Override public void contextInitialized(ServletContextEvent e) {
		
		final ServletContext context = e.getServletContext();

		final LoadingCache<Model, HazardModel> modelCache = CacheBuilder.newBuilder().build(
			new CacheLoader<Model, HazardModel>() {
				@Override public HazardModel load(Model model) throws Exception {
					return loadModel(context, model);
				}
			});
		context.setAttribute(MODEL_CACHE_CONTEXT_ID, modelCache);
		
		// possibly fill (preload) cache
		boolean preload = Boolean.valueOf(context.getInitParameter("preloadModels"));
		System.out.println("preload: " + preload);

		if (preload) {
			for (final Model model : Model.values()) {
				EXEC.submit(new Callable<HazardModel>() {
					@Override public HazardModel call() throws Exception {
						return modelCache.getUnchecked(model);
					}
				});
			}
		}
	}

	private static HazardModel loadModel(ServletContext context, Model model) {
		try {
			URL url = context.getResource(model.path);
			Path path = Paths.get(url.toURI());
			return HazardModel.load(path);
		} catch (URISyntaxException | MalformedURLException e) {
			Throwables.propagate(e);
			return null;
		}
	}
		
	static String formatDate(Date d) {
		// TODO switch to Java 8 time
		synchronized (dateFormat) {
			return dateFormat.format(d);
		}
	}

}
