'use strict';



class D3Line extends D3View{


  constructor(el){
    let _this,
        _svgD3,
        _plotD3,
        _width,
        _height,
        _svgHeight,
        _svgWidth,
        _xD3,
        _yD3;
         
    
    _this = super(el);

    _this.data;
    _this.labels;
    _this.xlabel; 
    _this.ylabel;
    _this.xscale;
    _this.yscale;
    


    _svgD3 = d3.select(_this.plotBody)
        .append("svg")
        .attr("class","D3Line");
        
        
    _plotD3 = _svgD3.append("g")
        .attr("class","plot");

    _plotD3.append("g")
        .attr("class","all-data");
        
    _xD3 = _plotD3.append("g")
        .attr("class","x-axis");
    _xD3.append("g")
        .attr("class","x-tick");
    _xD3.append("text")
        .attr("class","x-label");
         
    _yD3 = _plotD3.append("g")
        .attr("class","y-axis");
    _yD3.append("g")
        .attr("class","y-tick");
    _yD3.append("text")
        .attr("class","y-label");

    _plotD3.append("g")
        .attr("class","legend"); 

    _plotD3.append("g")
        .attr("class","d3-tooltip"); 


    _this.svg  = _this.el.querySelector(".D3Line");
    _this.plot = _this.svg.querySelector(".plot");
    _this.allData = _this.svg.querySelector(".all-data");
    _this.xAxis = _this.svg.querySelector(".x-axis"); 
    _this.yAxis = _this.svg.querySelector(".y-axis"); 
    _this.legend = _this.svg.querySelector(".legend");
  }
  
 
  //....................... Replace Y values with null ......................... 
  removeSmallValues(limit){
    this.data.forEach(function(d,id){        
      d.forEach(function(dp,idp){                
        console.log(dp[1]);
        if (dp[1] <= limit){                         
          dp[1] = null;
          dp[0] = null;
        }
      })
    });
  }
  //----------------------------------------------------------------------------
 
 
  //......................... Get Plot Height Function .........................
  static plotHeight(obj,isSvg){
    let _this,
        _bodyHeight,
        _titleHeight,
        _footerHeight,
        _options,
        _height,
        _panelMargin,
        _margin;

    _this = obj;
    _options = _this.options;

    _bodyHeight = _this.plotBody
        .getBoundingClientRect()
        .height;

    _footerHeight = _this.plotFooter
        .getBoundingClientRect()
        .height;
    
    _titleHeight = _this.plotTitle
        .getBoundingClientRect()
        .height;
   
    _panelMargin = _footerHeight + _titleHeight;
    _margin = _options.marginTop + _options.marginBottom;
    
    _height = isSvg ?  _bodyHeight - _panelMargin :
        _bodyHeight - _panelMargin - _margin; 
    
    return _height;
  }
  //----------------------------------------------------------------------------


  //......................... Get Plot Height Function .........................
  static plotWidth(obj,isSvg){
    let _this,
        _bodyWidth,
        _options,
        _width,
        _margin;

    _this = obj;
    _options = _this.options;

    _bodyWidth = _this.plotBody
        .getBoundingClientRect()
        .width;

    _margin = _options.marginLeft + _options.marginRight;
    
    _width = isSvg ?  _bodyWidth :
        _bodyWidth - _margin; 
    
    return _width;
  }
  //----------------------------------------------------------------------------

  
  
