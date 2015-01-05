package gov.usgs.earthquake.param;

/**
 * Marker interface that identifies {@code Enum}-valued {@code Param}s.
 * 
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public interface EnumParam<E extends Enum<E>> extends ChoiceParam<E> {}
