


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
var submit_btn_id = document.getElementById("submit_url");                  // Plot button id 
var raw_btn_id    = document.getElementById("raw_json");                    // Raw Data button id 
var hazard_panel_id     = document.getElementById("hazard-plot-panel");     // Hazard plot panel id
var hazard_plot_id      = document.getElementById("hazard-curves-plot");    // Hazard plot id
var hazard_resize_id    = document.getElementById("hazard-plot-resize");    // Hazard plot resize glyphicon id
var component_panel_id  = document.getElementById("component-plot-panel");  // Component plot panel id
var component_plot_id   = document.getElementById("component-curves-plot"); // Component plot id
var component_resize_id = document.getElementById("component-plot-resize"); // Component plot resize glyphicon id

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
    var supported_values = "region_supports."+supports[js];                   // Set string to get the supported parameters of each variable (example: region_supports.imt) 
    supported_values     = eval(supported_values);                            // Evaluate string to get the supported parameters (parameters.region.values[region_index].supports[support_index] in JSON file)
    var parameter_values = "parameters."+supports[js];                        // Set string to get the parameter values of each supported variable (parameters.imt) 
    parameter_values     = eval(parameter_values).values;                     // Evaluate string to get the parameter values (parameters.imt in JSON file)

    
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

submit_btn_id.onclick = function(){                                           // When button is pressed, perform the following
  
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
  var xvalues = metadata[xvalue_variable];      // Get X values, same for all responses
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
    total_hazard_data[jr]   = d3.zip(xvalues,data[jtotal][yvalue_variable]);                    // Create the array of x,y pairs for D3
    total_hazard_labels[jr] = response[jr].metadata.imt.display;                                // Create the array of labels
    imt_values[jr]          = response[jr].metadata.imt.value;
  }
  //--------------------------------------------------------------------------

  //.................... Plot Info Object for D3 .............................
  var plot_info = {                       // Plot info object
    series_data:   total_hazard_data,     // Series data to plot
    series_labels: total_hazard_labels,   // Series labels
    series_imt:    imt_values,
    xvalues:       xvalues,               // X values
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
      var cx   = parseFloat(d3.select(this).attr("cx"));                // Get X location of circle
      var cy   = parseFloat(d3.select(this).attr("cy"));                // Get Y location of circle
      var xval = d3.select(this).data()[0][0];                          // Get ground motion value
      var yval = d3.select(this).data()[0][1].toExponential(4);         // Get annual exceedece value
      var imt_value   = d3.select(this.parentNode).attr("id");          // Get the selected id of the data group
      var imt_display = imt_id.options[imt_value].text;                 // Get the IMT display from the menu
      var tooltip_text = [                                              // Set the tooltip text
        "IMT: "    + imt_display,
        "GM (g): " + xval,
        "AFE: "    + yval]
      tooltip_mouseover(plot_id,this,cx,cy,tooltip_text);               // Make tooltip
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
  var metadata = response[0].metadata;        // Get metadata from a response
  var xvalues = metadata.xvalues;             // Get X values, same for each response
  var xlabel  = metadata.xlabel;              // Get X label
  var ylabel  = metadata.ylabel;              // Get Y label
  //--------------------------------------------------------------------------
    
  //................. Get Component Hazard Data ..............................
  var component_hazard_data   = [];           // Array for component x,y pair data for D3
  var component_hazard_labels = [];           // Array for component labels
  var jimt = response.findIndex(function(d,i){                // Find the response index for IMT selection
    return d.metadata.imt.value == selected_imt_value;
  });
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
    series_data:   component_hazard_data,     // Series data to plot
    series_labels: component_hazard_labels,   // Series labels
    series_imt:    component_hazard_labels,
    xvalues:       xvalues,                   // X values
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
 
   
  d3.select("#"+plot_id + " svg")
    .selectAll(".data")
    .on("click",function(d,i){
      var selected_component = d3.select(this).attr("id"); 

      plot_selection_reset(plot_id);     
      plot_selection(plot_id,selected_component);
    }); 
  
  d3.select("#"+plot_id + " svg")
    .select(".legend")
    .selectAll(".legend-entry")
    .on("click",function(d,i){
      var selected_component = d3.select(this).attr("id");

      plot_selection_reset(plot_id);     
      plot_selection(plot_id,selected_component);
    });


  d3.select("#"+plot_id + " svg")
    .select(".all-data")
    .selectAll(".dot")
    .on("mouseover",function(d,i){
      var cx = parseFloat(d3.select(this).attr("cx"));
      var cy = parseFloat(d3.select(this).attr("cy"));
      var selection_id   = d3.select(this.parentNode).attr("id");
      var xval = d3.select(this).data()[0][0]; 
      var yval = d3.select(this).data()[0][1].toExponential(4);
      var tooltip_text = [
        selection_id ,
        "GM (g): " + xval,
        "AFE: "    + yval]
      tooltip_mouseover(plot_id,this,cx,cy,tooltip_text);

    })
    .on("mouseout",function(d,i){
      tooltip_mouseout(plot_id,this);
    });


} 
//---------------------- End: Plot Component Curves ------------------------------------------
//
//############################################################################################






