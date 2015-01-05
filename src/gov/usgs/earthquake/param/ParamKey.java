package gov.usgs.earthquake.param;

import static com.google.common.base.CaseFormat.LOWER_CAMEL;
import static com.google.common.base.CaseFormat.UPPER_UNDERSCORE;

import com.google.common.base.CaseFormat;

/**
 * Keys used to save {@code Param} attributes in JSON state objects.
 * 
 * @author Peter Powers
 */
enum ParamKey {
	
	TYPE,
	NAME,
	INFO,
	VALUE,
	UNITS,
	OPTIONS,
	RANGE_ALLOW,
	RANGE_REC,
	PARAM_LIST;

	/**
	 * Returns an {@code CaseFormat#LOWER_CAMEL} {@code String} representation
	 * of this {@code ParamKey}.
	 * 
	 * @see CaseFormat
	 */
	@Override
	public String toString() {
		return UPPER_UNDERSCORE.to(LOWER_CAMEL, name());
	}

	/**
	 * Converts supplied {@code String} to equivalent {@code ParamKey}.
	 * Method expects a {@code String} with {@code CaseFormat#LOWER_CAMEL}
	 * 
	 * @param s {@code String} to convert
	 * @return the corresponding {@code ParamKey}
	 * @see CaseFormat
	 * @throws IllegalArgumentException if supplied {@code String} is
	 *         incorrectly formatted or no matching {@code ParamKey}
	 *         exists
	 */
	public static ParamKey fromString(String s) {
		return valueOf(LOWER_CAMEL.to(UPPER_UNDERSCORE, s));
	}

}
