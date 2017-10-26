



$(function(){  
  var url = "/nshmp-haz-ws/util/testsites";
  $.getJSON(url,function(jsonReturn){
    testSites = jsonReturn.features; 
    console.log(testSites);
    setRegions();
  });
});




function setRegions(){
 
  testSites.forEach(function(site){ 
    var regionId      = site.properties.regionId;
    var regionDisplay = site.properties.regionDisplay;
    $("#region").append(
      $("<label>").addClass("btn btn-default").append(
        $("<input/>")
          .attr("name","region")
          .attr("value",regionId)
          .attr("type","radio")
      ).append(regionDisplay)
    )
  });

  $("#region [value*=WUS]")
    .parent()
    .addClass("active");
  
  plotMap();
  setTestSites();
}



function regionSelect(){
  var regionSelect = $("#region [class*=active] input").val();
  var region = testSites.find(function(fc,ifc){
    return fc.properties.regionId == regionSelect;
  });
  return region;
}


function siteSelect(){
  var region = regionSelect();
  var siteSelect = $("#testsite option:selected").val();
  var site = region.features.find(function(f,i){
    return f.properties.locationId == siteSelect;
  });
  return site != undefined ?  site : "default"; 
}



$("#region").change(function(){setTestSites()});

function setTestSites(){
  $("#lat").val("");
  $("#lon").val("");
  
  var siteOptions = $().add(
    $("<option>")
    .attr("value","default")
    .text("Please select ...")
  );
  
  var region = regionSelect();
  region.features.forEach(function(feature){
    var site   = feature.properties.location;
    var siteId = feature.properties.locationId;
    siteOptions = siteOptions.add( 
      $("<option>")
      .attr("value",siteId)
      .attr("id",siteId)
      .text(site)
    );
  })
  $("#testsite").empty().append(siteOptions);
  
  var regionId = region.properties.regionId;
  var bounds   = region.properties;
  checkBounds(regionId,bounds);


}



$("#testsite").change(function(){coordinates()});
function coordinates(){
  var region = regionSelect();
  var site   = siteSelect();
  if (site != "default"){
    var lon = site.geometry.coordinates[0];
    var lat = site.geometry.coordinates[1];
    $("#lat").val(lat);
    $("#lon").val(lon);
  }else{ 
    $("#lat").val("");
    $("#lon").val("");
  }

}




$("#region").change(function(){
  d3.select("#map svg").remove();
  plotMap()
});
function plotMap(){

  var margin = {top: 20,right: 20,bottom: 20,left: 20};

  var region = regionSelect();

  //......................... Get Plot Height Function ............................
  function plotHeight(){
    var height = $("#map").height();              // Get the height of the plot element
    height = height - margin.top  - margin.bottom;      // Subtract the top and bottom margins
    return height;                                      // Return plottable height
  }
  //-------------------------------------------------------------------------------


  //......................... Get Plot Width Function .............................
  function plotWidth(){
    var width = $("#map").width();                // Get the width of the plot element
    width  = width  - margin.left - margin.right;       // Subtract the left and right margins
    return width;                                       // Return plottable width
  }
  //-------------------------------------------------------------------------------


  var height = plotHeight();
  var width  = plotWidth();
  
  var rMin = 4.5;
	var rMax = 7;
	var rDelta = rMax - rMin;
	var rSelect = 9;

  var projection = d3.geoAlbersUsa()
    .scale(width)
    .translate([width/2,height/2])
    .fitSize([width,height],region);
  
  var path = d3.geoPath()
    .projection(projection);
  
  function siteRadius() {
    var scale = 4.5 / d3.event.transform.k ; 
    return scale;
  }

  var svgHeight = height + margin.top   + margin.bottom;
  var svgWidth  = width  + margin.right + margin.left;

  var zoom = d3.zoom()
    .scaleExtent([0.1,10])
    .on("zoom",zoom);

  function zoom(){
    d3.select(".map").attr("transform",d3.event.transform);
    d3.select(".sites")
      .attr("transform",d3.event.transform);
    d3.select(".sites")
      .selectAll("path")
      .attr("d",path.pointRadius(siteRadius()));
    d3.select(".map-borders")
      .attr("transform",d3.event.transform)
      .attr("stroke-width",1.5 / d3.event.transform.k+"px");
  }

  //................. Plot ..........................
  function plot(){
    var svg = d3.select("#map")
      .append("svg")
        .attr("class","testSiteMap")
        .attr("width",svgWidth)
        .attr("height", svgHeight)
        .append("g")
          .attr("class","svgMainGroup")
          .attr("transform","translate("+margin.left+","+margin.top+")");

    svg.call(zoom);

    var mapUrl = "/nshmp-haz-ws/data/us.json";
    d3.json(mapUrl,function(error,map){
      if (error) throw error;
      var geoJson = topojson.feature(map,map.objects.states); 
      var borders = topojson.mesh(map,map.objects.states,function(a,b){return a!==b;});
      
      svg.append("g")
        .attr("class","map")
        .selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d",path)
        .style("opacity",0.65);
      
      svg.append("g")
        .attr("class","map-borders")
        .append("path")
        .attr("d",path(borders) )
        .attr("stroke","white")
        .attr("fill","none");
      
      svg.append("g")
        .attr("class","sites")
        .selectAll("path")
        .data(region.features)
        .enter()
        .append("path")
        .attr("d",path)
        .attr("id",function(d,i){return d.properties.locationId})
        .attr("fill","red")
        .on("mouseover",siteOver)
        .on("mouseout",siteOut);
      

    });
 }
 plot();
 //-------------------------------------------------



  function plotUpdate(){
    var region = regionSelect();

    var height = plotHeight();
    var width  = plotWidth(); 
    var svgHeight = height + margin.top   + margin.bottom;
    var svgWidth  = width  + margin.right + margin.left;
    
    var svg = d3.select("#map svg");
    
    svg
      .attr("height",svgHeight)
      .attr("width",svgWidth); 

    
    projection
      .scale(width)
      .translate([width/2,height/2]);
    
    svg.select(".map")
      .selectAll("path")
      .attr("d",path);
      
      
    svg.select(".sites")
      .selectAll("path")
      .attr("d",path); 
    
  }
        
  $(window).resize(function(){
    plotUpdate();
  });


  $("li").mouseover(function(){
    console.log("Hello");
  });

  
  function siteOver(){
    var loc = d3.mouse(document.getElementsByClassName("svgMainGroup")[0] );
    var x = loc[0];
    var y = loc[1];
    
    var siteId = d3.select(this).attr("id");
    
    var site = region.features.find(function(f,i){
      return f.properties.locationId == siteId;
    });
    var siteName = site.properties.location;
    var lat      = site.geometry.coordinates[0];
    var lon      = site.geometry.coordinates[1];

    var tooltipText = [
      "Site: "      + siteName,
      "Latitude: "  + lat,
      "Longitude: " + lon
    ];

    var tooltip = new Tooltip("map",x,y,tooltipText);
    tooltip.setTooltip();
   /* 
    var tooltip = d3.select(".svgMainGroup")
      .append("g")
      .attr("class","d3-tooltip");
      
    tooltip.append("rect")
      .attr("x",x+10)
      .attr("y",y+10)
      .attr("width",50)
      .attr("height",50)
      .attr("fill","white")
      .attr("stroke","#999");
  */
  }


  function siteOut(){
    d3.select(".d3-tooltip")
      .remove();
  }
        
} 





