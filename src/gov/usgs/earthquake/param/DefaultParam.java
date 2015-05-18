package gov.usgs.earthquake.param;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Strings.nullToEmpty;
import static gov.usgs.earthquake.param.ParamKey.INFO;
import static gov.usgs.earthquake.param.ParamKey.NAME;
import static gov.usgs.earthquake.param.ParamKey.TYPE;
import static gov.usgs.earthquake.param.ParamKey.VALUE;
import static gov.usgs.earthquake.param.ParamType.BOOLEAN;
import static gov.usgs.earthquake.param.ParamType.STRING;
import static java.lang.Math.min;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

/**
 * Base implementation of the {@code Param} interface that provides the
 * structure required for storing and retrieving a parameter name, description,
 * and value, as well as control its visibility and enable states. This class
 * also manages parent-child dependencies. A {@code Param} value is always
 * initialized to the supplied default value.
 * 
 * <p>Subclass constructors should have the following structure:
 * 
 * <ol><li>Call the sole {@code DefaultParam} constructor via {@code super()}
 * for basic {@code null} checking.</li><li>Perform type-specific illegal
 * argument checking.</li></ol></p>
 * 
 * <p><strong>Note:</strong>{@code Param}s implements an {@code #equals(Object)}
 * that compares based on name alone. Class, type, value, etc... are all
 * ignored. This behavior supports {@code ParamList} management.</p>
 * 
 * @author Peter Powers
 */
class DefaultParam<T> implements Param<T> {

	private T value;
	private final T defaultValue;
	private final String name;
	private final String info;
	private boolean enabled = true;
	private boolean visible = true;
	private ParamList children;
	private Param<?> parent;
	JsonObject state;

	static final int MAX_LENGTH_NAME = 72;
	static final int MAX_LENGTH_INFO = 256;

	/**
	 * Default {@code Param} constructor.
	 * 
	 * @param name of the {@code Param} (max 72 chars)
	 * @param info {@code String} for use in tooltips; a {@code null} value will
	 *        be set to an empty {@code String} (max 256 chars)
	 * @param defaultValue of the {@code Param}
	 * @throws IllegalArgumentException if {@code name} is empty or whitespace
	 *         only
	 */
	DefaultParam(final String name, final String info, final T defaultValue) {

		checkNotNull(name);
		checkNotNull(defaultValue);
		checkArgument(!name.trim().isEmpty(), "Name is empty");

		this.name = truncate(name, MAX_LENGTH_NAME);
		this.info = truncate(info, MAX_LENGTH_INFO);
		this.defaultValue = defaultValue;
		this.value = defaultValue;

		/*
		 * Note to subclassers: The state object is package-private; 'type'
		 * value should be overridden in constructors; implementations should
		 * override the package-private method setStateValue. Basic types
		 * (Boolean, String) are set here rather than implement them as distinct
		 * classes.
		 */

		state = new JsonObject();
		boolean isBoolean = defaultValue.getClass().equals(Boolean.class);
		state.addProperty(TYPE.toString(), isBoolean ? BOOLEAN.toString() : STRING.toString());
		state.addProperty(NAME.toString(), this.name);
		state.addProperty(INFO.toString(), this.info);
		setState(defaultValue);
	}

	@Override public final String toString() {
		return name;
	}

	@Override public final String info() {
		return info;
	}

	@Override public final boolean equals(Object o) {
		if (o == this) return true;
		if (!(o instanceof Param)) return false;
		return ((Param<?>) o).toString().equals(name);
	}

	@Override public final boolean enabled() {
		return enabled;
	}

	@Override public final void enable() {
		enabled = true;
		if (children != null) children.enable();
	}

	@Override public final void disable() {
		enabled = false;
		if (children != null) children.disable();
	}

	@Override public final boolean visible() {
		return visible;
	}

	@Override public final void show() {
		visible = true;
	}

	@Override public final void hide() {
		visible = false;
	}

	@Override public final T value() {
		return value;
	}

	/*
	 * Provides a default implementation of {@code Param.set(Object)}.
	 * Subclasses should override this method to filter out illegal values. They
	 * should then call {@code super.set(Object)} after all filtering logic to
	 * set the value.
	 */
	@Override public void set(T value) {
		checkNotNull(value);
		this.value = value;
		setState(value);
	}

	@Override public final void reset() {
		set(defaultValue);
	}

	@Override public final void addChild(Param<?> child) {
		checkNotNull(child);
		DefaultParam<?> defaultChild = (DefaultParam<?>) child;
		checkArgument(defaultChild.parent == null, "Child already has parent");
		if (children == null) children = ParamList.create();
		children.add(child);
		defaultChild.parent = this;
	}

	@Override public final ParamList children() {
		return children;
	}

	@Override public final JsonObject state() {
		return state;
	}

	/*
	 * Truncates a (possibly null) String to a specified length after trim()ing
	 * whitespace.
	 */
	static String truncate(String s, int length) {
		String trimmed = nullToEmpty(s).trim();
		return trimmed.substring(0, min(trimmed.length(), length));
	}

	/*
	 * Sets the value in the json state object. This method provides the logic
	 * to mutate a Param value to the correct type of JsonELement and should be
	 * overridden by subclasses as necessary.
	 */
	void setState(T value) {
		state.add(VALUE.toString(), value.getClass().equals(Boolean.class) ?
			new JsonPrimitive((Boolean) value) :
			new JsonPrimitive(value.toString()));
	}

	/*
	 * Sets the value of this parameter. This method provides the logic to
	 * mutate a JsonElement to the correct Param value type and should be
	 * overridden by subclasses as necessary. When overridden, this method
	 * should always call set() so that listeners are notified as necessary.
	 */
	@SuppressWarnings("unchecked") void setState(JsonElement json) {
		set(value.getClass().equals(Boolean.class) ?
			(T) (Boolean) json.getAsBoolean() :
			(T) json.getAsString());
	}

}
