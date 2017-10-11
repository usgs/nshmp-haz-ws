//############################################################
//
//  Contains all JavaScript for model-explorer.html
//
//  Some function are called from the common.js file
//
//
//############################################################




//############################################################################################
//
//................................. Main DOM Ids ............................................. 

var edition_id    = document.getElementById("edition");                     // Edition select menu id $("#edition") 
var region_id     = document.getElementById("region");                      // Region select menu id 
var imt_id        = document.getElementById("imt");                         // IMT select menu id
var vs30_id       = document.getElementById("vs30");                        // Vs30 select menu id
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

spinner("on");
//------------------------------- End: Main DOM Ids ------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................ Get Parameter Dependencies ........................................ 
/*
- The set_parameters function is a callback function for the get_parameters function, in common.js,
  that will get called once both the static and dynamic parameter dependency JSON files are
  read in.
  - The get_parameters function will return an object that contains all editions, regions, imts, 
  and vs30.
*/
function set_parameters(par){
  spinner("off");
  parameters = par;                         // Global variable: An object of all editions, regions, imts, and vs30
  //.......................... Run Function ................................
  add_editions();                 // Add editions to menu
  //-----------------------------------------------------------------------
};

get_parameters(set_parameters);     // Call get_parameters from common.js and send in callback to above
//-------------------------- End: Get Parameter Dependencies ---------------------------------
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
  var edition_values  = parameters.edition.values;      // Get edition values
 
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
  
  add_regions();                  // Add regions to menu
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
  var edition_values    = parameters.edition.values;                  // Get all editions
  var edition_supports  = edition_values[jedition_select].supports;   // Get the selected edition's support parameters (parameters.edition.values[index].supports in JSON file) 
  var supported_regions = edition_supports.region;                    // Get the supported regions of the choosen edition 
  var parameter_regions = parameters.region.values;                   // Get all the parameter region values (parameters.region.values in JSON file)
  
  remove_options("region"); 
  
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
  
  check_bounds();                                     // Show the bounds for selected region
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
  remove_options("imt");      // Remove all previous imt menu items
  remove_options("vs30");     // Remove all previous vs30 menu items

  //............................... Region Selection ...............................
  var jregion_select    = region_id.selectedIndex;                            // Get the selected region index value 
  var region_select     = region_id.options[jregion_select].value;            // Get the selected region from the region menu
  var region_values     = parameters.region.values;                           // Get all region values
  var region_supports   = region_values[jregion_select].supports;             // Get the selected region's support parameters (parameters.region.values[index].supports in JSON file) 
  //--------------------------------------------------------------------------------

  //............................... Edition Selection ...............................
  var jedition_select   = edition_id.selectedIndex;                           // Get selected edition index value
  var edition_select    = edition_id.options[jedition_select].value           // Get selected edition value
  var edition_values    = parameters.edition.values;                          // Get all edition values
  var edition_supports  = edition_values[jedition_select].supports;           // Get selected edition supports
  //--------------------------------------------------------------------------------

  //............................... Set Menu with Options ...........................
  var options = ["imt","vs30"];                           // Option ids
  for (var jo in options){                                // Loop through options
    var support_values = [];                              // Array to hold array of support values
    support_values.push(edition_supports[options[jo]]);   // Add edition supported values
    support_values.push(region_supports[options[jo]]);    // Add region supported values
    common_supports(options[jo],support_values);          // Find common supports and add to menu
  }
  //--------------------------------------------------------------------------------

}
//----------------------------- End: Add Options ---------------------------------------------
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

$("footer").ready(function(){                                             // Wait for footer to load and add listener
  raw_btn_id    = document.getElementById("raw-data");                    // Raw Data button id 
  plot_btn_id   = document.getElementById("update-plot");                 // Update plot button id
  plot_btn_id.addEventListener("click",get_selections);                   // When button is pressed call get_selection
});

//............. Call get_selection on Keyboard Enter on Lat ...........
lat_id.onkeypress = function(key){                          // Submit URL on enter key
  var key_code = key.which || key.keyCode;
  if (key_code == 13){
    get_selections();
  }
}
//---------------------------------------------------------------------

