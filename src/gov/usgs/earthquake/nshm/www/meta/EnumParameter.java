package gov.usgs.earthquake.nshm.www.meta;

import java.util.Set;

final class EnumParameter<E extends Enum<E>> {

	private final String label;
	private final ParamType type;
	private final Set<E> values;

	EnumParameter(String label, ParamType type, Set<E> values) {
		this.label = label;
		this.type = type;
		this.values = values;
	}

}
