




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


    $(_this.footer.updateBtnEl).click(function(){
      ModelExplorer.getSelections(_this);
    });

    
    //............. Call Hazard Code on Enter ..................................
    _this.controlEl.onkeypress = function(key){
      var keyCode = key.which || key.keyCode;
      if (keyCode == 13){
        ModelExplorer.getSelections(_this);
      }
    }
    //--------------------------------------------------------------------------
  
    
    //....................... Get Hazard Parameters ............................
    Hazard.getHazardParameters(setParameters); 
    function setParameters(par){
      _this.spinner.off();
      _this.parameters = par;
      ModelExplorer.setEditionMenu(_this); 
      let urlInfo = ModelExplorer.checkQuery(_this);
      if (urlInfo) ModelExplorer.callHazard(_this,urlInfo);
    };
    //--------------------------------------------------------------------------
   
   
    d3.select(_this.lonEl)
        .on("change",function(){
          ModelExplorer.checkCoordinates(_this,false,true);
        });
    
    d3.select(_this.latEl)
        .on("change",function(){
          ModelExplorer.checkCoordinates(_this,true,false);
        });

    
  }
  //---------------------- End Constructor: ModelComapre -----------------------


  //........................... Method: setRegions ............................. 
  static setRegionMenu(_this){
    
    d3.select(_this.regionEl)
        .selectAll("option")
        .remove();

    var selectedEdition = _this.parameters.edition
        .values.find(function(edition,i){
          return edition.value == _this.editionEl.value;
    }); 
   
    let supportedRegions = _this.parameters.region.values.filter(function(region,ir){
      return selectedEdition.supports.region.find(function(regionVal,irv){
        return regionVal == region.value;
      })
    });

    ModelExplorer.setSelectMenu(_this.regionEl,supportedRegions);
    ModelExplorer.clearCoordinates(_this);
    ModelExplorer.setBounds(_this);
    d3.select(_this.regionEl)
        .on("change",function(){
          ModelExplorer.setParameterMenu(_this,"imt");
          ModelExplorer.setParameterMenu(_this,"vs30");
        });
   
    ModelExplorer.setParameterMenu(_this,"imt");
    ModelExplorer.setParameterMenu(_this,"vs30");
    
  }
  //-------------------- End Method: setRegions --------------------------------



  //......................... Method: setEditionMenu ...........................
  static setEditionMenu(_this){

    _this.footerOptions = {
      rawBtnDisable: true,
      updateBtnDisable: false
    };
    _this.footer.setOptions(_this.footerOptions);
    
    ModelExplorer.setParameterMenu(_this,"edition");
    
    d3.select(_this.editionEl)  
        .on("change",function(){
          ModelExplorer.setRegionMenu(_this);
        });

    ModelExplorer.setRegionMenu(_this);
  }
  //------------------- End Method: setEditionMenu -----------------------------




}
//-------------------- End Class: ModelCompare ---------------------------------
