'use strict'




/**
* @class Tooltip
*
* @classdesc Tooltip class
* Creates a tooltip for the plot 
*
*
* @argument plotObj {Object}
*     plot object from D3LineView
* 
* @argument plotObj.plotEl {Element}
* @argument plotObj.options {Object}
* @argument plotObj.options.tooltipOffset {Integer}
* @argument plotObj.options.tooltipPadding {Integer}
* @argument plotObj.labels {Array<String>}
* @argument plotObj.ids {Array<String>}
* @argument plotObj.options.tooltipText {Array<Array<String>>}
* @argument plotObj.tooltipEl {Element}
* @argument plotObj.svgEl {Element}
* @argument plotObj.options.pointRadius {Integer}
* @argument plotObj.options.pointRadiusSelection {Integer}
* @argument plotObj.options.pointRadiusTooltip {Integer}
*
* @argument selectedEl {Element}
*     DOM selection of the data point to put the tooltip
*
*
* @property mouseX {Number}
*     the mouse location in X in pixels
*
* @property mouseY {number}
*     the mouse location in Y in pixels
*
* @property offset {Number}
*     tooltip offset from data point <br>
*     comes from plotObj.options.tooltipOffset
*
* @property padding {Number}
*     tooltip text padding <br>
*     comes from plotObj.options.tooltipPadding
*
* @property selectedEl {Element}
*     DOM selected element of the data point to put the tooltip
*
* @property text {Array<String>}
*     array of 3 strings for the tooltip:  <br>
*     ["Data Label","X Value Label","Y Value Label"] <br>
*     comes from plotObj.options.tooltipText
*
* @property tooltipHeight {Number}
*     rectangle height to enclose tooltip
*
* @property tooltipWidth {Number}
*     rectangle width to enclose tooltip
*
* @property xVal {Number}
*     X value of data 
*
* @property yVal {Number}
*     Y value of data
*
*/

class Tooltip{
  
  //...................... Tooltip Contructor ..................................
  constructor(plotObj,selectedEl){
    
    //......................... Variables ......................................
    let _this,
        // Variables
        _label,
        _mouseCoord,
        _plotGeom,
        _tooltipGeom;
    
    _this = this;
    _this.mouseX;
    _this.mouseY;
    _this.offset;
    _this.padding;
    _this.selectedEl;
    _this.text;
    _this.tooltipHeight;
    _this.tooltipWidth;
    _this.xVal;
    _this.yVal;
    
    _mouseCoord = d3.mouse(plotObj.plotEl);
    _this.mouseX = parseFloat(d3.select(selectedEl).attr("cx")); 
    _this.mouseY = parseFloat( d3.select(selectedEl).attr("cy"));
    _this.offset = parseFloat(plotObj.options.tooltipOffset);
    _this.padding = parseFloat(plotObj.options.tooltipPadding);
    _this.selectedEl = selectedEl;
    _this.xVal = d3.select(selectedEl).data()[0][0];                              
    _this.yVal = d3.select(selectedEl).data()[0][1];
    //-------------------------------------------------------------------------

    
    //........................ Set Tooltip Text ................................
    let _labelId = d3.select(selectedEl).attr("id");
    let _iLabel = plotObj.ids.indexOf(_labelId);
    _label = plotObj.labels[_iLabel];
    
    _this.text = [
        plotObj.options.tooltipText[0] + ": " + _label,
        plotObj.options.tooltipText[1] + ": " + _this.xVal,
        plotObj.options.tooltipText[2] + ": " + _this.yVal
      ];
    //--------------------------------------------------------------------------

    
    //................... Create Tooltip ....................................... 
    d3.select(plotObj.tooltipEl)
        .selectAll("text")                       
        .data(_this.text)                             
        .enter()
        .append("text")                                 
        .attr("class","tooltip-text")                 
        .attr("font-size",11)                         
        .style("visibility","hidden")
        .attr("y",function(d,i){return i*16} )        
        .attr("alignment-baseline","text-before-edge")
        .text(function(d,i){return d});               

    _tooltipGeom   = plotObj.tooltipEl               
        .getBoundingClientRect();

    _this.tooltipWidth  = parseFloat(_tooltipGeom.width  + 2*_this.padding); 
    _this.tooltipHeight = parseFloat(_tooltipGeom.height + 2*_this.padding); 


    _plotGeom = plotObj.svgEl
			.getBoundingClientRect();
		_this.plotWidth  = _plotGeom.width; 
		_this.plotHeight = _plotGeom.height;

    Tooltip.tooltipLocation(_this);

    d3.select(plotObj.tooltipEl)
        .append("rect")                     
        .attr("class","tooltip-outline")   
        .attr("height",_this.tooltipHeight)    
        .attr("width",_this.tooltipWidth)     
        .attr("transform",_this.rectTrans)   
        .attr("stroke","#999")         
        .attr("fill","white");        

    d3.select(plotObj.tooltipEl)
      .selectAll(".tooltip-text")
      .style("visibility","initial")
      .attr("transform",_this.textTrans)
      .raise();

    d3.select(plotObj.tooltipEl)
        .raise();
    //--------------------------------------------------------------------------
  
  }
  //------------------------- End Constructor ----------------------------------



