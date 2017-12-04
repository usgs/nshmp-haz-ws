




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
  var siteSelect = $("#testsite [class*='active']").children().attr("value");
  var site = region.features.find(function(f,i){
    return f.properties.locationId == siteSelect;
  });
  console.log(site);
  return site != undefined ?  site : "default"; 
}



$("#region").change(function(){setTestSites()});

function setTestSites(){
  $("#lat").val("");
  $("#lon").val("");
 

  var siteOptions = $();
  

  var region = regionSelect();
  region.features.forEach(function(feature){ 
    var site   = feature.properties.location;
    var siteId = feature.properties.locationId;
      siteOptions = siteOptions.add(
        $("<label>").addClass("btn btn-default").append(
          $("<input/>")
            .attr("name","region")
            .attr("value",siteId)
            .attr("type","radio")
        ).append(site)
      )
  });
  $("#testsite").empty().append(siteOptions);
  
  var regionId = region.properties.regionId;
  var bounds   = region.properties;
  checkBounds(regionId,bounds);

  




}



function coordinates(){
  var region = regionSelect();
  var site   = siteSelect();
  if (site != "default"){
    var lon = site.geometry.coordinates[0];
    var lat = site.geometry.coordinates[1];
    var isChecked = $("#snap-grid").is(":checked");
    lon = isChecked ? Math.round(lon*10.0)/10.0 : lon;
    lat = isChecked ? Math.round(lat*10.0)/10.0 : lat;
    $("#lat").val(lat);
    $("#lon").val(lon);
  }else{ 
    $("#lat").val("");
    $("#lon").val("");
  }

}


function siteRadius() {
  var r = 5;
  var e    = d3.event;
  var isSelected = false;
  try {
    isSelected = "active" == d3.select(this)
    .attr("class");
  }catch(err){}
  if (e != null || e != undefined){
    r = e.transform != null ?  r/e.transform.k :r; 
  }
  return isSelected ? r*rScale : r;
}



function siteData(){
  var region = regionSelect();    
  var lat = [];
  var lon = []; 
  var isChecked = $("#snap-grid").is(":checked");

  region.features.forEach(function(d,i){
    if (isChecked){
      lon[i] = Math.round(d.geometry.coordinates[0]*10.0)/10.0;
      lat[i] = Math.round(d.geometry.coordinates[1]*10.0)/10.0;
    }else{
      lon[i] = d.geometry.coordinates[0];
      lat[i] = d.geometry.coordinates[1];
    }
  });
  return d3.zip(lon,lat);
}



