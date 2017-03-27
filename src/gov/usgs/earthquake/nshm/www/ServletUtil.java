package gov.usgs.earthquake.nshm.www;

import static java.lang.Runtime.getRuntime;
import gov.usgs.earthquake.nshm.www.meta.Edition;
import gov.usgs.earthquake.nshm.www.meta.ParamType;
import gov.usgs.earthquake.nshm.www.meta.Region;
import gov.usgs.earthquake.nshm.www.meta.Util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URI;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.FileSystemNotFoundException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.opensha2.calc.Vs30;
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

  static final ExecutorService CALC_EXECUTOR;
  static final ExecutorService TASK_EXECUTOR;

  public static final Gson GSON;

  static final String MODEL_CACHE_CONTEXT_ID = "model.cache";

  static {
    CALC_EXECUTOR = Executors.newFixedThreadPool(getRuntime().availableProcessors());
    TASK_EXECUTOR = Executors.newSingleThreadExecutor();
    GSON = new GsonBuilder()
        .registerTypeAdapter(Edition.class, new Util.EnumSerializer<Edition>())
        .registerTypeAdapter(Region.class, new Util.EnumSerializer<Region>())
        .registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
        .registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
        .registerTypeAdapter(Double.class, new Util.DoubleSerializer())
        .registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
        .disableHtmlEscaping()
        .serializeNulls()
        .setPrettyPrinting()
        .create();
  }

  @Override
  public void contextDestroyed(ServletContextEvent e) {
    CALC_EXECUTOR.shutdown();
    TASK_EXECUTOR.shutdown();
  }

  @Override
  public void contextInitialized(ServletContextEvent e) {

    final ServletContext context = e.getServletContext();

    final LoadingCache<Model, HazardModel> modelCache = CacheBuilder.newBuilder().build(
        new CacheLoader<Model, HazardModel>() {
          @Override
          public HazardModel load(Model model) {
            return loadModel(context, model);
          }
        });
    context.setAttribute(MODEL_CACHE_CONTEXT_ID, modelCache);

    // possibly fill (preload) cache
    boolean preload = Boolean.valueOf(context.getInitParameter("preloadModels"));
    // System.out.println("preload: " + preload);

    if (preload) {
      for (final Model model : Model.values()) {
        CALC_EXECUTOR.submit(new Callable<HazardModel>() {
          @Override
          public HazardModel call() throws Exception {
            return modelCache.getUnchecked(model);
          }
        });
      }
    }
  }

  private static HazardModel loadModel(ServletContext context, Model model) {
    Path path;
    URL url;
    URI uri;
    String uriString;
    String[] uriParts;
    FileSystem fs;

    try {
      url = context.getResource(model.path);
      uri = new URI(url.toString().replace(" ", "%20"));
      uriString = uri.toString();

      /*
       * When the web sevice is deployed inside a WAR file (and not unpacked by
       * the servlet container) model resources will not exist on disk as
       * otherwise expected. In this case, load the resources directly out of
       * the WAR file as well. This is slower, but with the preload option
       * enabled it may be less of an issue if the models are already in memory.
       */

      if (uriString.indexOf("!") != -1) {
        uriParts = uri.toString().split("!");

        try {
          fs = FileSystems.getFileSystem(
              URI.create(uriParts[0]));
        } catch (FileSystemNotFoundException fnx) {
          fs = FileSystems.newFileSystem(
              URI.create(uriParts[0]),
              new HashMap<String, String>());
        }

        path = fs.getPath(uriParts[1].replaceAll("%20", " "));
      } else {
        path = Paths.get(uri);
      }

      return HazardModel.load(path);
    } catch (URISyntaxException | MalformedURLException e) {
      throw new RuntimeException(e);
    } catch (IOException iox) {
      throw new RuntimeException(iox);
    }
  }

  static String formatDate(Date d) {
    // TODO switch to Java 8 time
    synchronized (dateFormat) {
      return dateFormat.format(d);
    }
  }

}
