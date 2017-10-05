



//############################################################################################
//
//........................ Read in Parameter Dependency JSON File ............................ 


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


//############################################################################################
//
//........................... Highlight a Selected Line ......................................

/*
- This function will highlight a selected line on a plot
- This function takes in two arguments:
    1. plot_id: the dom id of the plot (example: hazard-curves-plot)
    2. selected_id: the id of the selected line (example: PGA)

*/

function plot_selection(plot_id,selected_id){
  
  var svg = d3.select("#"+plot_id + " svg");    // Select the svg of the plot id

  //............ Increase Line Width and Dot size of Selected Plot ..............
  var selected = svg.select(".all-data")        // Select the all data group
    .select("#"+selected_id);                   // Select the data group that was selected 

   selected.select(".line")                     // Select the line that was choosen
    .attr("stroke-width",linewidth_size_select);// Increase the line width by 2

    selected.selectAll(".dot")                  // Select all dot along the line
    .attr("r",circle_size_select);              // Increase the dot size by 2

    selected.raise();                           // Bring the line and dots to the front
  //-----------------------------------------------------------------------------
  
  //............. Increase Line Width and Circle Size on Legend .................
  var leg = svg.select(".legend")               // Select the legend
    .select("#"+selected_id);                   // Select the legend group that was selected

  leg.select(".legend-line")                    // Select the line in the legend
    .attr("stroke-width",linewidth_size_select);// Increase the line width by 2

  leg.select(".legend-circle")                  // Select the dot in the legend
    .attr("r",circle_size_select);              // Increase the dot size by 2
  
  leg.select(".legend-text")                    // Select the legend text
    .style("font-weight","bold");               // Make text bold
  //-----------------------------------------------------------------------------

}

//---------------------- End: Highlight a Selected Line --------------------------------------
//
//############################################################################################




//############################################################################################
//
//....................... Remove Highlight from Selected Line ................................
/*
- This function removes the line selection so a new one can be applied
- This function take in one argument: 
    1. plot_id: The dom id of the plot (example: hazard-curves-plot)
*/

function plot_selection_reset(plot_id){

  var svg = d3.select("#"+plot_id+" svg");        // Select the plot svg
  
  //............. Resize All Lines and Dots in Plot ...............
  svg.selectAll(".line")                          // Select all lines
    .attr("stroke-width",linewidth);              // Make all line have same line width
 
  svg.selectAll(".dot")                           // Select all dots
    .attr("r",circle_size);                       // Make all dots have same line width
  //---------------------------------------------------------------

  //................ Resize Lines and Dots in the Legend ..........
  var leg = svg.select(".legend")                 // Select the legend
    .selectAll(".legend-entry");                  // Select all legend entrys
  
    leg.select(".legend-text")                    // Select the legend text
    .style("font-weight","initial");              // Make font weight default

    leg.select(".legend-line")                    // Select the legend line
    .attr("stroke-width",linewidth);              // Make all line in legend same line width

    leg.select(".legend-circle")                  // Select the legend circles
    .attr("r",circle_size);                       // Make all dots the same size 
  //---------------------------------------------------------------
}

//------------------ End: Remove Highlight from Selected Line --------------------------------
//
//############################################################################################




//############################################################################################
//
//............................ Add Tooltip ...................................................
/*
- This function makes a tooltip that displays the selected line, ground moition value,
  and the excedence value when the mouse is hovering over a dot
- This function takes in 3 arguments:
    1. plot_id: the dom id of the plot (example: hazard-curves-plot)
    2. circle_select: the selected circle (on mouseover this is passes as "this" variable)
    3. tooltip_height: height of tooltip box
    4. tooltip_width: width of tooltip box
    3. tooltip_text: An array of the text to display in the tooltip. Each array entry is a new line in the tooltip 

NOTE: The tooltip text is currently using three lines. If more is desired the height of the tooltip 
      will need to be adjusted. 
*/

