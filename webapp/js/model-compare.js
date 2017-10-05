


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

var overlay_id     = document.getElementById("overlay");                    // Overlay id for loading
var loader_id      = document.getElementById("loader");                     // Loader id
var loader_text_id = document.getElementById("loader-text");                // Loader text
loader_text_id.innerHTML = "Getting Menu";                                  // Set loader text on start 
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
  loader_id.style.display  = "none";        // After the JSON files have been loaded, remove spinner
  overlay_id.style.display = "none";        // Remove overlay 
 
  parameters = par;                         // Global variable: An object of all editions, regions, imts, and vs30
  add_regions();                            // Call add_regions, add regions to select menu
};

get_parameters(set_parameters);     // Call get_parameters from common.js and send in callback to above
//-------------------------- End: Get Parameter Dependencies ---------------------------------
//
//############################################################################################





//############################################################################################
//
//............................... Add Regions to Select Menu ................................

/*
- The add_regions functions adds all commparable regions to the region selection menu based on 
  the comparable_region object below.

- NOTE: This functions uses the global variable "parameters" from set_parameters functions
*/

//............................... Comparable Regions ........................................
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
//-------------------------------------------------------------------------------------------


//............................... Add Regions to Menu .......................................
function add_regions(){
  
  region_id.size = comparable_region.length;          // Update the size of the select menu 

  for (var jcr in comparable_region){                 // Loop through all comparable regions and add to menu
    var option   = document.createElement("option");  // Create a option element
    var region   = comparable_region[jcr];            // Get a region 
    option.value = region.value;                      // Set the menu value
    option.id    = region.value;                      // Set the menu id
    option.text  = region.display                     // Set the menu text
    region_id.add(option);                            // Add options to the region menu
  }
  
  region_id.value = "COUS";                           // Set the default region
  add_editions();                                     // Call add_editions, add editions to select menu 
}
//-------------------------------------------------------------------------------------------


//----------------------------- End: Add Regions ---------------------------------------------
//
//############################################################################################



//############################################################################################
//
//............................... Add Editions to Select Menu ...............................

/*
- The add_editions functions adds all supported editions to the edition selection menu based on 
  the selected region.

- NOTE: This functions uses the global variable "parameters" from set_parameters function
*/

function add_editions(){
  lat_id.value = null;                                // Reset the latitude values
  lon_id.value = null;                                // Reset the longitude values
  check_bounds();                                     // Check bounds based on selected region
  remove_options("edition");                          // Remove all edition menu items

  //............................. Find Selected Region .....................................
  var jregion_select      = region_id.selectedIndex;                    // Get the selected edition index value 
  var region_select_value = region_id.options[jregion_select].value;    // Get the selected edition from the edition menu  
  var region_select = comparable_region.find(function(d,i){             // Find the matching region value in comparable_regions
    return d.value == region_select_value;
  }); 
  //----------------------------------------------------------------------------------------

  //................................ Add Supported Editions ................................. 
  var supported_editions = parameters.edition.values.filter(function(ev,iev){         // Find the supported editions based on region
    return ev.supports.region.find(function(rv,irv){
      return rv == region_select.static_value || rv == region_select.dynamic_value;
    })
  });

  for (var je in supported_editions){                                 // Loop through all supported editions and add to menu
    var option = document.createElement("option");
    option.value    = supported_editions[je].value;                   // Set edition value
    option.id       = supported_editions[je].value;                   // Set edition id
    option.text     = supported_editions[je].display;                 // Set edition text
    option.selected = true;                                           // Select all editions
    edition_id.add(option);                                           // Add option to edition menu
  }
  edition_id.size = edition_id.options.length;                        // Set size of the menu 
  //-----------------------------------------------------------------------------------------

  add_options();  // Add other options based on selected region

}
//----------------------------- End: Add Editions --------------------------------------------
//
//############################################################################################




//############################################################################################
//
//............................... Add Options to Select Menus ................................

/*
- The add_options functions adds the support parameters options to the corresponding 
  selections menu, either imt or vs30.
- The options that are added to the menus are based on what all selected editions and
  regions have in common. 
*/