//............. Call get_selection on Keyboard Enter on Lon ...........
lon_id.onkeypress = function(key){                          // Submit URL on enter key
  var key_code = key.which || key.keyCode;
  if (key_code == 13){
    get_selections();
  }
}
//---------------------------------------------------------------------


function get_selections(){                                             // When button is pressed, perform the following
  
  
  var svg = d3.selectAll("svg");
  svg.select(".all-data")
    .remove();
  svg.select(".legend")
    .remove();

  //.............. Get All Selections from the Menus ...................      
  var selected_edition  = edition_id.options[edition_id.selectedIndex].value; // Get all selected editions
  var selected_region   = region_id.options[region_id.selectedIndex].value;   // Get selected region
  var vs30              = vs30_id.options[vs30_id.selectedIndex].value;       // Get selected vs30
  var lat = lat_id.value;                                                     // Get inputted lat
  var lon = lon_id.value;                                                     // Get inputted lon
  //-------------------------------------------------------------------

  //................. Check If Static or Dynamic Edition ..............
  var can_submit = check_bounds(true);
  if (can_submit[0] && can_submit[1]){
    spinner("on");

    var edition_info = parameters.edition.values.find(function(d,i){            // Get edition info
      return selected_edition == d.value;
    });
    var data_type = edition_info.data_type;                                     // Get edition data type 
    parameters.data_type = data_type;                                           // Set edition data type in parameters object
    var url_info = make_hazard_url(selected_edition,selected_region,lat,lon,vs30,data_type);     // Make URL info to query 
    get_hazard(url_info);
  }
  //--------------------------------------------------------------------

} 

//---------------------- End: Get Menu Selections/Values -------------------------------------
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

  $.getJSON(url_info.url,function(json_return){           // Get the JSON file that the code generates
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

  var type = parameters.data_type;

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







//############################################################################################
//
//........................... Plot Hazard Curves .............................................

function hazard_plot(response){

  spinner("off");

  var plot_id = "hazard-curves-plot";                                     // DOM ID of hazard plot element 
  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;    // Get the IMT selection
  
  //.................. JSON Variables based on Edition Type ..................
  if (parameters.data_type == "dynamic"){        // If using dynamic edition
    var xvalue_variable = "xvalues";
    var yvalue_variable = "yvalues";
  }else if (parameters.data_type == "static"){   // If using static edition
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
    if (parameters.data_type == "dynamic"){
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
    xaxis_btn:     "hazard-plot-xaxis",
    yaxis_btn:     "hazard-plot-yaxis",
    x_scale:       "log",
    y_scale:       "log",
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
  if (parameters.data_type == "dynamic"){                                        // If using dynamic edition
    component_curves_plot(response);                                        // Plot component curves      
  }
  //--------------------------------------------------------------------------

  //................ Update Plot Selection on IMT Menu Change ................
  imt_id.onchange = function(){                                             // When the selection menu of IMT changes, update selected IMT on plot and component plot
    var selected_imt_value = imt_id.options[imt_id.selectedIndex].value;    // Get selected IMT value
    plot_selection_reset(plot_id);                                          // Remove any current IMT selection on plot
    plot_selection(plot_id,selected_imt_value);                             // Update with new selection
    if (parameters.data_type == "dynamic"){                                      // If using dynamic
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

      if (parameters.data_type == "dynamic"){                        // If using dynamic edition
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

      if (parameters.data_type == "dynamic"){                        // If using a dynamic edition
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

  //................. Check X and Y Axis Scale ......................
  var xaxis_btn_id = document.getElementById("component-plot-xaxis");
  var yaxis_btn_id = document.getElementById("component-plot-yaxis");
  if (xaxis_btn_id.value == "" || yaxis_btn_id.value == ""){            // If no value has been applied, set default scale
    var x_scale = "log";
    var y_scale = "log";
  }else{                                                                // If value already set, get that value
    var x_scale = xaxis_btn_id.value;
    var y_scale = yaxis_btn_id.value;
  }
  //-----------------------------------------------------------------
 
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
    xaxis_btn:     "component-plot-xaxis",
    yaxis_btn:     "component-plot-yaxis",
    x_scale:       x_scale,
    y_scale:       y_scale,
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