  plotData(){
    let _this,
        _ndata,
        _height,
        _width,
        _seriesEnter;
    
    
    _this = this;
    _this.line;
    _this.color;
    _this.yExtremes;
    _this.xExtremes;
    _this.xBounds;
    _this.yBounds;
     
    //..................... Get Color Scheme ...................................
    _ndata = this.data.length;           
    _this.color = _ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    //--------------------------------------------------------------------------
     
    //........................ Line Function ...................................
    _this.line = d3.line()                            
      .defined(function(d,i) {return d[1] != null})  
      .x(function(d,i) {return _this.xBounds(d[0])})        
      .y(function(d,i) {return _this.yBounds(d[1])});      
    //-------------------------------------------------------------------------- 
  

    //........................ Get Values ......................................
    _this.yExtremes = getYextremes(_this);
    _this.xExtremes = getXextremes(_this);
    
    _height = D3Line.plotHeight(_this);
    _width  = D3Line.plotWidth(_this);
    
    _this.xBounds = getXscale(_this);
    _this.xBounds.range([0,_width])
        .domain(_this.xExtremes)
        .nice();

    _this.yBounds = getYscale(this);
    _this.yBounds.range([_height,0])
        .domain(_this.yExtremes)
        .nice();
    //-------------------------------------------------------------------------- 
  
    d3.select(_this.svg)
        .attr("width",D3Line.plotWidth(_this,true))
        .attr("height",D3Line.plotHeight(_this,true));
      
    d3.select(_this.svg)
        .select(".plot")
        .attr("transform","translate("+
            _this.options.marginLeft+","+ _this.options.marginTop+")")  
      
    
    //.............. Create Group for Each Data Set ............................ 
    _seriesEnter = d3.select(_this.allData)
        .selectAll("g")           
        .data(_this.data)        
        .enter()                
        .append("g")              
        .attr("class","data")   
        .attr("id", function(d,i){return _this.labels[i]} )
        .attr("fill","none")   
        .style("cursor","pointer");
    //--------------------------------------------------------------------------
    

    //..................... Plot Data Set as Paths .............................
    _seriesEnter.append("path")
        .attr("class","line") 
        .attr("d",this.line)
        .attr("stroke",function(d,i){return _this.color[i];}) 
        .attr("stroke-width",_this.options.linewidth);
    //--------------------------------------------------------------------------

     
    //...................... Plot Data Set as Circles ..........................
    _seriesEnter.selectAll("circle")
        .data(function(d,i) {return d})
        .enter()
        .filter(function(d,i){return d[1] != null})
        .append("circle") 
        .attr("class","dot") 
        .attr("fill", function(d,i){
          return d3.select(this.parentNode.firstChild).style("stroke");
        })
        .attr("cx",_this.line.x())
        .attr("cy",_this.line.y())
        .attr("r", _this.options.pointRadius)
    //--------------------------------------------------------------------------
    
    
    //......................... Setup the X Axis ...............................
    // X Tick Marks     
    d3.select(_this.xAxis)
        .select(".x-tick")
        .attr("transform","translate(0,"+_height+")") 
        .style("font-size","10px")
        .call(d3.axisBottom(_this.xBounds));
   
    
    // X Label
    d3.select(_this.xAxis)
        .select(".x-label")
        .attr("text-anchor","middle") 
        .attr("alignment-baseline","middle")
        .style("font-size","12px")
        .attr("x", _width/2) 
        .attr("y", _height+_this.options.marginBottom/2+10)
        .text(this.xlabel);
    //--------------------------------------------------------------------------



    //....................... Setup the Y Axis .................................
    // Y Tick marks
    d3.select(_this.yAxis)
        .select(".y-tick")
        .style("font-size","10px")
        .call(d3.axisLeft(_this.yBounds));

    // Y Label
    d3.select(_this.yAxis)
        .select(".y-label")
        .attr("transform","rotate(-90)")
        .attr("text-anchor","middle")
        .style("font-size","12px")
        .attr("x",0- _height/2)
        .attr("y",0- _this.options.marginLeft/2-10)
        .text(this.ylabel);
    //--------------------------------------------------------------------------
 
    /* 
    var plot = this; 
    $(window).resize(function(){
      plotResize(plot);
    });
 
 
    */
  /* 
    //............................. X Axis Scale ....................................
    this..onchange = function(){
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
  */
  }
  
