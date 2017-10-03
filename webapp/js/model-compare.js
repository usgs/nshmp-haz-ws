


//############################################################################################
//
//................................. Main DOM Ids ............................................. 

var edition_id    = document.getElementById("edition");                     // Edition select menu id $("#edition") 
var region_id     = document.getElementById("region");                      // Region select menu id 
var imt_id        = document.getElementById("imt");                         // IMT select menu id
var lat_bounds_id = document.getElementById("lat_bounds");                  // Latitude bounds label id
var lon_bounds_id = document.getElementById("lon_bounds");                  // Longitude bounds label id
var lat_id        = document.getElementById("lat");                         // Latitude input id
var lon_id        = document.getElementById("lon");                         // Longitude input id
var plot_btn_id   = document.getElementById("update-plot");                 // Plot button id 
var raw_btn_id    = document.getElementById("raw-data");                    // Raw Data button id 
var hazard_panel_id     = document.getElementById("hazard-plot-panel");     // Hazard plot panel id
var hazard_plot_id      = document.getElementById("hazard-curves-plot");    // Hazard plot id
var hazard_resize_id    = document.getElementById("hazard-plot-resize");    // Hazard plot resize glyphicon id
var component_panel_id  = document.getElementById("component-plot-panel");  // Component plot panel id
var component_plot_id   = document.getElementById("component-curves-plot"); // Component plot id
var component_resize_id = document.getElementById("component-plot-resize"); // Component plot resize glyphicon id

var overlay_id     = document.getElementById("overlay");                    // Overlay id for loading
var loader_id      = document.getElementById("loader");                     // Loader id
var loader_text_id = document.getElementById("loader-text");                // Loader text
loader_text_id.innerHTML = "Getting Menu";                                  // Set loader text 
//------------------------------- End: Main DOM Ids ------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................ Read in Parameter Dependency JSON File ............................ 

/*
- On start up the static and dynamic parameter dependicies JSON files get read in.
- Once the JSON files are read in, the functions add_editions, add_regions, and add_options are called.

- NOTE:  The following variables are global:
          - parameters 
*/


var dynamic_url = "https://earthquake.usgs.gov/nshmp-haz-ws/hazard"       // URL to get the JSON parameter dependicy file for dynamic editions
var static_url  = "https://earthquake.usgs.gov/hazws/staticcurve/1"       // URL to get the JSON parameter dependicy file for static editions
$.when(                                                                   // Read in the static and dynamic JSON files
  $.getJSON(dynamic_url,function(dynamic_json_return) {                   // Read in dynamic JSON file 
    dynamic_parameters    = dynamic_json_return.parameters;               // Global variable: get the parameter key from the dynamic JSON file 
  }),
  $.getJSON(static_url,function(static_json_return){                      // Read in the static JSON file
    static_parameters = static_json_return.parameters;                    // Global variable: get the parameter key from the static JSON file
  })
).done(function(){                                                        // Once both the static and dynamic JSON files are read in, perform the following
  console.log("Dynamic Parameters: ");      console.log(dynamic_parameters);   
  console.log("\n\n\n");
  console.log("Static Parameters: ");       console.log(static_parameters);   
  console.log("\n\n\n");

  loader_id.style.display  = "none";
  overlay_id.style.display = "none";

  //.................... Add Data Type ......................................  
  var main_pars    = ["edition","region","imt","vs30"];
  var edition_type = ["static","dynamic"];

  for (var jt in edition_type){
    var par = eval(edition_type[jt]+"_parameters");
    for (var jp in main_pars){
      for (var jv in par[main_pars[jp]].values){
        par[main_pars[jp]].values[jv].data_type = edition_type[jt];
      }
    }
  }
  //------------------------------------------------------------------------

 
  //.................. Combine Static and Dynamic Parameters ...............
  var edition_values = static_parameters.edition.                             // Combine the static and dynamic editions
                        values.concat(dynamic_parameters.edition.values);
  var region_values  = static_parameters.region.                              // Combine the static and dynamic regions
                        values.concat(dynamic_parameters.region.values);
  var imt_values     = static_parameters.imt.values;                          // Combine the static and dynamic IMTs
  var vs30_values    = static_parameters.vs30.values;                         // Combine the static and dynamic Vs30 values

  //------------------------------------------------------------------------

  //......... Sort Combined Parameters by Display Order Parameter ...........
  edition_values.sort(sort_displayorder);                                 // Sort the editions by using sort_displayorder function
  region_values.sort(sort_displayorder);                                  // Sort the regions by using sort_displayorder function       
  imt_values.sort(sort_displayorder);                                     // Sort the IMTs by using sort_displayorder funtion
  vs30_values.sort(sort_displayorder);                                    // Sort the Vs30 values by using sort_displayorder function
  //------------------------------------------------------------------------

  //....... Create a Single Parameter Object for Static and Dynamic .........
  parameters = {                  // Global variable of parameters
    type:  "",                    // type will either be static or dynamic based on which is choosen 
    edition: {                    // Combined static and dynamic editions
      values: edition_values
    },
    region: {                     // Combined static and dynamic editions
      values: region_values
    },
    imt: {                        // Combined static and dynamic IMTs
      values: imt_values
    },
    vs30: {                       // Combined static and dynamic Vs30
      values: vs30_values
    }
  };
  console.log("Combined Parameters: ");     console.log(parameters);   
  console.log("\n\n\n");
  //------------------------------------------------------------------------

  //.......................... Run Function ................................
  add_regions(); 
  //-----------------------------------------------------------------------

}); 


