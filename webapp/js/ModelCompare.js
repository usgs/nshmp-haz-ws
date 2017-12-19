





class ModelCompare{

  
  constructor(){

    //......................... Variables ......................................
    let _this = this; 

    
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
    
    
    _this.editionEl = document.getElementById("edition");
    _this.regionEl = document.getElementById("region");
    _this.imtEl = document.getElementById("imt");
    _this.vs30El = document.getElementById("vs30");
    _this.latBoundsEl = document.getElementById("lat_bounds");
    _this.lonBoundsEl = document.getElementById("lon_bounds");
    _this.latEl = document.getElementById("lat");
    _this.lonEl = document.getElementById("lon"); 
    _this.latFormEl = document.getElementById("lat-form");
    _this.lonFormEl = document.getElementById("lon-form");
    //--------------------------------------------------------------------------
  
    _this.options = {
        regionDefault: "COUS",
        imtDefault: "PGA",
        vs30Default: 760,
        staticUrl: "https://dev01-earthquake.cr.usgs.gov/hazws/staticcurve/1/",
        dynamicUrl: "https://dev01-earthquake.cr.usgs.gov/nshmp-haz-ws/hazard"
    };

    //..................... Plot Setup .........................................
    let el = document.querySelector("#content");
    let tooltipText = ["Edition", "GM (g)", "AFE"];
    let plotOptions = {
      legendLocation: "bottomleft",
      tooltipText: tooltipText
    };
    _this.plot = new D3LinePlot(el,plotOptions); 
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

    //............. Call get_selection on Keyboard Enter on Lat ................
    _this.latEl.onkeypress = function(key){ 
      var keyCode = key.which || key.keyCode;
      if (keyCode == 13){
        ModelCompare.getSelections(_this);
      }
    }
    //--------------------------------------------------------------------------


    //............. Call get_selection on Keyboard Enter on Lon ................
    _this.lonEl.onkeypress = function(key){
      var keyCode = key.which || key.keyCode;
      if (keyCode == 13){
        ModelCompare.getSelections(_this);
      }
    }
    //--------------------------------------------------------------------------
  
  
    //....................... Get Hazard Parameters ............................
    Common.getHazardParameters(setParameters); 
    function setParameters(par){
      _this.spinner.off();
      _this.parameters = par;
      ModelCompare.setRegionMenu(_this); 
    };
    //--------------------------------------------------------------------------
   
   
    d3.select(_this.lonEl)
        .on("change",function(){
          ModelCompare.checkCoordinates(_this,false,true);
        });
    
    d3.select(_this.latEl)
        .on("change",function(){
          ModelCompare.checkCoordinates(_this,true,false);
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
    Common.setSelectMenu(_this.regionEl,_this.comparableRegions);
    d3.select(_this.regionEl)
        .on("change",function(){
          ModelCompare.setEditionMenu(_this);
        });
    
    _this.regionEl.value = _this.options.regionDefault;
    ModelCompare.setEditionMenu(_this);
  }
  //-------------------- End Method: setRegions --------------------------------



  //......................... Method: setEditionMenu ...........................
  static setEditionMenu(_this){

    ModelCompare.clearCoordinates(_this);
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

    Common.setSelectMenu(_this.editionEl,supportedEditions);
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


  //....................... Method: setParameterMenu ...........................
  static setParameterMenu(_this,par){
    
    let el = eval("_this."+par+"El");
    d3.select(el)
        .selectAll("option")
        .remove();

    let supportedValues = ModelCompare.supportedValues(_this,par);
    Common.setSelectMenu(el,_this.parameters[par].values); 
    
    d3.select(el)
        .selectAll("option")
        .property("disabled",true)
        .filter(function(d,i){
          return supportedValues.some(function(sv,isv){
            return d.value == sv.value;
          })
        })
        .property("disabled",false); 
     
    el.value = supportedValues[0].value;
  }
  //------------------ End Method: setParameterMenu ----------------------------
  


  //....................... Method: supportedValues ............................
  static supportedValues(_this,par){
    
    let supports = [];
    let selectedEditions = _this.editionEl.querySelectorAll(":checked");
    selectedEditions.forEach(function(e,i){
      let edition = _this.parameters.edition.values.find(function(ev,iev){
        return ev.value == e.value;
      })
      supports.push(edition.supports[par]);
      let dataType = edition.dataType;
      let comparableRegion = _this.comparableRegions.find(function(r,ir){
        return r.value == _this.regionEl.value; 
      });
      let region = _this.parameters.region.values.find(function(r,ir){
        return r.value == comparableRegion[dataType+"Value"];
      });
      supports.push(region.supports[par]);
    });
    
    let supportedValues = _this.parameters[par].values.filter(function(p,ip){
      return supports.every(function(pc,ipc){
        return pc.includes(p.value);
      })
    });
    
    return supportedValues;
  }
  //----------------------- End Method: supportedValues ------------------------





  //...................... Get Menu Selections/Values  .........................
  /*
  - The get_selctions function gets the selection/value 
      from each of the menus, edition, region, 
      longitude, latitude, imt, and vs30.
  - The function then calls either the static or 
      dynamic web services based on the edition choosen
  */
  static getSelections(_this){
    
    _this.spinner.on("Calculating ...");
    $(_this.footer.rawBtnEl).off(); 
    
    
    let selectedEditions = _this.editionEl.querySelectorAll(":checked");
    let vs30 = _this.vs30El.value;
    let lat = _this.latEl.value;
    let lon = _this.lonEl.value;
     
    //....................... Setup URLs to Submit .............................
    var canSubmit = ModelCompare.checkCoordinates(_this,true,true); 
    
    if (canSubmit){
      _this.footerOptions = {
        rawBtnDisable: false,
        updateBtnDisable: false
      };
      _this.footer.setOptions(_this.footerOptions);

      var regionInfo = _this.comparableRegions.find(function(d,i){
        return d.value == _this.regionEl.value; 
      });
      var urlInfo = [];
      selectedEditions.forEach(function(se,ise){
        var editionInfo = _this.parameters.edition.values.find(function(d,i){
          return d.value == se.value;
        });
        var dataType     = editionInfo.dataType;
        var editionVal = editionInfo.value;
        var regionVal  = regionInfo[dataType+"Value"];
        let url = Common.composeHazardUrl(_this,editionVal,regionVal,
            lat,lon,vs30,dataType);
        urlInfo.push(url);
      });
      

      ModelCompare.callHazard(_this,urlInfo);

      $(_this.footer.rawBtnEl).click(function(){ 
        urlInfo.forEach(function(url,iu){
          window.open(url.url);
        })
      });
    }
    //--------------------------------------------------------------------------
  
  } 
  //----------------- End: Get Menu Selections/Values --------------------------



  //...................... Call the nshmp-haz Code Given URL ...................

  /*
  - The get_hazard function call the nshmp-haz code and 
      reads in the JSON file that is generated by the nshmp-haz code
  - The function takes in one argument, url. 
      The url is the URL that is created in the get_selections function.
  */

  static callHazard(_this,urlInfo){
     
    //........................... Call Code ....................................
    var promises = [];
    for (var ju in urlInfo){
      promises[ju] = $.getJSON(urlInfo[ju].url);
    }
    //--------------------------------------------------------------------------


    //......................... Get Each JSON Response .........................
    $.when.apply($,promises).done(function(){
      let jsonResponse = [];
      let responses = Array.from(arguments);
      _this.spinner.off();
      responses.forEach(function(jsonReturn,i){
        jsonReturn[0].response.dataType = urlInfo[i].dataType;
        jsonResponse.push(jsonReturn[0].response);
      });

      
      ModelCompare.plotHazardCurves(_this,jsonResponse);
    
      
      _this.imtEl.onchange = function(){
        ModelCompare.plotHazardCurves(_this,jsonResponse);
      };
      
    });
    //--------------------------------------------------------------------------
   
  }
  //------------------- End: Call nshmp-haz Code -------------------------------




  //.......................... Plot Hazard Curves ..............................

  static plotHazardCurves(_this,jsonResponse){
    _this.spinner.off();
    
    var selectedImtDisplay = _this.imtEl.text; 
    var selectedImtValue   = _this.imtEl.value; 
    
    let title = "Hazard Curves at " + selectedImtDisplay; 

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
    _this.plot.title = title;
    _this.plot.xLabel = xLabel;
    _this.plot.yLabel = yLabel;
   
    _this.plot.removeSmallValues(1e-14); 
    _this.plot.plotData();
    //--------------------------------------------------------------------------

  }



  //.................... Method: setBounds .....................................
  /**
  * @method setBounds
  *
  * @decription Set the latitude and longitude bounds text under
  *     the latitude and longitude labels given the region selected. <br>
  *
  *
  */
                                                                                
  static setBounds(_this){
    
    
    //............................ Variables ...................................
    let bounds,
        latMax,
        latMin,
        lonMax,
        lonMin,
        region;
                                                                                
    region = _this.parameters.region.values.find(function(d,i){
      return d.value == _this.regionEl.value;
    });

    latMax = region.maxlatitude;
    latMin = region.minlatitude;
    lonMax = region.maxlongitude;
    lonMin = region.minlongitude;
    //--------------------------------------------------------------------------
    
    
    //...................... Update Bounds .....................................
    _this.latBoundsEl.innerHTML = "<br>" + _this.regionEl.value +
        " bounds: " + " ["+latMin+","+latMax+"]";
    
    _this.lonBoundsEl.innerHTML = "<br>" + _this.regionEl.value +
        " bounds: " + " ["+lonMin+","+lonMax+"]";
    //--------------------------------------------------------------------------
  
  }
  //--------------------- End Method: setBounds --------------------------------



  //...................... Method: addSiteCheckBounds ..........................
  static checkCoordinates(_this,checkLat,checkLon){
    let bounds,
        latMax,
        latMin,
        lonMax,
        lonMin,
        region;
    
    region = _this.parameters.region.values.find(function(d,i){
      return d.value == _this.regionEl.value;
    });

    latMax = region.maxlatitude;
    latMin = region.minlatitude;
    lonMax = region.maxlongitude;
    lonMin = region.minlongitude;
    
    let lat = _this.latEl.value;
    let lon = _this.lonEl.value;
    
    let canLatSubmit = lat < latMin || lat > latMax
        || isNaN(lat) ? false : true;
    let canLonSubmit = lon < lonMin || lon > lonMax
        || isNaN(lon) ? false : true;
    
    if(checkLat){
      d3.select(_this.latFormEl)                                                
          .classed("has-error",!canLatSubmit);                                    
      d3.select(_this.latFormEl)                                                
          .classed("has-success",canLatSubmit);                                   
    }
    if(checkLon){ 
      d3.select(_this.lonFormEl)                                                
          .classed("has-error",!canLonSubmit);                                    
      d3.select(_this.lonFormEl)                                                
          .classed("has-success",canLonSubmit);                                   
    }
     
    return canLatSubmit && canLonSubmit ? true : false;           
  
  }                                                                             
  //-------------------- End Method: addSiteCheckBounds ------------------------


  //..................... Method: clearCoordinates .............................
  static clearCoordinates(_this){
    _this.latEl.value = "";
    _this.lonEl.value = "";
    
    d3.select(_this.latFormEl)
        .classed("has-error",false);
    d3.select(_this.latFormEl)
        .classed("has-success",false);
    
    d3.select(_this.lonFormEl)
        .classed("has-error",false);
    d3.select(_this.lonFormEl)
        .classed("has-success",false);
  }                                                                             
  //------------------- End Method: clearCoordinates ---------------------------


}
//-------------------- End Class: ModelCompare ---------------------------------