function tooltip_mouseover(plot_id,circle_select,tooltip_height,tooltip_width,tooltip_text){

  var tooltip = d3.select("#"+plot_id +" svg")            // Select tooltip
    .select(".d3-tooltip");
  
  var svg = d3.select("#"+plot_id + " svg");              // Select plot svg
  
  //........ Find Where the Tooltip Should Be Placed Relative to the Circle .................
  var plot_geom = svg.select(".all-data")                       // Select the bounding box of the data
    .node()
    .getBoundingClientRect();
  var plot_width  = plot_geom.width;                            // Get the width of the actual plot where the data is
  var plot_height = plot_geom.height;                           // Get the height of the actual plot where the data is
  
  var cx = parseFloat(d3.select(circle_select).attr("cx"));     // Get X location of dot
  var cy = parseFloat(d3.select(circle_select).attr("cy"));     // Get Y location of dot

  var xper = cx/plot_width;               // Get the X location in percentage
  var yper = cy/plot_height;              // Get the Y location in percentage

  var dy = 12;                            // Set the distance in Y between circle and tooltip

  if (xper < 0.10){                       // If the X location of the dot is < 10%, have box start to the right of the circle
    var xrect = cx;
    var xtext = cx+10;
  }else if (xper > 0.70){                 // If the X location of the dot is > 70%, have box end to the left of the circle
    var xrect = cx-tooltip_width;
    var xtext = cx-tooltip_width+10;
  }else{                                  // Center box location in X
    var xrect = cx-tooltip_width/2;
    var xtext = cx-tooltip_width/2+10;
  }

  if (yper < 0.25){                       // If Y location of the dot is < 25% (from top), place box below circle
    var yrect = cy+dy;
    var ytext = cy+dy+tooltip_height/4;
  }else{                                  // Else put the box above the circle
    var yrect = cy-tooltip_height-dy;
    var ytext = cy-dy-(tooltip_height*3/4);
  }
  
  var rect_trans = "translate("+xrect+","+yrect+")";    // The translation for the tooltip box
  var text_trans = "translate("+xtext+","+ytext+")";    // The translation for the tooltip text
  //----------------------------------------------------------------------------------------

  //........................... Create the Tooltip Box .....................................
  tooltip.append("rect")                        // Create a rectangle
    .attr("class","tooltip-outline")            // Add a class to the rectangle
    .attr("height",tooltip_height)              // Set height
    .attr("width",tooltip_width)                // Set width
    .attr("transform",rect_trans)               // Translate the rectangle to correct position
    .attr("stroke","#999")                      // Set stroke color
    .attr("fill","white");                      // Set fill color
  //----------------------------------------------------------------------------------------
  
  //........................... Create the Tooltip Text ....................................
  tooltip.selectAll("text")                     // Select all text fields in tooltip
    .data(tooltip_text)                         // Join the text
    .enter()
    .append("text")                             // Create a text field for each text in array
      .attr("class","tooltip-text")             // Add a class to each text
      .attr("transform",text_trans)             // Translate text to correct location
      .attr("font-size",11)                     // Set font size
      .attr("y",function(d,i){return i*16} )    // Set Y location of each text
      .attr("alignment-baseline","central")     // Set to be aligned center
      .text(function(d,i){return d});           // Set text
  //----------------------------------------------------------------------------------------
 
  //......................... Increase Size of Circle on Hover ............................. 
  var rcircle = d3.select(circle_select).attr("r");     // Get circle size of current circle 
  if (rcircle == circle_size){                          // If circle size is default, increase by 2
    d3.select(circle_select).attr("r",circle_size_tooltip);
  }else{                                                // If circle is already selected, increase by 4
    d3.select(circle_select).attr("r",circle_size_tooltip_select);
  }
  //----------------------------------------------------------------------------------------

  tooltip.raise();      // Bring tooltip to the front 
}

//------------------------- End: Add Tooltip -------------------------------------------------
//
//############################################################################################





//############################################################################################
//
//............................ Remove Tooltip ................................................

