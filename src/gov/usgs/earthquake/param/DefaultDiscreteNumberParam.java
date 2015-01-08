package gov.usgs.earthquake.param;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static gov.usgs.earthquake.param.ParamKey.OPTIONS;
import static gov.usgs.earthquake.param.ParamKey.TYPE;
import static gov.usgs.earthquake.param.ParamType.DOUBLE_DISCRETE;
import static gov.usgs.earthquake.param.ParamType.INTEGER_DISCRETE;

import java.util.Set;

import com.google.common.collect.ImmutableSortedSet;
import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;

/**
 * Base implementation for a {@code Number}-valued parameter that is restricted
 * to a discrete {@code Set} of values.
 * 
 * @author Peter Powers
 */
class DefaultDiscreteNumberParam<T extends Number> extends DefaultNumberParam<T> implements
		DiscreteNumberParam<T> {

	private Set<T> options;

	/**
	 * Constructs a new, {@code Number}-valued {@code Param} that is restricted
	 * to a discrete {@code Set} of values and that is initialized to the
	 * default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param}; a {@code null} value will be set to
	 *        an empty {@code String}
	 * @param defaultValue of the {@code Param}
	 * @param options that this parameter may be set to
	 * @throws IllegalArgumentException if {@code name} is an empty string, of
	 *         {@code options} is empty, if the {@code defaultValue} is not an
	 *         allowed value, or if the {@code Collection} of allowed
	 *         {@code values} is empty or contains {@code null}
	 */
	DefaultDiscreteNumberParam(String name, String info, String units, T defaultValue,
		Set<T> options) {

		super(name, info, units, defaultValue);
		checkNotNull(options);
		checkArgument(!options.isEmpty(), "Options is empty");
		checkArgument(options.contains(defaultValue), "Default missing from options");
		checkArgument(!options.contains(null), "Options contains null");
		this.options = ImmutableSortedSet.copyOf(options);

		// possibly restrict editability
		if (this.options.size() == 1) disable();

		// init state
		boolean isInteger = defaultValue.getClass().equals(Integer.class);
		state.addProperty(TYPE.toString(), isInteger ? INTEGER_DISCRETE.toString()
			: DOUBLE_DISCRETE.toString());

		JsonArray stateOptions = new JsonArray();
		for (T option : options) {
			stateOptions.add(new JsonPrimitive(option));
		}
		state.add(OPTIONS.toString(), stateOptions);
	}

	@Override public final Set<T> options() {
		return options;
	}

	@Override public final void set(T value) {
		checkNotNull(value);
		checkArgument(options.contains(value), "Value [%s] not permitted", value);
		super.set(value);
	}

}
