


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

var overlay_id     = document.getElementById("overlay");
var loader_id      = document.getElementById("loader");
var loader_text_id = document.getElementById("loader-text");
loader_text_id.innerHTML = "Getting Menu";
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
          - edition_values
          - region_values
          - imt_values
          - vs30_values
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
  
  //.................. Combine Static and Dynamic Parameters ...............
  edition_values = static_parameters.edition.                             // Global variable: Combine the static and dynamic editions
                        values.concat(dynamic_parameters.edition.values);
  region_values  = static_parameters.region.                              // Global variable: Combine the static and dynamic regions
                        values.concat(dynamic_parameters.region.values);
  imt_values     = static_parameters.imt.values;                          // Global variable: Combine the static and dynamic IMTs
  vs30_values    = static_parameters.vs30.values;                         // Global variable: Combine the static and dynamic Vs30 values

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
  add_editions();                 // Add editions to menu
  add_regions();                  // Add regions to menu
  add_options();                  // Add all other options based on edition and regions selected
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




//############################################################################################
//
//............................... Add Editions to Select Menu ...............................

/*
- The add_editions functions adds all editions to the edition selection menu based on 
  what is defined in the JSON parameter dependency file.

- NOTE: This functions uses the global variable parameters from parameter_dependency function
*/

function add_editions(){

  var edition_default = "E2008";                        // On startup the default edition will be E2008
  var nedition        = edition_values.length;          // Get how many editions there are
  edition_id.size     = nedition;                       // Set menu size 
 
  for (var je in edition_values){                       // Loop through each edition and add that edition as an option in selection menu
    var option    = document.createElement("option");   // Create an option element 
    var value     = edition_values[je].value;
    var display   = edition_values[je].display;
    display       = display.replace("&amp;","&");
    option.text   = display;                            // Set the selection option's text based on the edition display key (parameters.edition.values[index].display) [Example: Dynamic: Conterminous U.S. 2008 (v3.3.1)] 
    option.value  = value;                              // Set the selection option's value based on the edition value key (parameters.edition.values[index].value) [Example: E2008]
    edition_id.add(option);                             // Add the options to the edition selection menu
  }
  edition_id.value = edition_default;                   // Set the selection menu to the default edition
}

//----------------------------- End: Add Editions --------------------------------------------
//
//############################################################################################



//############################################################################################
//
//............................... Add Regions to Select Menu ................................

/*
- The add_regions functions adds all regions to the region selection menu based on 
  what is defined in the JSON parameter dependency file.
- The selectable regions are based on the supported regions from the selected edition

- NOTE: This functions uses the global variable parameters from parameter_dependency function
*/

function add_regions(){

  var jedition_select   = edition_id.selectedIndex;                   // Get the selected edition index value 
  var edition_select    = edition_id.options[jedition_select].value;  // Get the selected edition from the edition menu  
  var edition_supports  = edition_values[jedition_select].supports;   // Get the selected edition's support parameters (parameters.edition.values[index].supports in JSON file) 
  var supported_regions = edition_supports.region;                    // Get the supported regions of the choosen edition 
  var parameter_regions = parameters.region.values;                   // Get all the parameter region values (parameters.region.values in JSON file)
  
  
  var noptions  = region_id.options.length;           // Get length of options 
  for (var jr=0;jr<noptions;jr++){                    // Loop through all options and remove 
    region_id.remove(0);
  }
  
  lat_id.value = null;                                // Reset the latitude values
  lon_id.value = null;                                // Reset the longitude values

  for (var jp in parameter_regions){                  // Loop through the edition supported region values
    var option   = document.createElement("option");  // Create an option element 
    var value    = parameter_regions[jp].value;       // Get region value   
    var display  = parameter_regions[jp].display;     // Get region display
    display      = display.replace("&amp;","&");
    option.id    = value;                             // Create an id based on the value
    option.text  = display;                           // Create the text to show on menu based on the display 
    option.value = value;                             // Set the selection option's value (parameters.region.values[index].value) 
    region_id.add(option);                            // Add the options to the region menu
    option_id    = document.getElementById(value);
    option_id.disabled = true;
    for (var jsv in supported_regions){               // Loop through the supported regions of an edition (parameters.edition.values[edition_index].supports in JSON file)
      if (supported_regions[jsv] == value)            // Find the matching value to set the text from the display key (parameters.region.WUS.display in JSON file) [Example: Western US]
      {option_id.disabled = false;}
    }
  }
  var region_default = supported_regions[0];          // Get default region value
  region_id.value = region_default;                   // Set value in menu
  
  add_options();                                      // Add other options based on selected region

}

