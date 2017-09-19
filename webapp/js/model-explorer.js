


//############################################################################################
//
//................................. Main DOM Ids ............................................. 

var edition_id    = document.getElementById("edition");                     // Edition select menu id 
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

console.log("------------- Start parameter_dependency ------------- ");

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

  console.log("Combined Editions: ");       console.log(edition_values);   
  console.log("Combined Regions: ");        console.log(region_values);   
  console.log("Combined IMTs: ");           console.log(imt_values);   
  console.log("Combined Vs30: ");           console.log(vs30_values);   
  console.log("\n\n\n");
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

  console.log("------------- End parameter_dependency ------------- \n\n");
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
  console.log("------------- Start add_editions ------------- ");

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
  
  console.log("------------- End add_editions ------------- \n\n");
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
  console.log("------------- Start add_regions ------------- ");

  var jedition_select   = edition_id.selectedIndex;                   // Get the selected edition index value 
  var edition_select    = edition_id.options[jedition_select].value;  // Get the selected edition from the edition menu  
  var edition_supports  = edition_values[jedition_select].supports;   // Get the selected edition's support parameters (parameters.edition.values[index].supports in JSON file) 
  var supported_regions = edition_supports.region;                    // Get the supported regions of the choosen edition 
  var parameter_regions = parameters.region.values;                   // Get all the parameter region values (parameters.region.values in JSON file)
  
  console.log("Supports Region: ");             
  console.log(supported_regions);
  
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

  console.log("------------- End add_regions ------------- \n\n");
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
  console.log("------------- Start add_options ------------- ");
  remove_options();     // Remove all previous menu item

  var jregion_select    = region_id.selectedIndex;                            // Get the selected region index value 
  var region_select     = region_id.options[jregion_select].value;            // Get the selected region from the region menu
  var region_supports   = region_values[jregion_select].supports;             // Get the selected region's support parameters (parameters.region.values[index].supports in JSON file) 
  
  console.log("\n Region Selected: " + region_select); 
  console.log("\n Region Support: ");   console.log(region_supports); 

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

    console.log("Supports " + supports[js] +": ");    console.log(supported_values);
    
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

  console.log("------------- End add_options ------------- \n\n");
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
  console.log("------------- Start remove_options ------------- ");

  var ids = ["imt","vs30"];                             // Selection menu ids
  for (ji in ids){                                      // Loop through the menus
    var dom_id = document.getElementById(ids[ji]);      // Get the dom id from ids
    var noptions = dom_id.options.length;
    for (var jo=0;jo<noptions;jo++){                    // Loop through the number of options in each menu
      dom_id.remove(0);                                 // Remove each menu option
    }
  }

  console.log("------------- End remove_options ------------- \n\n");
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
  console.log("------------- Start check_bounds ------------- ");

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
  console.log("Region Values: ");       console.log(jregion_select);
  console.log("Min Lat: " + min_lat);
  console.log("Max Lat: " + max_lat);
  console.log("Min Lon: " + min_lon);
  console.log("Max Lon: " + max_lon);
  console.log("------------- End check_bounds ------------- \n\n");
  
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
  console.log("------------- Start get_selections ------------- ");
  
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

  console.log("------------- End get_selections ------------- \n\n");
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
  console.log("URL to call: "+url+"\n\n");
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
  console.log("URL to call: "+url+"\n\n");
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
  console.log("------------- Start get_hazard ------------- ");
  

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

  console.log("------------- End get_hazard ------------- \n\n");
}
//---------------------- End: Call nshmp-haz Code --------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Plot Options ...................................................

/*
- Plot options for Google Charts plots
*/

function plot_options(xlabel,ylabel){
	var options = {
      hAxis:{
        title: xlabel,
        titleTextStyle: {italic: false},
        scaleType: 'log',
        format: 'scientific'
      },
      vAxis:{
        title: ylabel,
        titleTextStyle: {italic: false},
        scaleType: 'log',
        format: 'scientific'
      },
      chartArea: {left: '10%', top: '10%', width:'70%',height:'75%'},
      animation: {
        duration: 0,
        easing: 'in'
      },
      legend: {
        textStyle: {
          fontSize: 12 
        }
      },
      pointsVisible: 'true' 
    };

  return options;
}

