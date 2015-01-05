package gov.usgs.earthquake.param;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static gov.usgs.earthquake.param.ParamKey.RANGE_ALLOW;
import static gov.usgs.earthquake.param.ParamKey.RANGE_REC;
import static gov.usgs.earthquake.param.ParamKey.TYPE;
import static gov.usgs.earthquake.param.ParamType.DOUBLE_BOUNDED;
import static gov.usgs.earthquake.param.ParamType.INTEGER_BOUNDED;

import com.google.common.collect.Range;
import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;

/**
 * Base implementation for a bounded, {@code Number}-valued parameter.
 * 
 * @author Peter Powers
 */
class DefaultBoundedNumberParam<T extends Number & Comparable<T>> extends DefaultNumberParam<T> implements
		BoundedNumberParam<T> {

	private Range<T> allowed;
	private Range<T> recommended;

	/**
	 * Constructs a new, bounded, {@code Number}-valued {@code Param} that also
	 * has recommended values. The {@code Param} is initialized to the default
	 * value.
	 * 
	 * @param name of the {@code Param}
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String}
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String}
	 * @param defaultValue of the {@code Param}
	 * @param minAllow the lower bound, inclusive
	 * @param maxAllow the upper bound, inclusive
	 * @param minRec the lower recommended bound, inclusive
	 * @param maxRec the upper recommended bound, inclusive
	 * @throws IllegalArgumentException if the {@code name} is an empty string;
	 *         if any of
	 *         {@code [defaultValue | minAllow | maxAllow | minRec | maxRec]}
	 *         are not allowed; if {@code defaultValue} is outside recommended
	 *         bounds; if {@code minAllow.equals(maxAllow)}; or if either
	 *         {@code [minRec | maxRec]} is outside the the range defined by
	 *         {@code minAllow} and {@code maxAllow}
	 */
	DefaultBoundedNumberParam(String name, String info, String units, T defaultValue, T minAllow,
		T maxAllow, T minRec, T maxRec) {

		super(name, info, units, defaultValue);
		validate(defaultValue, "defaultValue");
		setBounds(minAllow, maxAllow, minRec, maxRec);
		validateDefault(defaultValue);

		// init state
		boolean isInteger = defaultValue.getClass().equals(Integer.class);
		state.addProperty(TYPE.toString(),
			isInteger ? INTEGER_BOUNDED.toString() : DOUBLE_BOUNDED.toString());

		JsonArray rangeAllow = new JsonArray();
		rangeAllow.add(new JsonPrimitive(minAllow));
		rangeAllow.add(new JsonPrimitive(maxAllow));
		state.add(RANGE_ALLOW.toString(), rangeAllow);

		JsonArray rangeRec = new JsonArray();
		rangeRec.add(new JsonPrimitive(minRec));
		rangeRec.add(new JsonPrimitive(maxRec));
		state.add(RANGE_REC.toString(), rangeRec);
	}

	@Override public final void set(T value) {
		checkNotNull(value);
		checkArgument(allowed.contains(value), "Value [%s] is out of range", value);
		super.set(value);
	}

	@Override public final boolean recommended() {
		return recommended.contains(value());
	}

	@Override public final T minAllowed() {
		return allowed.lowerEndpoint();
	}

	@Override public final T maxAllowed() {
		return allowed.upperEndpoint();
	}

	@Override public final T minRecommended() {
		return recommended.lowerEndpoint();
	}

	@Override public final T maxRecommended() {
		return recommended.upperEndpoint();
	}

	private void setBounds(T minAllow, T maxAllow, T minRec, T maxRec) {

		validate(minAllow, "minAllow");
		validate(maxAllow, "maxAllow");
		validate(minRec, "minRec");
		validate(maxRec, "maxRec");
		validateRange(minAllow, maxAllow, "minMaxAllow");
		validateRange(minRec, maxRec, "minMaxRec");

		allowed = Range.closed(minAllow, maxAllow);
		recommended = Range.closed(minRec, maxRec);

		checkArgument(allowed.encloses(recommended), "Recommended values are outside allowed range");
	}

	/*
	 * Check for unwanted values; it's impossible to declare an abstract method
	 * that is then called by the constructor of the declaring abstract class --
	 * knowing that access is only granted through the Params utility class,
	 * we'll do those checks to satisfy the range of 'Numbers' currently
	 * supported. At the time of writing, it was assumed that only
	 * implementation for primitive type equivalents [Byte, Short, Integer,
	 * Long, Float, Double] would be created; only double and float reuire
	 * checking.
	 */
	private void validate(T value, String id) {
		checkNotNull(value, "%s is null", id);
		if (value instanceof Double) {
			Double dbl = (Double) value;
			checkArgument(!dbl.isNaN(), "%s is NaN", id);
			checkArgument(dbl != Double.NEGATIVE_INFINITY, "%s is -Inf", id);
			checkArgument(dbl != Double.POSITIVE_INFINITY, "%s is +Inf", id);
		} else if (value instanceof Float) {
			Float flt = (Float) value;
			checkArgument(!flt.isNaN(), "%s is NaN", id);
			checkArgument(flt != Float.NEGATIVE_INFINITY, "%s is -Inf", id);
			checkArgument(flt != Float.POSITIVE_INFINITY, "%s is +Inf", id);
		}
	}

	// Check default value is in range
	private void validateDefault(T value) {
		checkArgument(recommended.contains(value),
			"Default value [%s] is outside recommended bounds", value);
	}

	// Check constructor range inputs
	private void validateRange(T min, T max, String id) {
		checkArgument(min.compareTo(max) < 0, "%s are misordered or equal", id);
	}

}
