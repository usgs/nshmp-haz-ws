package gov.usgs.earthquake.nshm.www.util;

import org.opensha.eq.forecast.Forecast;

/**
 * Add comments here
 * 
 * @author Peter Powers
 */
public enum ForecastID {

	// TODO refactor to Model

	// TODO these enums should be keyed to know forecast locations;
	// forecastMgr would be able to generate instances using String/URL key

	NSHMP_CEUS_2008() {
		@Override public Forecast instance() {
			return Ceus2008.INSTANCE.model;
		}
	},
	NSHMP_WUS_2008 {
		@Override public Forecast instance() {
			return Wus2008.INSTANCE.model;
		}
	},
	NSHMP_CEUS_2014 {
		@Override public Forecast instance() {
			return Ceus2014.INSTANCE.model;
		}
	},
	NSHMP_WUS_2014 {
		@Override public Forecast instance() {
			return Wus2014.INSTANCE.model;
		}
	};

	/**
	 * Returns the shared initialized instance of a the {@link Forecast} for
	 * this identifier.
	 */
	public abstract Forecast instance();

	// @formatter:off

	private static enum Ceus2008 {
		INSTANCE;
		private Forecast model;
		private Ceus2008() { model = null; }
	}

	private static enum Wus2008 {
		INSTANCE;
		private Forecast model;
		private Wus2008() { model = null; }
	}

	private static enum Ceus2014 {
		INSTANCE;
		private Forecast model;
		private Ceus2014() { model = null; }
	}

	private static enum Wus2014 {
		INSTANCE;
		private Forecast model;
		private Wus2014() { model = null; }
	}

}
