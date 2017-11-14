'use strict'

class Tooltip{
  
  //............ Contructor ...................
  constructor(plotObj,selection){
    
    let _this,
        _label,
        _mouseCoord,
        _tooltipGeom,
        _plotGeom;
    
    
    _this = this;
    _this.offset;
    _this.mouseX;
    _this.xVal;
    _this.yVal;
    _this.padding;
    _this.text;
    _this.tooltipHeight;
    _this.tooltipWidth;
    _this.selection;

    _this.offset = parseFloat(plotObj.options.tooltipOffset);
    _mouseCoord = d3.mouse(plotObj.plotEl);
    _this.mouseX = _mouseCoord[0];
    _this.mouseY = _mouseCoord[1];
    _this.xVal = d3.select(selection).data()[0][0];                              
    _this.yVal = d3.select(selection).data()[0][1];
    _this.padding = parseFloat(plotObj.options.tooltipPadding);
    _this.selection = selection;
     
    let _labelId = d3.select(selection.parentNode).attr("id");
    let _iLabel = plotObj.labelIds.indexOf(_labelId);
    _label = plotObj.labels[_iLabel];
    
    _this.text = [
        plotObj.options.tooltipText[0] + ": " + _label,
        plotObj.options.tooltipText[1] + ": " + _this.xVal,
        plotObj.options.tooltipText[2] + ": " + _this.yVal
      ];

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

    
  }



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




  increaseRadius(plotObj){
    let _this = this;
    let options = plotObj.options;

    var r = d3.select(_this.selection).attr("r");
    
    if (r == options.pointRadiusSelection){
      d3.select(_this.selection)
        .attr("r",options.pointRadiusTooltip);
    }else if (r == options.pointRadius){
      d3.select(_this.selection)
        .attr("r",options.pointRadiusSelection);
    }
  }

  
  decreaseRadius(plotObj){
    let _this = this;
    let options = plotObj.options;
    var r = d3.select(_this.selection).attr("r");
    
    if (r == options.pointRadiusSelection){
      d3.select(_this.selection)
        .attr("r",options.pointRadius);
    }else if (r == options.pointRadiusTooltip){
      d3.select(_this.selection)
        .attr("r",options.pointRadiusSelection);
    }
  }



  destroy(plotObj){
    for (let obj in this){
      this[obj] = null;
    }
    
    d3.select(plotObj.tooltipEl)
        .selectAll("*")
        .remove();

  }

}
