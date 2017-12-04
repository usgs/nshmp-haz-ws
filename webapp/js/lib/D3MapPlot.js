"use strict"


/**
* @class D3MapPlot
* 
* @extends D3MapView
*
* @classdesc Plots the map 
*
*/
class D3MapPlot extends D3MapView{

  constructor(containerEl){
    let _this;

    _this = super(containerEl);

    console.log(_this);

    let svgD3 = d3.select(_this.mapEl)
        .append("svg")
        .attr("class","D3MapPlot");

    let plotD3 = svgD3.append("g")
        .attr("class","plot");

    let tooltipD3 = plotD3.append("g")
        .attr("class","d3-tooltip");

    _this.svgEl = svgD3.node();
    _this.tooltipEl = tooltipD3.node(); 
    _this.plotEl = plotD3.node(); 
    
    
    let americaMap = "/nshmp-haz-ws/data/americas.json";
    let borderMap = "/nshmp-haz-ws/data/us.json";

    let promiseOne = $.getJSON(americaMap);
    let promiseTwo = $.getJSON(borderMap);
    
    $.when(promiseOne,promiseTwo)
        .done(function(map,border){
          _this.usBorders = topojson.mesh(border[0],border[0].objects.states,
              function(a,b){return a!==b;});
          _this.worldMap = map[0];   
          D3MapPlot.plotMap(_this);      
        })
        .fail(function(){
          console.log("ERROR: Could not load maps");
        });
  
    _this.testSitePromise.done(function(){
      D3MapPlot.setBounds(_this);
      d3.select(_this.regionFormEl)
          .select("#region")
          .selectAll("label")
          .on("click",function(){
             _this.selectedRegion = d3.select(this)
                .select("input") 
                .attr("value"); 
            D3MapView.setSites(_this);
            D3MapPlot.setBounds(_this);
            D3MapPlot.clearCoordinates(_this);
            D3MapPlot.plotMap(_this);
          });
    });
  
  
  
    d3.select(_this.latEl)
        .on("input",function(){
          D3MapPlot.plotSelectionReset(_this);
        });
  }

  
  
  
  static plotMap(mapPlot){
    let selectedId;
    let svgHeight = D3MapPlot.plotHeight(mapPlot,true);
    let svgWidth = D3MapPlot.plotWidth(mapPlot,true);
    let height = D3MapPlot.plotHeight(mapPlot);
    let width = D3MapPlot.plotWidth(mapPlot);

    let region = D3MapPlot.regionSelect(mapPlot);
    let isSnapChecked = mapPlot.snapToEl.checked;
    let sites = D3MapPlot.testSiteList(region,isSnapChecked);
    
    mapPlot.ids.push("user_added");
    mapPlot.labels.push("User added");
    
    d3.select(mapPlot.svgEl)
        .attr("height",svgHeight)
        .attr("width",svgWidth);
    
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .attr("transform","translate("+
            mapPlot.options.marginLeft+","+mapPlot.options.marginTop+")");
    
    mapPlot.projection = d3.geoMercator()
        .fitSize([width,height],region);
        
    mapPlot.path = d3.geoPath()
        .projection(mapPlot.projection);
   
    mapPlot.zoom = d3.zoom()
        .scaleExtent([0.1,10])
        .on("zoom",D3MapPlot.zoom);

    /*
    d3.select(mapPlot.svgEl)
        .call(mapPlot.zoom);
    */

    d3.select(mapPlot.svgEl)
        .select(".world-map")
        .remove();
    d3.select(mapPlot.svgEl)
        .select(".map-borders")
        .remove();
    d3.select(mapPlot.svgEl)
        .select(".sites")
        .remove();
    d3.select(mapPlot.svgEl)
        .select("user-added-sites")
        .remove();
    

    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")
        .attr("class","world-map")
        .attr("stroke","black")
        .attr("fill","white")
        .selectAll("path") 
        .data(mapPlot.worldMap.features)
        .enter()             
        .append("path")       
        .attr("d",mapPlot.path)
   
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")
        .attr("class","map-borders")
        .append("path")
        .attr("d",mapPlot.path(mapPlot.usBorders) )
        .attr("stroke","black")
        .attr("fill","none");
        
    let tooltip;
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")  
        .attr("class","sites")
        .selectAll("circle") 
        .data(sites)     
        .enter()        
        .append("circle")
        .attr("cx",function(d,i){return mapPlot.projection(d)[0]})
        .attr("cy",function(d,i){return mapPlot.projection(d)[1]})
        .attr("r",mapPlot.options.pointRadius)
        .attr("fill",mapPlot.options.pointColor)   
        .attr("id",function(d,i){
          return region.features[i].properties.locationId
        })
        .on("click",function(){
          selectedId = d3.select(this).attr("id");
          D3MapPlot.plotSelection(mapPlot,selectedId,true);
        })
        .on("mouseout",function(){
          tooltip.decreaseRadius(mapPlot);
          if (!d3.select(this).classed("active"))
            tooltip.pointColor(mapPlot.options.pointColor);
          tooltip.destroy(mapPlot);
        })
        .on("mouseover",function(){
          tooltip = new Tooltip(mapPlot,this);
          tooltip.increaseRadius(mapPlot);
          tooltip.pointColor(mapPlot.options.pointColorSelection);
        });
  
      
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")
        .attr("class","user-added-sites");
    
    d3.select(mapPlot.siteListEl)
        .selectAll("label")
        .on("click",function(){
          selectedId = d3.select(this).attr("id");
          D3MapPlot.plotSelection(mapPlot,selectedId);
        })
        .on("mouseenter",function(){
          let siteId = d3.select(this).attr("id");
          let test = d3.select(mapPlot.svgEl)
              .selectAll(".sites")
              .select("#"+siteId);
          tooltip = new Tooltip(mapPlot,test.node());
          tooltip.increaseRadius(mapPlot);
          tooltip.pointColor(mapPlot.options.pointColorSelection);
        })
        .on("mouseleave",function(){
          tooltip.decreaseRadius(mapPlot);
          if (!d3.select(this).classed("active"))
            tooltip.pointColor(mapPlot.options.pointColor);
          tooltip.destroy(mapPlot);
        });
  
  
    mapPlot.snapToEl.onchange = function(){
      D3MapPlot.plotSiteUpdate(mapPlot);
      if (d3.select(mapPlot.siteListEl).select(".active").node() != null)
        D3MapPlot.setCoordinates(mapPlot);
    }
    
    mapPlot.addSiteEl.onclick = function(){
      if(d3.select(mapPlot.siteListEl).select(".active").node() == null)
        D3MapPlot.addSite(mapPlot);
    }

    
  }
  
  
  static addSite(mapPlot){
    let latAdd = mapPlot.latEl.value;
    let lonAdd = mapPlot.lonEl.value;
    
    let siteAdd = [[lonAdd,latAdd]];
    
    d3.select(mapPlot.svgEl)
        .select(".user-added-sites")
        .selectAll("circle")
        .remove();

    let tooltip;
    d3.select(mapPlot.svgEl)
        .select(".user-added-sites")
        .selectAll("circle")
        .data(siteAdd)
        .enter()
        .append("circle")
        .attr("cx",function(d,i){return mapPlot.projection(d)[0]})
        .attr("cy",function(d,i){return mapPlot.projection(d)[1]})
        .attr("r",mapPlot.options.pointRadius)
        .attr("fill",mapPlot.options.pointColorAddedSite)
        .attr("id","user_added")
        .on("mouseout",function(){
          tooltip.decreaseRadius(mapPlot);
          if (!d3.select(this).classed("active"))
            tooltip.pointColor(mapPlot.options.pointColorAddedSite);
          tooltip.destroy(mapPlot);
        })
        .on("mouseover",function(){
          tooltip = new Tooltip(mapPlot,this);
          tooltip.increaseRadius(mapPlot);
          tooltip.pointColor(mapPlot.options.pointColorAddedSite);
        });
  }

