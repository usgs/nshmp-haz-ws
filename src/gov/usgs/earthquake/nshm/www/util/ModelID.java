package gov.usgs.earthquake.nshm.www.util;

import org.opensha.eq.model.HazardModel;

/**
 * Hazard model identifiers.
 * @author Peter Powers
 */
public enum ModelID {

	NSHMP_CEUS_2008() {
		@Override public HazardModel instance() {
			return Ceus2008.INSTANCE.model;
		}
	},
	NSHMP_WUS_2008 {
		@Override public HazardModel instance() {
			return Wus2008.INSTANCE.model;
		}
	},
	NSHMP_CEUS_2014 {
		@Override public HazardModel instance() {
			return Ceus2014.INSTANCE.model;
		}
	},
	NSHMP_WUS_2014 {
		@Override public HazardModel instance() {
			return Wus2014.INSTANCE.model;
		}
	};

	/**
	 * Returns the shared initialized instance of a the {@link HazardModel} for
	 * this identifier.
	 */
	public abstract HazardModel instance();

	// @formatter:off

	private static enum Ceus2008 {
		INSTANCE;
		private HazardModel model;
		private Ceus2008() { model = null; }
	}

	private static enum Wus2008 {
		INSTANCE;
		private HazardModel model;
		private Wus2008() { model = null; }
	}

	private static enum Ceus2014 {
		INSTANCE;
		private HazardModel model;
		private Ceus2014() { model = null; }
	}

	private static enum Wus2014 {
		INSTANCE;
		private HazardModel model;
		private Wus2014() { model = null; }
	}

}
