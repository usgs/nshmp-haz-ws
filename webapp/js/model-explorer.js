



//############################################################################################
//
//........................ Read in Parameter Dependency JSON File ............................ 

/*
- The parameter_dependency function reads in the parameter dependencies from the JSON file at
  https://earthquake.usgs.gov/nshmp-haz-ws/hazard
- Once the JSON file is read in, the function then calls the add_editions and add_options functions.
- This function takes in one argument, init. When init is true (only on startup) the JSON 
  file will get read in using the getJSON function from jquery. If init is not defined then 
  the file is read in and the remove_options and add_options function is called.

- NOTE: parameters is a global variable and is the parameter key from the JSON file
*/

parameter_dependency(true);
function parameter_dependency(init){
  console.log("------------- Start parameter_dependency ------------- ");

  if (init){                                                                  // If on startup, read in the JSON files
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
      var edition_values = static_parameters.edition.                         // Combine the static and dynamic editions
                            values.concat(dynamic_parameters.edition.values);
      var region_values  = static_parameters.region.                          // Combine the static and dynamic regions
                            values.concat(dynamic_parameters.region.values);
      var imt_values     = static_parameters.imt.values;                      // Combine the static and dynamic IMTs
      var vs30_values    = static_parameters.vs30.values;                     // Combine the static and dynamic Vs30 values

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
      parameters = {
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

  }else{                              // If not on startup, file is already read in, just call functions
    
    //.......................... Run Function ................................
    add_regions();                    // Add regions to menu
    remove_options();                 // First remove all other options except regions and editions                           
    add_options();                    // Then add all options based on edition and regions selected
    //-----------------------------------------------------------------------

    console.log("------------- End parameter_dependency ------------- \n\n");
  }
    
}

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

  var edition_default  = "E2008";                                     // On startup the default edition will be E2008
  var edition_id      = document.getElementById("edition");           // Get the edition Div id 
  var edition_dep     = parameters.edition;                           // Get the edition dependencies (parameters.edition in JSON file) 
  var edition_values  = edition_dep.values;                           // Get the edition values (parameters.edition.values in JSON file)
  var nedition        = edition_values.length;                        // Get how many editions there are
  edition_id.size = nedition;
  console.log("Parameter Dependicies: ");    console.log(parameters);
  console.log("Edition Dependicies: ");      console.log(edition_dep);
 
  for (var je=0;je<nedition;je++){                                    // Loop through each edition and add that edition as an option in selection menu
    var edition_option    = document.createElement("option");         // Create an option element 
    edition_option.text   = edition_values[je].display;               // Set the selection option's text based on the edition display key (parameters.edition.values[index].display) [Example: Dynamic: Conterminous U.S. 2008 (v3.3.1)] 
    edition_option.value  = edition_values[je].value;                 // Set the selection option's value based on the edition value key (parameters.edition.values[index].value) [Example: E2008]
    edition_id.add(edition_option);                                   // Add the options to the edition selection menu
  }
  edition_id.value = edition_default;                                 // Set the selection menu to the default edition

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

  var edition_id       = document.getElementById("edition");          // Get the edition Div id 
  var jedition_select  = edition_id.selectedIndex;                    // Get the selected edition index value 
  var edition_select   = edition_id.options[jedition_select].value;   // Get the selected edition from the edition menu  

  var edition_values   = parameters.edition.values;                   // Get the edition dependencies (parameters.edition in JSON file) 
  var edition_supports = edition_values[jedition_select].supports;    // Get the selected edition's support parameters (parameters.edition.values[index].supports in JSON file) 

  var support_values   = edition_supports.region;                     // Set string to get the supported parameters of each variable (example: edition_supports.region) 
  var parameter_values  = parameters.region.values;                   // Get all the parameter region values (parameters.region.values in JSON file)
  
  var region_id         = document.getElementById("region");          // Get the region Div id 


  for (var jo in region_id.options){                                  // Loop through the number of options in the region menu
    region_id.remove(jo);                                             // Remove each menu option
  }

  console.log("Supports Region: ");             
  console.log(support_values);

  for (var jp in parameter_values){                                   // Loop through the edition support values
    var region_option   = document.createElement("option");           // Create an option element 
    region_option.id    = parameter_values[jp].value;                 // Create an id based on the value
    region_option.text  = parameter_values[jp].display;               // Create the text to show on menu based on the display 
    region_option.value = parameter_values[jp].value;                 // Set the selection option's value (parameters.region.values[index].value) 
    region_id.add(region_option);                                     // Add the options to the region menu
    region_option_id    = document.getElementById(parameter_values[jp].value);
    region_option_id.disabled = true;
    for (var jsv in support_values){                                  // Loop through the supported regions of an edition (parameters.edition.values[edition_index].supports in JSON file)
      if (support_values[jsv] == parameter_values[jp].value)          // Find the matching value to set the text from the display key (parameters.region.WUS.display in JSON file) [Example: Western US]
      {region_option_id.disabled = false;}
    }
  }
  var region_default = edition_supports.region[0];                    // Set the region defaults based on the edition selected
  region_id.value    = region_default;                                // Set the default values based on the edition selected

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

  var region_id         = document.getElementById("region");                  // Get the region Div id 
  var region_dep        = parameters.region;                                  // Get the region dependencies (parameters.edition in JSON file)
  var region_values     = region_dep.values;                                  // Get the region values (parameters.edition.values in JSON file) 
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
    var support_values   = "region_supports."+supports[js];                   // Set string to get the supported parameters of each variable (example: region_supports.imt) 
    support_values       = eval(support_values);                              // Evaluate string to get the supported parameters (parameters.region.values[region_index].supports[support_index] in JSON file)
    var parameter_values = "parameters."+supports[js];                        // Set string to get the parameter values of each supported variable (parameters.imt) 
    parameter_values     = eval(parameter_values).values;                     // Evaluate string to get the parameter values (parameters.imt in JSON file)

    console.log("Supports " + supports[js] +": ");    console.log(support_values);
    
    for (var jp in parameter_values){                                         // Loop through the edition support values
      var option    = document.createElement("option");                       // Create an option element 
      option.id     = parameter_values[jp].value;                             // Set an id based on value
      option.text   = parameter_values[jp].display;                           // Set display
      option.value  = parameter_values[jp].value;                             // Set the selection options values 
      dom_id.add(option);                                                     // Add the options to the menus of imt and vs30
      option_id = document.getElementById(parameter_values[jp].value);        // Get dom id of option
      option_id.disabled = true;                                              // Set all to disabled at first
      for (var jsv in support_values){                                        // Loop through the parameter values for a supported variable (parameters.imt in JSON file)
        if (support_values[jsv] == parameter_values[jp].value)                // Find the matching value to set the text from the display key 
        {option_id.disabled   = false;}
      }
    }
    dom_id.value = eval("parameter_defaults."+supports[js]);                  // Set the default values based on the edition selected
  } 
  set_bounds();                                                               // Show the bounds for selected region
  get_selections();                                                           // Get all selected menu items and call static or dynamic web service

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
    for (jo in dom_id.options){                         // Loop through the number of options in each menu
      dom_id.remove(jo);                                // Remove each menu option
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
- The set_bounds function will look at the supported bounds for the region
  as stated in the parameter depenency JSON file. 
- The bounds are then add in the webpage under the text field to enter the values
*/

function set_bounds(){
  console.log("------------- Start set_bounds ------------- ");

  var region_id      = document.getElementById("region");               // Get the region Div id 
  var jregion_select = region_id.selectedIndex;                         // Get the selected region index value 
  var region_select     = region_id.options[jregion_select].value;      // Get the selected region from the region menu
  var region_values     = parameters.region.values[jregion_select];     // Get the region values (parameters.region.values[region_index] in JSON file)
  var min_lat = region_values.minlatitude;                              // Get the minimum latitude value
  var max_lat = region_values.maxlatitude;                              // Get the maximum latitude value
  var min_lon = region_values.minlongitude;                             // Get the minimum longitude value
  var max_lon = region_values.maxlongitude;                             // Get the maximum longitude value
  
  var lat_bounds_id = document.getElementById("lat_bounds");            // Get latitude bounds dom id
  var lon_bounds_id = document.getElementById("lon_bounds");            // Get longitude bounds dom id
  lat_bounds_id.innerHTML = "Bounds for " + region_select+" ["+min_lat+","+max_lat+"]";        // Set the latitude bound text for the webpage (Example: Bounds for WUS [34.5,50.5])
  lon_bounds_id.innerHTML = "Bounds for " + region_select+" ["+min_lon+","+max_lon+"]";        // Set the longitude bound text for the webpage

  var lat_id = document.getElementById("lat");                          // Get latitude dom id
  var lon_id = document.getElementById("lon");                          // Get longitude dom id
  lat_id.value = (min_lat+max_lat)/2.0;                                 // Calculate the middle latitude value and set as default
  lon_id.value = (min_lon+max_lon)/2.0;                                 // Calculate the middle longitude value and set as defualt

  console.log("Region Values: ");       console.log(jregion_select);
  console.log("Min Lat: " + min_lat);
  console.log("Max Lat: " + max_lat);
  console.log("Min Lon: " + min_lon);
  console.log("Max Lon: " + max_lon);

  console.log("------------- End set_bounds ------------- \n\n");
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

function get_selections(){
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

  //................. Check If Static or Dynamic Edition ..............
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

  //...................... Plot Button .........................
  var submit_id = document.getElementById("submit_url");                                    // Get id of submit_url button
  submit_id.onclick = function(){                                                           // When button is pressed, perform the following
    get_hazard(url);                                                                        // Call get_hazard function           
    };                       
  //-----------------------------------------------------------
  
  //..................... Get Raw Data Button ..................
  var get_raw = document.getElementById("raw_json");                                        // Get id of the raw_json button
  get_raw.onclick = function(){
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

  //...................... Plot Button .........................
  var submit_id = document.getElementById("submit_url");                                    // Get id of submit_url button
  submit_id.onclick = function(){                                                           // When button is pressed, perform the following
    get_hazard(url);                                                                        // Call get_hazard function           
    };                       
  //-----------------------------------------------------------

  //..................... Get Raw Data Button ..................
  var get_raw = document.getElementById("raw_json");                                        // Get id of the raw_json button
  get_raw.onclick = function(){
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
  
  var hazard_plot_id    = document.getElementById("hazard-curves-plot");
  var component_plot_id = document.getElementById("component-curves-plot");

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
  var hazard_panel_id    = document.getElementById("hazard-plot-panel"); 
  var hazard_plot_id     = document.getElementById("hazard-curves-plot"); 
  var hazard_resize_id = document.getElementById("hazard-plot-resize");
  var component_panel_id = document.getElementById("component-plot-panel"); 
  var component_plot_id  = document.getElementById("component-curves-plot"); 
  var component_resize_id = document.getElementById("component-plot-resize");

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
 
  var imt_id = document.getElementById("imt");

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

  var imt_id = document.getElementById("imt");
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