  static plotSiteUpdate(mapPlot){
    
    let region;
    region = D3MapPlot.regionSelect(mapPlot);
    let isSnapChecked = mapPlot.snapToEl.checked;
    let sites = D3MapPlot.testSiteList(region,isSnapChecked);
    
    let svgSites = d3.select(mapPlot.svgEl)
        .select(".sites")
        .selectAll("circle")
        .data(sites);

    svgSites.exit().remove();

    svgSites.enter()
        .append("circle");
    
    d3.select(mapPlot.svgEl)
        .select(".sites")
        .selectAll("circle") 
        .attr("cx",function(d,i){return mapPlot.projection(d)[0]})
        .attr("cy",function(d,i){return mapPlot.projection(d)[1]})
        .attr("r",mapPlot.options.pointRadius)
        .attr("fill",function(d,i){
          return region.features[i].properties.locationId == "user_added" ?
              mapPlot.options.pointColorAddedSite : mapPlot.options.pointColor; 
        })
        .attr("id",function(d,i){
          return region.features[i].properties.locationId
        });
    
    if (d3.select(mapPlot.siteListEl).select(".active").node() != null){
      let selectedId = d3.select(mapPlot.svgEl)
          .select(".active")
          .attr("id");
      D3MapPlot.plotSelectionReset(mapPlot);
      D3MapPlot.plotSelection(mapPlot,selectedId);
    }
    
     
  }



