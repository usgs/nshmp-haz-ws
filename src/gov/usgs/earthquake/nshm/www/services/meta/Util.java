package gov.usgs.earthquake.nshm.www.services.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;

import java.lang.reflect.Type;
import java.util.EnumSet;
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

	static final Set<Imt> IMTS = EnumSet.of(PGA, SA0P2, SA1P0);

	static final Set<Vs30> CEUS_VS = EnumSet.of(Vs30.VS_2000, Vs30.VS_760);

	static final Set<Vs30> COUS_VS = EnumSet.of(Vs30.VS_760);

	static final Set<Vs30> WUS_VS = EnumSet.of(Vs30.VS_1150, Vs30.VS_760, Vs30.VS_537, Vs30.VS_360,
		Vs30.VS_259, Vs30.VS_180);

	static <E extends Enum<E>> List<String> enumToString(Set<E> values,
			Function<E, String> function) {
		return FluentIterable.from(values).transform(function).toList();
	}

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
	
	// TODO clean?
	static class ParamTypeSerializer implements JsonSerializer<ParamType> {
		@Override public JsonElement serialize(ParamType paramType, Type type,
				JsonSerializationContext context) {
			return new JsonPrimitive(paramType.name().toLowerCase());
		}
	}
	
	

}
