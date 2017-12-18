


class Common{



  //.................. Method: getHazardParameters .............................
  static getHazardParameters(callback){
    var dynamicUrl = "https://earthquake.usgs.gov/nshmp-haz-ws/hazard";
    var staticUrl  = "https://earthquake.usgs.gov/hazws/staticcurve/1";
    
    
    let dynamicPromise = $.getJSON(dynamicUrl);
    let staticPromise = $.getJSON(staticUrl);
    
    
    $.when(dynamicPromise,staticPromise)
        .done(function(dp,sp){
          
          let dynamicParameters = dp[0].parameters;
          let staticParameters = sp[0].parameters;
            
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
          editionValues.sort(Common.sortDisplayorder); 
          regionValues.sort(Common.sortDisplayorder);
          imtValues.sort(Common.sortDisplayorder);
          vs30Values.sort(Common.sortDisplayorder);
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
          console.log("Combined Parameters: ");     
          console.log(combinedParameters);   
          console.log("\n");
          //--------------------------------------------------------------------
            
          callback(combinedParameters); 
        }); 
  
  }
  //-------------------- End Method: getHazardParameters -----------------------

  
  
  //............................. Method: sortDisplayOrder ..................... 
  /*
  - The sort_displayorder function takes a parameter, like edition, and sorts them based
    on the display order given in the two JSON files
  - This function returns the subtraction of the display order values of two editions to see
    which one should be displayed first (a negative value return is displayed first)
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
        .text(function(d,i){return d.display})
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
        url: obj.options.staticUrl +
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
        url: obj.options.dynamicUrl +
        "?edition="   + edition   +
        "&region="    + region    +
        "&longitude=" + lon       +
        "&latitude="  + lat       +
        "&vs30="      + vs30
      };
    }
    return urlInfo;
  }


}
//------------------------- End Class: Common ----------------------------------




