package gov.usgs.earthquake.nshm.www.meta;

import java.util.Set;

final class EnumParameter<E extends Enum<E>> {

	final String label;
	final ParamType type;
	final Set<E> values;

	public EnumParameter(String label, ParamType type, Set<E> values) {
		this.label = label;
		this.type = type;
		this.values = values;
	}

}
