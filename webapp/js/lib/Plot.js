




class Plot{


  constructor(divContId){
    
    this.data;
    this.labels;
    this.xlabel; 
    this.ylabel;
    this.xscale;
    this.yscale;
     
    
    this.divContId = divContId;

    this.content = d3.select("#"+divContId);
    
    var nplots = this.content
      .selectAll(".plot-panel").size();
    
    if (nplots > 0){
      var colSize     = "col-lg-6";
      this.content
        .selectAll(".plot-panel")
        .each(function(d,i){
          d3.select(this).classed(colSize,true);
        });
    }else{
      var colSize     = "col-lg-12";
    }
       

    this.plotPanel = this.content
      .append("div")
        .attr("class","plot-panel " + colSize)
      .append("div")
        .attr("class","panel panel-default hidden");
    
    this.plotHeader = this.plotPanel
      .append("div")
        .attr("class","panel-heading");

    this.plot = this.plotPanel
      .append("div")
        .attr("class","panel-body");
    
    this.plotFooter = this.plotPanel
      .append("div")
        .attr("class","panel-footer");

    this.footerBtns = this.plotFooter
      .append("div")
        .attr("class","form-inline axes-btns");

    //............. X Axis Buttons ...............
    this.xAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.xAxisForm
      .append("label")
        .attr("for","x-axis-btns")
        .text("X-axis");

    this.xAxisBtns = this.xAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","x-axis-btns")
        .attr("data-toggle","buttons");

    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='linear'/> Linear");
    
    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='log'/> Log");
    //--------------------------------------------
      
    //............. Y Axis Buttons ...............
    this.yAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.yAxisForm
      .append("label")
        .attr("for","y-axis-btns")
        .text("Y-axis");

    this.yAxisBtns = this.yAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","y-axis-btns")
        .attr("data-toggle","buttons");

    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='linear'/> Linear");
    
    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='log'/> Log");
    //--------------------------------------------

  }

  
  //............. Set Plot Title ...........
  setTitle(title){
    this.plotHeader
      .text(title); 
  }
  //---------------------------------------


  //............ Set Plot X/Y Scale ..................
  setPlotScale(xscale,yscale){
    this.xscale = xscale.toLowerCase();
    this.yscale = yscale.toLowerCase();
    
    // X Axis Scale
    this.xAxisBtns.selectAll("input").each(function(d,i){
      var btn = d3.select(this);
      if (btn.attr("value") == xscale) d3.select(this.parentNode).classed("active",true); 
    });

    // Y Axis Scale
    this.yAxisBtns.selectAll("input").each(function(d,i){
      var btn = d3.select(this);
      if (btn.attr("value") == yscale) d3.select(this.parentNode).classed("active",true); 
    });

  }
  //--------------------------------------------------

 
 
  //...................... Replace Y values with null ........................  
  removeSmallValues(limit){
    this.data.forEach(function(d,id){        
      d.forEach(function(dp,idp){                
        if (dp[1] <= limit){                         
          dp[1] = null;
        }
      })
    });
  }
  //-------------------------------------------------------------------------------
 
 
  
  //......................... Set Plot Panel Content Height .......................
  updatePlotSize(){
      
    var plotHeaderHeight = this.plotHeader
      .node()
      .getBoundingClientRect()
      .height;
    
    var plotFooterHeight = this.plotFooter
      .node()
      .getBoundingClientRect()
      .height;
    
    var pad = plotHeaderHeight + plotFooterHeight + "px";   // Get the total height of header and footer in px
    
    var nplots = this.content
      .selectAll(".panel-body").size();
    console.log(nplots);
    
    if (nplots > 0){
      var plotHeight = "50%";
      this.content
        .selectAll(".panel-body")
        .each(function(d,i){
          d3.select(this)
            .style("height", "calc("+plotHeight+" - "+pad+")");
        });
      this.content
        .selectAll(".plot-panel")
        .each(function(d,i){
          d3.select(this)
            .style("height", plotHeight);
        });
    }else{
      var plotHeight = "100%";
    }
    
    this.plot.style("height", "calc("+plotHeight+" - "+pad+")");      // Set the plot content height 
  }
  //-------------------------------------------------------------------------------
 
  
  
