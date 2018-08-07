'use strict';

import Footer from './Footer.js';
import Header from './Header.js';
import LeafletTestSitePicker from './LeafletTestSitePicker.js';
import NshmpError from '../error/NshmpError.js';
import Settings from './Settings.js';
import Spinner from './Spinner.js';
import Tools from './Tools.js';

export default class Hazard{

  constructor(config){
    let _this = this;
    
    _this.footer = new Footer();
    _this.footerOptions = {
      rawBtnDisable: true,
      updateBtnDisable: true
    };
    _this.footer.setOptions(_this.footerOptions);
    
    // Create header                                                            
    _this.header = new Header();                                                
    
    // Create spinner                                                           
    _this.spinner = new Spinner();                                              

    // Settings menu
    //_this.settings = new Settings(_this.footer.settingsBtnEl);
    
     
    _this.controlEl = document.querySelector("#control");
    _this.editionEl = document.getElementById("edition");
    _this.regionEl = document.getElementById("region");
    _this.imtEl = document.getElementById("imt");
    _this.vs30El = document.getElementById("vs30");
    _this.latBoundsEl = document.getElementById("lat-bounds");
    _this.lonBoundsEl = document.getElementById("lon-bounds");
    _this.latEl = document.getElementById("lat");
    _this.lonEl = document.getElementById("lon");
    _this.latFormEl = document.getElementById("lat-form");
    _this.lonFormEl = document.getElementById("lon-form");

    this.config = config;

    $(_this.lonEl).on('input', (event) => {
      Hazard.checkCoordinates(_this,false,true);
    });
    
    $(_this.latEl).on('input', (event) => {
      Hazard.checkCoordinates(_this,true,false);
    });

    $(_this.controlEl).on('input change', (event) => {
      let canSubmit = Hazard.checkCoordinates(_this,false,false);
      _this.footerOptions = {
        updateBtnDisable: !canSubmit
      };
      _this.footer.setOptions(_this.footerOptions);
    });
 
    this.dynamicUrl = this.config.server.dynamic + "/nshmp-haz-ws/hazard";
    this.staticUrl  = this.config.server.static + "/hazws/staticcurve/1";
    
    this.testSitePickerBtnEl = document.querySelector('#test-site-picker');
  
    /* @type {LeafletTestSitePicker} */
    this.testSitePicker = new LeafletTestSitePicker(
        this.latEl,
        this.lonEl,
        this.testSitePickerBtnEl);
    
    /* Bring Leaflet map up when clicked */
    $(this.testSitePickerBtnEl).on('click', (event) => {
      this.testSitePicker.plotMap(this.regionEl.value);
    });
  }



  //.................. Method: getHazardParameters .............................
  static getHazardParameters(_this, callback) {
    let jsonCall = Tools.getJSONs([_this.dynamicUrl, _this.staticUrl]); 
    _this.spinner.on(jsonCall.reject, 'Calculating');

    Promise.all(jsonCall.promises).then((responses) => {    
      NshmpError.checkResponses(responses);
      let dynamicParameters = responses[0].parameters;
      let staticParameters = responses[1].parameters;

      //................ Add Edition Type ..................................
      var mainPars    = ["edition","region"];
      var editionType = ["static","dynamic"];

      for (var jt in editionType){
        var par = eval(editionType[jt]+"Parameters");
        for (var jp in mainPars){
          for (var jv in par[mainPars[jp]].values){
            par[mainPars[jp]].values[jv].dataType = editionType[jt];
          }
        }
      }
      //--------------------------------------------------------------------

      
      //.................. Combine Static and Dynamic Parameters ...........
      var editionValues = staticParameters.edition.values
          .concat(dynamicParameters.edition.values);
      var regionValues = staticParameters.region.values
          .concat(dynamicParameters.region.values);
      var imtValues = staticParameters.imt.values;
      var vs30Values = staticParameters.vs30.values;
      //--------------------------------------------------------------------

      //........ Sort Combined Parameters by Display Order Parameter .......
      editionValues.sort(Hazard.sortDisplayorder); 
      regionValues.sort(Hazard.sortDisplayorder);
      imtValues.sort(Hazard.sortDisplayorder);
      vs30Values.sort(Hazard.sortDisplayorder);
      //--------------------------------------------------------------------

      //....... Create a Single Parameter Object for Static and Dynamic ....
      var combinedParameters = {
        edition: {
          label: dynamicParameters.edition.label,
          type: dynamicParameters.edition.type,
          values: editionValues
        },
        region: {
          label: dynamicParameters.region.label,
          type: dynamicParameters.region.type,
          values: regionValues
        },
        imt: { 
          label: dynamicParameters.imt.label,
          type: dynamicParameters.imt.type,
          values: imtValues
        },
        vs30: { 
          label: dynamicParameters.vs30.label,
          type: dynamicParameters.vs30.type,
          values: vs30Values
        }
      };
      //--------------------------------------------------------------------
        
      callback(combinedParameters); 
    }).catch((errorMessage) => {
      _this.spinner.off();
      NshmpError.throwError(errorMessage);
    }); 
  
  }
  //-------------------- End Method: getHazardParameters -----------------------

  
  