//############################################################################################
//
//........................... Highlight a Selected Line ......................................

function plot_selection(plot_id,selected_id){
  
  var svg = d3.select("#"+plot_id + " svg");

  svg.select(".all-data")
    .select("#"+selected_id)
    .select(".line")
    .attr("stroke-width",line_width+2);

  svg.select(".all-data")
    .select("#"+selected_id)
    .selectAll(".dot")
    .attr("r",circle_size+2);
  
  svg.select(".all-data")
    .select("#"+selected_id)
    .raise();
  
  var leg = svg.select(".legend")
    .select("#"+selected_id);
  
  leg.select(".legend-line")
    .attr("stroke-width",line_width+2)
  
  leg.select(".legend-circle")
    .attr("r",circle_size+2);
  
  leg.select(".legend-text")
    .style("font-weight","bold");
}
//---------------------- End: Highlight a Selected Line --------------------------------------
//
//############################################################################################




//############################################################################################
//
//....................... Remove Highlight from Selected Line ................................

function plot_selection_reset(plot_id){
  var svg = d3.select("#"+plot_id+" svg");

  svg.selectAll(".line")
    .attr("stroke-width",line_width); 
  
  svg.selectAll(".dot")
    .attr("r",circle_size); 

  svg.select(".legend")
    .selectAll(".legend-entry")
    .select(".legend-text")
    .style("font-weight","initial");

  svg.select(".legend")
    .selectAll(".legend-entry")
    .select(".legend-line")
    .attr("stroke-width",line_width);

  svg.select(".legend")
    .selectAll(".legend-entry")
    .select(".legend-circle")
    .attr("r",circle_size);
}
//------------------ End: Remove Highlight from Selected Line --------------------------------
//
//############################################################################################




//############################################################################################
//
//............................ Add Tooltip ...................................................

function tooltip_mouseover(plot_id,circle_select,cx,cy,tooltip_text){

  var tooltip = d3.select("#"+plot_id +" svg")
    .select(".d3-tooltip");

  var svg = d3.select("#"+plot_id + " svg");
  var plot_width  = svg.select(".all-data").node().getBoundingClientRect().width;
  var plot_height = svg.select(".all-data").node().getBoundingClientRect().height;
  
  var xper = cx/plot_width;
  var yper = cy/plot_height;

  var tooltip_width  = 225;
  var tooltip_height = 60; 
  var dy = 12;

  if (xper < 0.10){
    var xrect = cx;
    var xtext = cx+10;
  }else if (xper > 0.80){
    var xrect = cx-tooltip_width;
    var xtext = cx-tooltip_width+10;
  }else{
    var xrect = cx-tooltip_width/2;
    var xtext = cx-tooltip_width/2+10;

  }

  if (yper < 0.25){
    var yrect = cy+dy;
    var ytext = cy+dy+tooltip_height/4;
  }else{
    var yrect = cy-tooltip_height-dy;
    var ytext = cy-dy-(tooltip_height*3/4);
  }
  
  var rect_trans = "translate("+xrect+","+yrect+")";
  var text_trans = "translate("+xtext+","+ytext+")";

  tooltip.append("rect")
    .attr("class","tooltip-outline")
    .attr("height",tooltip_height)
    .attr("width",tooltip_width)
    .attr("transform",rect_trans)
    .attr("stroke","#999")
    .attr("fill","white");

  tooltip.selectAll("text")
    .data(tooltip_text)
    .enter()
    .append("text")
      .attr("class","tooltip-text")
      .attr("transform",text_trans)
      .attr("font-size",11)
      .attr("y",function(d,i){return i*16} )
      .attr("alignment-baseline","central")
      .text(function(d,i){return d});
  
  var rcircle = d3.select(circle_select).attr("r");
  if (rcircle == circle_size){
    d3.select(circle_select).attr("r",circle_size+2);
  }else{
    d3.select(circle_select).attr("r",circle_size+4);
  }

  tooltip.raise();

}
//------------------------- End: Add Tooltip -------------------------------------------------
//
//############################################################################################





