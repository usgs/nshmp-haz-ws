




/**
* @class ModelCompare
*
* @classdec Class for model-compare.html
*
*/
class ModelExplorer extends Hazard{

  //.......................... Constructor: ModelCompare .......................
  constructor(){

    //......................... Variables ......................................
    let _this = super(); 
    
    _this.header.setTitle("Model Explorer");
    _this.spinner.on();
    //--------------------------------------------------------------------------
  
    _this.options = {
        type: "explorer",
        editionDefault: "E2014",
        regionDefault: "COUS",
        imtDefault: "PGA",
        vs30Default: 760,
        staticUrl: "hazws/staticcurve/1/",
        dynamicUrl: "nshmp-haz-ws/hazard"
    };

    //..................... Plot Setup .........................................
    _this.plotEl = document.querySelector("#content");
    let tooltipText = ["IMT", "GM (g)", "AFE"];
    let plotOptions = {
      legendLocation: "bottomleft",
      tooltipText: tooltipText
    };
    _this.hazardPlot = new D3LinePlot(_this.plotEl,plotOptions); 
    
    
    tooltipText = ["Component", "GM (g)", "AFE"];
    plotOptions = {
      colSizeDefault: "min",
      legendLocation: "bottomleft",
      tooltipText: tooltipText
    };
    _this.componentPlot = new D3LinePlot(_this.plotEl,plotOptions);
    //--------------------------------------------------------------------------


    
    //....................... Get Hazard Parameters ............................
    Hazard.getHazardParameters(_this,setParameters); 
    function setParameters(par){
      _this.spinner.off();
      _this.parameters = par;
      ModelExplorer.buildInputs(_this); 
    };
    //--------------------------------------------------------------------------
   
   
   
    $(_this.footer.updateBtnEl).click(function(){
      ModelExplorer.callHazard(_this,ModelExplorer.callHazardCallback);
    });
    
    //............. Call Hazard Code on Enter ..................................
    $(_this.controlEl).keypress(function(key){
      var keyCode = key.which || key.keyCode;
      if (keyCode == 13){
        ModelExplorer.callHazard(_this,ModelExplorer.callHazardCallback);
      }
    });
    //--------------------------------------------------------------------------
    
  }
  //---------------------- End Constructor: ModelComapre -----------------------


  
  
  //......................... Method: buildInputs ..............................
  static buildInputs(_this){

    ModelExplorer.checkQuery(_this);

    let editionValues = _this.parameters.edition.values;
    ModelExplorer.setParameterMenu(_this,"edition",editionValues);

    let supportedRegions = ModelExplorer.supportedRegions(_this);
    ModelExplorer.setParameterMenu(_this,"region",supportedRegions);
    ModelExplorer.setBounds(_this);

    let supportedImt = ModelExplorer.supportedValues(_this,"imt") 
    let supportedVs30 = ModelExplorer.supportedValues(_this,"vs30") 
    ModelExplorer.setParameterMenu(_this,"imt",supportedImt);
    ModelExplorer.setParameterMenu(_this,"vs30",supportedVs30);

    $(_this.editionEl).change(function(){
      ModelExplorer.clearCoordinates(_this);
      supportedRegions = ModelExplorer.supportedRegions(_this);
      ModelExplorer.setParameterMenu(_this,"region",supportedRegions);
      ModelExplorer.setBounds(_this);
      supportedImt = ModelExplorer.supportedValues(_this,"imt") 
      supportedVs30 = ModelExplorer.supportedValues(_this,"vs30") 
      ModelExplorer.setParameterMenu(_this,"imt",supportedImt);
      ModelExplorer.setParameterMenu(_this,"vs30",supportedVs30);
    });
          
    $(_this.regionEl).change(function(){
      ModelExplorer.clearCoordinates(_this);
      ModelExplorer.setBounds(_this);
      supportedImt = ModelExplorer.supportedValues(_this,"imt") 
      supportedVs30 = ModelExplorer.supportedValues(_this,"vs30") 
      ModelExplorer.setParameterMenu(_this,"imt",supportedImt);
      ModelExplorer.setParameterMenu(_this,"vs30",supportedVs30);
     });

    let urlInfo = ModelExplorer.checkQuery(_this);
    if (urlInfo) ModelExplorer.callHazard(_this,ModelExplorer.callHazardCallback);
  }
  //------------------- End Method: buildInputs --------------------------------


  static supportedRegions(_this){
    let selectedEdition = _this.parameters.edition
        .values.find(function(edition,i){
          return edition.value == _this.editionEl.value;
    });
    
    let supportedRegions = _this.parameters.region.values.filter(function(region,ir){
      return selectedEdition.supports.region.find(function(regionVal,irv){
        return regionVal == region.value;
      })
    });

    return supportedRegions;
  }


  static callHazardCallback(_this,hazardReturn){
    ModelExplorer.plotHazardCurves(_this,hazardReturn);
  }



