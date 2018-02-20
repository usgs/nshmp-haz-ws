"use strict";

import D3MapView from './D3MapView.js';
import Tooltip from './Tooltip.js';

/**
* @class D3MapPlot
* 
* @extends D3MapView
*
* @classdesc Plots the map 
*
*/
export default class D3MapPlot extends D3MapView{


  //.......................... D3MapPlot Constructor ...........................
  constructor(containerEl,options,settings, config){
    

    //.......................... Variables .....................................
    let _this,
        // Variables
        mapBorderPromise,
        mapBorderUrl,
        mapUrl,
        mapPromise,
        plotD3,
        svgD3,
        tooltipD3;

    _this = super(containerEl, options, settings, config);
    // Properties of class
    _this.svgEl;
    _this.tooltipEl;
    _this.plotEl;
    _this.usBorders;
    _this.worldMap;
    console.log(_this);
    //--------------------------------------------------------------------------
   
    
    //...................... Main SVG Groups ................................... 
    svgD3 = d3.select(_this.mapEl)
        .append("svg")
        .attr("class","D3MapPlot");

    plotD3 = svgD3.append("g")
        .attr("class","plot");

    tooltipD3 = plotD3.append("g")
        .attr("class","d3-tooltip");

    _this.plotEl = plotD3.node(); 
    _this.svgEl = svgD3.node();
    _this.tooltipEl = tooltipD3.node(); 
    //--------------------------------------------------------------------------
    

    //..................... Get GeoJSON Files and Plot Map .....................
    let dynamic = this.config.server.dynamic;
    mapBorderUrl = dynamic + "/nshmp-haz-ws/data/us.json";
    mapUrl = dynamic + "/nshmp-haz-ws/data/americas.json";

    mapBorderPromise = $.getJSON(mapBorderUrl);
    mapPromise = $.getJSON(mapUrl);
    
    $.when(mapPromise,mapBorderPromise)
        .done(function(map,border){
          _this.usBorders = topojson.mesh(border[0],border[0].objects.states,
              function(a,b){return a!==b;});
          _this.worldMap = map[0];   
          D3MapPlot.plotMap(_this);      
        })
        .fail(function(){
          console.log("ERROR: Could not load maps");
        });
    //--------------------------------------------------------------------------
   
    
    //..................... Plot Map On Region Change .......................... 
    _this.testSitePromise.done(function(){
      D3MapPlot.setBounds(_this);
      d3.select(_this.regionFormEl)
          .select("#region")
          .selectAll("label")
          .on("click",function(){
             _this.selectedRegionId = d3.select(this)
                .select("input") 
                .attr("value"); 
            D3MapView.setSites(_this);
            D3MapPlot.setBounds(_this);
            D3MapPlot.clearCoordinates(_this);
            D3MapPlot.plotMap(_this);
          });
    });
    //--------------------------------------------------------------------------
  
  
    //................ Remove Plot Selection on Lat/Lon Input ..................
    d3.select(_this.latEl)
        .on("input",function(){
          D3MapPlot.plotSelectionReset(_this);
        });
    
    d3.select(_this.lonEl)
        .on("input",function(){
          D3MapPlot.plotSelectionReset(_this);
        });
    //--------------------------------------------------------------------------


  }
  //----------------------- End: D3MapPlot Constructor -------------------------

  

