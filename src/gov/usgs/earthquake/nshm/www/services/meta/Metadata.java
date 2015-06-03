package gov.usgs.earthquake.nshm.www.services.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;

import java.util.EnumSet;

import org.opensha2.geo.GeoTools;
import org.opensha2.gmm.Imt;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public class Metadata {

	public static final String HAZARD_CURVE_USAGE;

	private static Gson GSON;

	static {
		GSON = new GsonBuilder()
			.setPrettyPrinting()
			.disableHtmlEscaping()
			.create();

		Gson gson = new GsonBuilder()
			.registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
			.registerTypeAdapter(Edition.class, new Util.EnumSerializer<Edition>())
			.registerTypeAdapter(Region.class, new Util.EnumSerializer<Region>())
			.registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
			.registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
			.disableHtmlEscaping()
			.serializeNulls()
			.setPrettyPrinting()
			.create();

		HAZARD_CURVE_USAGE = gson.toJson(new HazardCurve());
	}

	@SuppressWarnings("unused")
	private static class HazardCurve {

		final String status = "usage";
		final String description = "Computes hazard curve data for an input location";
		final String syntax = "http://localhost:8080/nshmp-haz-ws/HazardCurve/edition/region/lon/lat/imt/vs30";
		final Parameters parameters = new Parameters();

		private class Parameters {

			final Parameter<Edition> edition;
			final Parameter<Region> region;
			final Parameter<Double> longitude;
			final Parameter<Double> latitude;
			final Parameter<Imt> imt;
			final Parameter<Vs30> vs30;

			Parameters() {

				edition = new Parameter<>(
					"Model edition",
					ParamType.INTEGER,
					EnumSet.allOf(Edition.class));

				region = new Parameter<>(
					"Model region",
					ParamType.INTEGER,
					EnumSet.allOf(Region.class));

				longitude = new Parameter<>(
					"Longitude (in decimal degrees)",
					ParamType.NUMBER,
					ImmutableSet.of(GeoTools.MIN_LON, GeoTools.MAX_LON));

				latitude = new Parameter<>(
					"Latitude (in decimal degrees)",
					ParamType.NUMBER,
					ImmutableSet.of(GeoTools.MIN_LAT, GeoTools.MAX_LAT));

				imt = new Parameter<>(
					"Intensity measure type",
					ParamType.INTEGER,
					EnumSet.of(PGA, SA0P2, SA1P0));

				vs30 = new Parameter<>(
					"Site soil (Vs30)",
					ParamType.INTEGER,
					EnumSet.allOf(Vs30.class));
			}
		}

	}

	public static String errorMessage(String url, Throwable e) {
		Error error = new Error(url, e);
		return GSON.toJson(error);
	}

	@SuppressWarnings("unused")
	private static class Error {

		final String status = "error";
		final String request;
		final String trace;

		private Error(String request, Throwable e) {
			this.request = request;
			String trace = Throwables.getStackTraceAsString(e);
			trace = trace.replaceAll("\n", "<br />");
			trace = trace.replaceAll("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
			this.trace =  "<br />" + trace;
		}
	}

}