  /*
  //................. Set the Legend .......................
  setLegend(){
    var labels = this.labels;
    var nleg = labels.length-1;                              // Get how many legend entrys there are minus 1 for indexing
    var height = plotHeight(this);
    var width = plotWidth(this);
    var color = this.color;
     
    var legend = this.svg.append("g")                                    // Append a new group under main svg group     
      .attr("class","legend")                                       // Set class to legend
      .selectAll("g")                                               // Select all groups to create under legend class      
        .data(labels)                                               // Join data to legend class
        .enter()                                                    // Get each new node 
      .append("g")                                                  // Append a group for each label
        .attr("class","legend-entry")                               // Set class to legend-entry
        .attr("id",function(d,i){return labels[nleg-i]})            // Set id 
        .style("cursor","pointer");
    
    
    // Legend Text
    legend.append("text")                                         // Append a text tag to legend-entry class
      .attr("class","legend-text")
      .attr("font-size","12px")
      .attr("x",30)                                               // Set X location of each legend label
      .attr("y", function(d,i){return 16*-i})                     // Set Y location of each legend label
      .attr("alignment-baseline","central")                       // Set alignment
      .text(function(d,i){return labels[nleg-i]});                // Set the text of each label, do nleg-i to put PGA at top of legend
     
    // Legend Line Indicator
    legend.append("line")                                         // Append a svg line tag
      .attr("class","legend-line")                                // Set class to legend-line
      .attr("x2",24)                                              // Set width of line 
      .attr("y1", function(d,i){return 16*-i})                    // Set Y location of starting point
      .attr("y2", function(d,i){return 16*-i})                    // Set Y location of ending point
      .attr("stroke-width",3)                             // Set stroke width of line
      .attr("stroke",function(d,i){return color[nleg-i]})         // Set color of line
      .attr("fill","none");                                       // Set fill to none
      
    // Legend Circle on the Line
    legend.append("circle")                                       // Append a svg circle tag
      .attr("class","legend-circle")                              // Set class to legend-circle
      .attr("cx",12)                                              // Set X location to center of line
      .attr("cy",function(d,i){return 16*-i})                     // Set Y location
      .attr("r",5)                                      // Set radius
      .attr("fill",function(d,i){return color[nleg-i]} );         // Set fill color to match
    
    // Set translation 
    var translate = legendLocation(this,height,width);
    legend.attr("transform",translate)    // Position legend to bottom-left
  } 
  //--------------------------------------------------------
 */
  
}






//......................... Set Plot Panel Content Height .......................
function updatePlotSize(plot){
  var plotHeaderHeight = plot.plotHeader
    .node()
    .getBoundingClientRect()
    .height;
  
  var plotFooterHeight = plot.plotFooter
    .node()
    .getBoundingClientRect()
    .height;
  
  var pad = plotHeaderHeight + plotFooterHeight + "px";   // Get the total height of header and footer in px
  var nplots = plot.content
    .selectAll(".panel-body").size();
  
  if (nplots > 1){
    var plotHeight = "50%";
    plot.content
      .selectAll(".panel-body")
      .each(function(d,i){
        d3.select(this)
          .style("height", "calc("+plotHeight+" - "+pad+")");
      });
    plot.content
      .selectAll(".plot-panel")
      .each(function(d,i){
        d3.select(this)
          .style("height", plotHeight);
      });
  }else{
    var plotHeight = "100%";
  }
  
  plot.plot.style("height", "calc("+plotHeight+" - "+pad+")");      // Set the plot content height 
}
//-------------------------------------------------------------------------------
 




//........................ Get X Scale Function ................................
function getXscale(obj){
  let _this = obj.options;

  if (_this.xAxisScale == "log"){
    var xBounds = d3.scaleLog();       
  }else if (_this.xAxisScale == "linear"){
    var xBounds = d3.scaleLinear();
  }
  return xBounds;
}
//------------------------------------------------------------------------------ 




//........................ Get X Scale Function ................................
function getYscale(obj){
  let _this = obj.options;

  if (_this.yAxisScale == "log"){
    var yBounds = d3.scaleLog();       
  }else if (_this.yAxisScale == "linear"){
    var yBounds = d3.scaleLinear();
  }
  return yBounds;
}
//------------------------------------------------------------------------------ 


//..................... Get X Min and Max Values Functions ......................
function getXextremes(_this){

  var x_max = d3.max(_this.data,function(ds,is){
    var tmp = d3.max(ds,function(dp,ip){
      return dp[0];
    });
    return tmp;
  });
  
  var x_min = d3.min(_this.data,function(ds,is){
    var tmp = d3.min(ds,function(dp,ip){
      return dp[0];
    });
    return tmp;
  });

  return [x_min,x_max];               // Return an array of the min and max values
}
//-------------------------------------------------------------------------------