//############################################################################################
//
//............................ Remove Tooltip ................................................

function tooltip_mouseout(plot_id,circle_select){

  var tooltip = d3.select("#"+plot_id +" svg")
    .select(".d3-tooltip");

  tooltip.selectAll("text").remove();
  tooltip.select("rect").remove();

  var rcircle = d3.select(circle_select).attr("r");
  if (rcircle == circle_size+4){
    d3.select(circle_select).attr("r",circle_size+2);
  }else{
    d3.select(circle_select).attr("r",circle_size);
  }

}
//------------------------- End: Remove Tooltip ----------------------------------------------
//
//############################################################################################







//############################################################################################
//
//........................... D3 Plot Function ...............................................

/*
- This function takes in an object with the following keys:
    * series_data:  "contains arrays of x,y pairs. Must be formatted for d3"
    * series_label: "array of corresponding labels"
    * xvalues:      "X values"
    * xlabel:       "X label"
    * ylabel:       "Y label"
    * plot_id:      "DOM id for plot"
    * resize:       "resize element id"
    * margin:       {top: ,right: , bottom: , left: }

- An example:
  var plot_info = {                           // Plot info object
    series_data:   component_hazard_data,     // Series data to plot
    series_labels: component_hazard_labels,   // Series labels
    xvalues:       xvalues,                   // X values
    xlabel:        xlabel,                    // X label
    ylabel:        ylabel,                    // Y label
    plot_id:       plot_id,                   // DOM ID for plot
    margin:       {top:20,right:50,bottom:50,left:70},  // Margin for D3
    resize:       "component"                 // DOM ID for resize element 
  };
*/


var circle_size = 4;            // Radius of any circles
var line_width = 3;             // Line width for paths

