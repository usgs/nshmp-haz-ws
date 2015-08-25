package gov.usgs.earthquake.nshm.www.services.meta;

@SuppressWarnings("javadoc")
public enum Region implements Constrained {

	COUS("Conterminous US", new RegionConstraints(Util.COUS_VS, Util.IMTS)),
	WUS("Western US", new RegionConstraints(Util.WUS_VS, Util.IMTS)),
	CEUS("Central & Eastern US", new RegionConstraints(Util.CEUS_VS, Util.IMTS));

	final String label;
	final Constraints constraints;

	private Region(String label, Constraints constraints) {
		this.label = label;
		this.constraints = constraints;
	}

	@Override public String toString() {
		return label;
	}

	@Override public Constraints constraints() {
		return constraints;
	}
}