  static plotHazardCurves(_this,jsonResponse){
    _this.spinner.off();
    
    let title = "Hazard Curves";
    let filename = "hazardCurves";
    var seriesData = [];
    var seriesLabels = [];
    var seriesLabelIds = [];
    
    //............... Get Data from Selected IMT Value and Format for D3 .......
    let dataType = jsonResponse[0].dataType;  
    jsonResponse[0].forEach(function(response,ir){
      if (!response){
        console.log("ERROR: No response found")
        return;
      }
      var data = response.data;
      
      //................ JSON Variables based on Edition Type ..................
      if (dataType == "dynamic"){
        var xValueVariable = "xvalues";
        var yValueVariable = "yvalues";
        var jtotal = data.findIndex(function(d,i){
          return d.component == "Total"
        });
      }else if (dataType == "static"){
        var xValueVariable = "xvals";
        var yValueVariable = "yvals";
        var jtotal          = 0;
      }
      //------------------------------------------------------------------------
      
      //...................... Set Data for D3 .................................
      var xValues = response.metadata[xValueVariable];
      seriesData.push(d3.zip(xValues,data[jtotal][yValueVariable]));
      seriesLabels.push(response.metadata.imt.display);
      seriesLabelIds.push(response.metadata.imt.value);
      //------------------------------------------------------------------------
    });
    //--------------------------------------------------------------------------
    
    //.................. Get Axis Information ..................................
    var metadata = jsonResponse[0][0].metadata;
    var xLabel   = metadata.xlabel;
    var yLabel   = metadata.ylabel;
    metadata = {
        version: "1.1",
        url: window.location.href,
        time: new Date()
    };
    //--------------------------------------------------------------------------
    
    //.................... Plot Info Object for D3 .............................
    _this.hazardPlot.data = seriesData;
    _this.hazardPlot.ids = seriesLabelIds;
    _this.hazardPlot.labels = seriesLabels;
    _this.hazardPlot.metadata = metadata;
    _this.hazardPlot.plotFilename = filename;
    _this.hazardPlot.title = title;
    _this.hazardPlot.xLabel = xLabel;
    _this.hazardPlot.yLabel = yLabel;
    
    _this.hazardPlot.removeSmallValues(1e-14);
    _this.hazardPlot.plotData();
    //--------------------------------------------------------------------------
   
  
    // Override onclick in D3LinePlot 
    d3.select(_this.hazardPlot.allDataEl)
        .selectAll(".data")
        .on("click",function(){
          let selectedImt = this.id
          _this.imtEl.value = selectedImt;
          D3LinePlot.plotSelection(_this.hazardPlot,selectedImt);
          if (dataType == "dynamic"){
            ModelExplorer.plotComponentCurves(_this,jsonResponse);
          }
        
        });
   
    
    // Override onclick in D3LinePlot 
    d3.select(_this.hazardPlot.legendEl)
        .selectAll(".legend-entry")
        .on("click",function(){
          let selectedImt = this.id
          _this.imtEl.value = selectedImt;
          D3LinePlot.plotSelection(_this.hazardPlot,selectedImt);
          if (dataType == "dynamic"){
            ModelExplorer.plotComponentCurves(_this,jsonResponse);
          }
        });
    
    D3LinePlot.plotSelection(_this.hazardPlot,_this.imtEl.value);

    if (dataType == "dynamic"){ 
      $(_this.imtEl).change(function(){
        ModelExplorer.plotComponentCurves(_this,jsonResponse);
        D3LinePlot.plotSelection(_this.hazardPlot,_this.imtEl.value);
      });
      ModelExplorer.plotComponentCurves(_this,jsonResponse);
      _this.hazardPlot.panelResize("min");    
    }else if (dataType == "static" && _this.componentPlot != undefined){
      _this.componentPlot.hide(true);
      _this.hazardPlot.panelResize("max");
    }
    
  }


  static plotComponentCurves(_this,hazardReturn){
    
    _this.componentPlot.panelResize("min");
    let imtSelectedDisplay = _this.imtEl.querySelector(":checked").text; 
    let title = "Component Curves at "+ imtSelectedDisplay
    let filename = "componentCurve-"+_this.imtEl.value;
    var seriesData = [];
    var seriesLabels = [];
    var seriesLabelIds = [];

    let components = hazardReturn[0].find(function(d,i){
      return d.metadata.imt.value == _this.imtEl.value
    });

    let data = components.data.filter(function(d,i){
      return d.component != "Total";
    });
    components.data = data;
    
    let xValues = components.metadata.xvalues;
    data.forEach(function(d,i){
      seriesData.push(d3.zip(xValues,d.yvalues));
      seriesLabels.push(d.component);
      seriesLabelIds.push(d.component.toLowerCase());
    });
  
  
  
    //.................. Get Axis Information ..................................
    var metadata = hazardReturn[0][0].metadata;
    var xLabel   = metadata.xlabel;
    var yLabel   = metadata.ylabel;
    metadata = {
        version: "1.1",
        url: window.location.href,
        time: new Date()
    };
    //--------------------------------------------------------------------------
    
    //.................... Plot Info Object for D3 .............................
    _this.componentPlot.data = seriesData;
    _this.componentPlot.ids = seriesLabelIds;
    _this.componentPlot.labels = seriesLabels;
    _this.componentPlot.metadata = metadata;
    _this.componentPlot.plotFilename = filename;
    _this.componentPlot.title = title;
    _this.componentPlot.xLabel = xLabel;
    _this.componentPlot.yLabel = yLabel;
    
    _this.componentPlot.removeSmallValues(1e-14);
    _this.componentPlot.plotData();
    //--------------------------------------------------------------------------
  
  
  
  }





}
//-------------------- End Class: ModelCompare ---------------------------------
