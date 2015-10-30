package gov.usgs.earthquake.nshm.www.services.meta;

import java.util.EnumSet;

@SuppressWarnings("javadoc")
public enum Edition implements Constrained {

	E2008(
			"USGS NSHM 2008 Dynamic",
			2008,
			100,
			new EditionConstraints(
				EnumSet.allOf(Region.class))),

	E2014(
			"USGS NSHM 2014 Dynamic",
			2014,
			0,
			new EditionConstraints(
				EnumSet.allOf(Region.class)));

	final String label;
	final int year;
	final int displayOrder;
	final Constraints constraints;

	private Edition(String label, int year, int displayOrder,
			Constraints constraints) {
		this.year = year;
		this.label = label;
		this.displayOrder = displayOrder;
		this.constraints = constraints;
	}

	@Override public String toString() {
		return label;
	}

	public int year() {
		return year;
	}

	@Override public Constraints constraints() {
		return constraints;
	}
}
