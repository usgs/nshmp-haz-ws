"use strict"




/**
* @class D3MapView 
*
* @classdesc Creates the html structure for the location widget. The 
* location widget is 600px wide with 100% height. The html structure
* is done using a Bootstrap panel with the panel body being the map
* and the panel footer being the control panel for the map. <br>
*
* This class only creates the panel body for the map to reside in. The map 
* itself is created in the D3Map class that extends this class. The panel body
* is 55% height. <br>
*
* This class creates the entire control panel for the map, including the
* region list, test site list, a latitude and longitude input form, and
* a check box to snap the sites to nearest 0.1 degrees. <br>
*
* This class uses the D3MapView.css stylesheet at 
* /nshmp-haz-ws/css/D3MapView.css 
*
*
*
* @arguments containerEl {Element}
*     html selection of a container element of where to 
*     put the location widget <br>
*     The location widget will then take up 100% height and width of that 
*     container. <br>
*     The width should of the container element should be at minimum 
*     400px to fit the region and test site list.
*
*
* @property containerEl {Element}
*     the argument
*
* @property el {Element}
*     html selection of the D3MapView class
* 
* @property latBoundsEl {Element}
*     html selection of the lat-bounds element <br>
*     used to add the min/max bounds for a region underneath the latitude label
*
* @property latEl {Element}
*     html selection of the latitude input form element <br>
*     used to get/set the latitude value in the control panel
*
* @property latFormEl {Element}
*     html selection of the latitude form-group element 
*     where the latitude label and form input are
*
* @property lonBoundsEl {Element}
*     html selection of the lon-bounds element <br>
*     used to add the min/max bounds for a region underneath the longitude label
*
* @property lonEl {Element}
*     html selection of the longitude input form element <br>
*     used to get/set the longitude value in the control panel
*
* @property lonFormEl {Element}
*     html selection of the longitude form-group element 
*     where the longitude label and form input are
*
* @property options {Object}
*     object for the map options
*
* @property options.defaultRegion {String}
*     string region ID for the default selected region on the map <br>
*     default: "CEUS"
*
* @property options.defaultSite {String}
*     string site ID for the default selected site on the map <br>
*     default: null
*
* @propery regionFormEl {Element}
*     html selection of the form-group element for the region
*
* @property regionListEl {Element}
*     html selection of the btn-group-vertical div 
*     that holds the list of regions
*
* @property selectedRegionId {String}
*     region ID string of the current selected region 
*
* @propery siteFormEl {Element}
*     html selection of the form-group element for the test sites
*
* @property siteListEl {Element}
*     html selection of the btn-group-vertical div 
*     that holds the list of test sites
* 
*
*/
class D3MapView{


