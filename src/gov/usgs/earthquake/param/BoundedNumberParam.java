package gov.usgs.earthquake.param;

/**
 * Interface that identifies a {@code Number} valued {@code Param} as having
 * minimum and maximum values and possibly a recommended range of values.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface BoundedNumberParam<T extends Number & Comparable<T>> extends
		NumberParam<T> {

	/**
	 * Returns the minimum allowable value for this {@code Param}.
	 * @return the minimum allowable value
	 */
	public T minAllowed();

	/**
	 * Returns the maximum allowable value for this {@code Param}.
	 * @return the maximum allowable value
	 */
	public T maxAllowed();

	/**
	 * Returns whether the current value of this {@code Param} is recommended.
	 * @return {@code true} if current value is recommended, {@code false}
	 *         otherwise
	 */
	public boolean recommended();

	/**
	 * Returns the minimum recommended value for this {@code Param}.
	 * @return the minimum recommended value
	 */
	public T minRecommended();

	/**
	 * Returns the maximum recommended value for this {@code Param}.
	 * @return the maximum recommended value
	 */
	public T maxRecommended();

}
