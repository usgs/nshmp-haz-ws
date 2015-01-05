package gov.usgs.earthquake.param;

/**
 * Interface that identifies a {@code Param} as representing a {@code Number}
 * with some 'units' value. At the time of writing, the interface assumes
 * implementation with primitive class equivalents [Byte, Short, Integer, Long,
 * Float, Double]. The units string may not exceed 24 characters.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface NumberParam<T extends Number> extends Param<T> {

	/**
	 * Returns the units of this {@code Param}. This method may return an empty
	 * {@code String} but should never return {@code null}.
	 * 
	 * @return the units {@code String}
	 */
	public String units();

}
