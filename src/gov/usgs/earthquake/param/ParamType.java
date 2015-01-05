package gov.usgs.earthquake.param;

import static com.google.common.base.CaseFormat.UPPER_CAMEL;
import static com.google.common.base.CaseFormat.UPPER_UNDERSCORE;

import com.google.common.base.CaseFormat;

/**
 * Identifiers of different {@code Param} types. These correspond to specific
 * package-private {@code Param} implementations and are used as a rendering
 * hint in a {@code Param}s JSON state object.
 * 
 * @author Peter Powers
 */
enum ParamType {

	BOOLEAN,
	STRING,
	ENUM,
	INTEGER,
	INTEGER_BOUNDED,
	INTEGER_DISCRETE,
	DOUBLE,
	DOUBLE_BOUNDED,
	DOUBLE_DISCRETE;

	/**
	 * Returns a {@code CaseFormat#UPPER_CAMEL} {@code String} representation of
	 * this {@code ParamType}.
	 */
	@Override public String toString() {
		return UPPER_UNDERSCORE.to(UPPER_CAMEL, name());
	}

	/**
	 * Converts supplied {@code String} to equivalent {@code ParamType}.
	 * Method expects a {@code String} with {@code CaseFormat#UPPER_CAMEL}
	 * 
	 * @param s {@code String} to convert
	 * @return the corresponding {@code ParamType}
	 * @see CaseFormat
	 * @throws IllegalArgumentException if supplied {@code String} is
	 *         incorrectly formatted or no matching {@code ParamType} exists
	 */
	public static ParamType fromString(String s) {
		return valueOf(UPPER_CAMEL.to(UPPER_UNDERSCORE, s));
	}

}
