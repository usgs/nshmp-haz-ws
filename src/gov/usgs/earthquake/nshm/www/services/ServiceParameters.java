package gov.usgs.earthquake.nshm.www.services;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;
import gov.usgs.earthquake.nshm.www.services.meta.Edition;
import gov.usgs.earthquake.nshm.www.services.meta.Metadata;
import gov.usgs.earthquake.nshm.www.services.meta.Region;
import gov.usgs.earthquake.nshm.www.services.meta.Vs30;

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
@Deprecated
final class ServiceParameters {

//	final String HAZARD_CURVE_USAGE;
	
//	static {
//		Gson GSON = new GsonBuilder()
//		.registerTypeAdapter(ParamType.class, new ParamTypeSerializer())
//		.registerTypeAdapter(Edition.class, new EnumSerializer<Edition>())
//		.registerTypeAdapter(Region.class, new EnumSerializer<Region>())
//		.registerTypeAdapter(Imt.class, new EnumSerializer<Imt>())
//		.registerTypeAdapter(Vs30.class, new EnumSerializer<Vs30>())
//		.disableHtmlEscaping()
//		.serializeNulls()
//		.setPrettyPrinting()
//		.create();
//
//		HAZARD_CURVE_USAGE = GSON.toJson(new HazardCurve());
//		
//	}
	
//	ServiceParameters() {
//		Gson GSON = new GsonBuilder()
//		.registerTypeAdapter(ParamType.class, new ParamTypeSerializer())
//		.registerTypeAdapter(Edition.class, new EnumSerializer<Edition>())
//		.registerTypeAdapter(Region.class, new EnumSerializer<Region>())
//		.registerTypeAdapter(Imt.class, new EnumSerializer<Imt>())
//		.registerTypeAdapter(Vs30.class, new EnumSerializer<Vs30>())
//		.disableHtmlEscaping()
//		.serializeNulls()
//		.setPrettyPrinting()
//		.create();
//
//		HAZARD_CURVE_USAGE = GSON.toJson(new HazardCurve());
//		
//	}
	
//	final Parameter<Edition> edition;
//	final Parameter<Region> region;
//	final Parameter<Double> longitude;
//	final Parameter<Double> latitude;
//	final Parameter<Imt> imt;
//	final Parameter<Vs30> vs30;
//
//	ServiceParameters() {
//
//		edition = new Parameter<>(
//			"Model edition",
//			ParamType.INTEGER,
//			EnumSet.allOf(Edition.class));
//
//		region = new Parameter<>(
//			"Model region",
//			ParamType.INTEGER,
//			EnumSet.allOf(Region.class));
//
//		longitude = new Parameter<>(
//			"Longitude (in decimal degrees)",
//			ParamType.NUMBER,
//			ImmutableSet.of(GeoTools.MIN_LON, GeoTools.MAX_LON));
//
//		latitude = new Parameter<>(
//			"Latitude (in decimal degrees)",
//			ParamType.NUMBER,
//			ImmutableSet.of(GeoTools.MIN_LAT, GeoTools.MAX_LAT));
//
//		imt = new Parameter<>(
//			"Intensity measure type",
//			ParamType.INTEGER,
//			EnumSet.of(PGA, SA0P2, SA1P0));
//
//		vs30 = new Parameter<>(
//			"Site soil (Vs30)",
//			ParamType.INTEGER,
//			EnumSet.allOf(Vs30.class));
//	}
	
//	class HazardCurve {
//		
//		final Parameter<Edition> edition;
//		final Parameter<Region> region;
//		final Parameter<Double> longitude;
//		final Parameter<Double> latitude;
//		final Parameter<Imt> imt;
//		final Parameter<Vs30> vs30;
//
//		private HazardCurve() {
//
//			edition = new Parameter<>(
//				"Model edition",
//				ParamType.INTEGER,
//				EnumSet.allOf(Edition.class));
//
//			region = new Parameter<>(
//				"Model region",
//				ParamType.INTEGER,
//				EnumSet.allOf(Region.class));
//
//			longitude = new Parameter<>(
//				"Longitude (in decimal degrees)",
//				ParamType.NUMBER,
//				ImmutableSet.of(GeoTools.MIN_LON, GeoTools.MAX_LON));
//
//			latitude = new Parameter<>(
//				"Latitude (in decimal degrees)",
//				ParamType.NUMBER,
//				ImmutableSet.of(GeoTools.MIN_LAT, GeoTools.MAX_LAT));
//
//			imt = new Parameter<>(
//				"Intensity measure type",
//				ParamType.INTEGER,
//				EnumSet.of(PGA, SA0P2, SA1P0));
//
//			vs30 = new Parameter<>(
//				"Site soil (Vs30)",
//				ParamType.INTEGER,
//				EnumSet.allOf(Vs30.class));
//		}
//	}

//	final static class Parameter<T> {
//
//		final String label;
//		final ParamType type;
//		final Set<T> values;
//
//		Parameter(String label, ParamType type, Set<T> values) {
//			this.label = label;
//			this.type = type;
//			this.values = values;
//		}
//
//	}


//	enum Edition {
//		E2008(2008, "USGS NSHM 2008 Rev. 3"),
//		E2014(2014, "USGS NSHM 2014 Rev. 2");
//
//		final int year;
//		final String label;
//
//		private Edition(int year, String label) {
//			this.year = year;
//			this.label = label;
//		}
//		@Override public String toString() {
//			return label;
//		}
//	}

//	static class RegionConstraints implements Constraints {
//
//		final List<String> imt;
//		final List<String> vs30;
//
//		RegionConstraints(Set<Vs30> vs30, Set<Imt> imt) {
//			// converting to Strings here, otherwise EnumSerializer will be used
//			// and we want a compact list of (possible modified) enum.name()s
//			this.vs30 = enumToString(vs30, VS_TO_STR);
//			this.imt = enumToString(imt, IMT_TO_STR);
//		}
//	}

//	static class ParamTypeSerializer implements JsonSerializer<ParamType> {
//		@Override public JsonElement serialize(ParamType paramType, Type type,
//				JsonSerializationContext context) {
//			return new JsonPrimitive(paramType.name().toLowerCase());
//		}
//	}

//	static class EnumSerializer<E extends Enum<E>> implements JsonSerializer<E> {
//
//		@Override public JsonElement serialize(E src, Type type,
//				JsonSerializationContext context) {
//
//			String value = (src instanceof Vs30) ? src.name().substring(3) : src.name();
//
//			JsonObject jObj = new JsonObject();
//			jObj.addProperty("id", src.ordinal());
//			jObj.addProperty("value", value);
//			jObj.addProperty("display", src.toString());
//			jObj.addProperty("displayOrder", src.ordinal());
//
//			if (src instanceof Constrained) {
//				Constrained cSrc = (Constrained) src;
//				jObj.add("supports", context.serialize(cSrc.constraints()));
//			}
//
//			return jObj;
//		}
//	}

	public static void main(String[] args) {
//		Gson GSON = new GsonBuilder()
//			.registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
//			.registerTypeAdapter(Edition.class, new Util.EnumSerializer<Edition>())
//			.registerTypeAdapter(Region.class, new Util.EnumSerializer<Region>())
//			.registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
//			.registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
//			.disableHtmlEscaping()
//			.serializeNulls()
//			.setPrettyPrinting()
//			.create();
//
//		ServiceParameters sp = new ServiceParameters();
//
//		String json = GSON.toJson(sp);
//		System.out.println(json);

		System.out.println(Metadata.HAZARD_CURVE_USAGE);
	}
}