//---------------------- End: Plot Options ---------------------------------------------------
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
    hazard_plot_id.style.height      = "20vw";
    component_plot_id.style.height   = "20vw";
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
    plot_id.style.height = "20vw";
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
  console.log("------------- Start hazard_plot ------------- ");

  google.charts.load('current', {'packages':['corechart','line']});
  
  if (parameters.type == "dynamic"){
    var xvalue_variable = "xvalues";
    var yvalue_variable = "yvalues";
  }else if (parameters.type == "static"){
    var xvalue_variable = "xvals";
    var yvalue_variable = "yvals";
  } 

  var nresponse = response.length;                    // Get number of responses (This will be the number of supported IMTs)
  console.log("Number of responses: " + nresponse);
 

  google.charts.setOnLoadCallback(draw_hazard_curves);

  function draw_hazard_curves(){
    var imt_selection_value = imt_id.options[imt_id.selectedIndex].value;
    var data_table = new google.visualization.DataTable();
    
    for (var jr=0;jr<nresponse;jr++){
      console.log("\n\n Response: ("+jr+"): ");    console.log(response[jr]);   
      var metadata   = response[jr].metadata;
      var data       = response[jr].data;
      var ylabel     = metadata.ylabel;
      var ndata_sets = data.length;
      
      if (jr == 0){
        var xlabel     = metadata.xlabel;
        var xvalues    = eval("metadata."+xvalue_variable);
        var ndata      = xvalues.length;
        data_table.addColumn('number',xlabel);
        data_table.addRows(ndata);
      }
      
      var imt_response_display = metadata.imt.display;
      var imt_response_value   = metadata.imt.value;
      data_table.addColumn('number',imt_response_display)
      for (var jdp=0;jdp<ndata;jdp++){
        if (jr==0){
          data_table.setCell(jdp,0,xvalues[jdp]);
        }
        var yvalue = eval("data[0]."+yvalue_variable+"[jdp]");
        data_table.setCell(jdp,jr+1,yvalue);
      }
      if (imt_selection_value == imt_response_value){
        var selected_column = jr+1;
      }
    }

    console.log("Data Table: " );   console.log(data_table);
   
    var plot_id = document.getElementById("hazard-curves-plot"); 
    var fig = new google.visualization.LineChart(plot_id);
    
    var options = plot_options(xlabel,ylabel);
    fig.draw(data_table,options);
    
    fig.setSelection([{row:null,column:selected_column}]);
    google.visualization.events.addListener(fig,'select',get_legend_select);
    get_legend_select();

    
    function get_legend_select(){
      if (fig.getSelection().length > 0){
        var selection = fig.getSelection()[0].column;
        var selected_imt_display = data_table.getColumnLabel(selection);
        for (var jd in parameters.imt.values){
          if (parameters.imt.values[jd].display == selected_imt_display){
            imt_id.value = parameters.imt.values[jd].value;
          }
        }
        console.log("\n\n Selected IMT on Plot: ");   console.log(selected_imt_display);
        if (parameters.type == "dynamic"){
          component_curves_plot(response,selected_imt_display);
        }
      }
    }
    $(window).resize(function(){
      fig.draw(data_table,options);
    });
    
    
    /*
    var plot_collapse_id = document.getElementById("hazard-plot-collapse");
    plot_collapse_id.onclick = function(){
      plot_collapse("hazard");
      fig.draw(data_table,options);
    }
    */
    var resize_id = document.getElementById("hazard-plot-resize");
    resize_id.onclick = function(){
      panel_resize("hazard");
      fig.draw(data_table,options);
    }
  }
  
  imt_id.onchange = function(){ draw_hazard_curves();};



  console.log("------------- End hazard_plot ------------- \n\n");
} 
//---------------------- End: Plot Hazard Curves --------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Plot Compnent Curves ...........................................

function component_curves_plot(response,selected_imt_display){
  console.log("------------- Start component_curves_plot ------------- ");

  google.charts.load('current', {'packages':['corechart','line']});

  var nresponse = response.length;                    // Get number of responses (This will be the number of supported IMTs)
  console.log("Number of responses: " + nresponse);

  var imt_selection_display = imt_id.options[imt_id.selectedIndex].text;

  for (var jr=0;jr<nresponse;jr++){
    var metadata   = response[jr].metadata;
    var imt_response_display   = metadata.imt.display;
    if (selected_imt_display == imt_response_display){
      var selected_response = jr;
    }
  }
  var metadata   = response[selected_response].metadata;
  var data       = response[selected_response].data;
  var ylabel     = metadata.ylabel;
  var ndata_sets = data.length;
  
  var xlabel     = metadata.xlabel;
  var xvalues    = metadata.xvalues;
  var ndata      = xvalues.length;

  google.charts.setOnLoadCallback(draw_component_curves);

  function draw_component_curves(){
    
    var data_table = new google.visualization.DataTable();
    
    data_table.addColumn('number',xlabel);
    data_table.addRows(ndata);
    
    var counter = -1 
    for (var jds=0;jds<ndata_sets;jds++){
      var data_component   = data[jds].component;
      if (data_component != "Total"){
        counter+=1
        console.log("\n\n "+data[jds].component);  console.log(data[jds].yvalues);
        data_table.addColumn('number',data_component)
        for (var jdp=0;jdp<ndata;jdp++){
          data_table.setCell(jdp,0,xvalues[jdp]);
          data_table.setCell(jdp,counter+1,data[jds].yvalues[jdp]);
        }
      }
    }

    console.log("Data Table: " );   console.log(data_table);
   
    var plot_title_id = document.getElementById("component-plot-text");
    plot_title_id.innerHTML = " for " + metadata.imt.display; 
    var plot_id = document.getElementById("component-curves-plot"); 
    var fig = new google.visualization.LineChart(plot_id);
    
    var options = plot_options(xlabel,ylabel);
    fig.draw(data_table,options);
    
    $(window).resize(function(){
      fig.draw(data_table,options);
    });
    /*
    var plot_collapse_id = document.getElementById("component-plot-collapse");
    plot_collapse_id.onclick = function(){
      plot_collapse("component");
      fig.draw(data_table,options);
    }
    */
    var resize_id = document.getElementById("component-plot-resize");
    resize_id.onclick = function(){
      panel_resize("component");
      fig.draw(data_table,options);
    }
  }

  
  console.log("------------- End component_curves_plot ------------- \n\n");
} 
//---------------------- End: Plot Component Curves ------------------------------------------
//
//############################################################################################