  //.......................... Method: plotMap .................................
  /**
  * @method plotMap
  *
  * @description Plot the main map, map borders, and
  *     the test sites based on the region selected.
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  * @property path {Object}
  *     D3 geo path given the projection
  *
  * @property projection {Object}
  *     D3 geo mercator projection fit to the region bounds
  *
  */
  static plotMap(mapPlot){
    

    //.......................... Variables .....................................
    let height,
        region,
        selectedId,
        selectedSite,
        sites,
        svgHeight,
        svgWidth,
        tooltip,
        width;
   
    // Properties of the class
    mapPlot.path;
    mapPlot.projection;
     
    height = D3MapPlot.plotHeight(mapPlot);
    mapPlot.ids.push("user_added");
    mapPlot.labels.push("User Added");
    region = D3MapPlot.regionFeatureCollection(mapPlot);
    sites = D3MapPlot.testSiteData(mapPlot,region);
    svgHeight = D3MapPlot.plotHeight(mapPlot,true);
    svgWidth = D3MapPlot.plotWidth(mapPlot,true);
    width = D3MapPlot.plotWidth(mapPlot);
    //--------------------------------------------------------------------------
    

    //.......................... Update SVG Element ............................
    d3.select(mapPlot.svgEl)
        .attr("height",svgHeight)
        .attr("width",svgWidth);
    
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .attr("transform","translate("+
            mapPlot.options.marginLeft+","+mapPlot.options.marginTop+")");
    //--------------------------------------------------------------------------


    //................ Map Projection and Path .................................
    mapPlot.projection = d3.geoMercator()
        .fitSize([width,height],mapPlot.regionBounds);
        
    mapPlot.path = d3.geoPath()
        .projection(mapPlot.projection);
    //--------------------------------------------------------------------------


    //.......................... Remove All Previous Maps ......................
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
        .select(".user-added-sites")
        .remove();
    //--------------------------------------------------------------------------


    //......................... Plot Map and Borders ...........................
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
    //--------------------------------------------------------------------------    


    //......................... Plot Test Sites ................................
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
          tooltip.destroy();
        })
        .on("mouseover",function(){
          tooltip = new Tooltip(mapPlot, this);
          tooltip.increaseRadius();
          tooltip.pointColor(mapPlot.options.pointColorSelection);
        });
  
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")
        .attr("class","user-added-sites");
    //--------------------------------------------------------------------------
    

    //...................... Site List Events ..................................  
    d3.select(mapPlot.siteListEl)
        .selectAll("label")
        .on("click",function(){
          selectedId = d3.select(this).attr("id");
          D3MapPlot.plotSelection(mapPlot,selectedId);
        })
        .on("mouseenter",function(){
          selectedId = d3.select(this).attr("id");
          selectedSite = d3.select(mapPlot.svgEl)
              .selectAll(".sites")
              .select("#"+selectedId)
              .node();
          tooltip = new Tooltip(mapPlot,selectedSite);
          tooltip.increaseRadius(mapPlot);
          tooltip.pointColor(mapPlot.options.pointColorSelection);
        })
        .on("mouseleave",function(){
          tooltip.decreaseRadius(mapPlot);
          if (!d3.select(this).classed("active"))
            tooltip.pointColor(mapPlot.options.pointColor);
          tooltip.destroy(mapPlot);
        });
    //--------------------------------------------------------------------------
  

    //....................... Snap to Event ....................................
    d3.select(mapPlot.snapToEl).on("change",function(){
      D3MapPlot.plotSiteUpdate(mapPlot);
      if (d3.select(mapPlot.siteListEl).select(".active").node() != null)
      D3MapPlot.setCoordinates(mapPlot);
    });
    //--------------------------------------------------------------------------
  
    
    //....................... Add Site Event ...................................
    d3.select(mapPlot.addSiteEl).on("click",function(){
      if(d3.select(mapPlot.siteListEl).select(".active").node() == null)
        D3MapPlot.addSite(mapPlot);
    });
    //--------------------------------------------------------------------------

    
  }
  //------------------- End Method: plotMap ------------------------------------
 
  

  //........................ Method: addSite ................................... 
  /**
  * @method addSite
  *
  * @description Add a user inputted site using the latitude and longitude
  *     from the input forms. If the latitude or longitude is not within
  *     the region bounds the site will not be added.
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  */
  static addSite(mapPlot){
    let latAdd,
        lonAdd,
        siteAdd,
        tooltip;
    
    latAdd = mapPlot.latEl.value;
    lonAdd = mapPlot.lonEl.value;
    siteAdd = [lonAdd,latAdd];
    
    d3.select(mapPlot.svgEl)
        .select(".user-added-sites")
        .selectAll("circle")
        .remove();
    
    D3MapPlot.addSiteCheckBounds(mapPlot,siteAdd);
    if (!mapPlot.canAddSite) return;

    d3.select(mapPlot.svgEl)
        .select(".user-added-sites")
        .selectAll("circle")
        .data([siteAdd])
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
  
    D3MapPlot.plotSiteUpdate(mapPlot);
  }
  //------------------ End Method: addSite -------------------------------------



  //...................... Method: addSiteCheckBounds ..........................
  /**
  * @method addSiteCheckBounds
  *
  * @description Check the bounds of a user inputted site to see if 
  *     it is within the region bounds on the map.
  *
  *
  * @argument site {Array<Number>}
  *     the longitude and latitude of the site to add <br>
  *     format: [longitude,latitude]
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  * @property canAddSite {Boolean}
  *     true if both latitude and longitude are within the region bounds
  *
  */
  static addSiteCheckBounds(mapPlot,site){
    let region = D3MapPlot.regionFeatureCollection(mapPlot);
    let bounds = region.properties;
    let latMax = bounds.maxlatitude;
    let latMin = bounds.minlatitude;
    let lonMax = bounds.maxlongitude;
    let lonMin = bounds.minlongitude;
    
    let canLatSubmit = site[1] < latMin || site[1] > latMax 
        || isNaN(site[1]) ? false : true;
    let canLonSubmit = site[0] < lonMin || site[0] > lonMax 
        || isNaN(site[0]) ? false : true;

    d3.select(mapPlot.latFormEl)
        .classed("has-error",!canLatSubmit);
    d3.select(mapPlot.latFormEl)
        .classed("has-success",canLatSubmit);
    
    d3.select(mapPlot.lonFormEl)
        .classed("has-error",!canLonSubmit);
    d3.select(mapPlot.lonFormEl)
        .classed("has-success",canLonSubmit);
    
    mapPlot.canAddSite = canLatSubmit && canLonSubmit ? true : false;
  
  }
  //-------------------- End Method: addSiteCheckBounds ------------------------



  //........................ Method: plotSiteUpdate ............................  
  /**
  * @method plotSiteUpdate
  *
  * @description Replot the test sites. Used when the snap to 0.1 degree
  *     checkbox is used.
  *
  * 
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  */
  static plotSiteUpdate(mapPlot){
    
    //.......................... Variables .....................................
    let region,
        selectedId,
        sites,
        sitesD3;
    
    region = D3MapPlot.regionFeatureCollection(mapPlot);
    sites = D3MapPlot.testSiteData(mapPlot,region);
    //--------------------------------------------------------------------------


    //........................ Update Data in D3 ...............................
    sitesD3 = d3.select(mapPlot.svgEl)
        .select(".sites")
        .selectAll("circle")
        .data(sites);

    sitesD3.exit().remove();

    sitesD3.enter()
        .append("circle");
    //--------------------------------------------------------------------------


    //........................... Plot Sites ...................................
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
    //--------------------------------------------------------------------------


    //......................... Update Plot Selection ..........................
    if (d3.select(mapPlot.siteListEl).select(".active").node() != null){
      selectedId = d3.select(mapPlot.svgEl)
          .select(".active")
          .attr("id");
      D3MapPlot.plotSelectionReset(mapPlot);
      D3MapPlot.plotSelection(mapPlot,selectedId);
    }
    //--------------------------------------------------------------------------
     
  
  }
  //--------------------- End Method: plotSiteUpdate ---------------------------


 
  //......................... Method: plotMapUpdate ----------------------------
  /**
  * @method plotMapRedraw
  *
  * @description Redraw the map.
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  */
  static plotMapUpdate(mapPlot){
    
    //......................... Variables ......................................
    let height,
        region,
        svgHeight,
        svgWidth,
        width;
    
    height = D3MapPlot.plotHeight(mapPlot);
    region = D3MapPlot.regionFeatureCollection(mapPlot);
    svgHeight = D3MapPlot.plotHeight(mapPlot,true);
    svgWidth = D3MapPlot.plotWidth(mapPlot,true);
    width = D3MapPlot.plotWidth(mapPlot);
    //--------------------------------------------------------------------------

    
    //........................... Update Plot ..................................
    d3.select(mapPlot.svgEl)
        .attr("height",svgHeight)
        .attr("width",svgWidth);

    mapPlot.projection
        .fitSize([width,height],mapPlot.regionBounds);
    
    d3.select(mapPlot.svgEl)
        .select(".world-map")
        .select("path")
        .attr("d",mapPlot.path);

    d3.select(mapPlot.svgEl)
        .select(".map-borders")
        .select("path")
        .attr("d",mapPlot.path(mapPlot.usBorders));

    d3.select(mapPlot.svgEl)
        .select(".sites")
        .selectAll("circle")
        .attr("cx",function(d,i){return mapPlot.projection(d[0])})
        .attr("cy",function(d,i){return mapPlot.projection(d[1])});
    //--------------------------------------------------------------------------

  
  }
  //---------------------- End Method: plotMapUpdate ---------------------------



  //....................... Method: plotHeight .................................
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
        options;
                                                                                
    options = mapPlot.options;                                                
                                                                                
    bodyHeight = mapPlot.mapEl                                           
        .getBoundingClientRect()                                                
        .height;                  
                                                      
    margin = options.marginTop + options.marginBottom;                       
                                                                                
    height = isSvg ? bodyHeight : bodyHeight - margin;                                                  
                                                                                
    return height;                                                             
  }                                                                             
  //--------------------- End Method: plotHeight -------------------------------



  //...................... Method: plotWidth ...................................
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
        width
                                                                                
    options = mapPlot.options;
                                                                                
    bodyWidth = mapPlot.mapEl
        .getBoundingClientRect()
        .width;              

    margin = options.marginLeft + options.marginRight;
                                                                                
    width = isSvg ? bodyWidth : bodyWidth - margin;
                                                                                
    return width;
  }                                                                             
  //-------------------- End Method: plotWidth ---------------------------------



  //..................... Method: regionFeatureCollection ......................
  /**
  * @method regionFeatureCollection
  *
  * @description Find the GeoJSON feature collection of the selected region  
  *     from the test sites GeoJSON file. 
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  * @return region {Object}
  *     an object containing the GeoJSON feature 
  *     collection of the selected region.
  *
  */
  static regionFeatureCollection(mapPlot){
    let region,
        sites;
    
    sites = JSON.parse(JSON.stringify(mapPlot.testSites));
    region = sites.find(function(fc,ifc){
      return fc.properties.regionId == mapPlot.selectedRegionId;
    });
    
    return region;
  }
  //----------------- End Method: regionFeatureCollection ----------------------



  //..................... Method: siteFeature ..................................
  /**
  * @method siteFeature
  *
  * @description Find the GeoJSON feature to the selected 
  *     site from the test sites GeoJSON file.
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  *
  * @return site {Object}
  *     an object containing the GeoJSON feature of the selected site. 
  */
  static siteFeature(mapPlot){
    let region,
        selectedId,
        site;

    selectedId = d3.select(mapPlot.siteListEl)
        .select(".active")
        .attr("id");
    region = D3MapPlot.regionFeatureCollection(mapPlot);
    site = region.features.find(function(f,i){
      return f.properties.locationId == selectedId;
    });
    
    return site;
  }
  //-------------------- End Method: siteFeature -------------------------------



  //.................... Method: testSiteData ..................................
  /**
  * @method testSiteData
  *
  * @description Format the test site data for D3. Check if the snap to 0.1
  *     degree checkbox is selected and adjust the values as needed. 
  *
  *
  * @argument mapPlot {Object}
  *     D3MapPlot object
  *
  * @argument region {Object}
  *     the GeoJSON feature collection of the selected region. The 
  *     return from the regionFeatureCollection method.
  *
  *
  * @return {Array<Array<Number>>}
  *     x,y pairs of longitudes and latitudes formatted for D3 <br>
  *     Example: [ [x0,y0], [x1,y1], ... ]
  *
  */
  static testSiteData(mapPlot,region){
    let isSnapChecked,
        lat,
        lon,
        tmpLat,
        tmpLon;

    isSnapChecked = mapPlot.snapToEl.checked;
    lat = [];
    lon = [];
    
    region.features.forEach(function(d,i){
      tmpLat = d.geometry.coordinates[1];
      tmpLon = d.geometry.coordinates[0];

      lat[i] = isSnapChecked ? Math.round(tmpLat*10.0)/10.0 : tmpLat; 
      lon[i] = isSnapChecked ? Math.round(tmpLon*10.0)/10.0 : tmpLon; 
    });
    
    return d3.zip(lon,lat);
  }
  //-------------------- End Method: testSiteData ------------------------------


  
  //....................... Method: plotSelection .............................. 
  /**
  * @method plotSelection
  *
  * @description Highlight the selected site on the site list and change the 
  *     selected site red. If the site is selected in the map then the 
  *     site list will scroll up to show the cooresponding site in the list.
  *     If the site is selected in the site list then a tooltip will also 
  *     appear in the map. 
  *
  * @argument mapPlot {D3MapPlot}
  *     D3MapPlot object
  * 
  * @argument selectedId {String}
  *     string corresponding to the site location id that is selected
  *
  * @argument isMapClicked {Boolean}
  *     true if the selection is on the map and not the site list.
  *
  */
  static plotSelection(mapPlot,selectedId,isMapClicked){
    
    //...................... Variables .........................................
    let isActive,
        selectedListD3,
        selectedPointD3;
     
    selectedPointD3 = d3.select(mapPlot.svgEl)
        .select(".sites")
        .select("#"+selectedId);
    
    selectedListD3 = d3.select(mapPlot.siteListEl)
        .select("#"+selectedId)

    isActive = selectedPointD3.classed("active");
    //--------------------------------------------------------------------------

    //......... Clear Selections and Return if Site is Already Selected ........
    D3MapPlot.plotSelectionReset(mapPlot);
    D3MapPlot.clearCoordinates(mapPlot);
    if (isActive){
      setTimeout(function(){
        D3MapPlot.plotSelectionReset(mapPlot);
      },0); 
      return;
    }
    //--------------------------------------------------------------------------

    //.................... Update Selection ....................................
    selectedPointD3.attr("fill",mapPlot.options.pointColorSelection)
        .classed("active",true);
   
    selectedListD3.classed("active",true);

    if (isMapClicked) selectedListD3.node().scrollIntoView();
      
    D3MapPlot.setCoordinates(mapPlot);
    //--------------------------------------------------------------------------

  }
  //------------------- End Method: plotSelection ------------------------------



  //....................... Method: plotSelectionReset .........................
  /**
  * @method plotSelectionReset 
  *
  * @decription Remove all plot selections.
  *
  *
  * @argument mapPlot {D3MapPlot}
  *     D3MapPlot object
  * 
  */
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
  //------------------ End Method: plotSelectionReset --------------------------



  //...................... Method: setCoordinates ..............................  
  /**
  * @method setCoordinates
  *
  * @description Set the latitude and longitude values in the cooresponding
  *     inputs. 
  *
  * 
  * @argument mapPlot {D3MapPlot}
  *     D3MapPlot object
  *
  *
  */
  static setCoordinates(mapPlot){
    let isSnapChecked,
        lat,
        lon,
        site;

    isSnapChecked = mapPlot.snapToEl.checked;
    site = D3MapPlot.siteFeature(mapPlot);
    lat = site.geometry.coordinates[1];
    lon = site.geometry.coordinates[0];
    
    lat = isSnapChecked ? Math.round(lat*10.0)/10.0 : lat; 
    lon = isSnapChecked ? Math.round(lon*10.0)/10.0 : lon; 
    
    mapPlot.latEl.value = lat;
    mapPlot.lonEl.value = lon;

  }
  //------------------- End Method: setCoordinates -----------------------------


 
  //.................... Method: setBounds .....................................
  /**
  * @method setBounds
  *
  * @decription Set the latitude and longitude bounds text under
  *     the latitude and longitude labels given the region selected. <br>
  *
  * 
  * @argument mapPlot {D3MapPlot}
  *     D3MapPlot object
  *
  *
  * @property regionBounds {Object}
  *     a GeoJSON feature collection containing the min/max
  *     latitude and longitude values.
  *
  */ 
  
  static setBounds(mapPlot){
    
    
    //............................ Variables ...................................
    let bounds,
        latMax,
        latMin,
        lonMax,
        lonMin,
        region;

    // Property of class
    mapPlot.regionBounds;

    region = D3MapPlot.regionFeatureCollection(mapPlot);
    bounds = region.properties;
    latMax = bounds.maxlatitude;
    latMin = bounds.minlatitude;
    lonMax = bounds.maxlongitude;
    lonMin = bounds.minlongitude;
    mapPlot.regionBounds = region.properties.regionBounds;
    //--------------------------------------------------------------------------


    //...................... Update Bounds .....................................
    mapPlot.latBoundsEl.innerHTML = "<br>" + mapPlot.selectedRegionId +
        " bounds: " + " ["+latMin+","+latMax+"]";
    
    mapPlot.lonBoundsEl.innerHTML = "<br>" + mapPlot.selectedRegionId +
        " bounds: " + " ["+lonMin+","+lonMax+"]";
    //--------------------------------------------------------------------------

  }
  //--------------------- End Method: setBounds --------------------------------
  


  //..................... Method: clearCoordinates .............................
  /**
  * @method clearCoordinates 
  *
  * @description Clear the latitude and longitude input values
  *
  *
  * @argument mapPlot {D3MapPlot}
  *     D3MapPlot object
  *
  */
  static clearCoordinates(mapPlot){
    mapPlot.latEl.value = "";  
    mapPlot.lonEl.value = "";
    
    d3.select(mapPlot.latFormEl)
        .classed("has-error",false);
    d3.select(mapPlot.latFormEl)
        .classed("has-success",false);
    
    d3.select(mapPlot.lonFormEl)
        .classed("has-error",false);
    d3.select(mapPlot.lonFormEl)
        .classed("has-success",false);
  } 
  //------------------- End Method: clearCoordinates ---------------------------

 
  
}
//------------------------- End Class: D3MapPlot -------------------------------
