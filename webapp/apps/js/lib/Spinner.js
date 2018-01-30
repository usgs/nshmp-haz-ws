'use strict'




/**
* @class Spinner
*
* @description Creates a loading spinner 
*
*
* @argument containerEl {Element}
*     optional: html element where the spinner will be created <br>
*     default: body
*
*
* @parameter containerEl {Element}
*     html element where the spinner is created <br>
*     default: body
*/
class Spinner{

  
  //.......................... Spinner Constructor .............................
  constructor(containerEl){
    let _this;

    _this = this;
    _this.containerEl;

    _this.containerEl = containerEl ? containerEl : 
        document.querySelector("body");
  }
  //-------------------------- End: Spinner Constructor ------------------------



  //........................... Method: off ....................................
  /**
  * @method off 
  *
  * @description remove the loading spinner overlay 
  *
  */
  off(){
    let _this;
    _this = this;

    d3.select(_this.containerEl)
        .select(".loading-spinner")
        .remove();
  }
  //-------------------------- End Method: off ---------------------------------
  
  
  
  //............................ Method: on ....................................
  /**
  * @method on
  *
  * @description creates a loading spinner overlay 
  *
  *
  * @argument text {String}
  *     string for the spinner text <br>
  *     default: Loading ...
  */
  on(text){
    let _this,
        // Variables
        loaderD3,
        spinnerD3,
        spinnerText;
    
    _this = this;
     
    spinnerText = text == null ? "Loading ..." : text;

    spinnerD3 = d3.select(_this.containerEl)
        .append("div")
        .attr("class","loading-spinner");

    spinnerD3.append("div")
        .attr("id","overlay");

    loaderD3 = spinnerD3.append("div")
        .attr("id","loader");

    loaderD3.append("div")
        .attr("id","spinner");

    loaderD3.append("div")
        .attr("id","loader-text")
        .text(spinnerText);
  }
  //------------------------- End Method: on -----------------------------------
  

}


//-------------------------- End Spinner Class ---------------------------------
