package gov.usgs.earthquake.nshm.www.util;

import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.opensha2.eq.model.HazardModel;

import com.google.common.base.Throwables;
import com.google.common.io.Resources;

/**
 * Hazard model identifiers.
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public enum ModelID {

	CEUS_2008() {
		@Override public HazardModel instance() {
			return Ceus2008.INSTANCE.model;
		}
	},
	WUS_2008 {
		@Override public HazardModel instance() {
			return Wus2008.INSTANCE.model;
		}
	},
	CEUS_2014 {
		@Override public HazardModel instance() {
			return Ceus2014.INSTANCE.model;
		}
	},
	WUS_2014 {
		@Override public HazardModel instance() {
			return Wus2014.INSTANCE.model;
		}
	};

	/**
	 * Returns the shared initialized instance of a the {@link HazardModel} for
	 * this identifier.
	 */
	public abstract HazardModel instance();

	private static HazardModel loadModel(String resourcePath, String name) {
		try {
			URL url = Resources.getResource(resourcePath);
			Path path = Paths.get(url.toURI());
			return HazardModel.load(path, name);
		} catch (URISyntaxException urise) {
			Throwables.propagate(urise);
			return null;
		}
	}

	/*
	 * Enum singletons guarantee that each model loads in a threadsafe manner
	 * only when ModelID.instance() is called (above).
	 */

	private static enum Ceus2008 {
		INSTANCE;
		private HazardModel model;

		private Ceus2008() {
			System.out.println("CEUS2008");
			model = null;
		}
	}

	private static enum Wus2008 {
		INSTANCE;
		private HazardModel model;

		private Wus2008() {
			model = loadModel("/models/2008/Western US", "2008 USGS Western US Hazard Model");
		}
	}

	private static enum Ceus2014 {
		INSTANCE;
		private HazardModel model;

		private Ceus2014() {
			System.out.println("CEUS20014");
			model = null;
		}
	}

	private static enum Wus2014 {
		INSTANCE;
		private HazardModel model;

		private Wus2014() {
			System.out.println("WUS20014");
			model = null;
		}
	}

}
