

class MapTooltip{
  
  //............ Contructor ...................
  constructor(plotObj,text){
    let _this = plotObj;
    this.dy = parseFloat(10);
    this.text = text;
    
    this.mouseCoord = d3.mouse(d3.select(_this.plot).node());
    this.x = this.mouseCoord[0];
    this.y = this.mouseCoord[1];
 
  }
  //-------------------------------------------

  setTooltip(){
    var svg = d3.select("#"+this.mapId+" svg")
      .select("g");
    
    var tooltip = svg.append("g")
      .attr("class","d3-tooltip");
    
    tooltip.selectAll("text")                       
      .data(this.text)                             
      .enter()
      .append("text")                                 
        .attr("class","tooltip-text")                 
        .style("visibility","hidden")                 
        .attr("font-size",11)                         
        .attr("y",function(d,i){return i*16} )        
        .attr("alignment-baseline","text-before-edge")
        .text(function(d,i){return d});               

    var tooltip_geom   = tooltip.node()               
      .getBoundingClientRect();

    var pad = parseFloat(10);
    var tooltip_width  = parseFloat(tooltip_geom.width  + 2*pad); 
    var tooltip_height = parseFloat(tooltip_geom.height + 2*pad); 


    var plot_geom = svg.node()
			.getBoundingClientRect();
		var plot_width  = plot_geom.width;                            // Get the width of the actual plot where the data is
		var plot_height = plot_geom.height;                           // Get the height of the actual plot where the data is


		var xper = this.x/plot_width;               // Get the X location in percentage
		var yper = this.y/plot_height;              // Get the Y location in percentage

		if (xper < 0.30){                       // If the X location of the dot is < 10%, have box start to the right of the circle
			var xrect = (this.x);
			var xtext = (this.x+pad);
		}else if (xper > 0.70){                 // If the X location of the dot is > 70%, have box end to the left of the circle
			var xrect = (this.x-tooltip_width);
			var xtext = (this.x-tooltip_width+pad);
		}else{                                  // Center box location in X
			var xrect = (this.x-tooltip_width/2);
			var xtext = (this.x-tooltip_width/2+pad);
		}

		if (yper < 0.25){                       // If Y location of the dot is < 25% (from top), place box below circle
			var yrect = (this.y+this.dy);
			var ytext = (this.y+this.dy+pad);
		}else{                                  // Else put the box above the circle
			var yrect = (this.y-tooltip_height-this.dy);
			var ytext = (this.y-this.dy-tooltip_height+pad);
		}

		var rect_trans = "translate("+xrect+","+yrect+")";    // The translation for the tooltip box
		var text_trans = "translate("+xtext+","+ytext+")";    // The translation for the tooltip text


    tooltip.append("rect")                        // Create a rectangle
      .attr("class","tooltip-outline")            // Add a class to the rectangle
      .attr("height",tooltip_height)              // Set height
      .attr("width",tooltip_width)                // Set width
      .attr("transform",rect_trans)               // Translate the rectangle to correct position
      .attr("stroke","#999")                      // Set stroke color
      .attr("fill","white");                      // Set fill color

    tooltip.selectAll(".tooltip-text")
      .style("visibility","initial")
      .attr("transform",text_trans)
      .raise();


  }


  setRadius(circle,scale){
    var r = d3.select(circle).attr("r");
    d3.select(circle)
      .attr("r",scale*r);

  }

}