  //.......................... D3MapView Constructor ...........................
  constructor(containerEl,options,settings){

    //............................ Variables ...................................
    let _this,
        // Variables
        elD3,
        panelD3,
        footerD3,
        formD3,
        labels,
        ids,
        formEnterD3,
        horFormD3,
        formInputD3,
        wsUrl,
        jsonPromise;
    
    _this = this;
    // Properties of class
    _this.containerEl;
    _this.el;
    _this.latBoundsEl;
    _this.latEl;
    _this.latFormEl;
    _this.lonBoundsEl;
    _this.lonEl; 
    _this.lonFormEl;
    _this.options;
    _this.regionFormEl;
    _this.regionListEl;
    _this.selectedRegionId;
    _this.siteFormEl;
    _this.siteListEl;

    _this.settings = settings;
    //--------------------------------------------------------------------------


    //............................ Options .....................................
    _this.options = {
      defaultRegion: "COUS",
      defaultSite: null,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 20, 
      plotWidth: 600,
      pointColor: "black",
      pointColorAddedSite: "blue",
      pointColorSelection: "red",
      pointRadius: 5,
      pointRadiusSelection: 8,
      pointRadiusTooltip: 10,
      tooltipOffset: 10,
      tooltipPadding: 10,
      tooltipText: ["Site","Longitude","Latitude"]
    };
    $.extend(_this.options,options);
    _this.selectedRegionId = _this.options.defaultRegion;
    //--------------------------------------------------------------------------

    
    //........................... Construct Map Outline ........................  
    elD3 = d3.select(containerEl)
        .append("div")
        .attr("class","D3MapView")
        .style("width",_this.options.plotWidth+"px")
   
    panelD3 = elD3.append("div")
        .attr("class","panel panel-default");
        
    panelD3.append("div")
        .attr("class","panel-body map");

    footerD3 = panelD3.append("div")
        .attr("class","panel-footer control-panel");
    
    formD3 = footerD3.append("form");

    _this.containerEL = containerEl;
    _this.el = elD3.node();
    _this.mapEl = _this.el.querySelector(".map");
    //--------------------------------------------------------------------------


    //................... Create Region and Test Site List .....................
    labels = ["Region","Test Sites"];
    ids = ["region","test-site"];

    labels.forEach(function(label,i){
      formEnterD3 = formD3.append("div")
          .attr("class","col-xs-4")
          .append("div")
          .attr("class","form-group form-control-panel")
          .attr("id",ids[i]+"-form")
      
      formEnterD3.append("label")
          .attr("class","control-group control-spacer")
          .text(label+":");
      
      formEnterD3.append("div")
          .attr("class","panel panel-default")
          .append("div")
          .attr("class","btn-group-vertical")
          .attr("id",ids[i])
          .attr("data-toggle","buttons");
    });
    _this.regionFormEl= formD3.select("#region-form").node();
    _this.regionListEl = _this.regionFormEl.querySelector("#region");
    _this.siteFormEl = formD3.select("#test-site-form").node();
    _this.siteListEl = _this.siteFormEl.querySelector("#test-site");
    //--------------------------------------------------------------------------


    //............... Create Latitude and Longitude Input Box ..................
    labels = ["Latitude","Longitude"];
    ids = ["lat","lon"];

    horFormD3 = formD3.append("div")
        .attr("class","col-xs-4")
        .append("div")
        .attr("class","form-horizontal form-control-panel")
    
    formEnterD3 = horFormD3.selectAll("div")
        .data(labels)
        .enter()
        .append("div")
        .attr("class","form-group form-group-sm form-inline")
        .attr("id",function(d,i){return ids[i]+"-form"});
    
    formEnterD3.append("label")
        .attr("class","control-group control-spacer")
        .text(function(d,i){return d+":"})
        .append("small")
        .attr("id",function(d,i){return ids[i]+"-bounds"})
        .html("<br> Region bounds");
    
    formInputD3 = formEnterD3.append("div")
        .attr("class","input-group")
        .style("width","100%") 

    formInputD3.append("input")
        .attr("class","form-control")
        .attr("id",function(d,i){return ids[i]})
        .attr("type","text");
    
    formInputD3.append("div")
        .attr("class","input-group-addon")
        .text("°");
    
    _this.latFormEl = formD3.select("#lat-form").node();
    _this.latBoundsEl = _this.latFormEl.querySelector("#lat-bounds");
    _this.latEl = _this.latFormEl.querySelector("#lat");
    _this.lonFormEl = formD3.select("#lon-form").node();
    _this.lonBoundsEl = _this.lonFormEl.querySelector("#lon-bounds");
    _this.lonEl = _this.lonFormEl.querySelector("#lon");
    //-------------------------------------------------------------------------- 
   
    //........................ Add Site Button ................................. 
    let addSiteD3 = horFormD3.append("div")
        .attr("class","form-group form-group-sm")
        .append("button")
        .attr("class","btn btn-default")
        .attr("type","button")
        .text("Add site");
    _this.addSiteEl = addSiteD3.node();
    //--------------------------------------------------------------------------
    
    //....................... Snap to 0.1 degrees Checkbox ..................... 
    let snapToD3 = horFormD3.append("div")
        .attr("class","form-group form-group-sm")
        .append("label")
        .html("<input type='checkbox' id='snap-grid'> Snap to 0.1°");
    _this.snapToEl = snapToD3.select("input").node();
    //--------------------------------------------------------------------------


    //.................... Call Test Sites Web Service .........................
    wsUrl = "/nshmp-haz-ws/util/testsites";                                     
    jsonPromise = $.getJSON(wsUrl);
    jsonPromise.done(function(json){
      _this.testSites = json.features;
      D3MapView.setRegions(_this);
      D3MapView.setSites(_this);
    });
    jsonPromise.fail(function(){
      console.log("JSON Error");
    });
    _this.testSitePromise = jsonPromise;
    //--------------------------------------------------------------------------

  }
  //------------------------- End D3MapView Constructor ------------------------



