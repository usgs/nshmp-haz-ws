package gov.usgs.earthquake.param;

import static gov.usgs.earthquake.param.ParamKey.TYPE;
import static gov.usgs.earthquake.param.ParamKey.UNITS;
import static gov.usgs.earthquake.param.ParamKey.VALUE;
import static gov.usgs.earthquake.param.ParamType.DOUBLE;
import static gov.usgs.earthquake.param.ParamType.INTEGER;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

/**
 * Base implementation for {@code Number}-valued parameters. Units
 * {@code String} is truncated at 24 characters on initialization. At present
 * this implementation
 * 
 * @author Peter Powers
 */
class DefaultNumberParam<T extends Number> extends DefaultParam<T> implements NumberParam<T> {

	static final int MAX_LENGTH_UNITS = 24;

	private String units;

	DefaultNumberParam(String name, String info, String units, T defaultValue) {
		super(name, info, defaultValue);
		this.units = truncate(units, MAX_LENGTH_UNITS);

		// init state
		boolean isInteger = defaultValue.getClass().equals(Integer.class);
		state.addProperty(TYPE.toString(), isInteger ? INTEGER.toString() : DOUBLE.toString());
		state.addProperty(UNITS.toString(), units);
	}

	@Override public final String units() {
		return units;
	}

	@Override void setState(T value) {
		state.add(VALUE.toString(), new JsonPrimitive(value));
	}

	@Override @SuppressWarnings("unchecked") void setState(JsonElement json) {
		// It turns out we can't use getAsNumber() even though we use T extends
		// Number because a Number can't be cast to Double, Integer, etc...
		set(value().getClass().equals(Double.class) ? (T) (Double) json.getAsDouble()
			: (T) (Integer) json.getAsInt());
	}

}