//----------------------------- End: Add Regions ---------------------------------------------
//
//############################################################################################





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

  var jregion_select    = region_id.selectedIndex;                            // Get the selected region index value 
  var region_select     = region_id.options[jregion_select].value;            // Get the selected region from the region menu
  var region_supports   = region_values[jregion_select].supports;             // Get the selected region's support parameters (parameters.region.values[index].supports in JSON file) 
  
  var parameter_defaults = {                                                  // Variable for parameter defaults to first supported value
       imt:  region_supports.imt[0],                                          // IMT default
       vs30: region_supports.vs30[0]                                          // Vs30 default 
    }
  var supports = ["imt","vs30"];                                              // The edition support strings
  
  for (js in supports){                                                       // Loop through the supported variables (imt and vs30)
    var dom_id           = document.getElementById(supports[js]);             // Get to dom id of the supported variable for the selection menu
    var supported_values = region_supports[supports[js]];                   // Set string to get the supported parameters of each variable (example: region_supports.imt) 
    var parameter_values = parameters[supports[js]].values;                        // Set string to get the parameter values of each supported variable (parameters.imt) 

    
    for (var jp in parameter_values){                                         // Loop through the edition support values
      var option    = document.createElement("option");                       // Create an option element 
      var value     = parameter_values[jp].value;
      var display   = parameter_values[jp].display;
      display       = display.replace("&amp;","&");
      option.id     = value;                                                  // Set an id based on value
      option.text   = display;                                                // Set display
      option.value  = value;                                                  // Set the selection options values 
      dom_id.add(option);                                                     // Add the options to the menus of imt and vs30
      option_id = document.getElementById(parameter_values[jp].value);        // Get dom id of option
      option_id.disabled = true;                                              // Set all to disabled at first
      for (var jsv in supported_values){                                      // Loop through the parameter values for a supported variable (parameters.imt in JSON file)
        if (supported_values[jsv] == parameter_values[jp].value)              // Find the matching value to set the text from the display key 
        {option_id.disabled   = false;}
      }
    }
    dom_id.value = supported_values[0];                                       // Set the default value to Please Select ... 
  } 
  check_bounds();                                                             // Show the bounds for selected region

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
  var region_values  = parameters.region.values[jregion_select];    // Get the region values (parameters.region.values[region_index] in JSON file)
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
  
  
  d3.selectAll("svg")
    .remove();

  //.............. Get All Selections from the Menus ...................
  var menu_ids = ["edition","region","lon","lat","imt","vs30"];               // Menu id strings for the selection menus
  var jed = 0; var jre = 1; var jlon = 2; 
  var jlat = 3; var jimt = 4; var jvs = 5;                                    // Indices for each corresponing selction string

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
  //-------------------------------------------------------------------

  var can_submit = check_bounds(true);

  //................. Check If Static or Dynamic Edition ..............
  if (can_submit[0] && can_submit[1]){
    loader_id.style.display  = "initial";
    overlay_id.style.display = "initial";
    loader_text_id.innerHTML = "Calculating";

    var edition_selection = selection_values[jed];                              // Get selected edition 
    var static_edition_values  = static_parameters.edition.values;              // Get all static edition values
    var dynamic_edition_values = dynamic_parameters.edition.values;             // Get all dynamic edition values
    for (var je in dynamic_edition_values){                                     // Loop through all dynamic editions 
      if (edition_selection == dynamic_edition_values[je].value){               // Check if selected edition is dynamic
        parameters.type = "dynamic";                                            // If using dynamic set the type 
        dynamic_call(selection_values);                                         // Use dynamic web services
      }
    }
    for (var je in static_edition_values){                                      // Loop through all static editions
      if (edition_selection == static_edition_values[je].value){                // Check if selected edition is static
        parameters.type = "static";                                             // If using static set the type
        static_call(selection_values);                                          // Use static web services
      }
    }
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

function dynamic_call(selection_values){

  //.................... Setup URL .............................
  var jed = 0; var jre = 1; var jlon = 2; var jlat = 3; var jimt = 4; var jvs = 5;          // Indices for each corresponing selction string
  var url_base = "https://dev01-earthquake.cr.usgs.gov/nshmp-haz-ws/hazard";                // Set the URL base
  var url = url_base +                                                                      // Construct the URL to call the nshmp-haz code
            "?edition="+selection_values[jed]    +                                          // Add edition to URL
            "&region="+selection_values[jre]     +                                          // Add region to URL
            "&longitude="+selection_values[jlon] +                                          // Add longitude to URL
            "&latitude="+selection_values[jlat]  +                                          // Add latitude to URL
            "&vs30="+selection_values[jvs];                                                 // Add vs30 to URL
  //-----------------------------------------------------------

  get_hazard(url);                                                                        // Call get_hazard function           
  
  //..................... Get Raw Data Button ..................
  raw_btn_id.onclick = function(){
    window.open(url);                                                                       // Call the nshmp-haz code by opening it in a new tab
  };
  //-----------------------------------------------------------

}
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

function static_call(selection_values){

  //.................... Setup URL .............................
  var jed = 0; var jre = 1; var jlon = 2; var jlat = 3; var jimt = 4; var jvs = 5;          // Indices for each corresponing selction string
  var url_base = "https://dev01-earthquake.cr.usgs.gov/hazws/staticcurve/1/";               // Set the URL base
  var url = url_base +                                                                      // Construct the URL to call the nshmp-haz code
            selection_values[jed]  + "/" +                                                  // Add edition to URL
            selection_values[jre]  + "/" +                                                  // Add region to URL
            selection_values[jlon] + "/" +                                                  // Add longitude to URL
            selection_values[jlat] + "/" +                                                  // Add latitude to URL
            "any"                  + "/" +                                                  // Add IMT to URL (return all IMTs)
            selection_values[jvs];                                                          // Add vs30 to URL
  //-----------------------------------------------------------

  get_hazard(url);                                                                        // Call get_hazard function           

  //..................... Get Raw Data Button ..................
  raw_btn_id.onclick = function(){
    window.open(url);                                                                       // Call the nshmp-haz code by opening it in a new tab
  };
  //-----------------------------------------------------------

}
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

function get_hazard(url){

  $.getJSON(url,function(json_return){                    // Get the JSON file that the code generates
    var status = json_return.status;                      // Get the status of the return 
    if (status == "success"){                             // If the code returned a success then get the response from the JSON file
      var response = json_return.response;                // Get the respose from the JSON file
      plot_setup();
      hazard_plot(response);                              // Plot the response
    }
    else if (status == "error"){                          // If code returned an error, print to screen
      hazard_plot_id.innerHTML = "Status: " + status + "<br>" + json_return.message + "<br>";
    } 
  });

}
//---------------------- End: Call nshmp-haz Code --------------------------------------------
//
//############################################################################################





//############################################################################################
//
//........................... Plot Setup .....................................................

var plot_size_min = "col-lg-6";
var plot_size_max = "col-lg-12";

function plot_setup(){

  var type = parameters.type;

  if (type == "dynamic"){
    hazard_panel_id.style.display    = "initial";  
    hazard_panel_id.className        = plot_size_min;  
    component_panel_id.style.display = "initial";  
    component_panel_id.className     = plot_size_min;  
    hazard_plot_id.style.height      = "24vw";
    component_plot_id.style.height   = "24vw";
    hazard_resize_id.className       = "glyphicon glyphicon-resize-full";
    component_resize_id.className    = "glyphicon glyphicon-resize-full";
  }else if (type == "static"){
    hazard_panel_id.style.display    = "initial";  
    component_panel_id.style.display = "none";
    hazard_panel_id.className        = plot_size_max; 
    hazard_plot_id.style.height      = "35vw";
    hazard_resize_id.className       = "glyphicon glyphicon-resize-small";
  } 
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
    plot_id.style.height = "35vw";
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




//############################################################################################
//
//........................... Plot Hazard Curves .............................................

function hazard_plot(response){

  loader_id.style.display  = "none";
  overlay_id.style.display = "none";

  var plot_id = "hazard-curves-plot";                                     // DOM ID of hazard plot element 
  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;    // Get the IMT selection
  
  //.................. JSON Variables based on Edition Type ..................
  if (parameters.type == "dynamic"){        // If using dynamic edition
    var xvalue_variable = "xvalues";
    var yvalue_variable = "yvalues";
  }else if (parameters.type == "static"){   // If using static edition
    var xvalue_variable = "xvals";
    var yvalue_variable = "yvals";
  } 
  //--------------------------------------------------------------------------

  //.................. Get Axis Information ..................................
  var metadata = response[0].metadata;          // Get metadata of a response
  var xlabel  = metadata.xlabel;                // Get X label 
  var ylabel  = metadata.ylabel;                // Get Y label
  //--------------------------------------------------------------------------
    
  //................. Get Total Hazard Data ..................................
  var total_hazard_data   = [];                 // Array to hold the total component x,y data for D3  
  var total_hazard_labels = [];                 // Array to hold the labels
  var imt_values          = [];
  for (var jr in response){
    var data                = response[jr].data;                                                // Get the data for each response
    if (parameters.type == "dynamic"){
      var jtotal             = data.findIndex(function(d,i){return d.component == "Total"});     // Return the index for the Total component
    }else{
      var jtotal            = 0;
    }
    xvalues = response[jr].metadata[xvalue_variable];
    total_hazard_data[jr]   = d3.zip(xvalues,data[jtotal][yvalue_variable]);                    // Create the array of x,y pairs for D3
    total_hazard_labels[jr] = response[jr].metadata.imt.display;                                // Create the array of labels
    imt_values[jr]          = response[jr].metadata.imt.value;
  }
  //--------------------------------------------------------------------------

  //.................... Plot Info Object for D3 .............................
  var plot_info = {                       // Plot info object
    series_data:            total_hazard_data,     // Series data to plot
    series_label_displays:  total_hazard_labels,   // Series labels
    series_label_values:    imt_values,
    xlabel:        xlabel,                // X label
    ylabel:        ylabel,                // Y label
    plot_id:       plot_id,               // DOM ID for plot
    margin:       {top:30,right:15,bottom:50,left:70},  // Margin for D3
    resize:       "hazard"                // DOM ID for resize element 
  };
  console.log("Hazard Plot Information: ");    console.log(plot_info);
  console.log("\n\n");
  plot_curves(plot_info);                 // Plot the curves
  //--------------------------------------------------------------------------

  //............... Highlight Selected IMT ...................................
  var selected_imt_value = imt_id.options[imt_id.selectedIndex].value;    // Get selected IMT value 
  plot_selection(plot_id,selected_imt_value);                             // Have selected IMT be highlighted on plot
  //--------------------------------------------------------------------------

  //........ Call Component Curves when using Dynamic Edition ................
  if (parameters.type == "dynamic"){                                        // If using dynamic edition
    component_curves_plot(response);                                        // Plot component curves      
  }
  //--------------------------------------------------------------------------

  //................ Update Plot Selection on IMT Menu Change ................
  imt_id.onchange = function(){                                             // When the selection menu of IMT changes, update selected IMT on plot and component plot
    var selected_imt_value = imt_id.options[imt_id.selectedIndex].value;    // Get selected IMT value
    plot_selection_reset(plot_id);                                          // Remove any current IMT selection on plot
    plot_selection(plot_id,selected_imt_value);                             // Update with new selection
    if (parameters.type == "dynamic"){                                      // If using dynamic
      component_curves_plot(response);                                      // Plot component curves with new selection
    }
  };      
  //--------------------------------------------------------------------------

  //.................. Highlight Line when Selected on Plot ..................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .selectAll(".data")                                         // Select all data, lines and circles 
    .on("click",function(d,i){                                  // If a circle or line is clicked, increase stroke-widtd
      var selected_imt_value = d3.select(this).attr("id");      // Get selected id
      imt_id.value = selected_imt_value;                        // Update IMT menu to have selected IMT value

      plot_selection_reset(plot_id);                            // Remove any current IMT selection on plot
      plot_selection(plot_id,selected_imt_value);               // Update plot with new selection

      if (parameters.type == "dynamic"){                        // If using dynamic edition
        component_curves_plot(response);                        // Plot component curves with new selection
      }
    }); 
  //--------------------------------------------------------------------------
  
  //.............. Highlight Line when Legend Entry Selected .................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .select(".legend")                                          // Select legend
    .selectAll(".legend-entry")                                 // Select all legend entrys
    .on("click",function(d,i){                                  // If a legend entry is clicked, highlight corresponding line
      var selected_imt_value = d3.select(this).attr("id");      // Get selected id
      imt_id.value = selected_imt_value;                        // Update IMT menu to have selected IMT value
                                    
      plot_selection_reset(plot_id);                            // Remove any current slections from plot     
      plot_selection(plot_id,selected_imt_value);               // Update with new selection

      if (parameters.type == "dynamic"){                        // If using a dynamic edition
        component_curves_plot(response);                        // Plot component curves with new selection
      }
    });
  //--------------------------------------------------------------------------
      

  //.............. Add Tooltip on Hover over a Point ..........................
  d3.select("#"+plot_id + " svg")                                       // Get plot svg
    .select(".all-data")                                                // Select data group
    .selectAll(".dot")                                                  // Select all circles
    .on("mouseover",function(d,i){                                      // If a the mouse pointer is over a circle, add tooltip about that circle
      var xval = d3.select(this).data()[0][0];                          // Get ground motion value
      var yval = d3.select(this).data()[0][1].toExponential(4);         // Get annual exceedece value
      var imt_value   = d3.select(this.parentNode).attr("id");          // Get the selected id of the data group
      var imt_display = imt_id.options[imt_value].text;                 // Get the IMT display from the menu
      var tooltip_text = [                                              // Set the tooltip text
        "IMT: "    + imt_display,
        "GM (g): " + xval,
        "AFE: "    + yval]
      var tooltip_width  = 225;                                         // Set the tooltip box height
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



//############################################################################################
//
//........................... Plot Compnent Curves ...........................................

function component_curves_plot(response){

  var plot_id = "component-curves-plot";      // DOM ID for component plot element
  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;
  var selected_imt_value   = imt_id.options[imt_id.selectedIndex].value;
  var title_id             = document.getElementById("component-plot-text");
  title_id.innerHTML       = " for " + selected_imt_display;
 
  //.................. Get Axis Information ..................................
  //--------------------------------------------------------------------------
    
  //................. Get Component Hazard Data ..............................
  var component_hazard_data   = [];                           // Array for component x,y pair data for D3
  var component_hazard_labels = [];                           // Array for component labels
  var jimt = response.findIndex(function(d,i){                // Find the response index for IMT selection
    return d.metadata.imt.value == selected_imt_value;
  });

  var metadata = response[jimt].metadata;       // Get metadata from a response
  var xlabel  = metadata.xlabel;                // Get X label
  var ylabel  = metadata.ylabel;                // Get Y label
  
  var data = response[jimt].data.filter(                      // Get all data except the total component
    function(d,i){return d.component != "Total";}
  );
  
  data.forEach(function(d,i){                                 // Loop through each component
    component_hazard_data[i]   = d3.zip(xvalues,d.yvalues);   // Set x,y pair 
    component_hazard_labels[i] = d.component;                 // Set label
  });
  //--------------------------------------------------------------------------

  //.................... Plot Info Object for D3 .............................
  var plot_info = {                           // Plot info object
    series_data:            component_hazard_data,     // Series data to plot
    series_label_displays:  component_hazard_labels,   // Series labels
    series_label_values:    component_hazard_labels,
    xlabel:        xlabel,                    // X label
    ylabel:        ylabel,                    // Y label
    plot_id:       plot_id,                   // DOM ID for plot
    margin:       {top:20,right:50,bottom:50,left:70},  // Margin for D3
    resize:       "component"                 // DOM ID for resize element 
  };
  console.log("Component Plot Information: ");    console.log(plot_info);
  console.log("\n\n");
  plot_curves(plot_info);                     // Plot the curves
  //--------------------------------------------------------------------------
 
   
  //.................. Highlight Line when Selected on Plot ..................
  d3.select("#"+plot_id + " svg")                             // Get plot svg
    .selectAll(".data")                                       // Select all data
    .on("click",function(d,i){                                // If any data is selected, highlight the corresponds line and dots
      var selected_component = d3.select(this).attr("id");    // Get selected line id

      plot_selection_reset(plot_id);                          // Remove any current selections
      plot_selection(plot_id,selected_component);             // Update new selection
    }); 
  //--------------------------------------------------------------------------
  

  //.............. Highlight Line when Legend Entry Selected .................
  d3.select("#"+plot_id + " svg")                             // Get plot svg
    .select(".legend")                                        // Select legend
    .selectAll(".legend-entry")                               // Select all legend entrys
    .on("click",function(d,i){                                // If any legend entry is selected, highlight cooresponding line and dots
      var selected_component = d3.select(this).attr("id");    // Get selected legend id

      plot_selection_reset(plot_id);                          // Remove any current selections
      plot_selection(plot_id,selected_component);             // Update new selection
    });
  //--------------------------------------------------------------------------


  //.............. Add Tooltip on Hover over a Point ..........................
  d3.select("#"+plot_id + " svg")                                     // Get plot svg
    .select(".all-data")                                              // Select main data group
    .selectAll(".dot")                                                // Select all dots
    .on("mouseover",function(d,i){                                    // If mouse is over a dot, put up a tooltip 
      var selection_id   = d3.select(this.parentNode).attr("id");     // Get selection id of data group
      var xval = d3.select(this).data()[0][0];                        // Get the ground motion value
      var yval = d3.select(this).data()[0][1].toExponential(4);       // Get the exceedence value
      var tooltip_text = [                                            // Setup the tooltip text
        selection_id ,                                                // Component type
        "GM (g): " + xval,                                            // Ground moition value
        "AFE: "    + yval]                                            // Exceedence value
      
      var tooltip_width  = 115;                                       // Set the tooltip box height
      var tooltip_height = 60;                                        // Set the tooltip box width
      tooltip_mouseover(plot_id,this,tooltip_height,tooltip_width,tooltip_text);                   // Add tool tip 

    })
    .on("mouseout",function(d,i){                                     // When mouse pointer leaves dot, remove tooltip
      tooltip_mouseout(plot_id,this);                                 // Remove tooltip
    });
  //--------------------------------------------------------------------------


} 
//---------------------- End: Plot Component Curves ------------------------------------------
//
//############################################################################################





