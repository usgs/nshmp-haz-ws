package gov.usgs.earthquake.nshm.www.meta;

@SuppressWarnings("unused")
final class DoubleParameter<T> {

	private final String label;
	private final ParamType type;
	private final Values values;

	DoubleParameter(String label, ParamType type, double min, double max) {
		this.label = label;
		this.type = type;
		this.values = new Values(min, max);
	}
	
	private final static class Values {
		
		final double minimum;
		final double maximum;
		
		Values(double min, double max) {
			this.minimum = min;
			this.maximum = max;
		}
	}

}
