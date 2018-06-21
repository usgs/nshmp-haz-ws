'use strict';

import D3SaveFigure from './D3SaveFigure.js';
import D3Tooltip from './D3Tooltip.js';
import D3View from './D3View.js';
import Tools from './Tools.js';

/**
* @class D3LinePlot
* @extends D3View
*
* @fileoverview The class will create line plots in the upper and lower
*     panel body of the plot panel.
* All data properties must be set before plotting, for example:
*     let myPlot = new D3LinePlot().withPlotHeader().withPlotFooter();
*     myPlot.setPanelTitle(' ')
*         .setUpperData(data)
*         .setUpperDataTableTitle(' ')
*         .setUpperPlotFilename(' ')
*         .setUpperPlotIds(ids)
*         .setUpperPlotLabels(labels)
*         .setUpperMetadata(metadata)
*         .setUpperXLabel(xLabel)
*         .setUpperYLabel(yLabel)
*         .plotData(myPlot.upperPanel);
* To plot in the lower panel just replace 'Upper' to 'Lower' in the 
*     above method calls.
*
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class D3LinePlot extends D3View {
   
  /**
  * @param {!HTMLElement} containerEl - DOM element to append to
  * @param {LineViewOptions=} options - General options for plot panel
  * @param {PlotOptions=} plotOptionsUpper - Upper plot options
  * @param {PlotOptions=} plotOptionsLower - Lower plot options
  */
  constructor(containerEl,
      options = {},
      plotOptionsUpper = {},
      plotOptionsLower = {}){
    
    super(containerEl,
        options,
        plotOptionsUpper,
        plotOptionsLower);
    
    // Update SVG structure for line plots 
    this.updateSvgStructure();
    this.lowerPanel = this.updatePlotPanelObject(this.lowerPanel);
    this.upperPanel = this.updatePlotPanelObject(this.upperPanel);
  }
  
  /**
   * Add grid lines to a plot.
   * 
   * @param {PlotPanel} panel The plot panel to add the grid lines to.
   */
  addGridLines(panel) {
    this.removeGridLines(panel);

    /* X grid lines */
    let xGridLines = this.getXAxisLocation(panel);
    xGridLines.tickFormat('')
        .tickSize(-panel.plotHeight);

    let xGridD3 = d3.select(panel.xGridLinesEl)
        .attr('transform', d3.select(panel.xAxisEl).attr('transform'))
        .call(xGridLines);

    xGridD3.selectAll('*')
        .attr('stroke', panel.options.gridLineColor)
        .attr('stroke-width', panel.options.gridLinewidth);

    xGridD3.selectAll('text')
        .remove();
    
    /* Y grid lines */
    let yGridLines = this.getYAxisLocation(panel);
    yGridLines.tickFormat('')
        .tickSize(-panel.plotWidth);

    let yGridD3 = d3.select(panel.yGridLinesEl)
        .call(yGridLines);

    yGridD3.selectAll('*')
        .attr('stroke', panel.options.gridLineColor)
        .attr('stroke-width', panel.options.gridLinewidth);

    yGridD3.selectAll('text')
        .remove();
  }

  /**
   * Add return period to the data.
   * 
   * @param {PlotPanel} panel The plot panel to add the return period to.
   */
  addReturnPeriod(panel) {
    let xValues = panel.xBounds.domain();
    let yValues = [panel.returnPeriod, panel.returnPeriod];
    panel.data.unshift(d3.zip(xValues, yValues));
    panel.labels.unshift('Return Period');
    panel.ids.unshift('return-period');
  }

  clearData(panel) {
    d3.select(panel.allDataEl)
        .selectAll('.data')
        .remove();

    d3.select(panel.legendEl)
        .selectAll('*')
        .remove();

    d3.select(this.tableEl)
        .selectAll('.' + panel.panelId + '-tables')
        .remove();
  
    d3.select(this.metadataTableEl)
        .selectAll('table')
        .remove();
  }

  /**
  * @method createAxes
  *
  * Create the SVG X and Y axes in either the upper or lower panel
  * @param {Panel} panel - Upper or lower plot panel
  */
  createAxes(panel) {
    let options = panel.options;

    // X Tick Marks     
    let xAxisTranslate = panel.options.xAxisLocation == 'top' ? 
        0 : panel.plotHeight;
    d3.select(panel.xAxisEl)
        .attr('transform', 'translate(0, ' + xAxisTranslate + ')') 
        .style('font-size', options.tickFontSize)
        .select('.x-tick')
        .call(this.getXAxisLocation(panel));
    
    // Y Tick marks
    d3.select(panel.yAxisEl)
        .style('font-size', options.tickFontSize)
        .select('.y-tick')
        .call(this.getYAxisLocation(panel));
    
    // Set tick mark format
    this.setTicks(panel, 'x'); 
    this.setTicks(panel, 'y'); 

    // X Label
    let xAxisHeight = d3.select(panel.xAxisEl)
        .selectAll('.tick')
        .node()
        .getBoundingClientRect()
        .height;
    xAxisHeight = xAxisHeight * panel.plotScale;  
    let xLabelLoc = panel.options.xAxisLocation == 'bottom' ?
        options.marginBottom - (options.marginBottom - xAxisHeight) / 2 :
        - (xAxisHeight + options.marginTop) / 2; 
    
    d3.select(panel.xAxisEl)
        .select('.x-label')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline','middle')
        .style('font-size', options.labelFontSize)
        .style('font-weight', '500')
        .attr('x', panel.plotWidth / 2) 
        .attr('y', xLabelLoc)
        .text(panel.xLabel);
    
    // Y Label
    let yAxisWidth = d3.select(panel.yAxisEl)
        .selectAll('.tick')
        .node()
        .getBoundingClientRect()
        .width;  
    yAxisWidth = yAxisWidth * panel.plotScale;  
     
    d3.select(panel.yAxisEl)
        .select('.y-label')
        .attr('transform', 'rotate(-90)')
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .style('font-size', options.labelFontSize)
        .style('font-weight', '500')
        .attr('x', 0 - panel.plotHeight / 2)
        .attr('y', -1 * (options.marginLeft -
            (options.marginLeft - yAxisWidth) / 2))
        .text(panel.yLabel);
  }
  
  /**
   * Create a SVG draggable legend using the labels.
   * 
   * @param {Panel} panel - Upper or lower plot panel
   */
  createLegend(panel) {
    let options = panel.options;
    let nleg = panel.labels.length-1; 
    let plotHeight = panel.plotHeight; 
    let plotWidth = panel.plotWidth;
    let scale = panel.plotScale;
   
    /* Remove legend entries */
    d3.select(panel.legendEl)
      .selectAll('*')
      .remove();
      
    this.createLegendText(panel);

    // Legend geometry 
    let legendGeom = panel.legendEl.getBoundingClientRect(); 
    let legendWidth = parseFloat(legendGeom.width * scale + 
        2 * options.legendPaddingX);
    let legendHeight = parseFloat(legendGeom.height * scale +
        2 * options.legendPaddingY);
   
    /* Create legend background */
    this.createLegendBackground(panel, legendHeight, legendWidth);
    /* Set the legend location */  
    this.setLegendLocation(panel);
    /* Listen for legend selection */
    this.onLegendSelection(panel);
    
    d3.select(panel.legendEl)
        .select('.drag')
        .call(d3.drag()
            .on('drag', () => { 
              this.onLegendDrag(panel, legendHeight, legendWidth); 
            })
        );
    
    /* Show/hide legend */
    $(this.legendCheckEl).off('click');
    $(this.legendCheckEl).on('click', (event) => {
      this.onLegendCheckClick(panel)
    });  
    
    d3.select(panel.legendEl).raise()
        .select('.legend-entries').raise(); 
  } 

  /**
   * Create a white background for the legend with an outer 
   *    padding around the legend with the 'move' symbol 
   *    so the legend can be dragged around.
   * 
   * @param {PlotPanel} panel The plot panel to add the legend to.
   * @param {Number} legendHeight The current legend height.
   * @param {Number} legendWidth The current legend width.
   */
  createLegendBackground(panel, legendHeight, legendWidth) {
    let options = panel.options;

    // Legend outline
    d3.select(panel.legendEl)
        .append('g')
        .attr('class', 'outlines')
        .append('rect')
        .attr('class', 'outer')
        .attr('height', legendHeight)
        .attr('width', legendWidth)
        .attr('stroke', '#999')
        .attr('fill', 'white');
    
    d3.select(panel.legendEl)
        .select('.outlines')
        .append('rect')
        .attr('class', 'inner')
        .attr('height', legendHeight - 2 * options.legendPaddingY)
        .attr('width', legendWidth - 2 * options.legendPaddingX)
        .attr('x', options.legendPaddingX)
        .attr('y', options.legendPaddingY)
        .attr('fill', 'white');

    d3.select(panel.legendEl)
        .select('.outlines')
        .append('text')
        .attr('class', 'glyphicon drag')
        .attr('alignment-baseline', 'text-before-edge')
        .attr('fill', '#999')
        .style('cursor', 'move')
        .text('\ue068')
  }

  /**
   * Create the legend text from the labels with the matching line color.
   * 
   * @param {PlotPanel} panel The plot panel to add the legend to.
   */
  createLegendText(panel) {
    let options = panel.options;

    let legendD3 = d3.select(panel.legendEl)
        .append('g')
        .attr('class', 'legend-entries')
        .selectAll('g')
        .data(panel.labels)
        .enter()  
        .append('g') 
        .attr('class', 'legend-entry')
        .attr('id', (d,i) => {return panel.ids[i]})
        .style('cursor', 'pointer')
        .style('font-size', options.legendFontSize)
        .attr('transform', 'translate(' + (options.legendPaddingX) + ',' + 
            (options.legendFontSize / 2 + options.legendPaddingY) + ')');
    
    // Legend Text
    legendD3.append('text')
        .attr('class', 'legend-text')
        .attr('x', 30)
        .attr('y', (d,i) => {return options.legendLineBreak * i})
        .attr('alignment-baseline', 'central')
        .text((d,i) => {return panel.labels[i]});
     
    // Legend Line Indicator
    legendD3.append('line')
        .attr('class', 'legend-line')
        .attr('x2', 20)
        .attr('y1', (d,i) => {return options.legendLineBreak * i})
        .attr("y2", (d,i) => {return options.legendLineBreak * i})
        .attr('stroke-width', options.linewidth)
        .attr('stroke', (d,i) => {return panel.color[i]})
        .attr('fill', 'none');  
      
    // Legend Circle on the Line
    legendD3.append('circle') 
        .attr('class', 'legend-circle')
        .attr('cx', 10)
        .attr('cy', (d,i) => {return options.legendLineBreak * i}) 
        .attr('r', options.pointRadius)
        .attr('fill', (d,i) => {return panel.color[i]} );
  }

  /**
  * @method createTooltip
  *
  * Create a tooltip using the Tooltip class on data point mouseover
  * @param {Panel} panel - Upper or lower plot panel
  */
  createTooltip(panel) {
    let tooltip;
    this.setPlotScale(panel);
    let tooltipOptions = {
      fontSize: panel.options.tooltipFontSize,
      offsetX: panel.options.tooltipOffsetX,
      offsetY: panel.options.tooltipOffsetY,
      padding: panel.options.tooltipPadding,
      selectionIncrement: panel.options.selectionIncrement, 
    };
    
    d3.select(panel.allDataEl)
        .selectAll('.dot')
        .on('mouseover', (d, i, els) => {
          let xVal = panel.options.tooltipXToExponent ?
                  d[0].toExponential(4) : d[0];
          let yVal = panel.options.tooltipYToExponent ?
                  d[1].toExponential(4) : d[1];
          let id = els[i].id;
          let cx = d3.select(els[i]).attr('cx');
          let cy = d3.select(els[i]).attr('cy'); 
          let tooltipText = [
            panel.options.tooltipText[0] + ' ' + this.idToLabel(panel, id),
            panel.options.tooltipText[1] + ' ' + xVal,
            panel.options.tooltipText[2] + ' ' + yVal,
          ];
          tooltip = new D3Tooltip.Builder()
              .coordinates(cx, cy)
              .dataEl(els[i])
              .options(tooltipOptions)
              .plotHeight(panel.svgHeight)
              .plotWidth(panel.svgWidth)
              .tooltipText(tooltipText)
              .tooltipEl(panel.tooltipEl)
              .build()
              .changeSizeAttribute('r', true /* To increase */)
        })
        .on('mouseout', () => {
          tooltip.changeSizeAttribute('r', false /* To increase */)
              .destroy();
        });
  }

  /**
  * @method dataEnter
  *
  * Plot the data as lines and circles
  * @param {Panel} panel - Upper or lower plot panel
  */
  dataEnter(panel) {
    let options = panel.options;

    // Remove any data
    d3.select(panel.allDataEl)
        .selectAll('.data')
        .remove();
    
    // Create data groups
    let seriesEnter = d3.select(panel.allDataEl)
        .selectAll('g')
        .data(panel.data)
        .enter()
        .append('g')
        .attr('class', 'data')
        .attr('id', (d, i) => {return panel.ids[i]})
        .style('cursor', 'pointer');
   
    // Plot lines
    seriesEnter.append('path')
        .attr('class', 'line')
        .attr('d', panel.line)
        .attr('id', (d, i) => {return panel.ids[i]})
        .attr('stroke', (d, i) => {return panel.color[i]} )
        .attr('stroke-width', options.linewidth)
        .style('shape-rendering', 'geometricPrecision')
        .attr('fill', 'none');
    // Plot cirles
    seriesEnter.selectAll('circle')
        .data((d,i) => {return d})
        .enter()
        .filter((d,i) => {return d[1] != null})
        .append('circle')
        .attr('class', 'dot')
        .attr('id', (d, i, els) => {
          return d3.select(els[i].parentNode.firstChild).attr('id');
        })
        .attr('cx', panel.line.x())
        .attr('cy', panel.line.y())
        .attr('r', options.pointRadius)
        .attr('fill', (d,i, els) => {
          return d3.select(els[i].parentNode.firstChild).style('stroke');
        });
  }

  /**
  * @method getXAxisLocation
  *
  * Get the d3 X axis location
  * @param {Panel} panel - Upper or lower plot panel
  * @return {Object} - D3 axis object
  */  
  getXAxisLocation(panel){
    return panel.options.xAxisLocation == 'top' ? 
        d3.axisTop(panel.xBounds).ticks(panel.options.xTickMarks) : 
        d3.axisBottom(panel.xBounds).ticks(panel.options.xTickMarks);
  }
  
  /**
  * @method getXExtremes
  *
  * Find the maximum and minimun X values.
  * @param {Array<Array<Number, Number>>} data - Series data
  * @return {Array<Number>} - Pair of X extreme values: 
  *     [X min, X max]
  */
  getXExtremes(data) {
    // Find X max
    let xMax = d3.max(data, (ds,is) => {
      let tmp = d3.max(ds, (dp,ip) => {
        return dp[0] == 'PGA' ? Tools.imtToValue('PGA') : dp[0];
      });
      return tmp;
    });
    
    // Find X min
    let xMin = d3.min(data, (ds,is) => {
      let tmp = d3.min(ds, (dp,ip) => {
        return dp[0] == 'PGA' ? Tools.imtToValue('PGA') : dp[0];
      });
      return tmp;
    });

    if (xMin == xMax && xMin != 0 && xMin != 0) {
      [xMin, xMax] = [xMin / 1.1, xMax * 1.1]; 
    } else if (xMin == xMax && xMin == 0 && xMax == 0) {
      [xMin, xMax] = [-1.0, 1.0] 
    }
    
    xMin = isNaN(xMin) ? 0 : xMin;
    xMax = isNaN(xMax) ? 1 : xMax; 
    
    return [xMin, xMax];   
  }
  
  /**
  * @method getXScale
  *
  * Find which X scale to use log/linear based on options.xAxisScale
  * @param {Panel} panel - Upper or lower panel object
  * @return {Object} - D3 scale object, 
  *     d3.scaleLinear or d3.scaleLog for X axis
  */
  getXScale(panel) {
    let options = this.options.syncXAxis ? this.options : panel.options;
    return options.xAxisScale == 'linear' ? d3.scaleLinear() : d3.scaleLog();
  }
  
  /**
  * @method getYAxisLocation
  *
  * Get the d3 Y axis location
  * @param {Panel} panel - Upper or lower plot panel
  * @return {Object} - D3 axis object
  */
  getYAxisLocation(panel) {
    return panel.options.yAxisLocation == 'right' ? 
        d3.axisRight(panel.yBounds).ticks(panel.options.yTickMarks) : 
        d3.axisLeft(panel.yBounds).ticks(panel.options.yTickMarks);
  }

  /**
  * @method getYExtremes
  *
  * Find the maximum and minimum Y values.
  * @param {Array<Array<Number, Number>>} data - Series data.
  * @return {Array<Number>} - Pair of Y extreme values: 
  *     [Y min,Y max]
  */
  getYExtremes(data) {
    // Find Y max
    let yMax = d3.max(data, (ds,is) => {
      let tmp = d3.max(ds, (dp,ip) => {
        return dp[1];
      });
      return tmp;
    });
    
    // Find Y min
    let yMin = d3.min(data, (ds,is) => {
      let tmp = d3.min(ds, (dp,ip) => {
        return dp[1];
      });
      return tmp;
    });
   
    yMin = isNaN(yMin) ? 0 : yMin;
    yMax = isNaN(yMax) ? 1 : yMax; 
     
    return yMin == yMax ? [yMin / 1.1, yMax * 1.1] : [yMin, yMax];
  }
  
  /**
  * @method getYScale
  *
  * Find which Y scale to use log/linear based on options.yAxisScale
  * @param {Panel} panel - Upper or lower panel object
  * @return {Object} D3 scale object 
  *     d3.scaleLinear or d3.scaleLog for Y axis
  */
  getYScale(panel) {
    let options = this.options.syncYAxis ? this.options : panel.options;
    return options.yAxisScale == 'linear' ? d3.scaleLinear() : d3.scaleLog();
  }

  /**
  * @method legendLocation
  *
  * Calculate the translation needed for the legend
  * @param {Panel} panel - Upper or lower panel object
  * @return {String} - string of translation: 'translate(X, Y)'
  */
  legendLocation(panel) {
    let plotHeight = panel.plotHeight;
    let plotWidth = panel.plotWidth;
    let scale = panel.plotScale;
    let legendGeom = panel.legendEl.getBoundingClientRect();
    let legendWidth  = legendGeom.width * scale;
    let legendHeight = legendGeom.height * scale;
    
    let xTranslate;
    let yTranslate;
    let options = panel.options;
    let loc = options.legendLocation.toLowerCase();
    if (loc == 'topright') {
      xTranslate = (plotWidth - legendWidth - options.legendOffset);
      yTranslate = options.legendOffset;
    } else if (loc == 'topleft') {
      xTranslate = options.legendOffset;
      yTranslate = options.legendOffset;
    } else if (loc == 'bottomleft') {
      xTranslate = options.legendOffset;
      yTranslate = (plotHeight - legendHeight - options.legendOffset);
    } else if (loc == 'bottomright') {
      xTranslate = (plotWidth - legendWidth - options.legendOffset);
      yTranslate = (plotHeight - legendHeight - options.legendOffset);
    }
  
    return 'translate(' + xTranslate + ',' + yTranslate + ')';
  } 

  /**
   * When the gridline glyphicon is clicked update the 
   *    checked state and add or remove the gridlines.
   * 
   * @param {Event} event The event that triggered it.
   */
  onGridLineCheckClick(event) {
    this.gridLinesCheckEl.checked = !this.gridLinesCheckEl.checked;
    let isChecked = this.gridLinesCheckEl.checked;

    d3.select(this.gridLinesCheckEl)
        .style('color', isChecked ? 'black' : '#bfbfbf');

    if (isChecked) {
      this.addGridLines(this.upperPanel);
      if (this.options.plotLowerPanel) this.addGridLines(this.lowerPanel);
    } else {
      this.removeGridLines(this.upperPanel);
      if (this.options.plotLowerPanel) this.removeGridLines(this.lowerPanel);
    }
  }

  /**
   * Show/hide the legend when legend glyhpicon is clicked. 
   * 
   * @param {PlotPanel} panel The plot panel where the legend is. 
   */
  onLegendCheckClick(panel) {
    this.legendCheckEl.checked = !this.legendCheckEl.checked; 
    let isChecked = this.legendCheckEl.checked;

    d3.select(this.legendCheckEl)
        .style('color', isChecked ? 'black' : '#bfbfbf');

    let visiblity = isChecked ? 'initial' : 'hidden';
    d3.select(panel.legendEl).style('visibility', visiblity);
    this.setLegendLocation(panel);
  }

  /**
  * @method onLegendDrag
  *
  * Update legend location on drag
  * @param {Panel} panel - Upper or lower panel object
  * @param {Number} legendHeight - Current legend height
  * @param {Number} legendWidth - Current legend width
  */
  onLegendDrag(panel, legendHeight, legendWidth) {
    let plotHeight = panel.plotHeight; 
    let plotWidth = panel.plotWidth;
    let options = panel.options;
    let xDrag = d3.event.x;
    xDrag = xDrag < options.legendOffset ? options.legendOffset : 
        xDrag > plotWidth - legendWidth - options.legendOffset ?
        plotWidth - legendWidth - options.legendOffset : xDrag; 
    let yDrag = d3.event.y;
    yDrag = yDrag < options.legendOffset ? options.legendOffset : 
        yDrag > plotHeight - legendHeight - options.legendOffset ? 
        plotHeight - legendHeight - options.legendOffset : yDrag; 
    
    d3.select(panel.legendEl)
        .select('.outlines')
        .selectAll('*')
        .attr('transform', 'translate(' + xDrag + ',' + yDrag + ')');
    
    d3.select(panel.legendEl)
        .select('.legend-entries')
        .attr('transform', 'translate(' + xDrag + ',' + yDrag + ')');
  }

  /**
  * @method onLegendSelection
  *
  * Listen for a legend entry to be clicked and call plotSelection
  * @param {Panel} panel - Upper or lower panel object
  */
  onLegendSelection(panel) {
    if (this.options.syncSelections){ 
      return;
    }
   
    d3.select(panel.legendEl)
        .selectAll('.legend-entry')
        .on('click', (d, i, els) => {
          this.plotSelection(panel, els[i].id); 
        });
  }

  /**
  * @method onReturnPeriodDrag
  */ 
  onReturnPeriodDrag(panel) {
    let dy = d3.event.dy;
    let yDrag = d3.event.y;
    let returnPeriod = panel.yBounds.invert(yDrag);
    let yBounds = panel.yBounds.domain();
    
    let yMax = 1 / this.timeHorizonUsage.values.minimum; 
    let yMin = 1 / this.timeHorizonUsage.values.maximum;
    yMax = yBounds[1] < yMax ? yBounds[1] : yMax;
    
    returnPeriod = returnPeriod <= yMin ? yMin : 
        returnPeriod >= yMax ? yMax : returnPeriod;

    returnPeriod = dy > 0 ? 1 / Math.ceil(1 / returnPeriod) : 
        dy < 0 ? 1 / Math.floor(1 / returnPeriod) : 
        1 / Math.ceil(1 / returnPeriod) ; 
    
    panel.timeHorizon = 1 / returnPeriod;
    this.plotReturnPeriod(panel, 0 /* Duration */); 
    let el = d3.select(panel.plotEl).select('.return-period').node();
    $(el).trigger('change');
  }
  
  /**
  * @method onPlotSelection
  *
  * Listen for a data point to be clicked and call plotSelection
  * @param {Panel} panel - Upper or lower panel object
  */
  onPlotSelection(panel) {
    if (this.options.syncSelections){ 
      return;
    }
   
    d3.select(panel.allDataEl)
        .selectAll('.data')
        .selectAll('path')
        .on('click', (d, i, els) => {
          this.plotSelection(panel, els[i].id); 
        });
  }
  
  /**
  * @method onXAxisRescale
  *
  * Switch between log and linear on X axis
  */
  onXAxisRescale() {
    if (this.options.disableXAxisBtns){
      return;
    }
   
    $(this.plotFooterEl).find('.x-axis-btns').on('click', (event) => {
      let options = this.options.syncXAxis ? this.options :
          this.upperPanel.options;
      
      options.xAxisScale = $(event.target).find('input').val();
      
      if (this.options.plotLowerPanel && this.options.syncXAxis)
        this.plotRedraw(this.lowerPanel);
      
      this.plotRedraw(this.upperPanel);
    });
  }
  
  /**
  * @method onYAxisRescale
  *
  * Switch between log and linear on Y axis
  */
  onYAxisRescale() {
    if (this.options.disableYAxisBtns){
      return;
    }
   
    $(this.plotFooterEl).find('.y-axis-btns').on('click', (event) => {
      let options = this.options.syncYAxis ? this.options :
          this.upperPanel.options;
      
      options.yAxisScale = $(event.target).find('input').val();
      
      if (this.options.plotLowerPanel && this.options.syncYAxis)
        this.plotRedraw(this.lowerPanel);
      
      this.plotRedraw(this.upperPanel);
    });
  }
  
  /**
  * @method plotData
  *
  * Plot the data in either the upper or lower panel
  * @param {Panel} panel - Upper or lower panel object
  * @param {Array<Number, Number>=} xDomain - Optional X domain
  * @param {Array<Number, Number>=} yDomain - Optional Y domain
  */
  plotData(panel, xDomain, yDomain){
    let options = panel.options;
    this.setPlotScale(panel);
     
    d3.select(this.el)
        .classed('hidden', false);
         
    d3.select(this.tableEl)
        .classed('hidden', true);
    
    d3.select(this.metadataTableEl)
        .classed('hidden', true);
    
    d3.select(panel.plotBodyEl)
        .classed('hidden', false);

    d3.select(this.plotFooterEl)
        .select('.plot-data-btns')
        .selectAll('label')
        .classed('active', false)
        .classed('focus', false);

    d3.select(this.plotFooterEl)
        .select('.plot-btn')
        .classed('active', true);

    // Get color scheme
    let ndata = panel.data.length;           
    panel.color = ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    
    this.onXAxisRescale();
    this.onYAxisRescale();
    this.createDataTable(panel);
    
    panel.line = d3.line()                            
      .defined((d,i) => { return d[1] != null })  
      .x((d, i) => {
        if (d[0] == 'PGA') {
          return panel.xBounds(Tools.imtToValue('PGA'));
        } else {
          return panel.xBounds(d[0])
        }
      })      
      .y((d, i) => { return panel.yBounds(d[1]) }); 

    panel.xBounds = this.getXScale(panel);
    panel.xExtremes = xDomain || this.getXExtremes(panel.data);
    panel.xBounds.range([0, panel.plotWidth])
        .domain(panel.xExtremes);
    if (options.xAxisNice) {
      panel.xBounds.nice();
    }
   
    panel.yBounds = this.getYScale(panel);
    panel.yExtremes = yDomain || this.getYExtremes(panel.data);
    panel.yBounds.range([panel.plotHeight, 0])
        .domain(panel.yExtremes);
    if (options.yAxisNice){
      panel.yBounds.nice();
    }

    // Plot data
    this.dataEnter(panel);
    this.setPlotScale(panel);
    // Create X/Y axis
    this.createAxes(panel);
    // Create tooltips
    this.createTooltip(panel); 
    // Create legend 
    if (options.showLegend) this.createLegend(panel);
    // Plot Selections
    this.onPlotSelection(panel); 
    
    if (panel.options.plotReturnPeriod) {
      this.plotReturnPeriod(panel, options.transitionDuration);
    }

    if (panel.options.plotZeroReferenceLine && 
        panel.options.yAxisScale == 'linear') {
      this.plotZeroReferenceLine(panel);
    }

    if (this.gridLinesCheckEl.checked) {
      this.addGridLines(panel);
    }
    
    $(this.gridLinesCheckEl).off('click');
    $(this.gridLinesCheckEl).on('click', (event) => { 
      this.onGridLineCheckClick(event);
    });
  }

  /**
  * @method plotReturnPeriod
  *
  */
  plotReturnPeriod(panel, duration) {
    let returnPeriod = 1 / panel.timeHorizon;
    let xValues = panel.xBounds.domain();
    let yValues = [returnPeriod, returnPeriod]; 

    let data = [];
    data.push(d3.zip(xValues, yValues));
    
    let transition = d3.transition()
        .duration(duration);
         
    let seriesEnter = d3.select(panel.plotEl)
        .select('.return-period')
        .selectAll('path')
        .data(data)

    seriesEnter.exit()
        .transition(transition)
        .remove();

    seriesEnter.transition(transition)
        .attr('d', panel.line)

    seriesEnter.enter()
        .append('path')
        .transition(transition)
        .attr('d', panel.line)
        .attr('stroke', '#455A64')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')
        .style('cursor', 'row-resize');
        
    d3.select(panel.plotEl)
        .select('.return-period')
        .selectAll('path')
        .call(d3.drag()
        .on('drag', () => { 
          this.onReturnPeriodDrag(panel); 
        })
        .on('end', () => {
          this.onReturnPeriodDrag(panel); 
        }));
  }

  /**
  * @method plotRedraw
  *
  * Update the plot data points and axes, used generally when X/Y scale is
  *     changed between log/linear.
  * @param {Panel} panel - Upper or lower panel object
  */
  plotRedraw(panel){
    let options = panel.options;
    let svgD3 = d3.select(panel.svgEl);
   
    // Update X bounds
    panel.xBounds = this.getXScale(panel);
    panel.xBounds
        .range([0, panel.plotWidth])
        .domain(panel.xExtremes);
    if (options.xAxisNice){
      panel.xBounds.nice();
    }

    // Update Y bounds
    panel.yBounds = this.getYScale(panel);
    panel.yBounds
        .range([panel.plotHeight, 0])
        .domain(panel.yExtremes);
    if (options.yAxisNice){
      panel.yBounds.nice();
    }
    
    // Update X axis
    panel.xAxis = this.getXAxisLocation(panel);
    svgD3.select('.x-tick')  
        .call(panel.xAxis);
     
    // Update Y axis
    svgD3.select('.y-tick')                                   
        .call(this.getYAxisLocation(panel));
    
    // Update lines 
    svgD3.selectAll('.line')
        .transition()
        .duration(options.transitionDuration)
        .attr('d', panel.line);
    
    // Update circles 
    svgD3.selectAll('.dot')
        .transition()
        .duration(options.transitionDuration)
        .attr('cx', panel.line.x())
        .attr('cy', panel.line.y());
    
    // Set tick mark format
    this.setTicks(panel, 'x'); 
    this.setTicks(panel, 'y'); 
  
    if (options.plotReturnPeriod) {
      this.plotReturnPeriod(panel, options.transitionDuration);
      let el = d3.select(panel.plotEl).select('.return-period').node();
      $(el).trigger('axisChange');
    }
    
    if (panel.options.plotZeroReferenceLine && 
        panel.options.yAxisScale == 'linear') {
      this.plotZeroReferenceLine(panel);
    }
    
    if (this.gridLinesCheckEl.checked) {
      this.addGridLines(panel);
    }
  }


  /**
  * @method plotSelection
  *
  * Increases the linewidth and circle radius 
  * of a selected line or legend element based 
  * on options.linewidthSelection and options.pointRadiusSelection
  * If legend exists, will also increase line and circle
  * If the line is already selected it will be reset 
  * to normal linewidth and circle radius based on 
  * options.linewidth and options.pointRadius
  * @param {Panel} panel - Upper or lower panel object
  * @param {String} selectedId - ID of element to highlight
  *
  */
  plotSelection(panel, selectedId){
    let selectedD3 = d3.select(panel.allDataEl)
        .select('#' + selectedId); 
    let linewidthCheck = parseFloat(selectedD3.select('.line')
        .attr('stroke-width'));
    
    this.plotSelectionReset(panel);
    let increment = panel.options.selectionIncrement;
    let linewidthSelected = panel.options.linewidth + increment;
    let pointRadiusSelected = panel.options.pointRadius + increment;

    if (linewidthCheck == linewidthSelected){
      return;
    }
    
    selectedD3.select('.line') 
        .attr('stroke-width', linewidthSelected);
    selectedD3.selectAll('.dot')                 
        .attr('r', pointRadiusSelected);
    selectedD3.raise();                          
        
    let legendExists = !d3.select(panel.legendEl)
        .select('.legend-entry')
        .empty();
    
    if (legendExists){
      let legendD3 = d3.select(panel.legendEl)
          .select('#' + selectedId);                   
      legendD3.select('.legend-line')                    
          .attr('stroke-width',linewidthSelected) 
      legendD3.select('.legend-circle')                  
          .attr('r', pointRadiusSelected) 
      legendD3.select('.legend-text')                    
          .style('font-weight', 'bold');               
    }
  }
  
  /**
  * @method plotSelectionReset
  *
  * Resets all the lines and circles in the plot
  * to original linewidth and radius based on 
  * options.linewidth and options.pointRadius.
  * If the legend exsists, will reset the linewidth and 
  * circle radius as well.
  * @param {Panel} panel - Upper or lower panel object
  */
  plotSelectionReset(panel){
    let svgD3 = d3.select(panel.svgEl);
    
    svgD3.selectAll('.line')
        .attr('stroke-width', panel.options.linewidth); 
    svgD3.selectAll('.dot')
        .attr('r', panel.options.pointRadius);       

    if (panel.options.showLegend){
      let legendD3 = svgD3.select('.legend')
          .selectAll('.legend-entry');
      legendD3.select('.legend-text') 
          .style('font-weight', 'initial');
      legendD3.select('.legend-line')     
          .attr('stroke-width', panel.options.linewidth);
      legendD3.select(".legend-circle")   
          .attr('r', panel.options.pointRadius);   
    }
  }

  /**
  * @method plotZerReferenceLine
  *
  * Plot a line at y=0.
  */
  plotZeroReferenceLine(panel) {
    let xValues = panel.xBounds.domain();
    let yValues = [0, 0];
    let data = [];
    data.push(d3.zip(xValues, yValues));
    d3.select(panel.plotEl)
        .selectAll('.reference-line')
        .remove();

    d3.select(panel.plotEl)
        .append('g')
        .attr('class', 'reference-line')
        .lower()
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', panel.line)
        .attr('stroke', panel.options.referenceLineStroke)
        .attr('stroke-width', panel.options.referenceLineStrokeWidth)
        .attr('fill', 'none');
  }
  
  /**
   * Remove grid lines from a plot.
   * 
   * @param {PlotPanel} panel The plot panel to remove the grid lines. 
   */
  removeGridLines(panel) {
    d3.select(panel.xGridLinesEl)
        .selectAll('*')
        .remove();
    
    d3.select(panel.yGridLinesEl)
        .selectAll('*')
        .remove();
  }

  /**
  * @method removeSmallValues
  *
  * Set values of the data under a specifed limit 
  * to null so they will not be graphed.
  * @param {Panel} panel - Upper or lower panel object
  * @param {Number} limit - Remove values from: <= limit
  */
  removeSmallValues(panel, limit){
    panel.data.forEach((d, id) => {        
      d.forEach((dp, idp) => {                
        if (dp[1] <= limit){                         
          dp[1] = null;
          dp[0] = null;
        }
      })
    });
    
    return this;
  }
 
  saveFigure(panel, saveOptions, plotFormat) {
    let svgCloneD3 = d3.select(panel.svgEl.cloneNode(true));
    /* Remove legend drag symbol if there */
    svgCloneD3.select('.drag').remove();
    
    D3SaveFigure.builder()
        .centerSvgOnEl(panel.xAxisEl)
        .centerTitleOnEl(panel.xAxisEl)
        .currentSvgHeight(panel.svgHeight)
        .currentSvgWidth(panel.svgWidth)
        .filename(panel.plotFilename)
        .options(saveOptions)
        .metadata(this.metadata) 
        .plotFormat(plotFormat)
        .plotTitle(this.plotTitleEl.textContent)
        .svgEl(svgCloneD3.node())
        .build();
  }

  /**
   * Set the legend location based on the options.legendLocation.
   *  
   * @param {PlotPanel} panel The plot panel where the legend is.
   */
  setLegendLocation(panel) {
    /* Get legend location translation */
    let translate = this.legendLocation(panel);
    
    /* Transform legend entries */
    d3.select(panel.legendEl)
        .select('.legend-entries')
        .attr('transform', translate); 
    
    /* Transform legend outline */
    d3.select(panel.legendEl)
        .select('.outlines')
        .selectAll('*')
        .attr('transform', translate); 
  }

  /**
  * @method setTicks
  *
  * Set the log tick marks to be shown only powers of ten
  * @param {Panel} panel - Upper or lower plot panel
  * @param {String} axis - String to identify which axis to update.
  *     Either: 'x' or 'y'
  */ 
  setTicks(panel, axis) {
    let options = this.options['sync' + axis.toUpperCase() + 'Axis'] 
        ? this.options : panel.options;
         
    if (options[axis + 'AxisScale'] == 'log'){
      d3.select(panel.svgEl)
          .select('.' + axis + '-axis')
          .select('.' + axis + '-tick')
          .selectAll('.tick text')
          .text(null)
          .filter((d) => {return Number.isInteger(Math.log10(d))} )
          .text(10)
          .append('tspan')
          .text((d) => { return Math.round(Math.log10(d)); })
          .style('baseline-shift', 'super')
          .attr('font-size', panel.options.tickExponentFontSize);
    }
  }

  /**
  * @method syncSelections
  *
  * Allow the upper and lower plot data point selections to be synced.
  * This requires that the data in the upper and lower plot have the same ID
  */
  syncSelections() {
    $(this.plotBodyEl).find('.data').on('click', (event) => {
      this.plotSelection(this.upperPanel, event.target.id);
      this.plotSelection(this.lowerPanel, event.target.id);
    });
    
    $(this.plotBodyEl).find('.legend-entry').on('click', (event) => {
      this.plotSelection(this.upperPanel, event.target.parentNode.id);
      this.plotSelection(this.lowerPanel, event.target.parentNode.id);
    });
  }

  /**
  * @method updateLinePlotButtons
  *
  * Update which X/Y button is active, either linear or log
  */
  updateLinePlotButtons() {
    // Update X scale
    let optionsX = this.options.syncXAxis ? this.options :
        this.upperPanel.options;
    
    d3.select(this.plotFooterEl)
        .select('.x-axis-btns')
        .selectAll('input').each((d, i, els) => {
          let input = d3.select(els[i]);
          let btn = d3.select(els[i].parentNode);
          let isActive = input.attr('value') == optionsX.xAxisScale;
          btn.classed('active', isActive);
          if (this.options.disableXAxisBtns) {
            btn.attr('disabled', '');
          }
      });
    
    // Update Y scale
    let optionsY = this.options.syncYAxis ? this.options :
        this.upperPanel.options;
    
    d3.select(this.plotFooterEl)
        .select('.y-axis-btns')
        .selectAll('input').each((d, i, els) => {
          let input = d3.select(els[i]);
          let btn = d3.select(els[i].parentNode);
          let isActive = input.attr('value') == optionsY.yAxisScale;
          btn.classed('active', isActive);
          if (this.options.disableYAxisBtns) {
            btn.attr('disabled', '');
          }
      });
  }

  /**
  * @method updatePlotPanelObject
  */
  updatePlotPanelObject(panelObject) {
    let panelEl = panelObject.plotBodyEl;
    let panelUpdate = {
      allDataEl: panelEl.querySelector('.all-data'),
      color: d3.schemeCategory10,
      legendEl: panelEl.querySelector('.legend'),
      line: undefined,
      plotBodyEl: panelEl,
      plotScale: 1,
      xAxisEl: panelEl.querySelector('.x-axis'),
      xBounds: undefined,
      xExtremes: undefined,
      xGridLinesEl: panelEl.querySelector('.x-grid-lines'),
      xLabel: 'X',
      yAxisEl: panelEl.querySelector('.y-axis'),
      yBounds: undefined,
      yExtremes: undefined,
      yGridLinesEl: panelEl.querySelector('.y-grid-lines'),
      yLabel: 'Y',
    };
    
    return $.extend({}, panelObject, panelUpdate); 
  }

  /**
  * @method updateSvgStructure
  */
  updateSvgStructure() {
    let svgD3 = d3.select(this.el)
        .select('.panel-outer')
        .selectAll('svg')
        .attr('class', 'D3LinePlot')
        .selectAll('.plot');

    let gridLinesD3 = svgD3.append('g')
        .attr('class', 'grid-lines');
    
    /* X grid lines */
    gridLinesD3.append('g')
        .attr('class', 'x-grid-lines');

    /* Y grid lines */
    gridLinesD3.append('g')
        .attr('class', 'y-grid-lines');
              
    svgD3.append('g')
        .attr('class', 'all-data');
    
    // X-axis
    let xD3 = svgD3.append('g')
        .attr('class','x-axis');
    xD3.append('g')
        .attr('class','x-tick')
        .append('text')
        .attr('class', 'x-label')
        .attr('fill', 'black');
    
    // Y-axis
    let yD3 = svgD3.append('g')
        .attr('class', 'y-axis');
    yD3.append('g')
        .attr('class', 'y-tick')
        .append('text')
        .attr('class', 'y-label')
        .attr('fill', 'black');
    
    svgD3.append('g')
        .attr('class', 'legend');
  
    /* Return period */
    if (this.upperPanel.options.plotReturnPeriod) {
      d3.select(this.el)
          .select('.panel-upper')
          .select('.plot')
          .append('g')
          .attr('class', 'return-period');
    }
  }

  /**                                                                           
  * @override 
  * @method withPlotFooter
  *
  * Creates the footer in the plot panel a plot/data button.
  *     This method is chainable.
  * @return {D3LinePlot} - Return the class instance to be chainable
  */
  withPlotFooter() {
    let buttons = [
      {
        class: 'x-axis-btns',
        col: 'col-xs-3',
        btns: [
          {
            name: 'x-axis-x',
            value: 'linear',
            text: 'X: Linear',
            class: 'x-linear-btn',
          }, {
            name: 'x-axis-y',
            value: 'log',
            text: 'X: Log',
            class: 'x-log-btn',
          }
        ]
      },{
        class: 'plot-data-btns',
        col: 'col-xs-6',
        btns: [
          {
            name: 'plot',
            value: 'plot',
            text: 'Plot',
            class: 'plot-btn',
          }, {
            name: 'data',
            value: 'data',
            text: 'Data',
            class: 'data-btn',
          }, {
            name: 'metadata',
            value: 'metadata',
            text: 'Metadata',
            class: 'metadata-btn',
          }
        ]
      }, {
        class: 'y-axis-btns',
        col: 'col-xs-3',
        btns: [
          {
            name: 'y-axis-x',
            value: 'linear',
            text: 'Y: Linear',
            class: 'y-linear-btn',
          }, {
            name: 'y-axis-y',
            value: 'log',
            text: 'Y: Log',
            class: 'y-log-btn',
          }
        ]
      }
    ];
    this.createPanelFooter(buttons);
    // Update buttons
    this.updateLinePlotButtons();
    this.onPlotDataViewSwitch();
    
    return this;                                                                
  }

}
