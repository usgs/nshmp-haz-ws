package gov.usgs.earthquake.nshmp.www;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import gov.usgs.earthquake.nshmp.calc.Vs30;
import gov.usgs.earthquake.nshmp.gmm.Imt;
import gov.usgs.earthquake.nshmp.www.meta.DoubleParameter;
import gov.usgs.earthquake.nshmp.www.meta.Edition;
import gov.usgs.earthquake.nshmp.www.meta.EnumParameter;
import gov.usgs.earthquake.nshmp.www.meta.ParamType;
import gov.usgs.earthquake.nshmp.www.meta.Region;
import gov.usgs.earthquake.nshmp.www.meta.Status;
import gov.usgs.earthquake.nshmp.www.meta.Util;

import static gov.usgs.earthquake.nshmp.www.meta.Metadata.serverData;

/**
 * Web services for sources. Current source services:
 * 		<ul>
 * 			<li> nshmp-haz-ws/source/model </li>
 * 		</ul>
 * 
 *  <p> 
 *  Model service: The source model service obtains its model information 
 * 		from {@link Model}.
 * 	</p>
 * 
 * @author Brandon Clayton
 */
@WebServlet(
		name = "Source Model Services",
		description = "Utilities for working with source models",
		urlPatterns = {
				"/source",
				"/source/*"})
public class SourceServices extends HttpServlet {
	private static final long serialVersionUID = 1L;
	static final Gson GSON;
	static Set<Imt> HAZARD_IMTS; 
	
	static {
		GSON = new GsonBuilder()
				.registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
				.registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
				.registerTypeAdapter(SourceModel.class, new SourceModelSerializer())
				.registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
				.disableHtmlEscaping()
				.serializeNulls()
				.setPrettyPrinting()
				.create();
		
		HAZARD_IMTS = SourceModel
				.getModelContraints(Region.WUS, Edition.E2014).imtListToSet();
	}
	
