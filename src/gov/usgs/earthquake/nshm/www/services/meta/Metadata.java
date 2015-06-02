package gov.usgs.earthquake.nshm.www.services.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;

import java.util.EnumSet;

import org.opensha2.geo.GeoTools;
import org.opensha2.gmm.Imt;

import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Service metadata, parameterization, and constraint strings, in JSON format.
 */
@SuppressWarnings("javadoc")
public class Metadata {

	public static final String HAZARD_CURVE_USAGE;

	static {
		Gson GSON = new GsonBuilder()
			.registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
			.registerTypeAdapter(Edition.class, new Util.EnumSerializer<Edition>())
			.registerTypeAdapter(Region.class, new Util.EnumSerializer<Region>())
			.registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
			.registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
			.disableHtmlEscaping()
			.serializeNulls()
			.setPrettyPrinting()
			.create();

		HAZARD_CURVE_USAGE = GSON.toJson(new HazardCurve());
	}

	@SuppressWarnings("unused")
	private static class HazardCurve {

		final Parameter<Edition> edition;
		final Parameter<Region> region;
		final Parameter<Double> longitude;
		final Parameter<Double> latitude;
		final Parameter<Imt> imt;
		final Parameter<Vs30> vs30;

		HazardCurve() {

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