  //............................. Method: sortDisplayOrder ..................... 
  /*
  - The sort_displayorder function takes a parameter, 
      like edition, and sorts them based on the display 
      order given in the two JSON files
  - This function returns the subtraction of the display 
      order values of two editions to see which one should be 
      displayed first (a negative value return is displayed first)
  */
  static sortDisplayorder(a,b){
    return (a.displayorder - b.displayorder);
  }      
  //--------------------------- End Method: sortDisplayOrder -------------------



  //........................... Method: setSelectMenu ..........................
  static setSelectMenu(el,options){
    
    d3.select(el)
        .selectAll("option")
        .data(options)
        .enter()
        .append("option")
        .attr("value",function(d,i){return d.value})
        .attr("id",function(d,i){return d.value})
        .text(function(d,i){return d.display.replace("&amp;","&")})
  }                                                                             
  //-------------------- End Method: setSelectMenu -----------------------------



  /*
  -  This function is used for model-compare and model-explorer

  Format of Dynamic URL:
    https://earthquake.usgs.gov/nshmp-haz-ws/hazard?
        edition=value&region=value&longitude=value
        &latitude=value&imt=value&vs30=value

  Format of Static URL:
    https://earthquake.usgs.gov/hazws/staticcurve/1
    /{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}"
  */
  static composeHazardUrl(obj,edition,region,lat,lon,vs30,dataType){
    if (dataType == "static"){  
      var urlInfo =  {
        dataType: "static",
        url: obj.staticUrl +
        edition + "/" + 
        region  + "/" +
        lon     + "/" +
        lat     + "/" +
        "any"   + "/" +
        vs30   
      };
    }else if (dataType == "dynamic"){
      var urlInfo =  {
        dataType: "dynamic", 
        url: obj.dynamicUrl +
        "?edition="   + edition   +
        "&region="    + region    +
        "&longitude=" + lon       +
        "&latitude="  + lat       +
        "&vs30="      + vs30
      };
    }
    return urlInfo;
  }



  static checkQuery(_this){
    let url = window.location.hash.substring(1);
    
    if (!url) return false;
    
    let pars = url.split("&");
    let key;
    let value;
    let lat;
    let lon;
    let vs30;
    let imt;
    let editions = [];
    let dataType = [];
    let regions = [];
    let urlInfo = [];
    pars.forEach(function(par,i){
      key = par.split("=")[0];
      value = par.split("=")[1];
      switch (key){
        case("lat"):
          lat = value;
          break;
        case("lon"):
          lon = value;
          break;
        case("vs30"):
          vs30 = value;
          break;
        case("imt"):
          imt = value;
          break;
        case("edition"):
          editions.push(value);
          break;
        case("dataType"):
          dataType.push(value);
          break;
        case("region"):
          regions.push(value);
          break;
      }
    });
    
    d3.select(_this.editionEl)
        .selectAll("option")
        .property("selected",false);
   
    _this.latEl.value = lat;
    _this.lonEl.value = lon;
    _this.imtEl.value = imt;
    _this.vs30El.value = vs30;

    if (_this.options.type == "compare"){ 
      let comparableRegion = _this.comparableRegions.find(function(d,i){
        return d.staticValue == regions[0] || d.dynamicValue == regions[0];
      });
      _this.regionEl.value = comparableRegion.value;
      _this.options.regionDefault = comparableRegion.value;
    }else{
      _this.regionEl.value = regions[0];
      _this.options.regionDefault = regions[0];
      _this.options.editionDefault = editions[0];
    }
    
    _this.options.imtDefault = imt;
    _this.options.vs30Default = vs30;
    
    editions.forEach(function(edition,i){
      d3.select(_this.editionEl)
          .select("#"+edition)
          .property("selected",true);
    });
    
    return true; 
  }






