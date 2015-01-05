package gov.usgs.earthquake.param;

/**
 * Marker interface that identifies a {@code Number}-valued {@code Param}
 * with having a fixed set of possible values.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface DiscreteNumberParam<T extends Number>
		extends NumberParam<T>, ChoiceParam<T> {

}
