





class ModelCompare{

  
  constructor(){
    let _this = this; 
  
    _this.footer = new Footer();
    _this.footerOptions = {
      rawBtnDisable: true,
      updateBtnDisable: true
    };
    _this.footer.setOptions(_this.footerOptions);
    _this.header = new Header();
    _this.header.setTitle("Model Comparison");
    _this.spinner = new Spinner();
    _this.spinner.on();


    _this.edition_id    = document.getElementById("edition");                     
    _this.region_id     = document.getElementById("region");                      
    _this.imt_id        = document.getElementById("imt");                         
    _this.vs30_id       = document.getElementById("vs30");                        
    _this.lat_bounds_id = document.getElementById("lat_bounds");                  
    _this.lon_bounds_id = document.getElementById("lon_bounds");                  
    _this.lat_id        = document.getElementById("lat");                         
    _this.lon_id        = document.getElementById("lon");                         

    let el = document.querySelector("#content");
    let tooltip_text = ["Edition", "GM (g)", "AFE"];
    let plotOptions = {
      legendLocation: "bottomleft",
      tooltipText: tooltip_text
    };
    _this.plot = new D3LinePlot(el,plotOptions); 

    _this.comparable_region = [
      {
        display: "Alaska",
        value: "AK",
        static_value: "AK0P10",
        dynamic_value: "AK"
      },{
        display: "Central & Eastern US",
        value:"CEUS",
        static_value: "CEUS0P10",
        dynamic_value: "CEUS"
      },{
        display: "Conterminous US",
        value: "COUS",
        static_value: "COUS0P05",
        dynamic_value: "COUS"
      },{
        display: "Western US",
        value: "WUS",
        static_value: "WUS0P05",
        dynamic_value: "WUS"
      }
    ];

    $(_this.footer.updateBtnEl).click(function(){
      ModelCompare.get_selections();
    });

    //............. Call get_selection on Keyboard Enter on Lat ................
    _this.lat_id.onkeypress = function(key){ 
      var key_code = key.which || key.keyCode;
      if (key_code == 13){
        ModelCompare.get_selections();
      }
    }
    //--------------------------------------------------------------------------

    //............. Call get_selection on Keyboard Enter on Lon ................
    _this.lon_id.onkeypress = function(key){
      var key_code = key.which || key.keyCode;
      if (key_code == 13){
        ModelCompare.get_selections();
      }
    }
    //--------------------------------------------------------------------------

  function set_parameters(par){
    _this.spinner.off();
    _this.parameters = par;
    ModelCompare.add_regions(_this); 
  };
    get_parameters(set_parameters); 
  }




  //...................... Add Regions to Menu .................................
  static add_regions(modelCompare){
    
    for (var jcr in modelCompare.comparable_region){ 
      var option   = document.createElement("option");
      var region   = modelCompare.comparable_region[jcr];
      option.value = region.value;
      option.id    = region.value;
      option.text  = region.display
      modelCompare.region_id.add(option);
    }
    
    modelCompare.region_id.value = "COUS";
    ModelCompare.add_editions(modelCompare);
  }
  //----------------------------------------------------------------------------



  //........................ Add Editions to Select Menu .......................
  /*
  - The add_editions functions adds all supported editions to 
      the edition selection menu based on the selected region.
  */

  static add_editions(modelCompare){
    modelCompare.lat_id.value = null;
    modelCompare.lon_id.value = null;
    check_bounds();
    ModelComapre.remove_options("edition");

    //...................... Find Selected Region ..............................
    var jregion_select      = modelCompare.region_id.selectedIndex;
    var region_select_value = modelComapre.region_id.options[jregion_select].value;
    var region_select = modelCompare.comparable_region.find(function(d,i){
      return d.value == region_select_value;
    }); 
    //--------------------------------------------------------------------------

    //...................... Add Supported Editions ............................
    var supported_editions = modelCompare.parameters.edition.values.filter(function(ev,iev){
      return ev.supports.region.find(function(rv,irv){
        return rv == region_select.static_value || 
            rv == region_select.dynamic_value;
      })
    });

    for (var je in supported_editions){ 
      var option = document.createElement("option");
      option.value    = supported_editions[je].value;
      option.id       = supported_editions[je].value;
      option.text     = supported_editions[je].display;
      option.selected = true;
      modelCompare.edition_id.add(option);
    }
    //--------------------------------------------------------------------------

    ModelCompare.add_options(modelComapre);

  }
  //------------------------ End: Add Editions ---------------------------------