class Tooltip{
  constructor(mapId,x,y,text){
    this.mapId = mapId;
    this.x = x;
    this.y = y;
    this.dy = 10;
    this.text = text;
  }

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

    var pad = 10;                                     
    var tooltip_width  = tooltip_geom.width  + 2*pad; 
    var tooltip_height = tooltip_geom.height + 2*pad; 


    var plot_geom = svg.node()
			.getBoundingClientRect();
		var plot_width  = plot_geom.width;                            // Get the width of the actual plot where the data is
		var plot_height = plot_geom.height;                           // Get the height of the actual plot where the data is


		var xper = this.x/plot_width;               // Get the X location in percentage
		var yper = this.y/plot_height;              // Get the Y location in percentage

		if (xper < 0.30){                       // If the X location of the dot is < 10%, have box start to the right of the circle
			var xrect = this.x;
			var xtext = this.x+pad;
		}else if (xper > 0.70){                 // If the X location of the dot is > 70%, have box end to the left of the circle
			var xrect = this.x-tooltip_width;
			var xtext = this.x-tooltip_width+pad;
		}else{                                  // Center box location in X
			var xrect = this.x-tooltip_width/2;
			var xtext = this.x-tooltip_width/2+pad;
		}

		if (yper < 0.25){                       // If Y location of the dot is < 25% (from top), place box below circle
			var yrect = this.y+this.dy;
			var ytext = this.y+this.dy+pad;
		}else{                                  // Else put the box above the circle
			var yrect = this.y-tooltip_height-this.dy;
			var ytext = this.y-this.dy-tooltip_height+pad;
		}

		var rect_trans = "translate("+xrect+","+yrect+")";    // The translation for the tooltip box
		var text_trans = "translate("+xtext+","+ytext+")";    // The translation for the tooltip text


    tooltip.append("rect")                        // Create a rectangle
      .attr("class","tooltip-outline")            // Add a class to the rectangle
      .attr("height",tooltip_height)              // Set height
      .attr("width",tooltip_width)                // Set width
      .attr("transform",rect_trans)               // Translate the rectangle to correct position
      .attr("stroke","#999")                      // Set stroke color
      .style("padding","10px")
      .attr("fill","white");                      // Set fill color

    tooltip.selectAll(".tooltip-text")
      .style("visibility","initial")
      .attr("transform",text_trans)
      .raise();


  }

}
