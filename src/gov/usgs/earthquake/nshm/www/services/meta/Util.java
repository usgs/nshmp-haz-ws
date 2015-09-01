package gov.usgs.earthquake.nshm.www.services.meta;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Set;

import org.opensha2.gmm.Imt;

import com.google.common.base.Function;
import com.google.common.collect.FluentIterable;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

@SuppressWarnings("javadoc")
public final class Util {

	static <E extends Enum<E>> List<String> enumToString(Set<E> values,
			Function<E, String> function) {
		return FluentIterable.from(values).transform(function).toList();
	}

	static final Function<Region, String> REGION_TO_STR = new Function<Region, String>() {
		@Override public String apply(Region region) {
			return region.name();
		}
	};

	static final Function<Imt, String> IMT_TO_STR = new Function<Imt, String>() {
		@Override public String apply(Imt imt) {
			return imt.name();
		}
	};

	static final Function<Vs30, String> VS_TO_STR = new Function<Vs30, String>() {
		@Override public String apply(Vs30 vs30) {
			return vs30.name().substring(3);
		}
	};

	public static final class EnumSerializer<E extends Enum<E>> implements JsonSerializer<E> {

		@Override public JsonElement serialize(E src, Type type,
				JsonSerializationContext context) {

			String value = (src instanceof Vs30) ? src.name().substring(3) : src.name();

			JsonObject jObj = new JsonObject();
			jObj.addProperty("id", src.ordinal());
			jObj.addProperty("value", value);
			jObj.addProperty("display", src.toString());
			jObj.addProperty("displayOrder", src.ordinal());

			if (src instanceof Region) {
				Region region = (Region) src;
				jObj.addProperty("minlatitude", region.minlatitude);
				jObj.addProperty("maxlatitude", region.maxlatitude);
				jObj.addProperty("minlongitude", region.minlongitude);
				jObj.addProperty("maxlongitude", region.maxlongitude);

				jObj.addProperty("minuilatitude", region.minuilatitude);
				jObj.addProperty("maxuilatitude", region.maxuilatitude);
				jObj.addProperty("minuilongitude", region.minuilongitude);
				jObj.addProperty("maxuilongitude", region.maxuilongitude);
			}

			if (src instanceof Constrained) {
				Constrained cSrc = (Constrained) src;
				jObj.add("supports", context.serialize(cSrc.constraints()));
			}


			return jObj;
		}
	}

	/* Constrain all doubles to 8 decimal places */
	public static final class DoubleSerializer implements JsonSerializer<Double> {
		@Override public JsonElement serialize(Double d, Type type,
				JsonSerializationContext context) {
			double dOut = Double.valueOf(String.format("%.8g", d));
			return new JsonPrimitive(dOut);
		}
	}

	/* Serialize param type enum as lowercase */
	public static class ParamTypeSerializer implements JsonSerializer<ParamType> {
		@Override public JsonElement serialize(ParamType paramType, Type type,
				JsonSerializationContext context) {
			return new JsonPrimitive(paramType.name().toLowerCase());
		}
	}

}
