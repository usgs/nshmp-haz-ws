'use strict';

/**
* @class Tooltip
*
* @fileoverview Create a tooltip 
*/
export default class Tooltip {
  
  /**
  * @param {Panel} panel - Upper or lower panel object
  * @param {HTMLElement} selectedEl - The DOM element of the data point to 
  *     add tooltip. 
  */
  constructor(panel, selectedEl) {
    /** @type {HTMLElement} */
    this.selectedEl = selectedEl;
    /** @type {PlotOptions} */
    this.panelOptions = panel.options;
    /** @type {HTMLElement} */
    this.tooltipEl = panel.tooltipEl;
    /** @type {Number} */
    this.mouseX = parseFloat(d3.select(selectedEl).attr('cx')); 
    this.mouseY = parseFloat(d3.select(selectedEl).attr('cy'));
    /** @type {Number} */
    this.offset = parseFloat(this.panelOptions.tooltipOffset);
    /** @type {Number} */
    this.padding = parseFloat(this.panelOptions.tooltipPadding);
    /** @type {Number} */
    this.xVal = d3.select(selectedEl).data()[0][0];                              
    /** @type {Number} */
    this.yVal = d3.select(selectedEl).data()[0][1];
    /** @type {Number} */
    this.xVal = this.panelOptions.tooltipXToExponent ? 
        this.xVal.toExponential(4) : this.xVal;
    /** @type {Number} */
    this.yVal = this.panelOptions.tooltipYToExponent ? 
        this.yVal.toExponential(4) : this.yVal;

    let scale = panel.plotScale || 1;
    let labelId = d3.select(selectedEl).attr('id');
    let iLabel = panel.ids.indexOf(labelId);
    let label = panel.labels[iLabel];
    
    /** @type {Array<String>} */ 
    this.text = [
      this.panelOptions.tooltipText[0] + ' ' + label,
      this.panelOptions.tooltipText[1] + ' ' + this.xVal,
      this.panelOptions.tooltipText[2] + ' ' + this.yVal,
    ];
    
    d3.select(panel.tooltipEl)
        .selectAll('text')
        .data(this.text)
        .enter()
        .append('text')
        .attr('class', 'tooltip-text')
        .attr('font-size', 11)
        .style('visibility', 'hidden')
        .attr('y', (d,i) => {return i * 16})
        .attr('alignment-baseline', 'text-before-edge')
        .text((d,i) => {return d});

    let tooltipGeom = panel.tooltipEl.getBoundingClientRect();

    /** @type {Number} */
    this.tooltipWidth = parseFloat(tooltipGeom.width * scale + 
        2 * this.padding); 
    /** @type {Number} */
    this.tooltipHeight = parseFloat(tooltipGeom.height * scale + 
        2 * this.padding); 

    let plotGeom = panel.svgEl.getBoundingClientRect();
    /** @type {Number} */
		this.plotWidth = plotGeom.width * scale; 
    /** @type {Number} */
		this.plotHeight = plotGeom.height * scale;

    let tooltipTrans = this.tooltipLocation();

    d3.select(this.tooltipEl)
        .append('rect')                     
        .attr('class', 'tooltip-outline')   
        .attr('height', this.tooltipHeight)    
        .attr('width', this.tooltipWidth)     
        .attr('transform', tooltipTrans.rectTrans)   
        .attr('stroke', '#999')         
        .attr('fill', 'white');        

    d3.select(this.tooltipEl)
      .selectAll('.tooltip-text')
      .style('visibility', 'initial')
      .attr('transform', tooltipTrans.textTrans)
      .raise();

    d3.select(this.tooltipEl)
        .raise();
  }

  /**
  * @method decreaseRadius
  *
  * Method to decrease the radius of a circle
  * @param {Panel} panel - Upper or lower panel object
  */
  decreaseRadius() {
    let options = this.panelOptions;
    var r = d3.select(this.selectedEl).attr('r');
    
    if (r == options.pointRadiusSelection) {
      d3.select(this.selectedEl)
          .attr('r', options.pointRadius);
    } else if (r == options.pointRadiusTooltip) {
      d3.select(this.selectedEl)
          .attr('r',options.pointRadiusSelection);
    }
  }
  
  /**
  * @method destroy
  *
  * Method to remove the tooltip and remove all variables 
  * @param {Panel} panel - Upper or lower panel object
  */
  destroy() {
    d3.select(this.tooltipEl)
        .selectAll("*")
        .remove();
    
    for( let obj in this) {
      this[obj] = null;
    }
  }
  
  /**
  * @method increaseRadius
  *
  * Method to increase the radius of a circle
  * @param {Panel} panel - Upper or lower panel object
  */
  increaseRadius() {
    let options = this.panelOptions;
    var r = d3.select(this.selectedEl).attr('r');
    
    if (r == options.pointRadiusSelection) {
      d3.select(this.selectedEl)
        .attr('r', options.pointRadiusTooltip);
    } else if (r == options.pointRadius) {
      d3.select(this.selectedEl)
        .attr('r', options.pointRadiusSelection);
    }
  }

  /**
  * @method tooltipLocation 
  *
  * Find best location to put the tooltip
  * @return {{
  *   rectTrans: {String} - Translation string of tooltip outline,
  *   textTrans: {String} - Translation string for tooltip text
  * }} Object
  */
  tooltipLocation() {
    let xPer = this.mouseX / this.plotWidth; 
    let xRect;
    let xText;
    if (xPer < 0.30) {
      xRect = (this.mouseX);
      xText = (this.mouseX + this.padding);
    } else if (xPer > 0.70) {         
      xRect = (this.mouseX - this.tooltipWidth);
      xText = (this.mouseX - this.tooltipWidth + this.padding);
    } else {
      xRect = (this.mouseX - this.tooltipWidth / 2);
      xText = (this.mouseX - this.tooltipWidth / 2 + this.padding);
    }

    let yPer = this.mouseY / this.plotHeight; 
    let yRect;
    let yText;
    if (yPer < 0.25) {
      yRect = (this.mouseY + this.offset);
      yText = (this.mouseY + this.offset + this.padding);
    } else {
      yRect = (this.mouseY - this.tooltipHeight - this.offset);
      yText = (this.mouseY - this.offset - this.tooltipHeight + this.padding);
    }

    let rectTrans = 'translate(' + xRect + ',' + yRect + ')'; 
    let textTrans = 'translate(' + xText + ',' + yText + ')'; 
    
    return {rectTrans: rectTrans, textTrans: textTrans}; 
  }

  /**
  * @method pointColor
  *
  * Change the dot color
  * @param {String} color - The color the dot should be
  */
  pointColor(color) {
    d3.select(this.selectedEl)
        .attr('fill', color);
  }
    
}