function plot_curves(plot_info){

  //....................... Get Plot Info .........................................
  var series_data   = plot_info.series_data;        // Get the series data
  var series_labels = plot_info.series_labels;      // Get the series labels
  var series_imt    = plot_info.series_imt;         // Get IMT values (not display)
  var xvalues       = plot_info.xvalues;            // Get the X values
  var xlabel        = plot_info.xlabel;             // Get the X label
  var ylabel        = plot_info.ylabel;             // Get the Y label
  var plot_id       = plot_info.plot_id;            // Get the DOM id of the plot
  var margin        = plot_info.margin;             // Get the margin values
  var resize_id     = plot_info.resize;             // Get the resize DOM id

  var plot_div_id   = document.getElementById(plot_id);
  var resize_div_id = document.getElementById(resize_id+"-plot-resize");
  //-------------------------------------------------------------------------------


  //..................... Get Color Scheme ........................................
  var ndata = series_data.length;         // Get how many data sets there are
  if (ndata < 10){                        // If 10 or less data sets
    var color  = d3.schemeCategory10;     // Get the color scheme with 10 colors
  }else{                                  // If there are more than 10 data sets
    var color  = d3.schemeCategory20;     // Get the color scheme with 20 colors
  } 
  //-------------------------------------------------------------------------------
  

  //...................... Replace Y values of 0 with null ........................  
  series_data.forEach(function(data,idata){         // Loop through the data
    data.forEach(function(dp,idp){                  // Loop through each data point
      if (dp[1] == 0){                              // If a Y value is zero, set it to null
        dp[1] = null;
      }
    })
  });
  //-------------------------------------------------------------------------------

  

  var y_extremes = get_y_extremes();                //  Get the Y extreme values: min and max
  var x_extremes = get_x_extremes();                //  Get the X extreme values: min and max
  
  var height = plot_height();                       // Get the height of the plot element
  var width  = plot_width();                        // Get the width of the plot element

  x_bounds = d3.scaleLog()                      // Set the X axis range and domain in log space                 
    .range([0,width])                               // Set range to width of plot element to scale data points
    .domain(x_extremes);                            // Set the min and max X values

  y_bounds = d3.scaleLog()                      // Set the Y axis range and domain in log space
    .range([height,0])                              // Set the range inverted to make SVG Y axis from bottom instead of top 
    .domain(y_extremes);                            // Set the min and max Y values
  
  var line = d3.line()                              // Set the D3 line
    .defined(function(d,i) {return d[1] != null})   // Plot all but null values
    .x(function(d,i) {return x_bounds(d[0])})       // Return X data scaled to width of plot 
    .y(function(d,i) {return y_bounds(d[1])});      // Return Y data scaled to width of plot

  
  //.......................... Get X Min and Max Values ...........................
  function get_x_extremes(){                 
    var x_max = d3.max(xvalues,function(d,i){return d;});   // Get the X max value
    var x_min = d3.min(xvalues,function(d,i){return d;});   // Get the X min value

    return [x_min,x_max];                                   // Return an array of the min and max values
  }
  //-------------------------------------------------------------------------------

  //.......................... Get Y Min and Max Values ...........................
  function get_y_extremes(){
    var y_values = [];                  // Array to hold all Y values
    var counter = -1;                   // Counter
    series_data.forEach(function(d,i){  // Loop through each data set
      for(var jd in d){                 // Loop through each data point
        counter+=1;                     // Increment
        y_values[counter] = d[jd][1];   // Get Y value data point 
      }
    });

    var y_max = d3.max(y_values);       // Get the Y max value
    var y_min = d3.min(y_values);       // Get the Y min value

    return [y_min,y_max];               // Return an array of the min and max values
  }
  //-------------------------------------------------------------------------------

  //......................... Get Plot Height Function ............................
  function plot_height(){
    var height = plot_div_id.clientHeight;              // Get the height of the plot element
    height = height - margin.top  - margin.bottom;      // Subtract the top and bottom margins
    return height;                                      // Return plottable height
  }
  //-------------------------------------------------------------------------------
  
  //......................... Get Plot Width Function .............................
  function plot_width(){
    var width = plot_div_id.clientWidth;                // Get the width of the plot element
    width  = width  - margin.left - margin.right;       // Subtract the left and right margins
    return width;                                       // Return plottable width
  }
  //-------------------------------------------------------------------------------


  //........................ Plot Resize Function .................................
  function plot_resize(){
    
    var height = plot_height();                             // Get current plot height
    var width = plot_width();                               // Get current plot width
    
    var svg = d3.select("#"+plot_id + " svg")               // Select the plot
      .attr("width", width  + margin.left + margin.right)   // Update the svg width
      .attr("height",height + margin.top  + margin.bottom); // Update the svg height

    x_bounds                  // Reset the X range and domain
      .range([0,width])
      .domain(x_extremes);
     
    y_bounds
      .range([height,0])      // Reset the Y range and domain
      .domain(y_extremes);

    svg.select(".x-tick")                                   // Select the x-tick class
      .attr("transform","translate(0,"+height+")")          // Update the X tick mark locations
      .call(d3.axisBottom(x_bounds));                       // Update the X tick makrs with the X bounds

    svg.select(".x-label")                                  // Select the x-label class
      .attr("x",width/2.0)                                  // Update the X label X location                                
      .attr("y",height+margin.bottom/2+10);                 // Update the X label Y location

    svg.select(".y-tick")                                   // Select the y-tick class
      .call(d3.axisLeft(y_bounds));                         // Update the Y tick marks with Y bounds
    
    svg.select(".y-label")                                  // Select the y-label class
      .attr("x",0-height/2)                                 // Update Y label X location
      .attr("y",0-margin.left/2-10);                        // Update Y label Y location

    svg.selectAll(".line")                                  // Select all line classes
      .attr("d",line);                                      // Update the paths

    svg.selectAll(".dot")                                   // Select all the dot classes
      .attr("cx",line.x())                                  // Update the X location of the circles
      .attr("cy",line.y());                                 // Update the Y location of the circles

    svg.selectAll(".legend-entry")                                  // Select the legend-entry class
      .attr("transform","translate(10,"+(height*(1-0.08))+")");     // Update the location of the legend

  }
  //-------------------------------------------------------------------------------


  //........................ Plot Function ........................................
  function plot(){

    d3.selectAll("#"+plot_id+ " svg")           // Remove all svg tags for the plot element
      .remove();

    //................. Create SVG Tag .......................
    var svg = d3.select("#"+plot_id)            // Select the plot element
      .append("svg")                            // Append a svg tag
        .attr("width",  width + margin.left + margin.right)             // Set the width of the svg tag
        .attr("height", height+ margin.top  + margin.bottom)            // Set the height of the svg tag
      .append("g")                                                      // Append a group
        .attr("transform","translate("+margin.left+","+margin.top+")")  // Position group by the top and left margins

     svg.append("g")
      .attr("class","d3-tooltip");
      
    //--------------------------------------------------------
      
    //.............. Create Group for Each Data Set .......... 
    var series_enter = svg.append("g")          // Append a new group
      .attr("class","all-data")                 // Make new group have a class of all-data
      .selectAll("g")                           // Select all groups to create, inside the all-data class
        .data(series_data)                      // Join data to groups 
        .enter()                                // Get each new node 
      .append("g")                              // Append a group for each data set
        .attr("class","data")                   // Make new group have class of data
        .attr("id", function(d,i){return series_imt[i]} )
        .attr("fill","none")                    // Set group fill of none
        .attr("stroke-width",line_width)        // Set group line width 
        .style("cursor","pointer");
    //--------------------------------------------------------

    //............ Plot Data Set as Paths ....................
    series_enter.append("path")                 // Append a path tag to the data class
      .attr("class","line")                     // Make new path tag have class of line
      .attr("d",line)                           // Set the path using the line variable
      .attr("stroke",function(d,i){return color[i];})   // Set the colors of each line
    //--------------------------------------------------------

    
    //............ Plot Data Set as Circles ..................
    series_enter.selectAll("circle")                // Select all circles to create inside the data class
      .data(function(d,i) {return d})               // Join the data to the circles
      .enter()                                      // Get each new node
      .filter(function(d,i){return d[1] != null})   // Filter out the Y values of null
      .append("circle")                             // Append a new circle tag for each data point
        .attr("class","dot")                        // Make new circle tag have class of dot
        .attr("fill", function(d,i){                // Set the fill color to match that of the line color
          return d3.select(this.parentNode.firstChild).style("stroke");   // Get color from correspond line 
        })
        .attr("cx",line.x())                        // Set the X locations of the circles
        .attr("cy",line.y())                        // Set the Y locations of the circles
        .attr("r", circle_size)                     // Set the radius for each circle
    //--------------------------------------------------------

    
    //................. Setup the X Axis .....................
    var x_axis = svg.append("g")                      // Create a new groupd under main svg group
      .attr("class","x-axis");                        // Make new group have class of x-axis
    
    // X Tick Marks     
    x_axis.append("g")                                // Append a new group under x-axis class
      .attr("class","x-tick")                         // Set class to x-tick
      .attr("transform","translate(0,"+height+")")    // Put X axis on the bottom of the plot
      .call(d3.axisBottom(x_bounds));                 // Make tick marks
    
    // X Label
    x_axis.append("text")                             // Append a text tag to the x-axis class
      .attr("class","x-label")                        // Make text tag have class of x-label
      .attr("text-anchor","middle")                   // Set text to be centered
      .attr("alignment-baseline","middle")
      .attr("x",width/2)                              // X location of X label
      .attr("y", height+margin.bottom/2+10)           // Y location of X label
      .text(xlabel);                                  // Set the text of the label
    //--------------------------------------------------------



    //................. Setup the Y Axis .....................
    var y_axis = svg.append("g")          // Create a new group under main svg group
      .attr("class","y-axis");            // Set class of new group to y-axis

    // Y Tick marks
    y_axis.append("g")                    // Append a new group to y-axis class
      .attr("class","y-tick")             // Set class to y-tick
      .call(d3.axisLeft(y_bounds));       // Set tick marks

    // Y Label
    y_axis.append("text")                 // Append a new text tag to y-axis class
      .attr("class","y-label")            // Set class to y-label
      .attr("transform","rotate(-90)")    // Rotate the text
      .attr("text-anchor","middle")       // Set to center text
      .attr("x",0-height/2)               // Set X location
      .attr("y",0-margin.left/2-10)       // Set Y location
      .text(ylabel);                      // Set the text of the label
    //--------------------------------------------------------


    //................. Set the Legend .......................
    var nleg = series_labels.length-1;                              // Get how many legend entrys there are minus 1 for indexing

    var legend = svg.append("g")                                    // Append a new group under main svg group     
      .attr("class","legend")                                       // Set class to legend
      .selectAll("g")                                               // Select all groups to create under legend class      
        .data(series_labels)                                        // Join data to legend class
        .enter()                                                    // Get each new node 
      .append("g")                                                  // Append a group for each label
        .attr("class","legend-entry")                               // Set class to legend-entry
        .attr("id",function(d,i){return series_imt[nleg-i]})        // Set id to imt 
        .attr("transform","translate(10,"+(height*(1-0.08))+")")    // Position legend to bottom-left
        .style("cursor","pointer");
    
    
    // Legend Text
    legend.append("text")                                         // Append a text tag to legend-entry class
      .attr("class","legend-text")
      .attr("font-size",12)
      .attr("x",30)                                               // Set X location of each legend label
      .attr("y", function(d,i){return 18*-i})                     // Set Y location of each legend label
      .attr("alignment-baseline","central")                       // Set alignment
      .text(function(d,i){return series_labels[nleg-i]});         // Set the text of each label, do nleg-i to put PGA at top of legend
     
    // Legend Line Indicator
    legend.append("line")                                         // Append a svg line tag
      .attr("class","legend-line")                                // Set class to legend-line
      .attr("x2",24)                                              // Set width of line 
      .attr("y1", function(d,i){return 18*-i})                    // Set Y location of starting point
      .attr("y2", function(d,i){return 18*-i})                    // Set Y location of ending point
      .attr("stroke-width",line_width)                            // Set stroke width of line
      .attr("stroke",function(d,i){return color[nleg-i]})         // Set color of line
      .attr("fill","none");                                       // Set fill to none
      
    // Legend Circle on the Line
    legend.append("circle")                                       // Append a svg circle tag
      .attr("class","legend-circle")                              // Set class to legend-circle
      .attr("cx",12)                                              // Set X location to center of line
      .attr("cy",function(d,i){return 18*-i})                     // Set Y location
      .attr("r",circle_size)                                      // Set radius
      .attr("fill",function(d,i){return color[nleg-i]} );         // Set fill color to match
    //--------------------------------------------------------
  

  }
  //-------------------------------------------------------------------------------


/*  
  var svg_check = d3.select("#"+plot_id + " svg")._groups[0][0];
  if (svg_check == null){
    plot_init();
  }else{
    plot_update();
  }
*/

  plot();
  $(window).resize(function(){
    plot_resize();
  });
  
  resize_div_id.onclick = function(){
    panel_resize(resize_id);
    plot_resize(); 
  }
}
//---------------------- End: D3 Plot Function -----------------------------------------------
//
//############################################################################################








