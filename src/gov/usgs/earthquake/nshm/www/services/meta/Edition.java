package gov.usgs.earthquake.nshm.www.services.meta;

@SuppressWarnings("javadoc")
public enum Edition {
	E2008(2008, "USGS NSHM 2008 Rev. 3"),
	E2014(2014, "USGS NSHM 2014 Rev. 2");

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