  //....................... Method: Plot Height ................................
  /**                                                                           
  * @method plotHeight                                                          
  *                                                                             
  * @description Calculate the plot height based on the Bootstrap panel         
  * header, body, and footer.                                                   
  *                                                                             
  * If isSvg is true it will calculate the height of the svg element,           
  * else will calculate the height for the plot based                           
  * on the options.marginTop and options.marginBottom.                          
  *                                                                             
  * @argument linePlot {Object}                                                 
  *     D3LinePlot object                                                       
  *                                                                             
  * @argument isSvg {Boolean}                                                   
  *     whether to calculate for SVG element or plot                            
  *                                                                             
  * @return {Number}                                                            
  *         number in pixels of the height                                      
  */                                                                            
  static plotHeight(mapPlot,isSvg){                                            
    let bodyHeight,
        height,  
        margin,   
        options,   
        panelMargin;
                                                                                
    options = mapPlot.options;                                                
                                                                                
    bodyHeight = mapPlot.mapEl                                           
        .getBoundingClientRect()                                                
        .height;                                                                
    margin = options.marginTop + options.marginBottom;                       
                                                                                
    height = isSvg ? bodyHeight :                                             
        bodyHeight - margin;                                                  
                                                                                
    return height;                                                             
  }                                                                             
  //--------------------- End Method: Plot Height ------------------------------


//..................... Method: Plot Width ...................................
  /**                                                                           
  * @method plotWidth                                                           
  *                                                                             
  * @description Calculate the plot width based on the Bootstrap panel          
  * body.                                                                       
  *                                                                             
  * If isSvg is true it will calculate the width of the svg element,            
  * else will calculate the width for the plot based                            
  * on the options.marginLeft and options.marginLeft.                           
  *                                                                             
  * @argument linePlot {Object}                                                 
  *     D3LinePlot object                                                       
  *                                                                             
  * @argument isSvg {Boolean}                                                   
  *     whether to calculate for SVG element or plot                            
  *                                                                             
  * @return {Number}                                                            
  *         number in pixels of the width                                       
  */                                                                            
  static plotWidth(mapPlot,isSvg){ 
    let bodyWidth,                
        margin,                  
        options,                
        width;                
                                                                                
    options = mapPlot.options;
                                                                                
    bodyWidth = mapPlot.mapEl 
        .getBoundingClientRect() 
        .width;                 
    margin = options.marginLeft + options.marginRight; 
                                                                                
    width = isSvg ? bodyWidth :
        bodyWidth - margin;   
                                                                                
    return width;
  }                                                                             
  //------------------- End Method: Plot Width ---------------------------------



  static regionSelect(mapPlot){
    let sites = JSON.parse(JSON.stringify(mapPlot.testSites));
    let region = sites.find(function(fc,ifc){
      return fc.properties.regionId == mapPlot.selectedRegion;
    });
    return region;
  }

