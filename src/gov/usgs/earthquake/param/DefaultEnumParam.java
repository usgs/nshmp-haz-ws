package gov.usgs.earthquake.param;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static gov.usgs.earthquake.param.ParamKey.OPTIONS;
import static gov.usgs.earthquake.param.ParamKey.TYPE;
import static gov.usgs.earthquake.param.ParamType.ENUM;

import java.util.Set;

import com.google.common.collect.Sets;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

/**
 * A {@code Param} whose value is restricted to the constants (or some subset
 * thereof) defined by an {@code enum} type.
 * 
 * @author Peter Powers
 */
class DefaultEnumParam<E extends Enum<E>> extends DefaultParam<E> implements EnumParam<E> {

	private Set<E> options;

	/**
	 * Constructs a new {@code EnumParam}, initialized to the default value.
	 * Limit the set of options with the supplied {@code EnumSet}.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param defaultValue of the {@code Param}
	 * @param options a subset of the option type
	 * @throws IllegalArgumentException if {@code name} is an empty string,
	 *         {@code options} is empty, or the {@code defaultValue} is not
	 *         included in {@code options}
	 */
	DefaultEnumParam(String name, String info, E defaultValue, Set<E> options) {
		super(name, info, defaultValue);
		checkNotNull(options);
		checkArgument(!options.isEmpty(), "Options is empty");
		checkArgument(options.contains(defaultValue), "Default missing from options");
		this.options = Sets.immutableEnumSet(options);

		// init state
		state.addProperty(TYPE.toString(), ENUM.toString());
		JsonArray stateOptions = new JsonArray();
		for (E option : options) {
			stateOptions.add(new JsonPrimitive(option.name()));
		}
		state.add(OPTIONS.toString(), stateOptions);
	}

	@Override public final void set(E value) {
		checkNotNull(value);
		checkArgument(options.contains(value), "Value [%s] not permitted", value);
		super.set(value);
	}

	@Override public final Set<E> options() {
		return options;
	}

	@Override void setState(JsonElement json) {
		set(Enum.valueOf(value().getDeclaringClass(), json.getAsString()));
	}

}