//--------------------------- End: Parameter Dependency --------------------------------------
//
//############################################################################################





//############################################################################################
//
//........................ Read in Parameter Dependency JSON File ............................ 

/*
- The sort_displayorder function takes a parameter, like edition, and sorts them based
  on the display order given in the two JSON files
- This function returns the subtraction of the display order values of two editions to see
  which one should be displayed first (a negative value return is displayed first)
*/

function sort_displayorder(a,b){
  return (a.displayorder - b.displayorder);
}      

//--------------------------- End: Parameter Dependency --------------------------------------
//
//############################################################################################




var comparable_region = [
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

function add_regions(){

  
  region_id.size = comparable_region.length; 

  for (var jcr in comparable_region){
    var option   = document.createElement("option");
    var region   = comparable_region[jcr];
    option.value = region.value;
    option.id    = region.value;
    option.text  = region.display
    region_id.add(option);
  }
  
  region_id.value = "COUS";
  add_editions();
}





function add_editions(){
  lat_id.value = null;                                // Reset the latitude values
  lon_id.value = null;                                // Reset the longitude values
  check_bounds();

  var jregion_select         = region_id.selectedIndex;                   // Get the selected edition index value 
  var region_select_value    = region_id.options[jregion_select].value;  // Get the selected edition from the edition menu  
  
  var noptions  = edition_id.options.length;           // Get length of options 
  for (var jr=0;jr<noptions;jr++){                    // Loop through all options and remove 
    edition_id.remove(0);
  }
 
  for (var jr in comparable_region){
    if (comparable_region[jr].value == region_select_value){ 
      var region_select = comparable_region[jr];
    }
  } 
  
  var nedition = 0;
  for (var je in parameters.edition.values){
    var option = document.createElement("option");
    var edition_value   = parameters.edition.values[je].value;
    var edition_display = parameters.edition.values[je].display;
    var region_supports = parameters.edition.values[je].supports.region; 
    for (var jsr in region_supports){
      if (region_supports[jsr] == region_select.static_value || region_supports[jsr] == region_select.dynamic_value){
        nedition +=1;
        option.value    = edition_value;
        option.id       = edition_value; 
        option.text     = edition_display;
        option.selected = true;
        edition_id.add(option);
      }
    }
  }
  edition_id.size = nedition; 
  add_options();                                      // Add other options based on selected region

}





//############################################################################################
//
//............................... Add Options to Select Menus ................................

/*
- The add_options functions adds the support parameters options to the corresponding 
  selections menu, either imt or vs30.
- The options that are added to the menus are based on what edition is selected.
*/

function add_options(){
  remove_options();     // Remove all previous menu item

  var edition_select = edition_id.selectedOptions;                            // Get the selected region index value 
  var jregion        = region_id.options.selectedIndex;
  var region_select  = region_id.options[jregion].value;   

  var supports = ["imt","vs30"];
  for (var jp in supports){
    var parameter_values = parameters[supports[jp]].values;
    var dom_id           = document.getElementById(supports[jp]);
    for (var jv in parameter_values){
      var option      = document.createElement("option");
      var value       = parameter_values[jv].value;
      var display     = parameter_values[jv].display;
      option.value    = value;
      option.id       = value;
      option.text     = display;
      option.disabled = true;
      dom_id.add(option);
    }
  }
  


  var nselect = edition_select.length;
  var all_imt  = [];
  var all_vs30 = [];

  for (var js=0;js<nselect;js++){
    var edition = edition_select[js].value;
    var jpar_edition = parameters.edition.values.findIndex(function(d,i){
      return d.value == edition;
    });
    var edition_supports = parameters.edition.values[jpar_edition].supports;
    for (var ji in edition_supports.imt){
      all_imt.push(edition_supports.imt[ji]);
    }
    for (var jv in edition_supports.vs30){
      all_vs30.push(edition_supports.vs30[jv]);
    }
  }

  var data_types  = ["static","dynamic"];
  var ndata_types = data_types.length;
  for (var jd in data_types){
    var jcom_region = comparable_region.findIndex(function(d,i){
      return d.value == region_select
    });
    region = comparable_region[jcom_region][data_types[jd]+"_value"];
    var jregion_supports = parameters.region.values.findIndex(function(d,i){
      return d.value == region;
    });
    var region_supports = parameters.region.values[jregion_supports].supports; 
    for (var ji in region_supports.imt){
      all_imt.push(region_supports.imt[ji]);
    }
    for (var jv in region_supports.vs30){
      all_vs30.push(region_supports.vs30[jv]);
    }
  }

  all_imt.sort();  
  all_vs30.sort();
  for(var jp in supports){
    var all_par = eval("all_"+supports[jp]);
    var dom_id = document.getElementById(supports[jp]);
    for (var ji in all_par){
      if (all_par.length == 0){break;}
      var par  = all_par[0];
      var npar = all_par.filter(function(d,i){return d==par}).length;
      if (npar == nselect+ndata_types){
        for (var jo=0;jo<dom_id.options.length;jo++){
          if (dom_id.options[jo].value == par){
            dom_id.options[jo].disabled = false;
            dom_id.value =par;
          }
        }
      }
      all_par = all_par.filter(function(d,i){return d!=par});
    } 
  } 


}

//----------------------------- End: Add Options ---------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Remove Options from Select Menus ...............................

/*
- The remove_options function will remove the selection options from the imt
  and the vs30 menus so that they can be repopullated based on what is supported 
  for the edition that was choosen
*/

function remove_options(){

  var ids = ["imt","vs30"];                             // Selection menu ids
  for (ji in ids){                                      // Loop through the menus
    var dom_id = document.getElementById(ids[ji]);      // Get the dom id from ids
    var noptions = dom_id.options.length;
    for (var jo=0;jo<noptions;jo++){                    // Loop through the number of options in each menu
      dom_id.remove(0);                                 // Remove each menu option
    }
  }
}

//----------------------------- End: Remove Options ------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Set Latitude and Longitude Bounds ..............................

/*
- The check_bounds function will look at the supported bounds for the region
  as stated in the parameter depenency JSON file. 
- The bounds are then add in the webpage under the text field to enter the values
*/

function check_bounds(is_submit){

  var jregion_select = region_id.selectedIndex;                     // Get the selected region index value 
  var region_select  = region_id.options[jregion_select].value;     // Get the selected region from the region menu
  var region_values  = parameters.region.values.find(function(d,i){    // Get the region values (parameters.region.values[region_index] in JSON file)
    return d.value == region_select;
  });
  var min_lat = region_values.minlatitude;                          // Get the minimum latitude value
  var max_lat = region_values.maxlatitude;                          // Get the maximum latitude value
  var min_lon = region_values.minlongitude;                         // Get the minimum longitude value
  var max_lon = region_values.maxlongitude;                         // Get the maximum longitude value
   
  lat_bounds_id.innerHTML = region_select + " bounds: " +
                              " ["+min_lat+","+max_lat+"]";         // Set the latitude bound text for the webpage (Example: Bounds for WUS [34.5,50.5])
  lon_bounds_id.innerHTML = region_select + " bounds: " +
                              " ["+min_lon+","+max_lon+"]";         // Set the longitude bound text for the webpage

  var lat = lat_id.value;                                           // Get latitude value
  var lon = lon_id.value;                                           // Get longitude value

  var can_submit_lat = false;                                       // Boolean to see if latitude is within bounds
  var can_submit_lon = false;                                       // Boolean to see if longitude is within bounds
  if (is_submit){                                                   // Check bounds 
    if (lat < min_lat || lat > max_lat){                            // Check to see if lat value exists and within bounds
      lat_bounds_id.style.color = "red";                            // Set text color to red if not in bounds
      can_submit_lat = false;                                       // Set flag false
      lat_bounds_id.innerHTML += "<br> Selected latitude is outside allowed bounds";
    }else{
      lat_bounds_id.style.color = "black";                          // If within bounds set text to black
      can_submit_lat = true;                                        // Set flag true
    }
    if (lon < min_lon || lon > max_lon){                            // Check to see if lon value exists and within bounds
      lon_bounds_id.style.color = "red";                            // Set text color to ref if not in bounds
      can_submit_lon = false;                                       // Set false
      lon_bounds_id.innerHTML += "<br> Selected longitude is outside allowed bounds";
    }else{
      lon_bounds_id.style.color = "black";                          // If within bounds set text to black
      can_submit_lon = true;                                        // Set true
    }
  }
  
  return [can_submit_lat,can_submit_lon];
}

//----------------------------- End: Set Bounds ----------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Get Menu Selections/Values  ....................................

/*
- The get_selctions function gets the selection/value from each of the menus, 
  edition, region, longitude, latitude, imt, and vs30.
- The function then calls either the static or dynamic web services based on the 
  edition choosen
*/

plot_btn_id.onclick = function(){                                             // When button is pressed, perform the following
  
  
    
  d3.selectAll("svg")           // Remove all svg tags for the plot element
    .remove();

  //.............. Get All Selections from the Menus ...................
  var menu_ids = ["region","lon","lat","imt","vs30"];               // Menu id strings for the selection menus
  var jre = 0; 
  var jlon = 1; var jlat = 2; 
  var jimt = 3; var jvs = 4;                                    // Indices for each corresponing selction string

  var selection_values = [];                                                  // Allocate an array to store the parameters
  
  for (var ji in menu_ids){                                                   // Loop through the menu ids
    var menu_id = menu_ids[ji];                                               // Set a single menu id
    var dom_id  = document.getElementById(menu_id);                           // Get the dom id of the menu id
    
    if (menu_id == "lon" || menu_id == "lat"){                                // If getting latitude or longitude, get the inputted value
      selection_values[ji] = dom_id.value;                                    // Get selection value
    }else{                                                                    // Else the value is selected from a menu
      selection_values[ji] = dom_id.options[dom_id.selectedIndex].value;      // Get selection value
    }
  }

  var selected_editions = edition_id.selectedOptions;
  //-------------------------------------------------------------------
  
  var can_submit = check_bounds(true);
  
  //................. Setup URLs to Submit .............................
  if (can_submit[0] && can_submit[1]){
    loader_id.style.display  = "initial";
    overlay_id.style.display = "initial";
    loader_text_id.innerHTML = "Calculating";
    
    var region_info = comparable_region.find(function(d,i){
      return d.value == selection_values[jre] 
    });
    var url_info = [];
    var nedition = selected_editions.length;
    for (var je=0;je<nedition;je++){
      var edition = parameters.edition.values.find(function(d,i){
        return d.value == selected_editions[je].value;
      });
      var data_type     = edition.data_type;
      var edition_value = edition.value;
      if (data_type == "static"){
        var region_value  = region_info.static_value;
        var url_base = "https://dev01-earthquake.cr.usgs.gov/hazws/staticcurve/1/";   // Set the URL base
        url_info[je] =  {
                          data_type: "static",
                          url: url_base +                                             // Construct the URL to call the nshmp-haz code
                          edition_value          + "/" +                              // Add edition to URL
                          region_value           + "/" +                              // Add region to URL
                          selection_values[jlon] + "/" +                              // Add longitude to URL
                          selection_values[jlat] + "/" +                              // Add latitude to URL
                          "any"                  + "/" +                              // Add IMT to URL (return all IMTs)
                          selection_values[jvs]                                       // Add vs30 to URL
                        };
      }else if (data_type == "dynamic"){
        var region_value  = region_info.dynamic_value;
        var url_base = "https://dev01-earthquake.cr.usgs.gov/nshmp-haz-ws/hazard";    // Set the URL base
        url_info[je] = {data_type: "dynamic"};
        url_info[je] =  {
                          data_type: "dynamic",
                          url: url_base +                                             // Construct the URL to call the nshmp-haz code
                          "?edition="   + edition_value           +                   // Add edition to URL
                          "&region="    + region_value            +                   // Add region to URL
                          "&longitude=" + selection_values[jlon]  +                   // Add longitude to URL
                          "&latitude="  + selection_values[jlat]  +                   // Add latitude to URL
                          "&vs30="      + selection_values[jvs]                       // Add vs30 to URL
                        };
      }
    }

    get_hazard(url_info); 

    //..................... get raw data button ..................
    raw_btn_id.onclick = function(){            // call the nshmp-haz code by opening it in a new tab
      for (var ju in url){
        window.open(url[ju]);
      }                     
    };
    //-----------------------------------------------------------
  }
  //--------------------------------------------------------------------

} 

//---------------------- End: Get Menu Selections/Values -------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Call Dynamic Web Services  .....................................

/*
Format of URL:
https://earthquake.usgs.gov/nshmp-haz-ws/hazard?edition=value&region=value&longitude=value&latitude=value&imt=value&vs30=value

Where:

- edition [E2008, E2014, E2007]
- region [COUS, WUS, CEUS, AK]
- longitude (-360..360) °
- latitude [-90..90] °
- imt (intensity measure type) [PGA, SA0P2, SA1P0]
- vs30 [180, 259, 360, 537, 760, 1150, 2000] m/s
*/
//---------------------- End: Call Dynamic Web Services --------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Call Static Web Services  ......................................

/*
  Format of URL:
  https://earthquake.usgs.gov/hazws/staticcurve/1/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}"

Where:

- edition [E2014R1, E2008R3, E2008R2, E2007R1, E1998R1, E2003R1, E2012R1, E2012R2]
- region [COUS0P05, WUS0P05, CEUS0P10, AK0P10, HI0P02, PRVI0P01, GNMI0P10, AMSAM0P05]
- longitude (-360..360) °
- latitude [-90..90] °
- imt (intensity measure type) [PGA, SA0P1, SA0P2, SA0P3, SA0P5, SA0P75, SA1P0, SA2P0, SA3P0, SA4P0, SA5P0]
- vs30 [180, 259, 360, 537, 760, 1150, 2000] m/s
*/
//---------------------- End: Call Static Web Services ---------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Call the nshmp-haz Code Given URL ..............................

/*
- The get_hazard function call the nshmp-haz code and reads in the JSON file that is 
  generated by the nshmp-haz code
- The function takes in one argument, url. The url is the URL that is created in 
  the get_selections function.
*/

function get_hazard(url_info){
  
  var json_return = [];
  for (var ju in url_info){
    var data = url_info[ju].data_type;
    json_return[ju] = $.getJSON(url_info[ju].url);
  }

  var response = []; 
  $.when.apply(this,json_return).done(function(d,i){
    for (var jr in json_return){
      var response_json = json_return[jr].responseJSON;
      var url_check = response_json.url;
      for (var ju in url_info){
        if (url_check == url_info[ju].url){
         response_json.response.data_type = url_info[ju].data_type;
        }
      }
      var stat = response_json.status;
      if (stat == "success"){
        response[jr] = response_json.response;
      }
    }
    plot_setup();
    hazard_plot(response);                              // Plot the response
  });
 
}


//---------------------- End: Call nshmp-haz Code --------------------------------------------
//
//############################################################################################





//############################################################################################
//
//........................... Plot Setup .....................................................

var plot_size_min = "col-lg-8 col-lg-offset-2";
var plot_size_max = "col-lg-12";

function plot_setup(){
  hazard_panel_id.style.display    = "initial";  
  hazard_panel_id.className        = plot_size_max; 
  hazard_plot_id.style.height      = "40vw";
  hazard_resize_id.className       = "glyphicon glyphicon-resize-small";
  
}
//---------------------- End: Plot Setup -----------------------------------------------------
//
//############################################################################################



//############################################################################################
//
//........................... Resize Plot ....................................................

function panel_resize(plot_name){
  var resize_id = document.getElementById(plot_name+"-plot-resize");
  var panel_id  = document.getElementById(plot_name+"-plot-panel"); 
  var plot_id   = document.getElementById(plot_name+"-curves-plot"); 
  if (panel_id.className == plot_size_min){
    resize_id.className = "glyphicon glyphicon-resize-small";
    panel_id.className = plot_size_max;
    plot_id.style.height = "40vw";
  }
  else if (panel_id.className == plot_size_max){
    resize_id.className = "glyphicon glyphicon-resize-full";
    panel_id.className = plot_size_min; 
    plot_id.style.height = "24vw";
  }
}
//---------------------- End: Resize Plot  ---------------------------------------------------
//
//############################################################################################



/*
function plot_collapse(plot_name){
  var plot_collapse_id = document.getElementById(plot_name+"-plot-collapse");
  var arrow_up    = "glyphicon glyphicon-chevron-up";
  var arrow_down  = "glyphicon glyphicon-chevron-down";
  
  if (plot_collapse_id.className == arrow_up){
    plot_collapse_id.className = arrow_down;
  }
  else{
    plot_collapse_id.className = arrow_up;
  }
}
*/


function set_data(response,plot_id){

  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;   // Get the IMT selection
  var selected_imt_value   = imt_id.options[imt_id.selectedIndex].value;  // Get the IMT selection

  var series_data           = [];       // Array to hold the total component x,y data for D3  
  var series_label_displays = [];       // Array to hold the label displays 
  var series_label_values   = [];       // Array to hold the label values

  for (var jr in response){
    var res       = response[jr];
    var data_type = res.data_type; 
    res = res.find(function(d,i){
     return d.metadata.imt.value == selected_imt_value;
    });
    var data = res.data;
    
    //.................. JSON Variables based on Edition Type ..................
    if (data_type == "dynamic"){        // If using dynamic edition
      var xvalue_variable = "xvalues";
      var yvalue_variable = "yvalues";
      var jtotal          = data.findIndex(function(d,i){return d.component == "Total"});     // Return the index for the Total component
    }else if (data_type == "static"){   // If using static edition
      var xvalue_variable = "xvals";
      var yvalue_variable = "yvals";
      var jtotal          = 0;
    } 
    //--------------------------------------------------------------------------
  
    xvalues                   = res.metadata[xvalue_variable];
    series_data[jr]           = d3.zip(xvalues,data[jtotal][yvalue_variable]);                    // Create the array of x,y pairs for D3
    series_label_displays[jr] = res.metadata.edition.display;                                // Create the array of labels
    series_label_values[jr]   = res.metadata.edition.value;
  }
  
  //.................. Get Axis Information ..................................
  var metadata = response[0][0].metadata;          // Get metadata of a response
  var xlabel   = metadata.xlabel;                // Get X label 
  var ylabel   = metadata.ylabel;                // Get Y label
  //--------------------------------------------------------------------------
  

  //.................... Plot Info Object for D3 .............................
  var plot_info = {                       // Plot info object
    series_data:            series_data,     // Series data to plot
    series_label_displays:  series_label_displays,   // Series labels
    series_label_values:     series_label_values,
    xvalues:       xvalues,               // X values
    xlabel:        xlabel,                // X label
    ylabel:        ylabel,                // Y label
    plot_id:       plot_id,               // DOM ID for plot
    margin:       {top:30,right:15,bottom:50,left:70},  // Margin for D3
    resize:       "hazard"                // DOM ID for resize element 
  };
  //--------------------------------------------------------------------------
  
  return plot_info;

}




//############################################################################################
//
//........................... Plot Hazard Curves .............................................

function hazard_plot(response){
  
  loader_id.style.display  = "none";
  overlay_id.style.display = "none";

  var plot_id  = "hazard-curves-plot";                                     // DOM ID of hazard plot element 
  var title_id = document.getElementById("hazard-plot-text");

  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;   // Get the IMT selection
  var selected_imt_value   = imt_id.options[imt_id.selectedIndex].value;  // Get the IMT selection
   
  var plot_info = set_data(response,plot_id);  
  console.log("\n\n Hazard Plot Information: ");    console.log(plot_info);
  plot_curves(plot_info);                 // Plot the curves
  plot_hazard_selection(plot_id);
  title_id.innerHTML = " at " + selected_imt_display;

  //................ Update Plot on IMT Menu Change ..........................
  imt_id.onchange = function(){                                             // When the selection menu of IMT changes, update selected IMT on plot and component plot
    var plot_info = set_data(response,plot_id);
    plot_curves(plot_info);
    plot_hazard_selection(plot_id); 
    selected_imt_display = imt_id.options[imt_id.selectedIndex].text;   // Get the IMT selection
    title_id.innerHTML = " at " + selected_imt_display;
  };      
  //--------------------------------------------------------------------------
  
} 



function plot_hazard_selection(plot_id){

  //.................. Highlight Line when Selected on Plot ..................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .selectAll(".data")                                         // Select all data, lines and circles 
    .on("click",function(d,i){                                  // If a circle or line is clicked, increase stroke-widtd
      var selected_edition_value = d3.select(this).attr("id");      // Get selected id

      plot_selection_reset(plot_id);                            // Remove any current IMT selection on plot
      plot_selection(plot_id,selected_edition_value);               // Update plot with new selection
    }); 
  //--------------------------------------------------------------------------
  
  //.............. Highlight Line when Legend Entry Selected .................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .select(".legend")                                          // Select legend
    .selectAll(".legend-entry")                                 // Select all legend entrys
    .on("click",function(d,i){                                  // If a legend entry is clicked, highlight corresponding line
      var selected_edition_value = d3.select(this).attr("id");      // Get selected id
                                    
      plot_selection_reset(plot_id);                            // Remove any current slections from plot     
      plot_selection(plot_id,selected_edition_value);               // Update with new selection
    });
  //--------------------------------------------------------------------------
      

  //.............. Add Tooltip on Hover over a Point ..........................
  d3.select("#"+plot_id + " svg")                                       // Get plot svg
    .select(".all-data")                                                // Select data group
    .selectAll(".dot")                                                  // Select all circles
    .on("mouseover",function(d,i){                                      // If a the mouse pointer is over a circle, add tooltip about that circle
      var xval = d3.select(this).data()[0][0];                          // Get ground motion value
      var yval = d3.select(this).data()[0][1].toExponential(4);         // Get annual exceedece value
      var edition_value   = d3.select(this.parentNode).attr("id");          // Get the selected id of the data group
      var edition_display = edition_id.options[edition_value].text;                 // Get the IMT display from the menu
      var tooltip_text = [                                              // Set the tooltip text
        "Edition: "+ edition_display,
        "GM (g): " + xval,
        "AFE: "    + yval]
      var tooltip_width  = 265;                                         // Set the tooltip box height
      var tooltip_height = 60;                                          // Set the tooltip box width
      tooltip_mouseover(plot_id,this,tooltip_height,tooltip_width,tooltip_text);      // Make tooltip
    })
    .on("mouseout",function(d,i){                                       // When mouse pointer leaves circle, remove tooltip
      tooltip_mouseout(plot_id,this);
    });
  //--------------------------------------------------------------------------

}

//---------------------- End: Plot Hazard Curves --------------------------------------------
//
//############################################################################################