  static selectedSite(mapPlot){
    let selectedId = d3.select(mapPlot.siteListEl)
        .select(".active")
        .attr("id");
    let region = D3MapPlot.regionSelect(mapPlot);
    let site = region.features.find(function(f,i){
      return f.properties.locationId == selectedId;
    });
    
    return site;
  }


  static zoom(){
    let _this = this;

    d3.select(_this)
        .select(".world-map")
        .attr("transform",d3.event.transform);
  
    d3.select(_this)
        .select(".map-borders")
        .attr("transform",d3.event.transform)
        .attr("stroke-width",1.5/d3.event.transform.k+"px");
  
    d3.select(_this)
        .select(".sites")
        .attr("transform",d3.event.transform);
  }




  static testSiteList(region,isSnapChecked){
    
    let lat = [];
    let lon = [];
    let tmpLat;
    let tmpLon;
     
    region.features.forEach(function(d,i){
      tmpLat = d.geometry.coordinates[1];
      tmpLon = d.geometry.coordinates[0];

      lat[i] = isSnapChecked ? Math.round(tmpLat*10.0)/10.0 : tmpLat; 
      lon[i] = isSnapChecked ? Math.round(tmpLon*10.0)/10.0 : tmpLon; 
    });

    return d3.zip(lon,lat);
  }


  
  static plotSelection(mapPlot,selectedId,isMapClicked){
    
    let selectedPointD3 = d3.select(mapPlot.svgEl)
        .select(".sites")
        .select("#"+selectedId);

    let isActive = selectedPointD3.classed("active");
    D3MapPlot.plotSelectionReset(mapPlot);
    D3MapPlot.clearCoordinates(mapPlot);
    if (isActive){
      setTimeout(function(){
        D3MapPlot.plotSelectionReset(mapPlot);
      },0); 
      return;
    }
    
    selectedPointD3.attr("fill",mapPlot.options.pointColorSelection)
        .classed("active",true);
   
    let selectedListD3 = d3.select(mapPlot.siteListEl)
        .select("#"+selectedId)
        .classed("active",true);

    if (isMapClicked) selectedListD3.node().scrollIntoView();
      
    D3MapPlot.setCoordinates(mapPlot);

  }


  static plotSelectionReset(mapPlot){

    d3.select(mapPlot.svgEl)
        .select(".sites")
        .selectAll("circle")
        .attr("fill",mapPlot.options.pointColor)
        .classed("active",false);

    d3.select(mapPlot.siteListEl)
        .selectAll("label")
        .classed("active",false)
        .classed("focus",false);
  }

  
  static setCoordinates(mapPlot){
    let site = D3MapPlot.selectedSite(mapPlot);
    let lon = site.geometry.coordinates[0];
    let lat = site.geometry.coordinates[1];
    
    let isChecked = mapPlot.snapToEl.checked;
    
    lat = isChecked ? Math.round(lat*10.0)/10.0 : lat; 
    lon = isChecked ? Math.round(lon*10.0)/10.0 : lon; 
    
    mapPlot.latEl.value = lat;
    mapPlot.lonEl.value = lon;

  }


 
  static setBounds(mapPlot){
    let region = D3MapPlot.regionSelect(mapPlot);
    let bounds = region.properties;
    let latMax = bounds.maxlatitude;
    let latMin = bounds.minlatitude;
    let lonMax = bounds.maxlongitude;
    let lonMin = bounds.minlongitude;

    mapPlot.latBoundsEl.innerHTML = "<br>" + mapPlot.selectedRegion +
        " bounds: " + " ["+latMin+","+latMax+"]";
    
    mapPlot.lonBoundsEl.innerHTML = "<br>" + mapPlot.selectedRegion +
        " bounds: " + " ["+lonMin+","+lonMax+"]";
  
  }
  

  static clearCoordinates(mapPlot){
    mapPlot.latEl.value = "";  
    mapPlot.lonEl.value = "";
  } 
 
  
}