  //............................. Method: setRegions ...........................
  /**
  * @method setRegions
  *
  * @description This static method is called after the test sites 
  *     web service is called to make a vertical button group of
  *     all the regions returned from the web service. <br>
  *     The default region is then selected from the options.defaultRegion. <br>
  *     This method allso listens for a button to be pressed and then
  *     calls the setSites static method to update the test site list.
  *     
  *
  * @arguments mapView {Object}
  *     D3MapView object
  *
  */
  static setRegions(mapView){
    let options,
        regionsDisplay,
        regionId;

    options = mapView.options;

    //...................... Make Region List ..................................    
    d3.select(mapView.regionListEl)
        .selectAll("label")
        .data(mapView.testSites)
        .enter()
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .classed("active",function(d,i){
          return d.properties.regionId == options.defaultRegion ? true : false;
        })
        .html(function(d,i){ 
          return "<input name='region' type='radio' " +
              "value='"+d.properties.regionId+"' />"+
              d.properties.regionDisplay;
        });
    //--------------------------------------------------------------------------


    //.................... Update Site List on Click ...........................
    d3.select(mapView.regionFormEl)
        .selectAll("label")
        .on("click",function(){
          mapView.selectedRegionId = d3.select(this)
              .select("input")
              .attr("value");
          D3MapView.setSites(mapView);
        });
    //--------------------------------------------------------------------------

  }
  //----------------------- End Method: setRegions -----------------------------
  

  
  //........................ Method: setSites ..................................
  /**
  * @method setSites
  *
  * @description This static method is called after the test sites 
  *     web service is called to make a vertical button group of
  *     the test sites returned from the web service. <br>
  *     The initial test site list is from the default region from
  *     options.defaultRegion.
  *
  *
  * @arguments mapView {Object}
  *     D3MapView object
  *
  * 
  * @property mapView.labels {Array<String>}
  *     array of site names 
  *
  * @property mapView.ids {Array<String>}
  *     array of site id names
  *
  */
  static setSites(mapView){
    let fc,
        options,
        sites;

    options = mapView.options;
    fc = mapView.testSites.find(function(d,i){
      return d.properties.regionId == mapView.selectedRegionId;
    });
    sites = fc.features;

    mapView.labels = [];
    mapView.ids = [];
    sites.forEach(function(d,i){
      mapView.labels[i] = d.properties.location;
      mapView.ids[i] = d.properties.locationId;
    });

    d3.select(mapView.siteListEl)
        .selectAll("label")
        .remove();

    d3.select(mapView.siteListEl)
        .selectAll("label")
        .data(sites)
        .enter()
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .attr("id",function(d,i){return d.properties.locationId;})
        .html(function(d,i){ 
          return "<input name='site' type='radio' " +
              "value='"+d.properties.locationId+"' />"+
              d.properties.location;
        });

  }
  //-------------------- End Method: setSites ----------------------------------



}
//--------------------- End Class: D3MapView -----------------------------------
