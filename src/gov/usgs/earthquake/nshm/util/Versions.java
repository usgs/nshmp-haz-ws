package gov.usgs.earthquake.nshm.util;

import org.opensha2.internal.Version;

import com.google.common.collect.ImmutableMap;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Properties;

import gov.usgs.earthquake.nshm.www.meta.Edition;

/**
 * Application version tracking.
 * 
 * @author Peter Powers
 */
public class Versions {

  /** nshmp-haz version. */
  public static final String NSHMP_HAZ_VERSION;

  /** nshmp-haz build date. */
  public static final String NSHMP_HAZ_BUILD_DATE;

  /** nshmp-haz-ws version. */
  public static final String NSHMP_HAZ_WS_VERSION;

  /** nshmp-haz-ws build date. */
  public static final String NSHMP_HAZ_WS_BUILD_DATE;

  /** Model versions. */
  public static final Map<Edition, String> MODEL_VERSIONS;

  static {

    String nshmpHazVersion = "unknown";
    String nshmpHazBuildDate = "now";
    String nshmpHazWsVersion = "unknown";
    String nshmpHazWsBuildDate = "now";
    ImmutableMap.Builder<Edition, String> modelMap = ImmutableMap.builder();

    /* Always runs from a war (possibly unpacked). */
    InputStream is = null;
    Properties props = null;
    try {

      /* Core library version. */
      is = Version.class.getResourceAsStream("/app.properties");
      props = new Properties();
      props.load(is);
      is.close();
      nshmpHazVersion = props.getProperty("app.version");
      nshmpHazBuildDate = props.getProperty("build.date");

      /* Web-services version. */
      is = Versions.class.getResourceAsStream("/app.properties");
      props = new Properties();
      props.load(is);
      is.close();
      nshmpHazWsVersion = props.getProperty("app.version");
      nshmpHazWsBuildDate = props.getProperty("build.date");

      /* Model versions. */
      for (Edition edition : Edition.values()) {
        String modelKey = edition.name() + ".version";
        String modelVersion = props.getProperty(modelKey);
        modelMap.put(edition, modelVersion);
      }

    } catch (Exception e1) {
      /* Probably running outside standard webservice environment. */
      if (is != null) {
        try {
          is.close();
        } catch (Exception e2) {}
      }
    }

    NSHMP_HAZ_VERSION = nshmpHazVersion;
    NSHMP_HAZ_BUILD_DATE = nshmpHazBuildDate;
    NSHMP_HAZ_WS_VERSION = nshmpHazWsVersion;
    NSHMP_HAZ_WS_BUILD_DATE = nshmpHazWsBuildDate;
    MODEL_VERSIONS = modelMap.build();
  }

}
