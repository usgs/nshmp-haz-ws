package gov.usgs.earthquake.nshm.www.meta;

import com.google.common.collect.ImmutableMap;

import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

import gov.usgs.earthquake.nshmp.HazardCalc;

/*
 * Application and model version data. References are string-based as opposed to
 * enum-based (e.g. Edition) to avoid circular references in enum
 * initializations.
 */
class Versions {

  static final String NSHMP_HAZ_VERSION = HazardCalc.VERSION;
  static final String NSHMP_HAZ_WS_VERSION;
  private static final Map<String, String> MODEL_VERSIONS;

  static {
    String nshmpHazWsVersion = "unknown";
    ImmutableMap.Builder<String, String> modelMap = ImmutableMap.builder();

    /* Always runs from a war (possibly unpacked). */
    InputStream in = null;
    try {
      in = Metadata.class.getResourceAsStream("/service.properties");
      Properties props = new Properties();
      props.load(in);
      in.close();

      for (String key : props.stringPropertyNames()) {
        String value = props.getProperty(key);
        /* Web-services version. */
        if (value.equals("app.version")) {
          nshmpHazWsVersion = value;
        }
        /* Model versions. */
        modelMap.put(key, value);
      }
    } catch (Exception e1) {
      /* Probably running outside standard webservice environment. */
      if (in != null) {
        try {
          in.close();
        } catch (Exception e2) {}
      }
    }
    NSHMP_HAZ_WS_VERSION = nshmpHazWsVersion;
    MODEL_VERSIONS = modelMap.build();
  }
  
  static String modelVersion(String id) {
    String version = MODEL_VERSIONS.get(id + ".version");
    return (version == null) ? "unknown" : version;
  }

}