  //............................ Add Options to Select Menus ...................
  /*
  - The add_options functions adds the support parameters 
      options to the corresponding selections menu, either imt or vs30.
  - The options that are added to the menus are based 
      on what all selected editions and regions have in common. 
  */
  static add_options(modelComapre){

    ModelCompare.remove_options("imt");
    ModelCompare.remove_options("vs30");

    var edition_select = modelComapre.edition_id.selectedOptions;
    var nselect        = modelComapre.edition_select.length;
    var jregion        = modelComapre.region_id.options.selectedIndex;
    var region_select  = modelCompare.region_id.options[jregion].value;

    var supports = ["imt","vs30"];
    var imt_check  = [];
    var vs30_check = [];

    //........ Get All IMT and Vs30 Values in Selected Region and Editions .....
    for (var js=0;js<nselect;js++){ 
      var edition_value = edition_select[js].value;
      var edition       = modelComapre.parameters.edition.values.find(function(d,i){
        return d.value == edition_value;
      });
      imt_check.push(edition.supports.imt);
      vs30_check.push(edition.supports.vs30);
      var data_type   = edition.data_type;
      var region = modelCompare.comparable_region.find(function(d,i){
        return d.value == region_select
      });
      var region_value    = region[data_type+"_value"];
      var region_supports = modelCompare.parameters.region.values.find(function(d,i){
        return d.value == region_value;
      }).supports;
      imt_check.push(region_supports.imt);
      vs30_check.push(region_supports.vs30);
    }
    //--------------------------------------------------------------------------

    //........ Add IMT and Vs30 Values to Menu with Supported Selecteable ......
    common_supports("imt",imt_check);
    common_supports("vs30",vs30_check);
    //--------------------------------------------------------------------------


  }
  //----------------------- End: Add Options -----------------------------------



