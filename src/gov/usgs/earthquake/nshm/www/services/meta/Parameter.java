package gov.usgs.earthquake.nshm.www.services.meta;

import java.util.Set;

final class Parameter<T> {

	final String label;
	final ParamType type;
	final Set<T> values;

	public Parameter(String label, ParamType type, Set<T> values) {
		this.label = label;
		this.type = type;
		this.values = values;
	}

}
