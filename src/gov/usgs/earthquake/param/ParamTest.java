package gov.usgs.earthquake.param;

import static gov.usgs.earthquake.param.ParamKey.PARAM_LIST;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.EnumSet;

import com.google.common.io.Closeables;
import com.google.common.io.Resources;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.stream.JsonReader;

/**
 * Add comments here
 *
 * 
 * @author Peter Powers
 */
class ParamTest {

//	@Override
//	public void paramChanged(ParamEvent<?> event) {
//		System.out.println(event);
//	}
	
	public static void main(String[] args) throws IOException {
		Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().create();

		Param<String> dp = Params.newStringParam("testParam", "info", "lunchmeat");
//		System.out.println(gson.toJson(dp.state()));
		Param<Boolean> bp = Params.newBooleanParam("testBoolParam", "info", true);
//		System.out.println(gson.toJson(bp.state()));
		Param<Double> npD = Params.newDoubleParam("testDoubleParam", "info", "km", 33.0);
//		System.out.println(gson.toJson(npD.state()));
		Param<Double> npDr = Params.newDoubleParamWithBounds(
			"testDoubleRangeParam", "info", "km", 33.0, -23.0, 99.0, 0.0, 50.0);
//		System.out.println(gson.toJson(npDr.state()));
//		System.out.println(npDr.state());
		Param<TestEnum> ep = Params.newEnumParam("Test Choice Enum",
			"enumInfo", TestEnum.ONE, EnumSet.of(TestEnum.ONE, TestEnum.THREE));
//		System.out.println(gson.toJson(ep.state()));
		Param<Integer> npI = Params.newIntegerParam("testIntParam", "info", "count", 22);
//		System.out.println(gson.toJson(npI.state()));
		
		ParamList pList = ParamList.of(dp, bp, npD, npDr, ep, npI);
		
		System.out.println(gson.toJson(pList.state()));
		
		URL url = Resources.getResource(DefaultParamTest.class, "json.txt");
		InputStreamReader reader = new InputStreamReader(url.openStream());
		JsonReader jsonReader = new JsonReader(reader);
		JsonParser parser = new JsonParser();
		JsonObject root = parser.parse(jsonReader).getAsJsonObject();
		JsonArray paramArray = root.get(PARAM_LIST.toString()).getAsJsonArray();
		
		Closeables.close(jsonReader, true);

		
		pList.setState(paramArray);
		System.out.println(gson.toJson(pList.state()));
		System.out.println(pList.state());
		
//		ParamTest listener = new ParamTest();
//		npI.addListener(listener);
//		npI.setValue(41);
		
//		System.out.println(gson.toJson(npI.getState()));
//		npI.reset();
//		System.out.println(gson.toJson(npI.getState()));
		
	}
	
	enum TestEnum {
		ONE,TWO,THREE;
	}

	
//	/*
//	 * The one method that requires ugly generic type argument casting. This
//	 * ugliness saves us from having to declare setState in Param interface
//	 * and include/override it in all Default* implementations.
//	 */
//	private static void setParamValue(JsonObject json, Param<?> p) {
//		JsonElement jsonVal = json.get(VALUE);
//		ParamType type = valueOf(json.get(TYPE).getAsString());
//		
//		// most common types at top
//		switch (valueOf(json.get(TYPE).getAsString())) {
//			case BOOLEAN:
//				setBooleanParam(p, jsonVal);
//				break;
//			case DOUBLE:
//				setDoubleParam(p, jsonVal);
//				break;
//			case DOUBLE_BOUNDED:
//				setDoubleParam(p, jsonVal);
//				break;
//			case DOUBLE_DISCRETE:
//				setDoubleParam(p, jsonVal);
//				break;
//			case ENUM:
//				break;
//			case INTEGER:
//				setIntegerParam(p, jsonVal);
//				break;
//			case INTEGER_BOUNDED:
//				setIntegerParam(p, jsonVal);
//				break;
//			case INTEGER_DISCRETE:
//				setIntegerParam(p, jsonVal);
//				break;
//			case STRING:
//				setStringParam(p, jsonVal);
//				break;
//			default:
//				throw new IllegalArgumentException("Invalid type in json");
//		}
//	}
//	
//	@SuppressWarnings("unchecked")
//	private static void setBooleanParam(Param<?> p, JsonElement json) {
//		((Param<Boolean>) p).set(json.getAsBoolean());
//	}
//
//	@SuppressWarnings("unchecked")
//	private static void setStringParam(Param<?> p, JsonElement json) {
//		((Param<String>) p).set(json.getAsString());
//	}
//
//	@SuppressWarnings("unchecked")
//	private static void setDoubleParam(Param<?> p, JsonElement json) {
//		((Param<Double>) p).set(json.getAsDouble());
//	}
//
//	@SuppressWarnings("unchecked")
//	private static void setIntegerParam(Param<?> p, JsonElement json) {
//		((Param<Integer>) p).set(json.getAsInt());
//	}
//	
////	@SuppressWarnings("unchecked")
//	private static void setEnumParam(Param<?> p, JsonElement json) {
//		Param<? extends Enum<?>> pCast = (Param<? extends Enum<?>>) p;
//		pCast.set(Enum.valueOf(pCast.get().getDeclaringClass(), json.getAsString()));
//		
//	}

}
