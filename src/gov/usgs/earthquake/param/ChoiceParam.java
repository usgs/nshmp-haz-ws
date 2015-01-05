package gov.usgs.earthquake.param;

import java.util.Set;

/**
 * Interface that identifies a {@code Param} as having a fixed set of possible
 * values.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface ChoiceParam<T> extends Param<T> {

	/**
	 * Returns an unmodifiable {@code Set} of possible values that an
	 * implementing {@code Param} may take. Implementations are responsible for
	 * managing the iteration order of the options (as for display in a pick
	 * list).
	 * 
	 * @return a {@code List} of valid values for this {@code Param}
	 */
	public Set<T> options();

}
