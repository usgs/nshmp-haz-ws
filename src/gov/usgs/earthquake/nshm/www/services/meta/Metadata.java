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
public final class Metadata {

	public static final String HAZARD_USAGE = ServletUtil.GSON.toJson(new Hazard(
		"Computes hazard curve data for an input location",
		"http://%s/nshmp-haz-ws/hazard/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}",
		new HazardParameters()));

	public static final String DEAGG_USAGE = ServletUtil.GSON.toJson(new Deagg(
		"Deaggregate hazard at an input location",
		"http://%s/nshmp-haz-ws/deagg/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}/{returnPeriod}",
		new DeaggParameters()));

	@SuppressWarnings("unused")
	private static class Hazard {

		final String status;
		final String description;
		final String syntax;
		final HazardParameters parameters;

		private Hazard(
				String description,
				String syntax,
				HazardParameters parameters)  {
			this.status = "usage";
			this.description = description;
			this.syntax = syntax;
			this.parameters = parameters;
		}

	}

	@SuppressWarnings("unused")
	private static class HazardParameters {

		final EnumParameter<Edition> edition;
		final EnumParameter<Region> region;
		final DoubleParameter<Double> longitude;
		final DoubleParameter<Double> latitude;
		final EnumParameter<Imt> imt;
		final EnumParameter<Vs30> vs30;

		HazardParameters() {

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

	private static class Deagg extends Hazard {
		private Deagg(
				String description,
				String syntax,
				DeaggParameters parameters)  {
			super(description, syntax, parameters);
		}
	}

	@SuppressWarnings("unused")
	private static class DeaggParameters extends HazardParameters {

		final DoubleParameter<Double> returnPeriod;

		DeaggParameters() {
			returnPeriod = new DoubleParameter<>(
				"Return period (in years)",
				ParamType.NUMBER,
				1.0,
				4000.0);
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