  //................... Method: Decrease Circle Radius .........................
  /**
  * @method decreaseRadius
  *
  * @description Method to decrease the radius of a circle
  *
  * @argument plotObj {Object}
  *     the plot object (D3LinePlot)
  *
  */
  decreaseRadius(plotObj){
    let _this = this;
    let options = plotObj.options;
    var r = d3.select(_this.selectedEl).attr("r");
    
    if (r == options.pointRadiusSelection){
      d3.select(_this.selectedEl)
        .attr("r",options.pointRadius);
    }else if (r == options.pointRadiusTooltip){
      d3.select(_this.selectedEl)
        .attr("r",options.pointRadiusSelection);
    }
  }
  //---------------- End Method: Decrease Circle Radius ------------------------
  
  
  
  //.................... Method: Remove Tooltip ................................
  /**
  * @method destroy
  *
  * @description Method to remove the tooltip and remove all variables 
  *
  * @argument plotObj {Object}
  *     the plot object (D3LinePlot)
  *
  */
  destroy(plotObj){
    let _this,
        _obj;
    
    _this = this;
        
    for (_obj in _this){
      _this[_obj] = null;
    }
    
    d3.select(plotObj.tooltipEl)
        .selectAll("*")
        .remove();
  }
  //--------------------- End Method: Remove Tooltip ---------------------------
  
  

  //...................... Method: Increase Circle Radius ......................
  /**
  * @method increaseRadius
  *
  * @description Method to increase the radius of a circle
  *
  * @argument plotObj {Object}
  *     the plot object (D3LinePlot)
  *
  */
  increaseRadius(plotObj){
    let _this = this;
    let options = plotObj.options;

    var r = d3.select(_this.selectedEl).attr("r");
    
    if (r == options.pointRadiusSelection){
      d3.select(_this.selectedEl)
        .attr("r",options.pointRadiusTooltip);
    }else if (r == options.pointRadius){
      d3.select(_this.selectedEl)
        .attr("r",options.pointRadiusSelection);
    }
  }
  //----------------- End Method: Increase Circle Radius -----------------------



  //....................... Method: Tooltip Location ...........................
  /**
  * @method tooltipLocation 
  *
  * @description Static method to set the location of tooltip so it doesn't 
  * extend over the panel
  *
  * @argument tooltip {Object}
  *     Tooltip object
  *
  */
  static tooltipLocation(tooltip){
    let _this = tooltip,
        _xRect,
        _xText,
        _yText,
        _yRect,
        _xPer,
        _yPer,
        rectTrans,
        textTrans;

    _xPer = _this.mouseX/_this.plotWidth; 
    _yPer = _this.mouseY/_this.plotHeight; 

    if (_xPer < 0.30){              
      _xRect = (_this.mouseX);
      _xText = (_this.mouseX+_this.padding);
    }else if (_xPer > 0.70){         
      _xRect = (_this.mouseX-_this.tooltipWidth);
      _xText = (_this.mouseX-_this.tooltipWidth+_this.padding);
    }else{                               
      _xRect = (_this.mouseX-_this.tooltipWidth/2);
      _xText = (_this.mouseX-_this.tooltipWidth/2+_this.padding);
    }

    if (_yPer < 0.25){                   
      _yRect = (_this.mouseY+_this.offset);
      _yText = (_this.mouseY+_this.offset+_this.padding);
    }else{                             
      _yRect = (_this.mouseY-_this.tooltipHeight-_this.offset);
      _yText = (_this.mouseY-_this.offset-_this.tooltipHeight+_this.padding);
    }

    rectTrans = "translate("+_xRect+","+_yRect+")"; 
    textTrans = "translate("+_xText+","+_yText+")"; 
  
    _this.rectTrans = rectTrans;
    _this.textTrans = textTrans;
  }
  //-------------------- End Method: Tooltip Location --------------------------



  pointColor(color){
    let _this = this;

    d3.select(_this.selectedEl)
        .attr("fill",color);
  }
    


}

//--------------------- End Tooltip Class --------------------------------------
