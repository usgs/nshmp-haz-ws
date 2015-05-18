package gov.usgs.earthquake.nshm.www.services;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;

import java.lang.reflect.Type;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.opensha2.geo.GeoTools;
import org.opensha2.gmm.Imt;

import com.google.common.base.Function;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/**
 * This class when serialized to JSON supplies metadata required to
 * configure web clients.
 * 
 * TODO need to poll supported models for Imt and vs30 support/dependencies
 */
final class ServiceParameters {

	final Parameter<Edition> edition;
	final Parameter<Region> region;
	final Parameter<Double> longitude;
	final Parameter<Double> latitude;
	final Parameter<Imt> imt;
	final Parameter<Vs30> vs30;

	ServiceParameters() {

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

	final static class Parameter<T> {

		final String label;
		final ParamType type;
		final Set<T> values;

		Parameter(String label, ParamType type, Set<T> values) {
			this.label = label;
			this.type = type;
			this.values = values;
		}

	}

	static final Set<Imt> IMTS = EnumSet.of(PGA, SA0P2, SA1P0);
	static final Set<Vs30> CEUS_VS = EnumSet.of(Vs30.VS_2000, Vs30.VS_760);
	static final Set<Vs30> COUS_VS = EnumSet.of(Vs30.VS_760);
	static final Set<Vs30> WUS_VS = EnumSet.of(Vs30.VS_1150, Vs30.VS_760, Vs30.VS_537, Vs30.VS_360,
		Vs30.VS_259, Vs30.VS_180);

	enum ParamType {
		INTEGER,
		NUMBER;
	}

	enum Edition {
		E2008(2008),
		E2014(2014);

		final int year;

		private Edition(int year) {
			this.year = year;
		}
	}

	enum Region implements Constrained {

		COUS("Conterminous US", new RegionConstraints(COUS_VS, IMTS)),
		WUS("Western US", new RegionConstraints(WUS_VS, IMTS)),
		CEUS("Central & Eastern US", new RegionConstraints(CEUS_VS, IMTS));

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

	enum Vs30 {
		VS_2000("Site class A"),
		VS_1150("Site class B"),
		VS_760("B/C boundary"),
		VS_537("Site class C"),
		VS_360("C/D boundary"),
		VS_259("Site class D"),
		VS_180("D/E boundary");

		private String label;

		private Vs30(String label) {
			this.label = label;
		}

		@Override public String toString() {
			return this.name().substring(3) + " m/s (" + label + ")";
		}
	}

	/*
	 * Marker interface for supported parameter lists; individual enums provide
	 * concrete implementations.
	 */
	interface Constraints {}

	/*
	 * Interface implemented by enum parameters that impose restrictions on
	 * other parameter choices.
	 */
	static interface Constrained {
		public Constraints constraints();
	}

	static class RegionConstraints implements Constraints {

		final List<String> imt;
		final List<String> vs30;

		RegionConstraints(Set<Vs30> vs30, Set<Imt> imt) {
			// converting to Strings here, otherwise EnumSerializer will be used
			// and we want a compact list of (possible modified) enum.name()s
			this.vs30 = enumToString(vs30, VS_TO_STR);
			this.imt = enumToString(imt, IMT_TO_STR);
		}
	}

	static class ParamTypeSerializer implements JsonSerializer<ParamType> {
		@Override public JsonElement serialize(ParamType paramType, Type type,
				JsonSerializationContext context) {
			return new JsonPrimitive(paramType.name().toLowerCase());
		}
	}

	static class EnumSerializer<E extends Enum<E>> implements JsonSerializer<E> {

		@Override public JsonElement serialize(E src, Type type,
				JsonSerializationContext context) {

			String value = (src instanceof Vs30) ? src.name().substring(3) : src.name();

			JsonObject jObj = new JsonObject();
			jObj.addProperty("id", src.ordinal());
			jObj.addProperty("value", value);
			jObj.addProperty("display", src.toString());
			jObj.addProperty("displayOrder", src.ordinal());

			if (src instanceof Constrained) {
				Constrained cSrc = (Constrained) src;
				jObj.add("supports", context.serialize(cSrc.constraints()));
			}

			return jObj;
		}
	}

	private static <E extends Enum<E>> List<String> enumToString(Set<E> values,
			Function<E, String> function) {
		return FluentIterable.from(values).transform(function).toList();
	}

	private static final Function<Imt, String> IMT_TO_STR = new Function<Imt, String>() {
		@Override public String apply(Imt imt) {
			return imt.name();
		}
	};

	private static final Function<Vs30, String> VS_TO_STR = new Function<Vs30, String>() {
		@Override public String apply(Vs30 vs30) {
			return vs30.name().substring(3);
		}
	};

	public static void main(String[] args) {
		Gson GSON = new GsonBuilder()
			.registerTypeAdapter(ParamType.class, new ParamTypeSerializer())
			.registerTypeAdapter(Region.class, new EnumSerializer<Region>())
			.registerTypeAdapter(Imt.class, new EnumSerializer<Imt>())
			.registerTypeAdapter(Vs30.class, new EnumSerializer<Vs30>())
			.disableHtmlEscaping()
			.serializeNulls()
			.setPrettyPrinting()
			.create();

		ServiceParameters sp = new ServiceParameters();

		String json = GSON.toJson(sp);
		System.out.println(json);

	}
}
