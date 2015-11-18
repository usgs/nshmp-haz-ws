package gov.usgs.earthquake.nshm.www.meta;

import java.util.EnumSet;
import java.util.Set;

@SuppressWarnings("javadoc")
public enum Edition implements Constrained {

	E2008(
			"USGS NSHM 2008 Dynamic",
			2008,
			100,
			EnumSet.allOf(Region.class)),

	E2014(
			"USGS NSHM 2014 Dynamic",
			2014,
			0,
			EnumSet.allOf(Region.class));

	private final String label;
	private final int year;

	/* not serialized */
	final transient Set<Region> regions;

	private final Constraints constraints;

	final int displayOrder;

	private Edition(
			String label,
			int year,
			int displayOrder,
			Set<Region> regions) {
		
		this.year = year;
		this.label = label;
		this.displayOrder = displayOrder;
		this.regions = regions;
		this.constraints = new EditionConstraints(regions);
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