  //...................... Get Menu Selections/Values  .........................
  /*
  - The get_selctions function gets the selection/value 
      from each of the menus, edition, region, 
      longitude, latitude, imt, and vs30.
  - The function then calls either the static or 
      dynamic web services based on the edition choosen
  */
  static get_selections(modelCompare){
      
    modelCompare.spinner.on("Calculating ...");

    //.................. Get All Selections from the Menus .....................
    var selected_editions = modelCompare.edition_id.selectedOptions;
    var selected_region   = modelCompare.region_id.options[modelCompare.region_id.selectedIndex].value;
    var vs30              = modelComapre.vs30_id.options[modelCompare.vs30_id.selectedIndex].value;
    var lat = modelCompare.lat_id.value;
    var lon = modelCompare.lon_id.value;
    //--------------------------------------------------------------------------
    
    
    //....................... Setup URLs to Submit .............................
    var can_submit = check_bounds(true);
    if (can_submit[0] && can_submit[1]){
      
      var region_info = modelCompare.comparable_region.find(function(d,i){
        return d.value == selected_region; 
      });
      var url_info = [];
      var nedition = selected_editions.length;
      for (var je=0;je<nedition;je++){
        var edition_info = modelComapre.parameters.edition.values.find(function(d,i){
          return d.value == selected_editions[je].value;
        });
        var data_type     = edition_info.data_type;
        var edition_value = edition_info.value;
        var region_value  = region_info[data_type+"_value"];
        url_info[je] = make_hazard_url(edition_value,region_value,
            lat,lon,vs30,data_type);
      }
      
      ModelComapre.get_hazard(modelComapre,url_info);

      $(modelComapre.footer.rawBtnEl).click(function(){ 
        for (var ju in url_info){
          window.open(url_info[ju].url);
        }                     
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

  static get_hazard(modelCompare,url_info){
    
    //........................... Call Code ....................................
    var json_return = [];
    for (var ju in url_info){
      json_return[ju] = $.getJSON(url_info[ju].url);
    }
    //--------------------------------------------------------------------------


    //......................... Get Each JSON Response .........................
    var response = [];
    $.when.apply(this,json_return).done(function(d,i){
      for (var jr in json_return){
        var response_json = json_return[jr].responseJSON;
        var url_check = response_json.url;
        var jurl = url_info.findIndex(function(d,i){
          return url_check == d.url;
        });
        response_json.response.data_type = url_info[jurl].data_type;
        var stat = response_json.status;
        if (stat == "success"){
          response[jr] = response_json.response;
        }
      }
      ModelComapre.hazard_plot(modelComapre,response);
    
      ModelCompare.imt_id.onchange = function(){
        ModelComapre.hazard_plot(modelComapre,response);
      };
    });
    //--------------------------------------------------------------------------
   
  }
  //------------------- End: Call nshmp-haz Code -------------------------------




  //.......................... Plot Hazard Curves ..............................

  static hazard_plot(modelCompare,json_response){
    modelComapre.spinner.off();
    
    var selected_imt_display = modelCompare.imt_id.options[modelCompare.imt_id.selectedIndex].text;
    var selected_imt_value   = modelCompare.imt_id.options[modelComapre.imt_id.selectedIndex].value;
    let title = "Hazard Curves at " + selected_imt_display; 

    var series_data           = [];       
    var series_label_displays = [];       
    var series_label_values   = [];       

    //............... Get Data from Selected IMT Value and Format for D3 .......
    for (var jr in json_response){        
      var data_type = json_response[jr].data_type;
      var response  = json_response[jr].find(function(d,i){
       return d.metadata.imt.value == selected_imt_value;
      });
      var data = response.data;
      
      //................ JSON Variables based on Edition Type ..................
      if (data_type == "dynamic"){
        var xvalue_variable = "xvalues";
        var yvalue_variable = "yvalues";
        var jtotal          = data.findIndex(function(d,i){ 
          return d.component == "Total"
        });     
      }else if (data_type == "static"){ 
        var xvalue_variable = "xvals";
        var yvalue_variable = "yvals";
        var jtotal          = 0; 
      } 
      //------------------------------------------------------------------------
    
      //...................... Set Data for D3 .................................
      var xvalues               = response.metadata[xvalue_variable];
      series_data[jr]           = d3.zip(xvalues,data[jtotal][yvalue_variable]);
      series_label_displays[jr] = response.metadata.edition.display; 
      series_label_values[jr]   = response.metadata.edition.value;
      //------------------------------------------------------------------------
    }
    //--------------------------------------------------------------------------
   
    //.................. Get Axis Information ..................................
    var metadata = json_response[0][0].metadata;
    var xlabel   = metadata.xlabel;
    var ylabel   = metadata.ylabel;
    metadata = {
        version: "1.1",
        url: window.location.href,
        time: new Date()
      };
    //--------------------------------------------------------------------------
    

    //.................... Plot Info Object for D3 .............................
    modelCompare.plot.data = series_data;
    modelCompare.plot.ids = series_label_values;
    modelCompare.plot.labels = series_label_displays;
    modelCompare.plot.metadata = metadata;
    modelCompare.plot.title = title;
    modelCompare.plot.xLabel = xlabel;
    modelCompare.plot.yLabel = ylabel;
   
    modelCompare.plot.removeSmallValues(1e-14); 
    modelCompare.plot.plotData();
    //--------------------------------------------------------------------------

  }



}
//-------------------- End Class: ModelCompare ---------------------------------
