package gov.usgs.earthquake.nshm.www.services.meta;

final class DoubleParameter<T> {

	final String label;
	final ParamType type;
	final Values values;

	public DoubleParameter(String label, ParamType type, double min, double max) {
		this.label = label;
		this.type = type;
		this.values = new Values(min, max);
	}
	
	final static class Values {
		
		final double minimum;
		final double maximum;
		
		Values(double min, double max) {
			this.minimum = min;
			this.maximum = max;
		}
	}

}
