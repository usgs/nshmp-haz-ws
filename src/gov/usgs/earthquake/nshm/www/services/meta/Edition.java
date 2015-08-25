package gov.usgs.earthquake.nshm.www.services.meta;

@SuppressWarnings("javadoc")
public enum Edition {
	E2008(2008, "USGS NSHM 2008 Dynamic"),
	E2014(2014, "USGS NSHM 2014 Dynamic");

	final int year;
	final String label;

	private Edition(int year, String label) {
		this.year = year;
		this.label = label;
	}

	@Override public String toString() {
		return label;
	}
	
	public int year() {
		return year;
	}
}
