'use strict';

import D3LinePlot from './lib/D3LinePlot.js';
import Hazard from './lib/Hazard.js';

/**
* @class ModelCompare
*
* @classdec Class for model-compare.html
*
*/
export default class ModelExplorer extends Hazard{

  //.......................... Constructor: ModelCompare .......................
  constructor(config){

    //......................... Variables ......................................
    let _this = super(config); 
    
    _this.header.setTitle("Model Explorer");
    //--------------------------------------------------------------------------
  
    _this.options = {
        type: "explorer",
        editionDefault: "E2014",
        regionDefault: "COUS",
        imtDefault: "PGA",
        vs30Default: 760,
    };

    //..................... Plot Setup .........................................
    _this.plotEl = document.querySelector("#content");
    let plotOptions = {};
    let tooltipText = ["IMT:", "GM (g):", "AFE:"];
    let hazardCurveOptions = {
      legendLocation: "bottomleft",
      tooltipText: tooltipText,
      tooltipYToExponent: true
    };
    _this.hazardPlot = new D3LinePlot(_this.plotEl,
        plotOptions,
        hazardCurveOptions,
        {}) 
        .withPlotHeader()
        .withPlotFooter();
    
    plotOptions = {
        colSizeDefault: "min"
    };
    
    tooltipText = ["Component:", "GM (g):", "AFE:"];
    let componentCurveOptions = {
      legendLocation: "bottomleft",
      tooltipText: tooltipText
    };
    _this.componentPlot = new D3LinePlot(_this.plotEl,
        plotOptions,
        componentCurveOptions,
        {})
        .withPlotHeader()
        .withPlotFooter();
    //--------------------------------------------------------------------------


    
    //....................... Get Hazard Parameters ............................
    Hazard.getHazardParameters(_this,setParameters); 
    function setParameters(par){
      _this.parameters = par;
      ModelExplorer.buildInputs(_this); 
    };
    //--------------------------------------------------------------------------
   
   
   
    $(_this.footer.updateBtnEl).click(function(){
      ModelExplorer.callHazard(_this,ModelExplorer.callHazardCallback);
    });
  }
  //---------------------- End Constructor: ModelComapre -----------------------


  
  
  //......................... Method: buildInputs ..............................
  static buildInputs(_this){
    _this.spinner.off();
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
    
    $(_this.controlEl).removeClass('hidden');

    let urlInfo = ModelExplorer.checkQuery(_this);
    if (urlInfo) ModelExplorer.callHazard(_this,ModelExplorer.callHazardCallback);
  }
  //------------------- End Method: buildInputs --------------------------------

  /**
  * @method getMetadata
  */
  getMetadata() {
    let metadata = {
      'Edition': $(this.editionEl).find(':selected').text(),
      'Region': $(this.regionEl).find(':selected').text(),
      'Latitude (°)': this.latEl.value,
      'Longitude (°)': this.lonEl.value,
      'Intensity Measure Type': $(this.imtEl).find(':selected').text(),
      'V<sub>S</sub>30': $(this.vs30El).find(':selected').text(),
    };

    return metadata;
  }

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
    let metadata = _this.getMetadata();
    metadata.url = window.location.href;
    metadata.date = new Date();
    
    // Reset listeners
    $(_this.imtEl).off();
    $(_this.hazardPlot.legendEl).off();
    $(_this.hazardPlot.allDataEl).off();
    
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
    var returnMetadata = jsonResponse[0][0].metadata;
    var xLabel   = returnMetadata.xlabel;
    var yLabel   = returnMetadata.ylabel;
    //--------------------------------------------------------------------------
    
    //.................... Plot Info Object for D3 .............................
    _this.hazardPlot.setPlotTitle(title)
        .setMetadata(metadata)
        .setUpperData(seriesData)
        .setUpperDataTableTitle('')
        .setUpperPlotFilename(filename)
        .setUpperPlotIds(seriesLabelIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperXLabel(xLabel)
        .setUpperYLabel(yLabel)
        .removeSmallValues(_this.hazardPlot.upperPanel, 1e-14)
        .plotData(_this.hazardPlot.upperPanel);
    //--------------------------------------------------------------------------
   
 

  
    // Override onclick in D3LinePlot 
    d3.select(_this.hazardPlot.upperPanel.allDataEl)
        .selectAll(".data")
        .on("click",function(){
          let selectedImt = this.id
          _this.imtEl.value = selectedImt;
          if (dataType == "dynamic"){
            ModelExplorer.plotComponentCurves(_this, jsonResponse);
          }
        
        });
   
    
    // Override onclick in D3LinePlot 
    d3.select(_this.hazardPlot.upperPanel.legendEl)
        .selectAll(".legend-entry")
        .on("click",function(){
          let selectedImt = this.id
          _this.imtEl.value = selectedImt;
          if (dataType == "dynamic"){
            ModelExplorer.plotComponentCurves(_this,jsonResponse);
          }
        });
    
    _this.hazardPlot.plotSelection(
        _this.hazardPlot.upperPanel, _this.imtEl.value);
    
    $(_this.imtEl).change(function(){
      _this.hazardPlot.plotSelection(
          _this.hazardPlot.upperPanel, _this.imtEl.value);
      if (dataType == "dynamic")
        ModelExplorer.plotComponentCurves(_this,jsonResponse);
    });

    if (dataType == "dynamic"){ 
      ModelExplorer.plotComponentCurves(_this,jsonResponse);
      _this.componentPlot.panelResize("min");
      _this.hazardPlot.panelResize("min");    
    }else if (dataType == "static" && _this.componentPlot != undefined){
      _this.componentPlot.hide(true);
      _this.hazardPlot.panelResize("max");
    }
    
  }


  static plotComponentCurves(_this,hazardReturn){
    let metadata = _this.getMetadata();
    metadata.url = window.location.href;
    metadata.time = new Date();
    
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
      seriesData.push(d3.zip(xValues, d.yvalues));
      seriesLabels.push(d.component);
      seriesLabelIds.push(d.component.toLowerCase());
    });
  
  
  
    //.................. Get Axis Information ..................................
    var returnMetadata = hazardReturn[0][0].metadata;
    var xLabel   = returnMetadata.xlabel;
    var yLabel   = returnMetadata.ylabel;
    //--------------------------------------------------------------------------
    
    //.................... Plot Info Object for D3 .............................
    _this.componentPlot.setPlotTitle(title)
        .setMetadata(metadata)
        .setUpperData(seriesData)
        .setUpperDataTableTitle('')
        .setUpperPlotFilename(filename)
        .setUpperPlotIds(seriesLabelIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperXLabel(xLabel)
        .setUpperYLabel(yLabel)
        .removeSmallValues(_this.componentPlot.upperPanel, 1e-14)
        .plotData(_this.componentPlot.upperPanel);
    //--------------------------------------------------------------------------
  
  
  
  }





}
//-------------------- End Class: ModelCompare ---------------------------------