function add_options(){

  remove_options("imt");                                            // Remove all previous imt menu items
  remove_options("vs30");                                           // Remove all previous vs30 menu items

  var edition_select = edition_id.selectedOptions;                  // Get all selected editions 
  var nselect        = edition_select.length;                       // Get how many editions are selected
  var jregion        = region_id.options.selectedIndex;             // Get region selected index
  var region_select  = region_id.options[jregion].value;            // Get selected region value

  var supports = ["imt","vs30"];                                    // Supported parameters to get
  var imt_check  = [];                                              // An array to hold arrays of imt values from regions and editions
  var vs30_check = [];                                              // An array to hold arrays of vs30 values from regions and editions

  //............ Get All IMT and Vs30 Values in Selected Region and Editions .................
  for (var js=0;js<nselect;js++){                                           // Loop over all selected editions and get all imt and vs30 values
    var edition_value = edition_select[js].value;                           // Get a single edition value
    var edition       = parameters.edition.values.find(function(d,i){       // Find the edition in the parameters object
      return d.value == edition_value;
    });
    imt_check.push(edition.supports.imt);                                   // Add all supported imt values to array
    vs30_check.push(edition.supports.vs30);                                 // Add all supported vs30 values to array
    var data_type   = edition.data_type;                                    // Find the edition data type
    var region = comparable_region.find(function(d,i){                      // Find the region inside comparable regions
      return d.value == region_select
    });
    var region_value    = region[data_type+"_value"];                       // Find the region value for the edition data type
    var region_supports = parameters.region.values.find(function(d,i){      // Find the supported regions 
      return d.value == region_value;
    }).supports;
    imt_check.push(region_supports.imt);                                    // Add all supported imt values to array
    vs30_check.push(region_supports.vs30);                                  // Add all supported vs30 values to arrray
  }
  //-----------------------------------------------------------------------------------------

  //.................. Add IMT and Vs30 Values to Menu with Supported Selecteable ...........
  common_supports("imt",imt_check);
  common_supports("vs30",vs30_check);
  //-----------------------------------------------------------------------------------------


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


plot_btn_id.addEventListener("click",get_selections);       // When button is pressed call get_selection

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



function get_selections(){
    
  var svg = d3.selectAll("svg");      // Get all svg element 
  svg.select(".all-data")             // Remove data
    .remove();
  svg.select(".legend")               // Remove legend
    .remove();


  //.............. Get All Selections from the Menus ...................
  var selected_editions = edition_id.selectedOptions;                         // Get all selected editions
  var selected_region   = region_id.options[region_id.selectedIndex].value;   // Get selected region
  var vs30              = vs30_id.options[vs30_id.selectedIndex].value;       // Get selected vs30
  var lat = lat_id.value;                                                     // Get inputted lat
  var lon = lon_id.value;                                                     // Get inputted lon

  //-------------------------------------------------------------------
  
  
  //................. Setup URLs to Submit .............................
  var can_submit = check_bounds(true);                          // Set if bounds are good
  if (can_submit[0] && can_submit[1]){                          // If lat and lon are within bounds, continue
    loader_id.style.display  = "initial";                       // Display spinner
    overlay_id.style.display = "initial";                       // Display overlay
    loader_text_id.innerHTML = "Calculating";                   // Update loader text
    
    var region_info = comparable_region.find(function(d,i){     // Find region info from selected region and comparable_region
      return d.value == selected_region; 
    });
    var url_info = [];                                              // Array to hold object of the urls
    var nedition = selected_editions.length;                        // Get how many editions have been selected
    for (var je=0;je<nedition;je++){                                // Loop through all selected editions and make a URL to query
      var edition_info = parameters.edition.values.find(function(d,i){    // Find the selected edition info
        return d.value == selected_editions[je].value;
      });
      var data_type     = edition_info.data_type;
      var edition_value = edition_info.value;
      var region_value  = region_info[data_type+"_value"];
      url_info[je] = make_hazard_url(edition_value,region_value,lat,lon,vs30,data_type);     // Make URL to call
    }
    
    get_hazard(url_info);                       // Call get_hazard, call all urls

    raw_btn_id.onclick = function(){            // call all urls by opening them in a new tab
      for (var ju in url_info){
        window.open(url_info[ju].url);
      }                     
    };
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
  
  //............................... Call Code ........................................
  var json_return = [];                                 // Array to hold all JSON returns
  for (var ju in url_info){                             // Loop through each URL to query
    json_return[ju] = $.getJSON(url_info[ju].url);      // Call each URL
  }
  //----------------------------------------------------------------------------------

  //.............................. Get Each JSON Response ............................
  var response = [];                                                      // Array for all JSON responses
  $.when.apply(this,json_return).done(function(d,i){                      // Wait for all json_returns to be there
    for (var jr in json_return){                                          // Loop through each return and set data type
      var response_json = json_return[jr].responseJSON;                   // Get response from json return
      var url_check = response_json.url;                                  // Get the URL from response
      var jurl = url_info.findIndex(function(d,i){                             // Find index in url_info
        return url_check == d.url;
      })
      response_json.response.data_type = url_info[jurl].data_type;        // Set response to correct data type
      var stat = response_json.status;                                    // Get status of response 
      if (stat == "success"){                                             // If status is successful, put response in array
        response[jr] = response_json.response;
      }
    }
    plot_setup();                     // Setup the plot
    hazard_plot(response);            // Plot the response
  });
  //----------------------------------------------------------------------------------
 
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
    resize_id.className  = "glyphicon glyphicon-resize-small";
    panel_id.className   = plot_size_max;
    plot_id.style.height = "40vw";
  }
  else if (panel_id.className == plot_size_max){
    resize_id.className  = "glyphicon glyphicon-resize-full";
    panel_id.className   = plot_size_min; 
    plot_id.style.height = "24vw";
  }
}
//---------------------- End: Resize Plot  ---------------------------------------------------
//
//############################################################################################




//############################################################################################
//
//........................... Format Information for D3 ......................................

function format_plot_info(json_response,plot_id){

  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;   // Get the IMT selection
  var selected_imt_value   = imt_id.options[imt_id.selectedIndex].value;  // Get the IMT selection

  var series_data           = [];       // Array to hold the total component x,y data for D3  
  var series_label_displays = [];       // Array to hold the label displays 
  var series_label_values   = [];       // Array to hold the label values

  //................. Get Data from Selected IMT Value and Format for D3 ...................
  for (var jr in json_response){                                          // Loop through all responses
    var data_type = json_response[jr].data_type;                          // Get the data type of each response 
    var response  = json_response[jr].find(function(d,i){                 // Find the response that corresponds to selected IMT 
     return d.metadata.imt.value == selected_imt_value;
    });
    var data = response.data;                                             // Get data corresponding to selected IMT
    
    //.................. JSON Variables based on Edition Type ..................
    if (data_type == "dynamic"){                                          // If using dynamic edition
      var xvalue_variable = "xvalues";
      var yvalue_variable = "yvalues";
      var jtotal          = data.findIndex(function(d,i){                 // Return the index for the Total component
        return d.component == "Total"
      });     
    }else if (data_type == "static"){                                     // If using static edition
      var xvalue_variable = "xvals";
      var yvalue_variable = "yvals";
      var jtotal          = 0;                                            // Only component it total
    } 
    //--------------------------------------------------------------------------
  
    //........................ Set Data for D3 .................................
    var xvalues               = response.metadata[xvalue_variable];               // Get X values
    series_data[jr]           = d3.zip(xvalues,data[jtotal][yvalue_variable]);    // Create the array of x,y pairs for D3
    series_label_displays[jr] = response.metadata.edition.display;                // Create the array of label displays
    series_label_values[jr]   = response.metadata.edition.value;                  // Create the array of label values
    //--------------------------------------------------------------------------
  }
  //-------------------------------------------------------------------------------------
 
  //.................. Get Axis Information ..................................
  var metadata = json_response[0][0].metadata;    // Get metadata of a response
  var xlabel   = metadata.xlabel;                 // Get X label 
  var ylabel   = metadata.ylabel;                 // Get Y label
  //--------------------------------------------------------------------------
  

  //.................... Plot Info Object for D3 .............................
  var plot_info = {                                     // Plot info object
    series_data:              series_data,              // Series data to plot
    series_label_displays:    series_label_displays,    // Series label displays
    series_label_values:      series_label_values,      // Series label values
    xlabel:        xlabel,                              // X label
    ylabel:        ylabel,                              // Y label
    plot_id:       plot_id,                             // DOM ID for plot
    margin:       {top:30,right:15,bottom:50,left:70},  // Margin for D3
    resize:       "hazard"                              // DOM ID for resize element 
  };
  console.log("\n\n Plot Information: ");    console.log(plot_info);
  console.log("\n\n");
  return plot_info;                       // Return the plot info object
  //--------------------------------------------------------------------------
  

}

//---------------------- End: Format Data for D3 ---------------------------------------------
//
//############################################################################################



//############################################################################################
//
//........................... Plot Hazard Curves .............................................

function hazard_plot(response){
  
  loader_id.style.display  = "none";                                      // Remove the spinner
  overlay_id.style.display = "none";                                      // Remove the overlay

  var plot_id  = "hazard-curves-plot";                                    // DOM ID of hazard plot element 
  var title_id = document.getElementById("hazard-plot-text");             // Get title element
  var selected_imt_display = imt_id.options[imt_id.selectedIndex].text;   // Get the IMT selection
  
  //................... Setup Reponse for D3 and Plot ........................
  var plot_info = format_plot_info(response,plot_id);                     // Get D3 plot data setup 
  plot_curves(plot_info);                                                 // Plot the curves
  plot_hazard_selection(plot_id);                                         // Setup plot selections and tooltips 
  title_id.innerHTML = " at " + selected_imt_display;                     // Update plot title to have selected IMT
  //--------------------------------------------------------------------------

  //................ Update Plot on IMT Menu Change ..........................
  imt_id.onchange = function(){                                           // When the selection menu of IMT changes, update selected IMT on plot and component plot
    var plot_info = format_plot_info(response,plot_id);                   // Update D3 data
    plot_curves(plot_info);                                               // Plot D3 data
    plot_hazard_selection(plot_id);                                       // Update plot selection and tooltips
    selected_imt_display = imt_id.options[imt_id.selectedIndex].text;     // Get the IMT selection
    title_id.innerHTML = " at " + selected_imt_display;                   // Update plot title
  };      
  //--------------------------------------------------------------------------
  
} 

//---------------------- End: Plot Hazard Curves ---------------------------------------------
//
//############################################################################################



//############################################################################################
//
//........................... Setup Plot Selections ..........................................

function plot_hazard_selection(plot_id){

  //.................. Highlight Line when Selected on Plot ..................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .selectAll(".data")                                         // Select all data, lines and circles 
    .on("click",function(d,i){                                  // If a circle or line is clicked, increase stroke-widtd
      var selected_edition_value = d3.select(this).attr("id");  // Get selected id
      plot_selection_reset(plot_id);                            // Remove any current selection on plot
      plot_selection(plot_id,selected_edition_value);           // Update plot with new selection
    }); 
  //--------------------------------------------------------------------------
  
  //.............. Highlight Line when Legend Entry Selected .................
  d3.select("#"+plot_id + " svg")                               // Get plot svg
    .select(".legend")                                          // Select legend
    .selectAll(".legend-entry")                                 // Select all legend entrys
    .on("click",function(d,i){                                  // If a legend entry is clicked, highlight corresponding line
      var selected_edition_value = d3.select(this).attr("id");  // Get selected id
      plot_selection_reset(plot_id);                            // Remove any current slections from plot     
      plot_selection(plot_id,selected_edition_value);           // Update with new selection
    });
  //--------------------------------------------------------------------------
      

  //.............. Add Tooltip on Hover over a Point ..........................
  d3.select("#"+plot_id + " svg")                                       // Get plot svg
    .select(".all-data")                                                // Select data group
    .selectAll(".dot")                                                  // Select all circles
    .on("mouseover",function(d,i){                                      // If a the mouse pointer is over a circle, add tooltip about that circle
      var xval = d3.select(this).data()[0][0];                          // Get ground motion value
      var yval = d3.select(this).data()[0][1].toExponential(4);         // Get annual exceedece value
      var edition_value   = d3.select(this.parentNode).attr("id");      // Get the selected id of the data group
      var edition_display = edition_id.options[edition_value].text;     // Get the display from the menu
      var tooltip_text = [                                              // Set the tooltip text
        "Edition: "+ edition_display,
        "GM (g): " + xval,
        "AFE: "    + yval]
      var tooltip_width  = 265;                                         // Set the tooltip box height
      var tooltip_height = 60;                                          // Set the tooltip box width
      tooltip_mouseover(plot_id,this,tooltip_height,tooltip_width,tooltip_text);      // Make tooltip
    })
    .on("mouseout",function(d,i){                                       // When mouse pointer leaves circle, remove tooltip
      tooltip_mouseout(plot_id,this);                                   // Remove tooltip
    });
  //--------------------------------------------------------------------------

}

//---------------------- End: Setup Plot Selections ------------------------------------------
//
//############################################################################################