var rScale = 2.5;

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
  

  var projection = d3.geoMercator()
    .scale(width)
    .translate([width/2,height/2])
    .fitSize([width,height],region);
  
  var path = d3.geoPath()
    .projection(projection);
  
  var svgHeight = height + margin.top   + margin.bottom;
  var svgWidth  = width  + margin.right + margin.left;

  var zoom = d3.zoom()
    .scaleExtent([0.1,10])
    .on("zoom",zoom);

  function zoom(){
    d3.select(".map")
      .attr("transform",d3.event.transform);
    d3.select(".sites")
      .attr("transform",d3.event.transform);
    d3.select(".sites")
      .selectAll("circle")
      .attr("r",siteRadius);
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
        .call(zoom)
        .append("g")
          .attr("class","svgMainGroup")
          .attr("transform","translate("+margin.left+","+margin.top+")");


    var americaMap = "/nshmp-haz-ws/data/americas.json";
    var bordersMap = "/nshmp-haz-ws/data/us.json";

    $.when(
      $.getJSON(americaMap),
      $.getJSON(bordersMap)
    ).done(function(m,b){
      borders = topojson.mesh(b[0],b[0].objects.states,function(a,b){return a!==b;});
      map     = m[0];
      
      
      svg.append("g")
        .attr("class","map")
        .selectAll("path")
        .data(map.features)
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
     
      var sites = siteData();
      svg.append("g")
        .attr("class","sites")
        .selectAll("circle")
        .data(sites)
        .enter()
        .append("circle")
        .attr("cx",function(d,i){return projection(d)[0]})
        .attr("cy",function(d,i){return projection(d)[1]})
        .attr("r",siteRadius())
        .attr("fill","red")
        .attr("id",function(d,i){return region.features[i].properties.locationId})
        .on("mouseover",siteOver)
        .on("mouseout",siteOut);
      siteMenuSelect();
    });
 }
 plot();
 //-------------------------------------------------



  function plotUpdate(){
    var region = regionSelect();
    
    //console.log(path.bounds(region));
    
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
      .translate([width/2,height/2])
      .fitSize([width,height],region);
    
    svg.select(".map")
      .selectAll("path")
      .attr("d",path);
    
    svg.select(".map-borders")
      .select("path")
      .attr("d",path(borders) );
      
      
    svg.select(".sites")
      .selectAll("circle")
      .attr("cx",function(d,i){return projection(d)[0]})
      .attr("cy",function(d,i){return projection(d)[1]});
    
    siteMenuSelect();
  }
        


  $(window).resize(function(){
    plotUpdate();
  });



  $("#snap-grid").change(function(){
    updateSites();
    coordinates();
  });

  function siteMenuSelect(){
   $("#testsite label").mouseleave(function(){
      var region = regionSelect();
      
      
      var siteId = this.childNodes[0].value;
      var siteSelected = d3.select("#map svg")
        .select(".sites")
        .selectAll("circle")
        .select(function(d,i){return region.features[i].properties.locationId == siteId ? this : null});

      var r = siteSelected
        .attr("r");
         
      isActive = siteSelected.attr("class");
      if (isActive != "active"){
        siteSelected
          .attr("r",r/rScale);
      }
     
   });
    
    $("#testsite label").mouseenter(function(){
      $(this).off("click");
      
      var region = regionSelect();
      
      var siteId = this.childNodes[0].value;
      var siteSelected = d3.select("#map svg")
        .select(".sites")
        .selectAll("circle")
        .select(function(d,i){return region.features[i].properties.locationId == siteId ? this : null});

      var r = siteSelected
        .attr("r");
         
      isActive = siteSelected.attr("class");
      if (isActive != "active"){
        siteSelected
          .attr("r",r*rScale);
      }
      
      $(this).click(function(){
        d3.select("#map svg")
          .select(".sites")
          .selectAll("circle")
          .attr("class","")
          .attr("r",r);
        $(this).addClass("active");
        siteSelected
          .attr("class","active")
          .attr("r",r*rScale);
        coordinates();
      });
      
    });
  }



  $("#region").change(updateSites);
  function updateSites(){
    plotUpdate(); 
    
    var region = regionSelect();
    var width  = plotWidth();
    var height = plotHeight();
    var sites  = siteData(); 
    
    d3.select("#map svg")
      .select(".sites")
      .selectAll("circle")
      .attr("class","");

    var svgSites = d3.select("#map svg")
      .select(".sites")
      .selectAll("circle")
      .data(sites);
    
    svgSites.exit().remove();
    
    svgSites.enter()
      .append("circle")
      .on("mouseover",siteOver)
      .on("mouseout",siteOut);

    d3.select("#map svg")
    .select(".sites")
    .selectAll("circle")
    .transition()
      .duration(500)
      .attr("cx",function(d,i){return projection(d)[0]})
      .attr("cy",function(d,i){return projection(d)[1]})
      .attr("r",siteRadius())
      .attr("id",function(d,i){return region.features[i].properties.locationId})
      .attr("fill","red");

  }
  

  function siteOver(){
    var region = regionSelect();

    var siteId = d3.select(this).attr("id");
    
    var site = region.features.find(function(f,i){
      return f.properties.locationId == siteId;
    });
    var siteName = site.properties.location;
    
    var isChecked = $("#snap-grid").is(":checked");
    var lon = site.geometry.coordinates[0];
    var lat = site.geometry.coordinates[1];
    lon = isChecked ? Math.round(lon*10.0)/10.0 : lon;
    lat = isChecked ? Math.round(lat*10.0)/10.0 : lat;

    var tooltipText = [
      "Site: "      + siteName,
      "Latitude: "  + lat,
      "Longitude: " + lon
    ];

    var tooltip = new MapTooltip("map",tooltipText);
    tooltip.setTooltip();
    tooltip.setRadius(this,rScale);
  }


  function siteOut(){
    var r = d3.select(this).attr("r");
    d3.select(this).attr("r",r/rScale);
    d3.select(".d3-tooltip")
      .remove();
  }
        


} 
