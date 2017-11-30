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

    _this.svgEl = svgD3.node();
  
    let americaMap = "/nshmp-haz-ws/data/americas.json";
    let borderMap = "/nshmp-haz-ws/data/us.json";

    let promiseOne = $.getJSON(americaMap);
    let promiseTwo = $.getJSON(borderMap);
    
    _this.t0 = performance.now(); 
    $.when(promiseOne,promiseTwo)
        .done(function(map,border){
          _this.usBorders = topojson.mesh(border[0],border[0].objects.states,
              function(a,b){return a!==b;});
          _this.worldMap = map[0];   
          _this.t1 = performance.now();
          console.log("Time: " + (_this.t1-_this.t0));
          D3MapPlot.plotMap(_this);      
        })
        .fail(function(){
          console.log("ERROR: Could not load maps");
        });
  
    _this.testSitePromise.done(function(){
      d3.select(_this.regionFormEl)
          .select("#region")
          .selectAll("label")
          .on("click",function(){
             _this.selectedRegion = d3.select(this)
                .select("input") 
                .attr("value"); 
            D3MapView.setSites(_this);

            D3MapPlot.plotMap(_this);
          });
    });
  }


  static plotMap(mapPlot){
    mapPlot.t0 = performance.now(); 

    let svgHeight = D3MapPlot.plotHeight(mapPlot,true);
    let svgWidth = D3MapPlot.plotWidth(mapPlot,true);
    let height = D3MapPlot.plotHeight(mapPlot);
    let width = D3MapPlot.plotWidth(mapPlot);

    let region = D3MapPlot.regionSelect(mapPlot);
    let sites = D3MapPlot.testSiteList(region);
    
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

    d3.select(mapPlot.svgEl)
        .call(mapPlot.zoom);


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
    mapPlot.t1 = performance.now();
    console.log("Time1: " + (mapPlot.t1-mapPlot.t0));
   
   
    d3.select(mapPlot.svgEl)
        .select(".plot")
        .append("g")
        .attr("class","map-borders")
        .append("path")
        .attr("d",mapPlot.path(mapPlot.usBorders) )
        .attr("stroke","black")
        .attr("fill","none");
        
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
        .attr("r","5")
        .attr("fill","black")   
        .attr("id",function(d,i){
          return region.features[i].properties.locationId
          });
  
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

    let region = mapPlot.testSites.find(function(fc,ifc){
      return fc.properties.regionId == mapPlot.selectedRegion;
    });
    return region;
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




  static testSiteList(region){
    
    let lat = [];
    let lon = [];

    region.features.forEach(function(d,i){
      lon[i] = d.geometry.coordinates[0];
      lat[i] = d.geometry.coordinates[1];
    });

    return d3.zip(lon,lat);
  }





}
