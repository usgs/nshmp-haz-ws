
//############################################################################################
//
//................................. Load Include Files ....................................... 

//.................................... Load Header and Set Title .............................
$("#include-header").load("includes/header.html",function(){
  var title_id = document.getElementById("header-title");         // Get the header title dom id
  var webapp = window.location.pathname.split("/").pop();         // Get the current file name

  switch (webapp){
    case "model-explorer.html":                           
      var title = "Model Explorer";
      break;
    case "model-compare.html":
      var title = "Model Compare";
      break;
    case "spectra-plot.html":
      var title = "Response Spectra";
      break;
    default:
      var title = "Please define title in common.js";
  }
  title_id.innerHTML = title;               // Set the header title
  document.title     = "NSHMP " + title;    // Set the tab title
});                  
//--------------------------------------------------------------------------------------------

//................................... Load Footer ............................................
$("#include-footer").load("includes/footer.html");         
//--------------------------------------------------------------------------------------------

//................................... Load Spinner ...........................................
$("#include-spinner").load("includes/spinner.html");        
//--------------------------------------------------------------------------------------------

//--------------------------- End: Load Include Files ----------------------------------------
//
//############################################################################################



//############################################################################################
//
//................................. Turn On/Off Spinner ...................................... 

/*
-  This function wil turn on or off a loading spinner that is centered in the screen.
-  To turn on the spinner just call spinner("on");
-  To turn off the spinner just call spinner("off");
*/

function spinner(stat){
  $("#overlay").ready(function(){
    $("#loader").ready(function(){                                          // Make sure dom is loaded 
      var overlay_id     = document.getElementById("overlay");              // Global variable: Overlay id for loading
      var loader_id      = document.getElementById("loader");               // Global variable: Loader id
      var loader_text_id = document.getElementById("loader-text");          // Global Variable: Loader text

      if (stat.toLowerCase() == "on"){                // If argument string is "on", then show the spinner
        overlay_id.style.display = "initial";
        loader_id.style.display  = "initial";
        loader_text_id.innerHTML = "Processing";          
      }else if (stat.toLowerCase() == "off"){         // If argument string is "off", then remove the spinner
        overlay_id.style.display = "none";
        loader_id.style.display  = "none";
      }
    });
  });
}

//--------------------------- End: Turn On/Off Spinner ---------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................ Read in Parameter Dependency JSON File ............................ 

/*
-  This function is used for model-compare and model-explorer
*/

