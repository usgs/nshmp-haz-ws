package gov.usgs.earthquake.nshmp.www;

import static gov.usgs.earthquake.nshmp.www.meta.Metadata.serverData;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
import gov.usgs.earthquake.nshmp.www.meta.EnumParameter;
import gov.usgs.earthquake.nshmp.www.meta.ParamType;
import gov.usgs.earthquake.nshmp.www.meta.Region;
import gov.usgs.earthquake.nshmp.www.meta.Status;
import gov.usgs.earthquake.nshmp.www.meta.Util;

/**
 * Entry point for services related to source models. Current services:
 * <ul><li>nshmp-haz-ws/source/</li></ul>
 * 
 * @author Brandon Clayton
 * @author Peter Powers
 */
@WebServlet(
    name = "Source Services",
    description = "Utilities for querying earthquake source models",
    urlPatterns = {
        "/source",
        "/source/*" })
@SuppressWarnings("unused")
public class SourceServices extends NshmpServlet {
  private static final long serialVersionUID = 1L;
  static final Gson GSON;

  static {
    GSON = new GsonBuilder()
        .registerTypeAdapter(Imt.class, new Util.EnumSerializer<Imt>())
        .registerTypeAdapter(ParamType.class, new Util.ParamTypeSerializer())
        .registerTypeAdapter(SourceModel.class, new SourceModelSerializer())
        .registerTypeAdapter(Vs30.class, new Util.EnumSerializer<Vs30>())
        .registerTypeAdapter(Region.class, new RegionSerializer())
        .disableHtmlEscaping()
        .serializeNulls()
        .setPrettyPrinting()
        .create();
  }

  @Override
  protected void doGet(
      HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {


    ResponseData svcResponse = null;
    try {
      svcResponse = new ResponseData();
      String jsonString = GSON.toJson(svcResponse);
      response.getWriter().print(jsonString);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static class ResponseData {
    String name;
    String status;
    Object server;
    Parameters parameters;

    ResponseData() {
      this.status = Status.USAGE.toString();
      this.name = "Source Models";
      this.server = serverData(ServletUtil.THREAD_COUNT, ServletUtil.timer());
      this.parameters = new Parameters();
    }
  }

  private static class Parameters {
    SourceModelsParameter models;
    EnumParameter<Region> region;
    DoubleParameter returnPeriod;
    EnumParameter<Imt> imt;
    EnumParameter<Vs30> vs30;

    Parameters() {
      models = new SourceModelsParameter(
          "Source models",
          ParamType.STRING,
          Stream.of(Model.values())
              .map(SourceModel::new)
              .collect(Collectors.toList()));

      region = new EnumParameter<>(
          "Region",
          ParamType.STRING,
          EnumSet.allOf(Region.class));
      
      returnPeriod = new DoubleParameter(
          "Return period (in years)",
          ParamType.NUMBER,
          100.0,
          1e6);

      imt = new EnumParameter<>(
          "Intensity measure type",
          ParamType.STRING,
          modelUnionImts());

      vs30 = new EnumParameter<>(
          "Site soil (Vs30)",
          ParamType.STRING,
          modelUnionVs30s());
    }
  }

  private static class SourceModelsParameter {
    private final String label;
    private final ParamType type;
    private final List<SourceModel> values;

    SourceModelsParameter(String label, ParamType type, List<SourceModel> values) {
      this.label = label;
      this.type = type;
      this.values = values;
    }
  }

  /* Union of IMTs across all models. */
  static Set<Imt> modelUnionImts() {
    return EnumSet.copyOf(Stream.of(Model.values())
        .flatMap(model -> model.imts.stream())
        .collect(Collectors.toSet()));
  }

  /* Union of Vs30s across all models. */
  static Set<Vs30> modelUnionVs30s() {
    return EnumSet.copyOf(Stream.of(Model.values())
        .flatMap(model -> model.vs30s.stream())
        .collect(Collectors.toSet()));
  }

  private static class SourceModel {
    int displayorder;
    int id;
    String region;
    String display;
    String path;
    String value;
    String year;
    ModelConstraints supports;

    SourceModel(Model model) {
      this.display = model.name;
      this.displayorder = model.ordinal();
      this.id = model.ordinal();
      this.region = model.region.name();
      this.path = model.path;
      this.supports = new ModelConstraints(model);
      this.value = model.toString();
      this.year = model.year;
    }
  }

  private static class ModelConstraints {

    final List<String> imt;
    final List<String> vs30;

    ModelConstraints(Model model) {
      this.imt = Util.enumsToNameList(model.imts);
      this.vs30 = Util.enumsToStringList(
          model.vs30s,
          vs30 -> vs30.name().substring(3));
    }
  }

  enum Attributes {
    /* Source model service */
    MODEL,

    /* Serializing */
    ID,
    VALUE,
    DISPLAY,
    DISPLAYORDER,
    YEAR,
    PATH,
    REGION,
    IMT,
    VS30,
    SUPPORTS,
    MINLATITUDE,
    MINLONGITUDE,
    MAXLATITUDE,
    MAXLONGITUDE;

    /** Return upper case string */
    String toUpperCase() {
      return name().toUpperCase();
    }

    /** Return lower case string */
    String toLowerCase() {
      return name().toLowerCase();
    }
  }

  private static final class SourceModelSerializer
      implements
      JsonSerializer<SourceModel> {

    @Override
    public JsonElement serialize(
        SourceModel srcModel,
        Type typeOfSrc,
        JsonSerializationContext context) {

      JsonObject json = new JsonObject();

      json.addProperty(Attributes.ID.toLowerCase(), srcModel.id);
      json.addProperty(Attributes.VALUE.toLowerCase(), srcModel.value);
      json.addProperty(Attributes.DISPLAY.toLowerCase(), srcModel.display);
      json.addProperty(Attributes.DISPLAYORDER.toLowerCase(), srcModel.displayorder);
      json.addProperty(Attributes.YEAR.toLowerCase(), srcModel.year);
      json.addProperty(Attributes.PATH.toLowerCase(), srcModel.path);
      json.addProperty(Attributes.REGION.toLowerCase(), srcModel.region);
      json.add(Attributes.SUPPORTS.toLowerCase(), context.serialize(srcModel.supports));

      return json;
    }
  }
  
  // TODO align with enum serializer if possible; consider service attribute
  // enum
  // TODO test removal of ui-min/max-lon/lat
  private static final class RegionSerializer implements JsonSerializer<Region> {

    @Override
    public JsonElement serialize(Region region, Type typeOfSrc, JsonSerializationContext context) {
      JsonObject json = new JsonObject();

      json.addProperty(Attributes.VALUE.toLowerCase(), region.name());
      json.addProperty(Attributes.DISPLAY.toLowerCase(), region.toString());

      json.addProperty(Attributes.MINLATITUDE.toLowerCase(), region.minlatitude);
      json.addProperty(Attributes.MAXLATITUDE.toLowerCase(), region.maxlatitude);
      json.addProperty(Attributes.MINLONGITUDE.toLowerCase(), region.minlongitude);
      json.addProperty(Attributes.MAXLONGITUDE.toLowerCase(), region.maxlongitude);

      return json;
    }
  }

}