//.................... Get Y Min and Max Values  Functions ......................
function getYextremes(_this){
  var y_max = d3.max(_this.data,function(ds,is){
    var tmp = d3.max(ds,function(dp,ip){
      return dp[1];
    });
    return tmp;
  });
  
  var y_min = d3.min(_this.data,function(ds,is){
    var tmp = d3.min(ds,function(dp,ip){
      return dp[1];
    });
    return tmp;
  });

  return [y_min,y_max];               // Return an array of the min and max values
}
//-------------------------------------------------------------------------------





//........................ Set Legend Location Function .........................
function legendLocation(plot,height,width){
  var legend_geom = plot.svg
    .select(".legend")   
    .node()
    .getBoundingClientRect();
  var legend_width  = legend_geom.width;
  var legend_height = legend_geom.height;
  
  if (plot.xscale == "linear" || plot.yscale == "linear"){
    var translate = "translate("+(width-legend_width)+","+legend_height+")";
  }else{
    var translate = "translate(10,"+(height*(1-0.05))+")";
  }
  return translate; 
} 
//-------------------------------------------------------------------------------



//........................ Plot Resize Function .................................
function plotResize(plot,do_transition){
  
  updatePlotSize(plot);

  var height = plotHeight(plot);                             // Get current plot height
  var width = plotWidth(plot);                               // Get current plot width
  
  plot.plot.select("svg")                                      // Select the plot
    .attr("width", width  + plot.margin.left + plot.margin.right)   // Update the svg width
    .attr("height",height + plot.margin.top  + plot.margin.bottom); // Update the svg height

  plot.xbounds                  // Reset the X range and domain
    .range([0,width])
    .domain(plot.xextremes)
    .nice();

  plot.ybounds
    .range([height,0])      // Reset the Y range and domain
    .domain(plot.yextremes)
    .nice()

  plot.svg
    .select(".x-tick")                                   // Select the x-tick class
    .attr("transform","translate(0,"+height+")")          // Update the X tick mark locations
    .call(d3.axisBottom(plot.xbounds));                       // Update the X tick makrs with the X bounds

  plot.svg
    .select(".x-label")                                  // Select the x-label class
    .attr("x",width/2.0)                                  // Update the X label X location                                
    .attr("y",height+plot.margin.bottom/2+10);                 // Update the X label Y location

  plot.svg
    .select(".y-tick")                                   // Select the y-tick class
    .call(d3.axisLeft(plot.ybounds));                         // Update the Y tick marks with Y bounds
  
  plot.svg
    .select(".y-label")                                  // Select the y-label class
    .attr("x",0-height/2)                                 // Update Y label X location
    .attr("y",0-plot.margin.left/2-10);                        // Update Y label Y location
  
  var translate = legendLocation(plot,height,width);
  var svg_legend = plot.svg.selectAll(".legend-entry");

  var svg_line = plot.svg.selectAll(".line");
  var svg_dot  = plot.svg.selectAll(".dot");
  
  if (do_transition){
    svg_line.transition()
      .duration(500)
      .attr("d",plot.line);
    
    svg_dot.transition()
      .duration(500)
      .attr("cx",plot.line.x())
      .attr("cy",plot.line.y());
    
    svg_legend.transition()
      .duration(500)
      .attr("transform",translate);
    
  }else{
    svg_line.attr("d",plot.line);
    svg_dot.attr("cx",plot.line.x())                                  // Update the X location of the circles
      .attr("cy",plot.line.y());                                 // Update the Y location of the circles
    svg_legend.attr("transform",translate);
  }

}
//-------------------------------------------------------------------------------



/*
$("#add-data-btn").ready(function(){
  $("#add-data-btn").on("click",function(){
    var Fdata = $("#add-data-file").val(); 
    Fdata = Fdata.split("\\").pop();
    var reader = new FileReader();
    console.log(reader.readAsText(Fdata));
  })
});
*/


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
 


 
  














  



  //.................... Redraw Plot when Resize Button is Pressed ................ 
  resize_div_id.onclick = function(){
    panel_resize(resize_id);
    plot_resize(); 
  }
  //-------------------------------------------------------------------------------

  //.......................... Setup Plot Selection ...............................
  plot_selection(plot_id);
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
