'use strict'




/**
* @class Footer
*
* @classdesc Creates the footer to be used with all 
*     nshmp-haz-ws webapps. <br>
*     The footer contains two buttons: <br>
*       1. raw-data: When clicked would open a new 
*          tab with raw JSON return <br>
*       2. update-plot: When clicked would update the plot(s) 
*
* @argument containerEl {Element}                                               
*     optional: html container element where the footer will be placed <br>
*     default: body
*
*
* @property footerEl {Element}
*     selected html element of the footer
*
* @property options {Object}
*     options object for the footer options
*
* @property options.position {String}
*     default fixed <br>
*     whether to use fixed or absolute positioning 
*
* @property options.rawBtnDisable {Boolean}
*     default false <br>
*     whether to have the raw data button disabled or not
*
* @property options.updateBtnDisable {Boolean}
*     default false <br>
*     whether to have the update plot button disabled or not 
*
* @property rawBtnEl {Element}
*     selected html element of the raw data button
*
* @property updateBtnEl {Element}
*     selected html element of the update plot button
*
*
*/


class Footer{

  //........................ Footer Contructor .................................
  constructor(containerEl){
    
    
    //.............................. Variables .................................
    let _this,
        // Variables
        footerD3;

    _this = this;
    _this.footerEl;
    _this.options;
    _this.rawDataBtnEl;
    _this.updatePlotEl;
    
    // Check for optional argument 
    containerEl = containerEl ? containerEl : document.querySelector("body");
    //--------------------------------------------------------------------------

    
    //............................... Options ..................................
    _this.options = {
      position: "fixed",
      rawBtnDisable: false,
      updateBtnDisable: false
    };       
    //--------------------------------------------------------------------------  
    

    //.............................. Create Footer .............................
    // Append footer to body
    footerD3 = d3.select(containerEl)
        .append("div")
        .attr("id","footer");
    // Append update plot button to footer
    footerD3.append("button")
        .attr("id","update-plot")
        .attr("class","btn btn-primary")
        .text("Update");
    // Append raw data button to footer
    footerD3.append("span")
        .append("button")
        .attr("id","raw-data")
        .attr("class","btn btn-danger")
        .text("Raw Data");
    
    footerD3.lower();
    //--------------------------------------------------------------------------


    //....................... DOM Elements .....................................
    _this.footerEl = footerD3.node();
    _this.rawBtnEl = _this.footerEl.querySelector("#raw-data");
    _this.updateBtnEl = _this.footerEl.querySelector("#update-plot");
    //--------------------------------------------------------------------------
    
  }
  //-------------------- End: Footer Constructor -------------------------------


        	
  //......................... Method: setOptions ...............................
  /**
  * @method setOptions
  *
  * @description method to set the footer options
  *
  * @arguments options {Object}
  *     options object for footer <br>
  *     should contain: <br>
  *     options.rawBtnDisable {Boolean} <br>
  *     options.updateBtnDisable {Boolean} <br>
  *
  */
  setOptions(options){
    let _this,
        footer;

    footer = this;
    _this = footer.options;

    options.position = options.position == "fixed" || 
        options.position == "absolute" ? options.position : "fixed";
         
    $.extend(_this,options);
    
    Footer.updateOptions(footer);
  }
  //---------------------- End Method: setOptions ------------------------------



  //......................... Method: updateOptions ............................
  /**
  * @method updateOptions
  *
  * @description static method to update the footer options: whether to
  * disable the footer buttons;
  *
  * @arguments footer {Object}
  *     Footer object
  */
  static updateOptions(footer){
   
    d3.select(footer.footerEl)
        .style("position",footer.options.position);
         
    d3.select(footer.rawBtnEl)
        .property("disabled",footer.options.rawBtnDisable);   
  
    d3.select(footer.updateBtnEl)
        .property("disabled",footer.options.updateBtnDisable);
  }
  //-------------------- End Method: updateOptions -----------------------------

}


//-------------------------- End Footer Class ----------------------------------