  //....................... Method: setParameterMenu ...........................
  static setParameterMenu(_this,par,supportedValues){
    let el = eval("_this."+par+"El");
    d3.select(el)
        .selectAll("option")
        .remove();
    
    if ((_this.options.type == "explorer" && par == "region") || 
          (_this.options.type == "compare" && par == "edition" || "region"))
      Hazard.setSelectMenu(el,supportedValues);
    else
      Hazard.setSelectMenu(el,_this.parameters[par].values);
    

    d3.select(el)
        .selectAll("option")
        .property("disabled",true)
        .filter(function(d,i){
          return supportedValues.some(function(sv,isv){
            return d.value == sv.value;
          })
        })
        .property("disabled",false);
    
    let defaultVal = _this.options[par+"Default"];
    let isFound = supportedValues.some(function(val,i){
      return val.value == defaultVal; 
    });
    defaultVal = isFound ? defaultVal 
        : supportedValues[0].value;  
    el.value = defaultVal;                                                      
  }
  //------------------ End Method: setParameterMenu ----------------------------
  
  
  
  
  //....................... Method: supportedValues ............................
  static supportedValues(_this,par){
    
    let type = _this.options.type;
    let supports = [];                                                          
    let selectedEditions = _this.editionEl.querySelectorAll(":checked");
    selectedEditions.forEach(function(e,i){
      let edition = _this.parameters.edition.values.find(function(ev,iev){
        return ev.value == e.value;
      });
      supports.push(edition.supports[par]);
      let dataType = edition.dataType;
      if (type == "compare"){
        let comparableRegion = _this.comparableRegions.find(function(r,ir){
          return r.value == _this.regionEl.value;
        });
        let region = _this.parameters.region.values.find(function(r,ir){
          return r.value == comparableRegion[dataType+"Value"];
        });
        supports.push(region.supports[par]);
      }else if (type == "explorer"){
        let region = _this.parameters.region.values.find(function(r,ir){
          return r.value == _this.regionEl.value; 
        });
        supports.push(region.supports[par]);
      }
    });
    
    let supportedValues = _this.parameters[par].values.filter(function(p,ip){
      return supports.every(function(pc,ipc){
        return pc.includes(p.value);
      });
    });
    
    return supportedValues;
  }
  //----------------------- End Method: supportedValues ------------------------




  //.................... Method: setBounds .....................................
  static setBounds(_this){
    
    //............................ Variables ...................................
    let latMax,
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
    let latMax,
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



  //...................... Get Menu Selections/Values  .........................
  static getSelections(_this){
    
    $(_this.footer.rawBtnEl).off();
    
    let selectedEditions = _this.editionEl.querySelectorAll(":checked");
    let vs30 = _this.vs30El.value;
    let lat = _this.latEl.value;
    let lon = _this.lonEl.value;
    let imt = _this.imtEl.value;
    
    //....................... Setup URLs to Submit .............................
    let type = _this.options.type;
    if (type == "compare"){
      var regionInfo = _this.comparableRegions.find(function(d,i){
        return d.value == _this.regionEl.value;
      });
    }
    var urlInfo = [];
    let windowUrl = "lat="+lat+"&lon="+lon+"&vs30="+vs30+"&imt="+imt;
    selectedEditions.forEach(function(se,ise){
      var editionInfo = _this.parameters.edition.values.find(function(d,i){
        return d.value == se.value;
      });
      var dataType = editionInfo.dataType;
      var editionVal = editionInfo.value;
      var regionVal  = type == "compare" ? regionInfo[dataType+"Value"]
          : _this.regionEl.value;
      windowUrl += "&dataType="+dataType+"&edition="
          +editionVal+"&region="+regionVal;
      let url = Hazard.composeHazardUrl(_this,editionVal,regionVal,
          lat,lon,vs30,dataType);
      urlInfo.push(url);
    });
    
    window.location.hash = windowUrl;
    
    $(_this.footer.rawBtnEl).click(function(){
      urlInfo.forEach(function(url,iu){
        window.open(url.url);
      })
    });
    //--------------------------------------------------------------------------
    
    return urlInfo; 
  }
  //----------------- End: Get Menu Selections/Values --------------------------



  //...................... Call the nshmp-haz Code Given URL ...................
  static callHazard(_this,callback){
    
    var canSubmit = Hazard.checkCoordinates(_this,true,true);
    if (!canSubmit) return;
    
    let urlInfo = Hazard.getSelections(_this);
    
    _this.footerOptions = {
      rawBtnDisable: false,
      updateBtnDisable: false
    };
    _this.footer.setOptions(_this.footerOptions);
    
    let urls = [];
    for (var ju in urlInfo){
      urls.push(urlInfo[ju].url);
    }

    let jsonCall = Tools.getJSONs(urls);
    _this.spinner.on(jsonCall.reject, 'Calculating');
    
    Promise.all(jsonCall.promises).then((responses) => {
      NshmpError.checkResponses(responses);

      let jsonResponse = [];
      
      responses.forEach(function(jsonReturn,i){
        jsonReturn.response.dataType = urlInfo[i].dataType;
        jsonResponse.push(jsonReturn.response);
      });
     
      let responseWithServer = responses.find((d, i) => {
        return d.server;
      });
      
      let server = responseWithServer != undefined ?
          responseWithServer.server : undefined;
      _this.footer.setMetadata(server);

      callback(_this, jsonResponse); 
    }).catch((errorMessage) => {
      _this.spinner.off();
      NshmpError.throwError(errorMessage);
    });
  
  }
  //------------------- End: Call nshmp-haz Code -------------------------------



}
//------------------------- End Class: Hazard ----------------------------------




