'use strict'




/**
* @class Header
*
* @classdesc Creates the header to be used for all nshmp-haz-ws webapps.
*
* 
* @argument containerEl {Element}
*     optional: html container element where the header will be placed <br>
*     default: body
* 
* @property headerEl {Element}
*     html element for the header
*
* @property headerTitleEl {Element}
*     html element of the title in the header
*
* @property menuItems {Array<Array<String>>}
*     array of string coorseponding to the dropdown menu label and url: <br>
*     [ ["Model Compare Webapp","model-compare.html"] ,.., ["",""] ]
*
* @property options {Object}                                                    
*     options object for the footer options                                     
*                                                                               
* @property options.position {String}                                           
*     default fixed <br>                                                        
*     whether to use fixed or absolute positioning 
*
*/
class Header{

  //........................... Header Constructor .............................
  constructor(containerEl){

    
    //............................... Variables ................................
    let _this,
        // Variables
        headerD3,
        headerMenuD3;

    _this = this;
    _this.headerEl;
    _this.headerTitleEl;
    _this.menuItems;
    _this.options;
    
    // Check for optional argument                                              
    containerEl = containerEl ? containerEl : document.querySelector("body"); 
    
    document.title = "NSHMP-HAZ-WS";
    //--------------------------------------------------------------------------

    
    //...................... Header Options ....................................
    _this.options = {
      position: "fixed"
    };
    //--------------------------------------------------------------------------


    //...................... Set Dropdown Menu Items ...........................
    _this.menuItems = [
        ["Dashboard","/nshmp-haz-ws/dashboard.html"],
        ["Ground Motion Vs. Distance","/nshmp-haz-ws/gmm-distance.html"],
        ["Model Compare","/nshmp-haz-ws/model-compare.html"],
        ["Model Explorer","/nshmp-haz-ws/model-explorer.html"],
        ["Response Spectra","/nshmp-haz-ws/spectra-plot.html"],
        ["Test Sites","/nshmp-haz-ws/test-sites.html"]
    ];
    //--------------------------------------------------------------------------

            
    //............................. Create Header ..............................
    // Append header to body
    headerD3 = d3.select(containerEl)
        .append("div")
        .attr("id","header");
    // Append webapp title
    headerD3.append("span")
        .attr("class","title")
        .attr("id","header-title")
        .text("");
    // Create dropdown 
    headerD3.append("div")
        .attr("class","dropdown-toggle")
        .attr("id","header-menu")
        .attr("data-toggle","dropdown")
        .append("span")
        .attr("class","glyphicon glyphicon-menu-hamburger");
    // Append unordered list
    headerMenuD3 = headerD3.append("ul")
        .attr("class","dropdown-menu dropdown-menu-right")
        .attr("aria-labelledby","header-menu");
    // Create dropdown list of all webapps 
    headerMenuD3.selectAll("li")
        .data(_this.menuItems)
        .enter()
        .append("li")
        .append("a")
        .text(function(d,i){return d[0]})
        .attr("href",function(d,i){return d[1]});

    headerD3.lower(); 
    //--------------------------------------------------------------------------


    //........................... DOM Elements .................................
    _this.headerEl = headerD3.node(); 
    _this.headerListEl = _this.headerEl.querySelector("ul");
    _this.headerTitleEl = _this.headerEl.querySelector("#header-title");
    //--------------------------------------------------------------------------
    
  }
  //----------------------- End: Header Constructor ----------------------------



  //......................... Method: setCustomMenu ............................
  /**
  * @method setCustomMenu
  *
  * @description create a custom dropdown menu for the header
  *
  *
  * @argument menuItems {Array<Array<String>>}
  *     array of string coorseponding to the dropdown menu label and url: <br>
  *     [ ["Model Compare Webapp","model-compare.html"] ,.., ["",""] ]
  *
  */
  setCustomMenu(menuItems){
    let _this;

    _this = this;
    
    d3.select(_this.headerListEl)
        .selectAll("li")
        .remove();
  
    // Create dropdown list of all webapps 
    d3.select(_this.headerListEl)
        .selectAll("li")
        .data(menuItems)
        .enter()
        .append("li")
        .append("a")
        .text(function(d,i){return d[0]})
        .attr("href",function(d,i){return d[1]});

  }
  //-------------------- End Method: customMenu --------------------------------

  
  
  //......................... Method: setOptions ...............................
  /**                                                                           
  * @method setOptions
  *
  * @description method to set the header options
  *
  * @arguments options {Object}
  *     options object for footer <br>
  *     should contain: <br>
  *     options.position {String}
  *
  */
  setOptions(options){
    let _this,
        header;
                                                                                
    header = this;
    _this = header.options;

    options.position = options.position == "fixed" ||
        options.position == "absolute" ? options.position : "fixed"; 
     
    $.extend(_this,options);
    Header.updateOptions(header);
  }
  //---------------------- End Method: setOptions ------------------------------
                                                                                
                                                                                
                                                                                
  //......................... Method: setTitle .................................
  /**
  * @method setTitle
  *
  * @argument title {String}
  *     title for webapp that goes in header 
  *
  */
  setTitle(title){
    let _this;

    _this = this;

    d3.select(_this.headerTitleEl)
        .text(title);

    document.title = "NSHMP: " + title;
  }
  //-------------------- End Method: setTitle ----------------------------------

  
  
  //......................... Method: updateOptions ............................
  /** 
  * @method updateOptions
  * 
  * @description static method to update the header options: the
  * position of the header (fixed || absolute}
  *
  * @arguments header {Object}
  *     Header object
  */
  static updateOptions(header){
    d3.select(header.headerEl)
        .style("position",header.options.position); 
  }
  //-------------------- End Method: updateOptions -----------------------------

}


//------------------------ End Header Class ------------------------------------
