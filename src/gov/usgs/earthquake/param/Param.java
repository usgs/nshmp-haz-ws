package gov.usgs.earthquake.param;

import com.google.gson.JsonObject;

/**
 * Top level interface for value-wrapping parameter classes. A {@code Param} may
 * represent any scalar value or object but is generally restricted to simple
 * types such as {@code String}s, {@code Enum}s, or {@code Double}s.
 * Implementations always initialize a {@code Param} with a default value and
 * therefore never return {@code null}. Implementations also guarantee that
 * {@code Param} properties (e.g. name, allowed values) are immutable after
 * creation. Parameter names may not be longer than 72 characters, and info
 * strings no longer than 256; both will be truncated if longer. Two parameters
 * are considered equal if they have the same name.
 * 
 * <p>{@code Param}s facilitate communication between application services and
 * web clients. {@code Param} states (e.g. enabled, visible) are provided for
 * the benefit of the client and do not place restrictions on the ability to
 * change the value of a {@code Param} programmatically.</p>
 * 
 * <p><em>Parent-child relationships:</em> {@code Param}s may have children that
 * imply conditional relationships: e.g. the selection of a parent may affect
 * the enabled state of a child. A {@code Param} may have multiple children, but
 * a child is only ever allowed to be attached to one parent. This feature is
 * intended for managing occasional dependency and not for use with large
 * heirarchies of nested parameters or for dynamic insertion/deletion of
 * {@code Param}s in {@link ParamList}s. Child lists are created lazily and
 * should not be considered thread-safe.</p>
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface Param<T> {

	/**
	 * Set the value of this {@code Param} and throws an exception if the
	 * supplied value is illegal, {@code null}, or out-of-range.
	 * 
	 * @param value to set
	 * @throws NullPointerException if supplied value is null
	 * @throws IllegalArgumentException if supplied value is not allowed
	 */
	public void set(T value);

	/**
	 * Return the value of this {@code Param}. Implementations guarantee to
	 * never return {@code null}.
	 * 
	 * @return the parameter value.
	 */
	public T value();

	/**
	 * Reset {@code Param} to default value.
	 */
	public void reset();

	/**
	 * Returns the info string for this {@code Param}. This is a short
	 * description appropriate for use in a tooltip. This method may return an
	 * empty {@code String}, but will never return {@code null}.
	 * 
	 * @return the info/tooltip {@code String}
	 */
	public String info();

	/**
	 * Returns whether this {@code Param} is currently enabled. A disabled
	 * {@code Param} can not have focus in an editor.
	 * 
	 * @return {@code true} if enabled, {@code false} otherwise
	 * @see #enable()
	 * @see #disable()
	 */
	public boolean enabled();

	/**
	 * Set the enabled state of this {@code Param} to {@code true}. Usually some
	 * inter-parameter logic dictates whether a parameter is enabled: e.g. the
	 * selected state of a boolean parameter dictates whether some numeric value
	 * is required and therefore enabled. Default implementations automatically
	 * enable all child {@code Param}s.
	 * 
	 * @see #disable()
	 * @see #enabled()
	 */
	public void enable();

	/**
	 * Set the enabled state of this {@code Param} to {@code false}. Usually
	 * some inter-parameter logic dictates whether a parameter is dinabled: e.g.
	 * the selected state of a boolean parameter dictates whether some numeric
	 * value is not required and therefore disabled. Default implementations
	 * automatically disable all child {@code Param}s.
	 * 
	 * @see #enable()
	 * @see #enabled()
	 */
	public void disable();

	/**
	 * Return whether this {@code Param} is currently visible.
	 * 
	 * @return {@code true} if visible, {@code false} otherwise
	 */
	public boolean visible();

	/**
	 * Sets this {@code Param}s visibility state to {@code true}. Showing a
	 * {@code Param} will not affect its enabled state; it will also show it's
	 * children.
	 * 
	 * @see #visible()
	 * @see #hide()
	 */
	public void show();

	/**
	 * Sets this {@code Param}s visibility state to {@code false}. Hiding a
	 * {@code Param} will not affect its enabled state; it will also hide it's
	 * children.
	 * 
	 * @see #visible()
	 * @see #show()
	 */
	public void hide();

	/**
	 * Returns a JSON representation of this {@code Param}.
	 * 
	 * @return json
	 */
	public JsonObject state();

	/**
	 * Adds a child {@code Param}. Implementations handle logic that binds the
	 * parent to child.
	 * 
	 * @param child {@code Param} to add
	 * @throws IllegalArgumentException if the supplied {@code Param} is already
	 *         attached to a parent
	 * @throws IllegalArgumentException if a child {@code Param} with the same
	 *         name already exists
	 */
	public void addChild(Param<?> child);

	/**
	 * Returns an immutable {@code Collection} of child {@code Param}s.
	 * 
	 * @return the {@code Collection} of children or {@code null} if
	 *         {@code Param} has no children
	 */
	public ParamList children();

}