/*
- This function removes the tooltip once the mouse leaves the circle
- This function takes in 2 arguments:
    1. plot_id: the dom id of the plot (example: hazard-curves-plot)
    2. circle_select: the selected circle (on mouseover this is passes as "this" variable)
*/


function tooltip_mouseout(plot_id,circle_select){

  var tooltip = d3.select("#"+plot_id +" svg")        // Select the tooltip
    .select(".d3-tooltip");

  tooltip.selectAll("text").remove();                 // Remove all text
  tooltip.select("rect").remove();                    // Remove the rectangle

  //................. Resize Circle .....................................
  var rcircle = d3.select(circle_select).attr("r");   // Bring the circle back to original size
  if (rcircle == circle_size_tooltip_select){         // If line is highlighted, reduce by 2
    d3.select(circle_select).attr("r",circle_size_select);
  }else{                                            
    d3.select(circle_select).attr("r",circle_size);
  }
  //---------------------------------------------------------------------

  //................ Increase Circle Back If Line is Selected ...........
  var current_linewidth = d3.select(circle_select.parentNode)     // Get circle selection parent
    .select(".line")                                              // Get line
    .attr("stroke-width");                                        // Get stroke width

  if(current_linewidth == linewidth_size_select){                 // If line is highlighted, make sure dots are as well
    d3.select(circle_select).attr("r",circle_size_select);
  }  
  //---------------------------------------------------------------------

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
    * xlabel:       "X label"
    * ylabel:       "Y label"
    * plot_id:      "DOM id for plot"
    * resize:       "resize element id"
    * margin:       {top: ,right: , bottom: , left: }

- An example:
  var plot_info = {                           // Plot info object
    series_data:   component_hazard_data,     // Series data to plot
    series_labels: component_hazard_labels,   // Series labels
    xlabel:        xlabel,                    // X label
    ylabel:        ylabel,                    // Y label
    plot_id:       plot_id,                   // DOM ID for plot
    margin:       {top:20,right:50,bottom:50,left:70},  // Margin for D3
    resize:       "component"                 // DOM ID for resize element 
  };
*/


var circle_size = 4;                              // Radius of any circles
var linewidth   = 3;                              // Line width for paths
var circle_size_select         = circle_size+2;   // Radius when line is selected
var circle_size_tooltip        = circle_size+2;   // Radius when hovering over a circle
var circle_size_tooltip_select = circle_size+4    // Radius when hovering and line is selected
var linewidth_size_select      = linewidth+2;     // Line width when selected

function plot_curves(plot_info){

  //....................... Get Plot Info .........................................
  var series_data           = plot_info.series_data;        // Get the series data
  var series_label_displays = plot_info.series_label_displays;      // Get the series labels
  var series_label_values   = plot_info.series_label_values;         // Get IMT values (not display)
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
      if (dp[1] < 1e-14){                           // If a Y value is zero, set it to null
        dp[1] = null;
      }
    })
  });
  //-------------------------------------------------------------------------------

  

  var y_extremes = get_y_extremes();                //  Get the Y extreme values: min and max
  var x_extremes = get_x_extremes();                //  Get the X extreme values: min and max
  
  var height = plot_height();                       // Get the height of the plot element
  var width  = plot_width();                        // Get the width of the plot element

  var x_bounds = d3.scaleLog()                      // Set the X axis range and domain in log space                 
    .range([0,width])                               // Set range to width of plot element to scale data points
    .domain(x_extremes)                             // Set the min and max X values
    .nice();

  var y_bounds = d3.scaleLog()                      // Set the Y axis range and domain in log space
    .range([height,0])                              // Set the range inverted to make SVG Y axis from bottom instead of top 
    .domain(y_extremes)                             // Set the min and max Y values
    .nice()

  var line = d3.line()                              // Set the D3 line
    .defined(function(d,i) {return d[1] != null})   // Plot all but null values
    .x(function(d,i) {return x_bounds(d[0])})       // Return X data scaled to width of plot 
    .y(function(d,i) {return y_bounds(d[1])});      // Return Y data scaled to width of plot

  
  //.......................... Get X Min and Max Values ...........................
  function get_x_extremes(){
    var x_max = d3.max(series_data,function(ds,is){
      var tmp = d3.max(ds,function(dp,ip){
        return dp[0];
      });
      return tmp;
    });
    
    var x_min = d3.min(series_data,function(ds,is){
      var tmp = d3.min(ds,function(dp,ip){
        return dp[0];
      });
      return tmp;
    });

    return [x_min,x_max];               // Return an array of the min and max values
  }
  //-------------------------------------------------------------------------------


  //.......................... Get Y Min and Max Values ...........................
  function get_y_extremes(){
    var y_max = d3.max(series_data,function(ds,is){
      var tmp = d3.max(ds,function(dp,ip){
        return dp[1];
      });
      return tmp;
    });
    
    var y_min = d3.min(series_data,function(ds,is){
      var tmp = d3.min(ds,function(dp,ip){
        return dp[1];
      });
      return tmp;
    });

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
      .domain(x_extremes)
      .nice();

    y_bounds
      .range([height,0])      // Reset the Y range and domain
      .domain(y_extremes)
      .nice()

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
        .attr("class","d3-plot")                                        // Set class
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
        .attr("id", function(d,i){return series_label_values[i]} )
        .attr("fill","none")                    // Set group fill of none
        .style("cursor","pointer");
    //--------------------------------------------------------

    //............ Plot Data Set as Paths ....................
    series_enter.append("path")                 // Append a path tag to the data class
      .attr("class","line")                     // Make new path tag have class of line
      .attr("d",line)                           // Set the path using the line variable
      .attr("stroke",function(d,i){return color[i];})   // Set the colors of each line
      .attr("stroke-width",linewidth);          // Set line width 
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
    var nleg = series_label_displays.length-1;                              // Get how many legend entrys there are minus 1 for indexing

    var legend = svg.append("g")                                    // Append a new group under main svg group     
      .attr("class","legend")                                       // Set class to legend
      .selectAll("g")                                               // Select all groups to create under legend class      
        .data(series_label_displays)                                // Join data to legend class
        .enter()                                                    // Get each new node 
      .append("g")                                                  // Append a group for each label
        .attr("class","legend-entry")                               // Set class to legend-entry
        .attr("id",function(d,i){return series_label_values[nleg-i]})        // Set id to imt 
        .attr("transform","translate(10,"+(height*(1-0.08))+")")    // Position legend to bottom-left
        .style("cursor","pointer");
    
    
    // Legend Text
    legend.append("text")                                         // Append a text tag to legend-entry class
      .attr("class","legend-text")
      .attr("font-size","1em")
      .attr("x",30)                                               // Set X location of each legend label
      .attr("y", function(d,i){return 18*-i})                     // Set Y location of each legend label
      .attr("alignment-baseline","central")                       // Set alignment
      .text(function(d,i){return series_label_displays[nleg-i]}); // Set the text of each label, do nleg-i to put PGA at top of legend
     
    // Legend Line Indicator
    legend.append("line")                                         // Append a svg line tag
      .attr("class","legend-line")                                // Set class to legend-line
      .attr("x2",24)                                              // Set width of line 
      .attr("y1", function(d,i){return 18*-i})                    // Set Y location of starting point
      .attr("y2", function(d,i){return 18*-i})                    // Set Y location of ending point
      .attr("stroke-width",linewidth)                             // Set stroke width of line
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
  plot();                             // Plot the curves
  //-------------------------------------------------------------------------------



  //..................... Redraw Plot On Window Resize ............................
  $(window).resize(function(){
    plot_resize();
  });
  //-------------------------------------------------------------------------------
 
  //.................... Redraw Plot when Resize Button is Pressed ................ 
  resize_div_id.onclick = function(){
    panel_resize(resize_id);
    plot_resize(); 
  }
  //-------------------------------------------------------------------------------

}

//---------------------- End: D3 Plot Function -----------------------------------------------
//
//############################################################################################








