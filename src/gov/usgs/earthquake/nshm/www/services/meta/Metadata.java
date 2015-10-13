package gov.usgs.earthquake.nshm.www.services.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;
import gov.usgs.earthquake.nshm.www.services.ServletUtil;

import java.util.EnumSet;

import org.opensha2.calc.Vs30;
import org.opensha2.geo.GeoTools;
import org.opensha2.gmm.Imt;

import com.google.common.base.Throwables;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public class Metadata {

	public static final String HAZARD_CURVE_USAGE = ServletUtil.GSON.toJson(new HazardCurve());

	@SuppressWarnings("unused")
	private static class HazardCurve {

		final String status = "usage";
		final String description = "Computes hazard curve data for an input location";
		final String syntax = "http://%s/nshmp-haz-ws/HazardCurve/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}";
		final Parameters parameters = new Parameters();

		private class Parameters {

			final EnumParameter<Edition> edition;
			final EnumParameter<Region> region;
			final DoubleParameter<Double> longitude;
			final DoubleParameter<Double> latitude;
			final EnumParameter<Imt> imt;
			final EnumParameter<Vs30> vs30;

			Parameters() {

				edition = new EnumParameter<>(
					"Model edition",
					ParamType.STRING,
					EnumSet.allOf(Edition.class));

				region = new EnumParameter<>(
					"Model region",
					ParamType.STRING,
					EnumSet.allOf(Region.class));

				longitude = new DoubleParameter<>(
					"Longitude (in decimal degrees)",
					ParamType.NUMBER,
					GeoTools.MIN_LON,
					GeoTools.MAX_LON);

				latitude = new DoubleParameter<>(
					"Latitude (in decimal degrees)",
					ParamType.NUMBER,
					GeoTools.MIN_LAT,
					GeoTools.MAX_LAT);

				imt = new EnumParameter<>(
					"Intensity measure type",
					ParamType.STRING,
					EnumSet.of(PGA, SA0P2, SA1P0));

				vs30 = new EnumParameter<>(
					"Site soil (Vs30)",
					ParamType.STRING,
					EnumSet.allOf(Vs30.class));
			}
		}
	}

	public static String errorMessage(String url, Throwable e) {
		Error error = new Error(url, e);
		return ServletUtil.GSON.toJson(error);
	}

	@SuppressWarnings("unused")
	private static class Error {

		final String status = "error";
		final String request;
		final String trace;

		private Error(String request, Throwable e) {
			this.request = request;
			this.trace = Throwables.getStackTraceAsString(e);
		}
	}

}
