package gov.usgs.earthquake.param;

import static com.google.common.base.Strings.nullToEmpty;

import java.util.Collection;
import java.util.Set;

/**
 * Static methods for the creation of {@code Param}s. All methods throw
 * {@code NullPointerException}s for {@code null} arguments.
 * 
 * @author Peter Powers
 */
public class Params {

	private Params() {}

	/**
	 * Creates a new, {@code boolean}-valued {@code Param}, initialized to the
	 * default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param defaultValue of the {@code Param}
	 * @return a new {@code boolean}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static Param<Boolean> newBooleanParam(String name, String info, boolean defaultValue) {
		return new DefaultParam<Boolean>(name, info, defaultValue);
	}

	/**
	 * Creates a new {@code Param} whose value can be set to any {@code double}.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @return a new {@code double}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static Param<Double> newDoubleParam(String name, String info, String units,
			double defaultValue) {

		return new DefaultNumberParam<Double>(name, info, units, defaultValue);
	}

	/**
	 * Creates a new, bounded {@code double}-valued {@code Param}, initialized
	 * to the default value. Internally, the 'recommended' bounds are set to the
	 * supplied 'allowed' bounds.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @param minAllow the lower bound, inclusive
	 * @param maxAllow the upper bound, inclusive
	 * @return a new {@code Param} that is restricted to a range of
	 *         {@code double} values
	 * @throws IllegalArgumentException if {@code name} is empty; if any of
	 *         {@code [defaultValue | minAllow | maxAllow]} are
	 *         {@code Double.NaN}, {@code Double.POSITIVE_INFINITY}, or
	 *         {@code Double.NEGATIVE_INFINITY}; if
	 *         {@code minAllow.equls(maxAllow)}; or if {@code defaultValue} is
	 *         outside allowed bounds
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static BoundedNumberParam<Double> newDoubleParamWithBounds(String name, String info,
			String units, double defaultValue, double minAllow, double maxAllow) {

		return new DefaultBoundedNumberParam<Double>(name, info, units, defaultValue, minAllow,
			maxAllow, minAllow, maxAllow);
	}

	/**
	 * Creates a new, bounded {@code double}-valued {@code Param} that has
	 * recommended values and is initialized to the default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @param minAllow the lower bound, inclusive
	 * @param maxAllow the upper bound, inclusive
	 * @param minRec the lower recommended bound, inclusive
	 * @param maxRec the upper recommended bound, inclusive
	 * @return a new {@code Param} that is restricted to a range of
	 *         {@code double} values
	 * @throws IllegalArgumentException if the {@code name} is empty; if any of
	 *         {@code [defaultValue | minAllow | maxAllow | minRec | maxRec]}
	 *         are {@code Double.NaN}, {@code Double.POSITIVE_INFINITY}, or
	 *         {@code Double.NEGATIVE_INFINITY}; if {@code defaultValue} is
	 *         outside recommended bounds; if {@code minAllow.equals(maxAllow)};
	 *         or if either {@code [minRec | maxRec]} is outside the the range
	 *         defined by {@code minAllow} and {@code maxAllow}
	 * @throws NullPointerException if the {@code name} is {@code null}
	 */
	public static BoundedNumberParam<Double> newDoubleParamWithBounds(String name, String info,
			String units, double defaultValue, double minAllow, double maxAllow, double minRec,
			double maxRec) {

		return new DefaultBoundedNumberParam<Double>(name, info, units, defaultValue, minAllow,
			maxAllow, minRec, maxRec);
	}

	/**
	 * Creates a new, {@code double}-valued {@code Param} that is restricted to
	 * a discrete set of values and initialized to the default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param}; a {@code null} value will be set to
	 *        an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @param options that this parameter may be set to
	 * @return a new {@code Param} that is restricted to discrete set of
	 *         {@code double} values
	 * @throws IllegalArgumentException if {@code name} is empty, if the
	 *         {@code defaultValue} is not an allowed value, or if the
	 *         {@code Collection} of allowed {@code values} is empty.
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}, or if the {@code Collection} of allowed
	 *         {@code values} is {@code null} or contains {@code null} values
	 */
	public static DiscreteNumberParam<Double> newDoubleParamWithValues(String name, String info,
			String units, double defaultValue, Set<Double> options) {

		return new DefaultDiscreteNumberParam<Double>(name, info, units, defaultValue, options);
	}

	/**
	 * Creates a new {@code Param} whose value can be set to any {@code int}.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @return a new {@code int}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static Param<Integer> newIntegerParam(String name, String info, String units,
			int defaultValue) {

		return new DefaultNumberParam<Integer>(name, info, units, defaultValue);
	}

	/**
	 * Creates a new {@code Param} whose value can be set to any {@code int}.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param units of this {@code Param} value; a {@code null} value will be
	 *        set to an empty {@code String} (max 24 chars)
	 * @param defaultValue of the {@code Param}
	 * @param options that this parameter may be set to
	 * @return a new {@code int}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static DiscreteNumberParam<Integer> newIntegerParamWithValues(String name, String info,
			String units, int defaultValue, Set<Integer> options) {

		return new DefaultDiscreteNumberParam<Integer>(name, info, units, defaultValue, options);
	}

	/**
	 * Creates a new {@code EnumParam}, initialized to the default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param defaultValue of the {@code Param}
	 * @param options a subset of the {@code Param} type
	 * @return a new {@code Enum}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty, or the
	 *         {@code defaultValue} is not included in {@code options}
	 * @throws NullPointerException if the {@code name} or {@code defaultValue}
	 *         is {@code null}
	 */
	public static <E extends Enum<E>> Param<E> newEnumParam(String name, String info,
			E defaultValue, Set<E> options) {

		return new DefaultEnumParam<E>(name, info, defaultValue, options);
	}

	/**
	 * Creates a new, {@code String}-valued {@code Param}, initialized to the
	 * default value.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param defaultValue of the {@code Param}
	 * @return a new {@code String}-valued {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty
	 * @throws NullPointerException if the {@code name}
	 */
	public static Param<String> newStringParam(String name, String info, String defaultValue) {
		String def = nullToEmpty(defaultValue).trim();
		return new DefaultParam<String>(name, info, def.isEmpty() ? "[empty default]"
			: defaultValue);
	}

}
