package gov.usgs.earthquake.nshmp.www;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Enums;
import java.util.Optional;
import com.google.common.collect.FluentIterable;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import gov.usgs.earthquake.nshmp.internal.Parsing;
import gov.usgs.earthquake.nshmp.internal.Parsing.Delimiter;

class Util {

  enum Key {
    EDITION,
    REGION,
    VS30,
    LATITUDE,
    LONGITUDE,
    IMT,
    RETURNPERIOD,
    DISTANCE,
    FORMAT,
    TIMESPAN;

    private String label;

    private Key() {
      label = name().toLowerCase();
    }

    @Override
    public String toString() {
      return label;
    }
  }

  static <T extends Enum<T>> T readValue(String value, Class<T> type) {
    Optional<T> opt = Enums.getIfPresent(type, value).toJavaUtil();
    checkState(opt.isPresent(), "Invalid value [%s] for enum: %s", value, type.getName());
    return opt.get();
  }

  static <T extends Enum<T>> Set<T> readValues(String values, Class<T> type) {
    return EnumSet.copyOf(
        FluentIterable.from(Parsing.split(values, Delimiter.COMMA))
            .transform(Enums.stringConverter(type))
            .toList());
  }

  static String readValue(Map<String, String[]> paramMap, Key key) {
    String keyStr = key.toString();
    String[] values = paramMap.get(keyStr);
    checkNotNull(values, "Missing query key: %s", keyStr);
    checkState(values.length > 0, "Empty value array for key: %s", key);
    return values[0];
  }

  static <T extends Enum<T>> T readValue(Map<String, String[]> paramMap, Key key, Class<T> type) {
    return readValue(readValue(paramMap, key), type);
  }

  static <T extends Enum<T>> Set<T> readValues(Map<String, String[]> paramMap, Key key,
      Class<T> type) {
    return readValues(readValue(paramMap, key), type);
  }

  static double readDoubleValue(Map<String, String[]> paramMap, Key key) {
    return Double.valueOf(readValue(paramMap, key));
  }

}
