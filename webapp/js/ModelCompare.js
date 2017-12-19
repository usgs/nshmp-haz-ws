




/**
* @class ModelCompare
*
* @classdec Class for model-compare.html
*
*/
class ModelCompare extends Hazard{

  //.......................... Constructor: ModelCompare .......................
  constructor(){

    //......................... Variables ......................................
    let _this = super(); 
    
   // Create footer
    _this.footer = new Footer();
    _this.footerOptions = {
      rawBtnDisable: true,
      updateBtnDisable: true
    };
    _this.footer.setOptions(_this.footerOptions);
    
    // Create header 
    _this.header = new Header();
    _this.header.setTitle("Model Comparison");
    
    // Create spinner
    _this.spinner = new Spinner();
    _this.spinner.on();
    //--------------------------------------------------------------------------
  
    _this.options = {
        type: "compare",
        regionDefault: "COUS",
        imtDefault: "PGA",
        vs30Default: 760,
        staticUrl: "https://dev01-earthquake.cr.usgs.gov/hazws/staticcurve/1/",
        dynamicUrl: "https://dev01-earthquake.cr.usgs.gov/nshmp-haz-ws/hazard"
    };

    //..................... Plot Setup .........................................
    _this.plotEl = document.querySelector("#content");
    let tooltipText = ["Edition", "GM (g)", "AFE"];
    let plotOptions = {
      colSizeMin: "col-md-offset-3 col-md-6",
      legendLocation: "bottomleft",
      tooltipText: tooltipText
    };
    _this.plot = new D3LinePlot(_this.plotEl,plotOptions); 
    //--------------------------------------------------------------------------


    //........................ Comparable Regions ..............................
    _this.comparableRegions = [
      {
        display: "Alaska",
        value: "AK",
        staticValue: "AK0P10",
        dynamicValue: "AK"
      },{
        display: "Central & Eastern US",
        value:"CEUS",
        staticValue: "CEUS0P10",
        dynamicValue: "CEUS"
      },{
        display: "Conterminous US",
        value: "COUS",
        staticValue: "COUS0P05",
        dynamicValue: "COUS"
      },{
        display: "Western US",
        value: "WUS",
        staticValue: "WUS0P05",
        dynamicValue: "WUS"
      }
    ];
    //--------------------------------------------------------------------------


    $(_this.footer.updateBtnEl).click(function(){
      ModelCompare.getSelections(_this);
    });

    
    //............. Call Hazard Code on Enter ..................................
    _this.controlEl.onkeypress = function(key){
      var keyCode = key.which || key.keyCode;
      if (keyCode == 13){
        ModelCompare.getSelections(_this);
      }
    }
    //--------------------------------------------------------------------------
  
    
    //....................... Get Hazard Parameters ............................
    Hazard.getHazardParameters(setParameters); 
    function setParameters(par){
      _this.spinner.off();
      _this.parameters = par;
      ModelCompare.setRegionMenu(_this); 
    };
    //--------------------------------------------------------------------------
   
   
    d3.select(_this.lonEl)
        .on("change",function(){
          Hazard.checkCoordinates(_this,false,true);
        });
    
    d3.select(_this.latEl)
        .on("change",function(){
          Hazard.checkCoordinates(_this,true,false);
        });

    
  }
  //---------------------- End Constructor: ModelComapre -----------------------


  //........................... Method: setRegions ............................. 
  static setRegionMenu(_this){
    _this.footerOptions = {
      rawBtnDisable: true,
      updateBtnDisable: false
    };
    _this.footer.setOptions(_this.footerOptions);
    ModelCompare.setSelectMenu(_this.regionEl,_this.comparableRegions);
    d3.select(_this.regionEl)
        .on("change",function(){
          ModelCompare.setEditionMenu(_this);
        });
   
    _this.regionEl.value = _this.options.regionDefault;
    
    let url = window.location.hash.substring(1);
    if (url){
      let urlInfo = Hazard.checkQuery(_this);
      ModelCompare.setEditionMenu(_this,true);
      ModelCompare.callHazard(_this,urlInfo);
    }else{
      ModelCompare.setEditionMenu(_this);
    }
  }
  //-------------------- End Method: setRegions --------------------------------



  //......................... Method: setEditionMenu ...........................
  static setEditionMenu(_this,isQuery){
    
    if (!isQuery) ModelCompare.clearCoordinates(_this);
    ModelCompare.setBounds(_this);
    d3.select(_this.editionEl)
        .selectAll("option")
        .remove();

    //...................... Find Selected Region ..............................
    var selectedRegion = _this.comparableRegions.find(function(region,i){
      return region.value == _this.regionEl.value;
    }); 
    //--------------------------------------------------------------------------

    //...................... Add Supported Editions ............................
    var supportedEditions = _this.parameters.edition
        .values.filter(function(editionValue,iev){
          return editionValue.supports.region.find(function(regionValue,irv){
            return regionValue == selectedRegion.staticValue || 
                regionValue == selectedRegion.dynamicValue;
          })
    });

    ModelCompare.setSelectMenu(_this.editionEl,supportedEditions);
    d3.select(_this.editionEl)  
        .on("change",function(){
          ModelCompare.setParameterMenu(_this,"imt");
          ModelCompare.setParameterMenu(_this,"vs30");
        })
        .selectAll("option")
        .attr("selected",true);
    //--------------------------------------------------------------------------

    ModelCompare.setParameterMenu(_this,"imt");
    ModelCompare.setParameterMenu(_this,"vs30");
  }
  //------------------- End Method: setEditionMenu -----------------------------




  //.......................... Plot Hazard Curves ..............................
  /*
  static plotHazardCurves(_this,jsonResponse){
    _this.spinner.off();
    
    var selectedImtDisplay = _this.imtEl.querySelector(":checked").text; 
    var selectedImtValue   = _this.imtEl.value; 
    let title = "Hazard Curves at " + selectedImtDisplay; 
    let filename = "hazardCurves-"+selectedImtValue;

    var seriesData = [];       
    var seriesLabels = [];       
    var seriesLabelIds = [];       

    //............... Get Data from Selected IMT Value and Format for D3 .......
    for (var jr in jsonResponse){        
      var dataType = jsonResponse[jr].dataType;
      var response  = jsonResponse[jr].find(function(d,i){
       return d.metadata.imt.value == selectedImtValue;
      });
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
      seriesData[jr] = d3.zip(xValues,data[jtotal][yValueVariable]);
      seriesLabels[jr] = response.metadata.edition.display; 
      seriesLabelIds[jr] = response.metadata.edition.value;
      //------------------------------------------------------------------------
    }
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
    _this.plot.data = seriesData;
    _this.plot.ids = seriesLabelIds;
    _this.plot.labels = seriesLabels;
    _this.plot.metadata = metadata;
    _this.plot.plotFilename = filename;
    _this.plot.title = title;
    _this.plot.xLabel = xLabel;
    _this.plot.yLabel = yLabel;
   
    _this.plot.removeSmallValues(1e-14); 
    _this.plot.plotData();
    //--------------------------------------------------------------------------

  }

  */




}
//-------------------- End Class: ModelCompare ---------------------------------