  plotData(){
    
    this.plotPanel.classed("hidden",false);                 // Remove class hidden
  
    //..................... Get Color Scheme ........................................
    var ndata = this.data.length;           // Get how many data sets there are
    if (ndata < 10){                        // If 10 or less data sets
      var color  = d3.schemeCategory10;     // Get the color scheme with 10 colors
    }else{                                  // If there are more than 10 data sets
      var color  = d3.schemeCategory20;     // Get the color scheme with 20 colors
    } 
    //-------------------------------------------------------------------------------
  
  }
  



}






/*
var circle_size = 4;                              // Radius of any circles
var linewidth   = 3;                              // Line width for paths
var circle_size_select         = circle_size+2;   // Radius when line is selected
var circle_size_tooltip        = circle_size+2;   // Radius when hovering over a circle
var circle_size_tooltip_select = circle_size+4    // Radius when hovering and line is selected
var linewidth_size_select      = linewidth+2;     // Line width when selected

function plot_curves(plot_info){

  


  //.......................... Setup For Resizable Panels .........................
  var plot_height_check = panel_id.parentNode.clientHeight;         // Get height of panel
  if (plot_height_check > 500){                                     // If panel is greater than 500px, set col to 12
    $("#"+resize_id).removeClass(icon_full).addClass(icon_small);   // Set glyphicon to resize small 
    $("#"+plot_id).parent().parent()                                // Set col to 12
      .removeClass(plot_size_min)
      .addClass(plot_size_max);
  }else{                                                            // Else set panel col to 6
    $("#"+resize_id).removeClass(icon_small).addClass(icon_full);   // Set glyphicon to resize full
    $("#"+plot_id).parent().parent()                                // Set col to 6
      .removeClass(plot_size_max)
      .addClass(plot_size_min);
  }
  //-------------------------------------------------------------------------------
 


 
  






  //........................ Get Values ...........................................
  var y_extremes = get_y_extremes();                //  Get the Y extreme values: min and max
  var x_extremes = get_x_extremes();                //  Get the X extreme values: min and max
  
  var height = plot_height();                       // Get the height of the plot element
  var width  = plot_width();                        // Get the width of the plot element
  
  var x_bounds = get_xscale();
  x_bounds.range([0,width])                         // Set range to width of plot element to scale data points
    .domain(x_extremes)                             // Set the min and max X values
    .nice();
  
  var y_bounds = get_yscale();
  y_bounds.range([height,0])                        // Set the range inverted to make SVG Y axis from bottom instead of top 
    .domain(y_extremes)                             // Set the min and max Y values
    .nice()
  //------------------------------------------------------------------------------- 


  
 
  //........................ Get X Scale Function ..................................
  function get_xscale(){
    if (x_scale == "log"){
      var x_bounds = d3.scaleLog();       
    }else if (x_scale == "linear"){
      var x_bounds = d3.scaleLinear();
    }
    return x_bounds;
  }
  //------------------------------------------------------------------------------- 



  //........................ Get Y Scale Function ..................................
  function get_yscale(){
    if (y_scale == "log"){
      var y_bounds = d3.scaleLog();      
    }else if (y_scale == "linear"){
      var y_bounds = d3.scaleLinear();
    }
    return y_bounds;
  }
  //------------------------------------------------------------------------------- 

  
  //........................ Line Function ........................................
  var line = d3.line()                              // Set the D3 line
    .defined(function(d,i) {return d[1] != null})   // Plot all but null values
    .x(function(d,i) {return x_bounds(d[0])})       // Return X data scaled to width of plot 
    .y(function(d,i) {return y_bounds(d[1])});      // Return Y data scaled to width of plot
  //------------------------------------------------------------------------------- 

  
  //..................... Get X Min and Max Values Functions ......................
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


  //.................... Get Y Min and Max Values  Functions ......................
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




  //........................ Set Legend Location Function .........................
  function legend_location(height,width){
    var legend_geom = d3.select("#"+plot_id+" svg")
      .select(".legend")   
      .node()
      .getBoundingClientRect();
    var legend_width  = legend_geom.width;
    var legend_height = legend_geom.height;
    
    if (x_scale == "linear" || y_scale == "linear"){
      var translate = "translate("+(width-legend_width)+","+legend_height+")";
    }else{
      var translate = "translate(10,"+(height*(1-0.05))+")";
    }
    return translate; 
  } 
  //-------------------------------------------------------------------------------




  //........................ Plot Resize Function .................................
  function plot_resize(do_transition){
    
    var header_height = panel_id
      .getElementsByClassName("panel-heading")[0]
      .clientHeight;
    var footer_height = panel_id
      .getElementsByClassName("panel-footer")[0]
      .clientHeight;
    var pad = header_height + footer_height + "px";
    plot_div_id.style.height = "calc(100% - "+pad+")";  

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
    
    var translate = legend_location(height,width);
    var svg_legend = svg.selectAll(".legend-entry");

    var svg_line = svg.selectAll(".line");
    var svg_dot  = svg.selectAll(".dot");
    
    if (do_transition){
      svg_line.transition()
        .duration(500)
        .attr("d",line);
      
      svg_dot.transition()
        .duration(500)
        .attr("cx",line.x())
        .attr("cy",line.y());
      
      svg_legend.transition()
        .duration(500)
        .attr("transform",translate);
      
    }else{
      svg_line.attr("d",line);
      svg_dot.attr("cx",line.x())                                  // Update the X location of the circles
        .attr("cy",line.y());                                 // Update the Y location of the circles
      svg_legend.attr("transform",translate);
    }

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
      .style("font-size","10px")
      .call(d3.axisBottom(x_bounds));                 // Make tick marks
   
    
    // X Label
    x_axis.append("text")                             // Append a text tag to the x-axis class
      .attr("class","x-label")                        // Make text tag have class of x-label
      .attr("text-anchor","middle")                   // Set text to be centered
      .attr("alignment-baseline","middle")
      .style("font-size","12px")
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
      .style("font-size","10px")
      .call(d3.axisLeft(y_bounds));       // Set tick marks

    // Y Label
    y_axis.append("text")                 // Append a new text tag to y-axis class
      .attr("class","y-label")            // Set class to y-label
      .attr("transform","rotate(-90)")    // Rotate the text
      .attr("text-anchor","middle")       // Set to center text
      .style("font-size","12px")
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
        .style("cursor","pointer");
    
    
    // Legend Text
    legend.append("text")                                         // Append a text tag to legend-entry class
      .attr("class","legend-text")
      .attr("font-size","12px")
      .attr("x",30)                                               // Set X location of each legend label
      .attr("y", function(d,i){return 16*-i})                     // Set Y location of each legend label
      .attr("alignment-baseline","central")                       // Set alignment
      .text(function(d,i){return series_label_displays[nleg-i]}); // Set the text of each label, do nleg-i to put PGA at top of legend
     
    // Legend Line Indicator
    legend.append("line")                                         // Append a svg line tag
      .attr("class","legend-line")                                // Set class to legend-line
      .attr("x2",24)                                              // Set width of line 
      .attr("y1", function(d,i){return 16*-i})                    // Set Y location of starting point
      .attr("y2", function(d,i){return 16*-i})                    // Set Y location of ending point
      .attr("stroke-width",linewidth)                             // Set stroke width of line
      .attr("stroke",function(d,i){return color[nleg-i]})         // Set color of line
      .attr("fill","none");                                       // Set fill to none
      
    // Legend Circle on the Line
    legend.append("circle")                                       // Append a svg circle tag
      .attr("class","legend-circle")                              // Set class to legend-circle
      .attr("cx",12)                                              // Set X location to center of line
      .attr("cy",function(d,i){return 16*-i})                     // Set Y location
      .attr("r",circle_size)                                      // Set radius
      .attr("fill",function(d,i){return color[nleg-i]} );         // Set fill color to match
    
    // Set translation 
    var translate = legend_location(height,width);
    legend.attr("transform",translate)    // Position legend to bottom-left
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

  //.......................... Setup Plot Selection ...............................
  plot_selection(plot_id);
  //-------------------------------------------------------------------------------

  
  //............................. X Axis Scale ....................................
  var xaxis_btn_id = document.getElementById(xaxis_btn);
  xaxis_btn_id.onchange = function(){
    x_scale = $("#"+xaxis_btn + " [class*=active] input").val();
    x_bounds = get_xscale();
    plot_resize(true);
  }
  //-------------------------------------------------------------------------------

  //............................. Y Axis Scale ....................................
  var yaxis_btn_id = document.getElementById(yaxis_btn);
  yaxis_btn_id.onchange = function(){
    y_scale = $("#"+yaxis_btn + " [class*=active] input").val();
    y_bounds = get_yscale();
    plot_resize(true);
  }
  //-------------------------------------------------------------------------------



  //............................... Tooltip ........................................
  d3.select("#"+plot_id + " svg")                                     // Get plot svg
    .select(".all-data")                                              // Select data group
    .selectAll(".dot")                                                // Select all circles
    .on("mouseover",function(d,i){                                    // If a the mouse pointer is over a circle, add tooltip about that circle
      if (x_scale == "log"){
        var xval   = d3.select(this).data()[0][0].toExponential(3);   // Get X value in log
      }else if (x_scale == "linear"){
        var xval   = d3.select(this).data()[0][0].toFixed(3);         // Get X value 
      }
      if (y_scale == "log"){
        var yval   = d3.select(this).data()[0][1].toExponential(3);   // Get Y value in log
      }else if (y_scale == "linear"){
        var yval   = d3.select(this).data()[0][1].toFixed(3);         // Get Y value
      }
      var value    = d3.select(this.parentNode).attr("id");           // Get the selected id of the data group
      var jdisplay = series_label_values.findIndex(function(d,i){     // Find index where id is 
        return d == value;
      });
      var display = series_label_displays[jdisplay];                  // Get display 
      var text = [                                                    // Set the tooltip text
        tooltip_text[0] + ": " + display,
        tooltip_text[1] + ": " + xval,
        tooltip_text[2] + ": " + yval]
      tooltip_mouseover(plot_id,this,text);                           // Make tooltip
    })
    .on("mouseout",function(d,i){                                     // When mouse pointer leaves circle, remove tooltip
      tooltip_mouseout(plot_id,this);                                 // Remove tooltip
    });
  //-------------------------------------------------------------------------------



}

//---------------------- End: D3 Plot Function -----------------------------------------------
//
//############################################################################################






//############################################################################################
//
//........................ Listen for a Line/Circle Selection ................................


function plot_selection(plot_id){
  
  var svg = d3.select("#"+plot_id + " svg");    // Select the svg of the plot id

  //.................. Highlight Line when Selected on Plot ..................
  svg.selectAll(".data")                                         // Select all data, lines and circles 
    .on("click",function(d,i){                                  // If a circle or line is clicked, increase stroke-widtd
      var selected_id = d3.select(this).attr("id");  // Get selected id
      make_selection(plot_id,selected_id);           // Update plot with new selection
    });
  //--------------------------------------------------------------------------

  //.............. Highlight Line when Legend Entry Selected .................
  svg.select(".legend")                                          // Select legend
    .selectAll(".legend-entry")                                 // Select all legend entrys
    .on("click",function(d,i){                                  // If a legend entry is clicked, highlight corresponding line
      var selected_id = d3.select(this).attr("id");  // Get selected id
      make_selection(plot_id,selected_id);           // Update with new selection
    });
  //--------------------------------------------------------------------------

}

//------------------- End: Listen for a Line/Circle Selection --------------------------------
//
//############################################################################################



//############################################################################################
//
//........................... Highlight a Selected Line ......................................


function make_selection(plot_id,selected_id){
  
  plot_selection_reset(plot_id);                            // Remove any current selection on plot
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

function tooltip_mouseover(plot_id,circle_select,tooltip_text){

  var tooltip = d3.select("#"+plot_id +" svg")            // Select tooltip
    .select(".d3-tooltip");
  
  var svg = d3.select("#"+plot_id + " svg");              // Select plot svg
  

  //........................... Create the Tooltip Text ....................................
  tooltip.selectAll("text")                           // Select all text fields in tooltip
    .data(tooltip_text)                               // Join the text
    .enter()
    .append("text")                                   // Create a text field for each text in array
      .attr("class","tooltip-text")                   // Add a class to each text
      .style("visibility","hidden")                   // Make text hidden as it is not in right location yet
      .attr("font-size",11)                           // Set font size
      .attr("y",function(d,i){return i*16} )          // Set Y location of each text
      .attr("alignment-baseline","text-before-edge")  // Set to be aligned center
      .text(function(d,i){return d});                 // Set text

  var tooltip_geom   = tooltip.node()                 // Get dimensions of text box
    .getBoundingClientRect();

  var pad = 10;                                       // Padding
  var tooltip_width  = tooltip_geom.width  + 2*pad;   // Get tooltip width and add padding
  var tooltip_height = tooltip_geom.height + 2*pad;   // Get tooltip height and add padding
  //----------------------------------------------------------------------------------------


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

  var dy  = 12;                           // Set the distance in Y between circle and tooltip
  if (xper < 0.30){                       // If the X location of the dot is < 10%, have box start to the right of the circle
    var xrect = cx;
    var xtext = cx+pad;
  }else if (xper > 0.70){                 // If the X location of the dot is > 70%, have box end to the left of the circle
    var xrect = cx-tooltip_width;
    var xtext = cx-tooltip_width+pad;
  }else{                                  // Center box location in X
    var xrect = cx-tooltip_width/2;
    var xtext = cx-tooltip_width/2+pad;
  }

  if (yper < 0.25){                       // If Y location of the dot is < 25% (from top), place box below circle
    var yrect = cy+dy;
    var ytext = cy+dy+pad;
  }else{                                  // Else put the box above the circle
    var yrect = cy-tooltip_height-dy;
    var ytext = cy-dy-tooltip_height+pad;
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
    .style("padding","10px")
    .attr("fill","white");                      // Set fill color
  //----------------------------------------------------------------------------------------
  
  //......................... Translate Text to Correct Spot ...............................
  tooltip.selectAll(".tooltip-text")
    .style("visibility","initial")
    .attr("transform",text_trans)
    .raise();
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
//........................... Resize Plot ....................................................
var plot_size_min = "col-lg-6";
var plot_size_max = "col-lg-12";
var icon_full = "glyphicon glyphicon-resize-full";
var icon_small = "glyphicon glyphicon-resize-small";

function panel_resize(resize_id){
  var plot_name = resize_id.split("-")[0];
  var panel_id  = plot_name+"-plot-panel";
  var plot_id   = plot_name+"-curves-plot";
 
  var isMin = $("#"+panel_id).parent().hasClass(plot_size_min);
  if (isMin){
    $("#"+panel_id).parent().removeClass(plot_size_min).addClass(plot_size_max);
    $("#"+panel_id).parent().css("height","100%");
    $("#"+resize_id).removeClass(icon_full).addClass(icon_small); 
  }else{
    $("#"+panel_id).parent().removeClass(plot_size_max).addClass(plot_size_min);
    $("#"+panel_id).parent().css("height","500px");
    $("#"+resize_id).removeClass(icon_small).addClass(icon_full); 
 }

}
//---------------------- End: Resize Plot  ---------------------------------------------------
//
//############################################################################################

*/