function get_parameters(callback){
  var dynamic_url = "https://earthquake.usgs.gov/nshmp-haz-ws/hazard"       // URL to get the JSON parameter dependicy file for dynamic editions
  var static_url  = "https://earthquake.usgs.gov/hazws/staticcurve/1"       // URL to get the JSON parameter dependicy file for static editions
  $.when(                                                                   // Read in the static and dynamic JSON files
    $.getJSON(dynamic_url,function(dynamic_json_return) {                   // Read in dynamic JSON file 
      dynamic_parameters    = dynamic_json_return.parameters;           // Global variable: get the parameter key from the dynamic JSON file 
    }),
    $.getJSON(static_url,function(static_json_return){                      // Read in the static JSON file
      static_parameters = static_json_return.parameters;                // Global variable: get the parameter key from the static JSON file
    })
  ).done(function(){                                                        // Once both the static and dynamic JSON files are read in, perform the following
    console.log("Dynamic Parameters: ");      console.log(dynamic_parameters);   
    console.log("\n\n\n");
    console.log("Static Parameters: ");       console.log(static_parameters);   
    console.log("\n\n\n");

    //................. Add Edition Type ......................................  
    var main_pars    = ["edition","region"];
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
    var combined_parameters = {                  // Global variable of parameters
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
    console.log("Combined Parameters: ");     console.log(combined_parameters);   
    console.log("\n\n\n");
    //------------------------------------------------------------------------
    
    callback(combined_parameters); 
  }); 
}

//--------------------------- End: Parameter Dependency --------------------------------------
//
//############################################################################################





//############################################################################################
//
//.............................. Sort Values .................................................

/*
- The sort_displayorder function takes a parameter, like edition, and sorts them based
  on the display order given in the two JSON files
- This function returns the subtraction of the display order values of two editions to see
  which one should be displayed first (a negative value return is displayed first)
*/

function sort_displayorder(a,b){
  return (a.displayorder - b.displayorder);
}      

//-------------------------------- End: Sort Values ------------------------------------------
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

function remove_options(id){
  var dom_id = document.getElementById(id);          // Get the dom id 
  var noptions = dom_id.options.length;
  for (var jo=0;jo<noptions;jo++){                    // Loop through the number of options in each menu
    dom_id.remove(0);                                 // Remove each menu option
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

-  This function is used for model-compare and model-explorer

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
//............................ Check for Common Supported Values ..............................
/*
-  This function is used for model-compare and model-explorer
*/

function common_supports(id,selected_values){

  var dom_id           = document.getElementById(id);               // Get to dom id of the supported variable for the selection menu
  var parameter_values = parameters[id].values;                     // Set string to get the parameter values of each supported variable (parameters.imt) 
  var supported_values = parameter_values.filter(function(d,i){
    var option      = document.createElement("option");             // Create an option element 
    var value       = parameter_values[i].value;
    var display     = parameter_values[i].display;
    display         = display.replace("&amp;","&");
    option.id       = value;                                        // Set an id based on value
    option.text     = display;                                      // Set display
    option.value    = value;                                        // Set the selection options values 
    option.disabled = true;
    dom_id.add(option);                                             // Add the options to the menus of imt and vs30
    return  selected_values.every(function(dp,ip){
      return dp.includes(d.value);
    })
  });
  supported_values.forEach(function(sv,isv){
    var jsupport = parameter_values.findIndex(function(v,iv){
      return sv.value == v.value;
    })
    dom_id.options[jsupport].disabled = false;
  });
  dom_id.value = supported_values[0].value;                         // Set the default value to Please Select ... 

}
//---------------------- End: Check for Common Supported Values ------------------------------
//
//############################################################################################




//############################################################################################
//
//................................ Make URL to Query .........................................

/*
-  This function is used for model-compare and model-explorer

Format of Dynamic URL:
  https://earthquake.usgs.gov/nshmp-haz-ws/hazard?edition=value&region=value&longitude=value&latitude=value&imt=value&vs30=value

Format of Static URL:
  https://earthquake.usgs.gov/hazws/staticcurve/1/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}"
*/

function make_hazard_url(edition,region,lat,lon,vs30,data_type){

  if (data_type == "static"){                         // If data type is static, setup static URL
    var url_base = "https://dev01-earthquake.cr.usgs.gov/hazws/staticcurve/1/";   // Set the URL base
    var url_info =  {
      data_type: "static",          // Set data type
      url: url_base +               // Construct the URL to call the nshmp-haz code
      edition       + "/" +         // Add edition to URL
      region        + "/" +         // Add region to URL
      lon           + "/" +         // Add longitude to URL
      lat           + "/" +         // Add latitude to URL
      "any"         + "/" +         // Add IMT to URL (return all IMTs)
      vs30                          // Add vs30 to URL
    };
  }else if (data_type == "dynamic"){                // If data type is dynamic, setup dynamic URL
    var url_base = "https://dev01-earthquake.cr.usgs.gov/nshmp-haz-ws/hazard";    // Set the URL base
    var url_info =  {
      data_type: "dynamic",           // Set data type
      url: url_base +                 // Construct the URL to call the nshmp-haz code
      "?edition="   + edition   +     // Add edition to URL
      "&region="    + region    +     // Add region to URL
      "&longitude=" + lon       +     // Add longitude to URL
      "&latitude="  + lat       +     // Add latitude to URL
      "&vs30="      + vs30            // Add vs30 to URL
    };
  }
  return url_info;
}

//---------------------------- End: Make URL to Query ----------------------------------------
//
//############################################################################################