	/**
	 * Handle the GET request and return a JSON response for {@code SourceServices}.
	 */
	@Override
	protected void doGet(
			HttpServletRequest request,
			HttpServletResponse response)
			throws ServletException, IOException {
		
		PrintWriter writer = response.getWriter();
		String query = request.getQueryString();
		String pathInfo = request.getPathInfo();
		String host = request.getServerName();
		
		ResponseData svcResponse = null;
		try {
			svcResponse = sourceModelResult();
			String jsonString = GSON.toJson(svcResponse);
			writer.print(jsonString);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Container structure for each {@code Model} with properties:
	 * 		<ul>
	 * 			<li> display: String </li>
	 * 			<li> displayorder: int </li>
	 * 			<li> id: int </li>
	 * 			<li> path: String </li>
	 * 			<li> region: Region </li>
	 * 			<li> value: String </li>
	 * 			<li> year: String </li>
	 * 		</ul>
	 * 
	 */
	private static class SourceModel {
		int displayorder;
		int id;
		String edition;
		Region region;
		String display;
		String path;
		String value;
		String year;
		ModelConstraints supports;
		
		SourceModel(Model model) {
			this.display = model.name;
			this.displayorder = model.ordinal();
			this.edition = Edition.valueOf("E" + model.year).name();
			this.id = model.ordinal();
			this.region = model.region;
			this.path = model.path;
			this.supports = getModelContraints(model.region, Edition.valueOf("E" + model.year));
			this.value = model.toString();
			this.year = model.year;	
		}
		
		/**
		 * Return common {@code ModelConstraints} associated with {@code Region}
		 * 		and {@code Edition}.
		 */
		static ModelConstraints getModelContraints(Region region, Edition edition) {
			JsonElement regionContraintsEl = GSON.toJsonTree(region.constraints());
			ModelConstraints regionConstraints = GSON.fromJson(
					regionContraintsEl, 
					ModelConstraints.class);
			
			JsonElement editionConstraintsEl = GSON.toJsonTree(edition.constraints());
			ModelConstraints editionConstraints = GSON.fromJson(
					editionConstraintsEl, 
					ModelConstraints.class);
			
			/* Get common IMTs */
			editionConstraints.imt.retainAll(regionConstraints.imt);
			/* Get common vs30s */
			editionConstraints.vs30.retainAll(regionConstraints.vs30);
			
			return editionConstraints;
		}
		
		/**
		 * Container for constraints associated with {@code Region}.
		 */
		static class ModelConstraints {
			List<String> imt;
			List<String> vs30;
			
			/** Convert {@code List<String>} of {@code Imt}s to {@code Set<Imt>} */
			Set<Imt> imtListToSet() {
				Set<Imt> imt = new HashSet<>();
				
				for (String imtStr : this.imt) {
					imt.add(Imt.valueOf(imtStr));
				}
			
				return imt;
			}
			
			/** Convert {@code List<String>} of {@code Vs30}s to {@code Set<Vs30>} */
			Set<Vs30> vs30ListToSet() {
				Set<Vs30> vs30 = new HashSet<>();
				
				for (String vs30Str : this.vs30) {
					vs30.add(Vs30.fromValue(Double.parseDouble(vs30Str)));	
				}
				
				return vs30;
			}
		}
	}
	
	/**
	 * Container structure for {@code SourceModel}s to match {@link EnumParameter}
	 */
	private static class SourceModelParameter {
		private final String label;
		private final ParamType type;
		private final Set<SourceModel> values;
		
		SourceModelParameter(String label, ParamType type, Set<SourceModel> values) {
			this.label = label;
			this.type = type;
			this.values = values;
		}
	}
	
	/**
	 * Container structure for the {@ResponseData} parameters which include:
	 * 		<ul> 
	 * 			<li> source models </li>
	 * 			<li> IMTs </li>
	 * 			<li> Return period </li>
	 * 			<li> Vs30s </li>
	 * 		</ul>
	 */
	private static class Parameters {
		SourceModelParameter models;
		EnumParameter<Imt> imt;
		DoubleParameter returnPeriod;
		EnumParameter<Vs30> vs30;
		
		Parameters(Set<SourceModel> models) {
			this.models = new SourceModelParameter(
					"Source models",
					ParamType.STRING,
					models);
			
			this.imt = new EnumParameter<>(
					"Intensity measure type",
					ParamType.STRING,
					HAZARD_IMTS);
			
			this.returnPeriod = new DoubleParameter(
					"Return period (in years)",
					ParamType.NUMBER,
					1.0,
					1000000.0);
			
			this.vs30 = new EnumParameter<>(
					"Site soil (Vs30)",
					ParamType.STRING,
					EnumSet.allOf(Vs30.class));
		}
	}
	
	/**
	 * Container structure for JSON response. Example: 
	 * <pre>
	 * 	{
	 * 		name: "Source models",
	 * 		status: "usage",
	 * 		server: {},
	 * 		parameters: {
	 * 			models: [
	 * 				{
	 * 					id: 4,
	 * 					value: "WUS_2014",
	 * 					display: "2014 NSHM Western US Hazard Model",
	 * 					displayorder: 4,
	 * 					year: "2014",
	 * 					region : {},
	 * 					imt: [],
	 * 					vs30: []
	 * 				}
	 * 			],
	 * 			imt: {},
	 * 			vs30: {}
	 * 	}
	 * </pre>
	 */
  private static class ResponseData {
		String name;
		String status; 
		Object server;
		Parameters parameters;
		
		ResponseData(Parameters parameters) {
			this.status = Status.USAGE.toString();
			this.name = "Source Models";
			this.parameters = parameters;
			this.server = serverData(ServletUtil.THREAD_COUNT, ServletUtil.timer());
		}
	}
	
	/**
	 * Returns new {@code ResponseData} instance with all models available
	 * 		in {@link Model}.
	 * 
	 * <p> 
	 *		Each {@code Model} is wrapped in the {@link SourceModel} container.
	 *	 </p>
	 */
	private static ResponseData sourceModelResult () {
		Set<SourceModel> models = new HashSet<>();
		
		for (Model model : Model.values()) {
			models.add(new SourceModel(model));	
		}
		
		Parameters parameters = new Parameters(models);
		
		return new ResponseData(parameters);
	}
	
  /**
	 * Enum source attributes for serialization
	 */
	enum Attributes {
		/* Source model service */
		MODEL,
		
		/* Serializing */
		ID,
		VALUE,
		DISPLAY,
		DISPLAYORDER,
		EDITION,
		YEAR,
		PATH,
		REGION,
		IMT,
		VS30,
		SUPPORTS,
		MINLATITUDE,
		MINLONGITUDE,
		MAXLATITUDE,
		MAXLONGITUDE,
		UIMINLATITUDE,
		UIMINLONGITUDE,
		UIMAXLATITUDE,
		UIMAXLONGITUDE;
		
		 /** Return upper case string */
	  String toUpperCase () {
	    return name().toUpperCase();
	  }
	  
	  /** Return lower case string */
	  String toLowerCase() {
	  		return name().toLowerCase();
	  }
	}
	
	/**
	 * {@code Gson} {@code SourceModel} serializer for response.  Example:
	 * <pre>	
	 * 	id: 4,
	 * 	value: "WUS_2014",
	 * 	display: "2014 NSHM Western US Hazard Model",
	 * 	displayorder: 4,
	 * 	year: "2014",
	 * 	region : {},
	 * 	imt: [],
	 * 	vs30: []		
	 * </pre>
	 */
	private static final class SourceModelSerializer 
			implements JsonSerializer<SourceModel> {
		
		@Override
		public JsonElement serialize (
				SourceModel srcModel,
				Type typeOfSrc,
				JsonSerializationContext context) {
			
			JsonObject json = new JsonObject();
		
			json.addProperty(Attributes.ID.toLowerCase(), srcModel.id);
			json.addProperty(Attributes.VALUE.toLowerCase(), srcModel.value);
			json.addProperty(Attributes.DISPLAY.toLowerCase(), srcModel.display);
			json.addProperty(Attributes.DISPLAYORDER.toLowerCase(), srcModel.displayorder);
			json.addProperty(Attributes.YEAR.toLowerCase(), srcModel.year);
			json.addProperty(Attributes.EDITION.toLowerCase(), srcModel.edition);
			json.addProperty(Attributes.PATH.toLowerCase(), srcModel.path);
			json.add(Attributes.REGION.toLowerCase(), regionToJson(srcModel.region));
			json.add(Attributes.SUPPORTS.toLowerCase(), context.serialize(srcModel.supports));
		
			return json;
		}
	}
	
	/**
	 * Return {@code JsonElement} to serialize {@code Region}.
	 * 
	 * <p> 
	 * 	This is a simple {@code Region} serializer from {@link Util.EnumSerializer}.
	 * </p>
	 */
	private static JsonElement regionToJson (Region region) {
		JsonObject json = new JsonObject();
			
		json.addProperty(Attributes.VALUE.toLowerCase(), region.name());
		json.addProperty(Attributes.DISPLAY.toLowerCase(), region.toString());
		
		json.addProperty(Attributes.MINLATITUDE.toLowerCase(), region.minlatitude);
		json.addProperty(Attributes.MAXLATITUDE.toLowerCase(), region.maxlatitude);
    json.addProperty(Attributes.MINLONGITUDE.toLowerCase(), region.minlongitude);
    json.addProperty(Attributes.MAXLONGITUDE.toLowerCase(), region.maxlongitude);

   	json.addProperty(Attributes.UIMINLATITUDE.toLowerCase(), region.uiminlatitude);
   	json.addProperty(Attributes.UIMAXLATITUDE.toLowerCase(), region.uimaxlatitude);
    json.addProperty(Attributes.UIMINLONGITUDE.toLowerCase(), region.uiminlongitude);
    json.addProperty(Attributes.UIMAXLONGITUDE.toLowerCase(), region.uimaxlongitude);
    
    return json;
	}
	
}
