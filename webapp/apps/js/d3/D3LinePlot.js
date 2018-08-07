
import D3LineView from './view/D3LineView.js';
import D3LineSubView from './view/D3LineSubView.js';
import D3LineData from './data/D3LineData.js';
import D3LineSeriesData from './data/D3LineSeriesData.js';
import D3LineAxes from './axes/D3LineAxes.js';
import Preconditions from '../error/Preconditions.js';

/**
 * @fileoverview Plot D3LineData
 * 
 * @class D3LinePlot
 * @author Brandon Clayton
 */
export default class D3LinePlot {

  /**
   * New D3LinePlot instance.
   * 
   * @param {D3LineView} view The line view 
   */
  constructor(view) {
    Preconditions.checkArgumentInstanceOf(view, D3LineView);

    /** @type {D3LineView} */
    this.view = view;
    /** @type {D3LineAxes} */
    this.axes = new D3LineAxes(this.view);
    
    /** @type {D3LineData} */
    this.upperLineData = undefined;
    this._setLineData(this._getDefaultUpperLineData());
    
    /** @type {D3LineData} */
    this.lowerLineData = undefined;
    this._setLineData(this._getDefaultLowerLineData());

    this._addDefaultAxes();
    this._addEventListeners();
  }

  /**
   * Clear all plots off a D3LineSubView.
   * 
   * @param {D3LineSubView} subView The sub view to clear the plots
   */
  clear(subView) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);

    d3.select(subView.svg.dataContainerEl)
        .selectAll('*')
        .remove();
  }

  /**
   * Creates a 2-D line plot from D3LineData.
   *  
   * @param {D3LineData} lineData The line data to plot
   */
  plot(lineData) {
    this._dataEnter(lineData);

    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    this.axes.createXAxis(lineData, xScale);
    this.axes.createYAxis(lineData, yScale);
  }

  /**
   * Add the default X and Y axes.
   * 
   * Based on D3LineSubViewOptions.defaultXLimit and 
   *    D3LineSubViewOptions.defaultYLimit.
   */
  _addDefaultAxes() {
    this.axes.createXAxis(
        this.upperLineData,
        this.view.getXAxisScale(this.view.upperSubView));
    
    this.axes.createYAxis(
        this.upperLineData,
        this.view.getYAxisScale(this.view.upperSubView));

    if (this.view.addLowerSubView) {
      this.axes.createXAxis(
          this.lowerLineData,
          this.view.getXAxisScale(this.view.lowerSubView));
      
      this.axes.createYAxis(
          this.lowerLineData,
          this.view.getYAxisScale(this.view.lowerSubView));
      }
  }

  /**
   * Add all event listeners
   */
  _addEventListeners() {
    this.view.viewFooter.xAxisBtnEl
        .addEventListener('click', () => { this._onXAxisClick(event); });
    
    this.view.viewFooter.yAxisBtnEl
        .addEventListener('click', () => { this._onYAxisClick(event); });

    this.view.viewHeader.gridLinesCheckEl
        .addEventListener('click', () => { this._onGridLineIconClick(); });
  }

  /**
   * Enter all data from D3LineData.series and any existing data
   *    into new SVG elements.
   * 
   * @param {D3LineData} lineData The data
   */
  _dataEnter(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    /** @type {Array<D3LineData>} */
    let currentLineData = d3.select(lineData.subView.svg.dataContainerEl)
        .datum();

    let data = currentLineData || [];
    data.push(lineData);
    let updatedLineData = D3LineData.of(...data);

    let seriesEnter = d3.select(lineData.subView.svg.dataContainerEl)
        .datum([ updatedLineData ])    
        .selectAll('g')
        .data(updatedLineData.series);

    seriesEnter.exit().remove();

    let seriesDataEnter = seriesEnter.enter()
        .append('g')
        .attr('class', 'data-enter')
        .attr('id', (/** @type {D3LineSeriesData} */ series) => {
          return series.lineOptions.id;
        })
        .style('cursor', 'pointer');

    /* Update upperLineData or lowerLineData */
    this._setLineData(updatedLineData);

    this._plotLine(updatedLineData, seriesDataEnter);
    this._plotSymbol(updatedLineData, seriesDataEnter);
  }

  /**
   * Returns a default D3LineData for the lower sub view to 
   *    show a empty plot on startup.
   * 
   * @returns {D3LineData} The default line data for lower view
   */
  _getDefaultLowerLineData() {
    let lowerXLimit = this.view.lowerSubView.options.defaultXLimit;
    let lowerYLimit = this.view.lowerSubView.options.defaultYLimit;

    let lowerLineData = D3LineData.builder()
        .xLimit(lowerXLimit)
        .yLimit(lowerYLimit)
        .subView(this.view.lowerSubView)
        .build();

    return lowerLineData;
  }

  /**
   * Returns a default D3LineData for the upper sub view to 
   *    show a empty plot on startup.
   * 
   * @returns {D3LineData} The default line data for upper view
   */
  _getDefaultUpperLineData() {
    let upperXLimit = this.view.upperSubView.options.defaultXLimit;
    let upperYLimit = this.view.upperSubView.options.defaultYLimit;

    let upperLineData = D3LineData.builder()
        .xLimit(upperXLimit)
        .yLimit(upperYLimit)
        .subView(this.view.upperSubView)
        .build();

    return upperLineData;
  }

  /**
   * Get the current X scale of a D3LineSubView, either: 'log' || 'linear'
   * 
   * @param {D3LineSubView} subView The sub view to get X scale
   * @returns {String} The X scale: 'log' || 'linear'
   */
  _getCurrentXScale(subView) {
    if (this.view.viewOptions.syncXAxisScale) {
      return this.view.viewFooter.xLinearBtnEl.classList.contains('active') ?
          this.view.viewFooter.xLinearBtnEl.getAttribute('value') :
          this.view.viewFooter.xLogBtnEl.getAttribute('value');
    } else {
      return subView.options.xAxisScale;
    }
  }

  /**
   * Get the current Y scale of a D3LineSubView, either: 'log' || 'linear'
   * 
   * @param {D3LineSubView} subView The sub view to get Y scale
   * @returns {String} The Y scale: 'log' || 'linear'
   */
  _getCurrentYScale(subView) {
    if (this.view.viewOptions.syncYAxisScale) {
      return this.view.viewFooter.yLinearBtnEl.classList.contains('active') ?
          this.view.viewFooter.yLinearBtnEl.getAttribute('value') :
          this.view.viewFooter.yLogBtnEl.getAttribute('value');
    } else {
      return subView.options.yAxisScale;
    }
  }

  /**
   * Handler to add the grid lines when the grid lines icon is checked.
   */
  _onAddGridLines() {
    this.view.viewHeader.gridLinesCheckEl.setAttribute('checked', 'true');

    this.axes.createXGridLines(
        this.upperLineData,
        this._getCurrentXScale(this.view.upperSubView));
    
    this.axes.createYGridLines(
        this.upperLineData,
        this._getCurrentYScale(this.view.upperSubView));

    if (this.view.addLowerSubView) {
      this.axes.createXGridLines(
          this.lowerLineData,
          this._getCurrentXScale(this.view.lowerSubView));
      
      this.axes.createYGridLines(
          this.lowerLineData,
          this._getCurrentYScale(this.view.lowerSubView));
    }
  }

  /**
   * Event handler to add or remove the grid lines when the grid lines
   *    icon is clicked.
   */
  _onGridLineIconClick() {
    let isChecked = this.view.viewHeader.gridLinesCheckEl.getAttribute('checked');

    d3.select(this.view.viewHeader.gridLinesCheckEl)
        .style('color', !isChecked ? 'black' : '#bfbfbf');

    if (isChecked) {
      this._onRemoveGridLines();
    } else {
      this._onAddGridLines();
    }
  }

  /**
   * Handler to remove the grid lines when the grid lines icon is 
   *    not checked
   */
  _onRemoveGridLines() {
    this.view.viewHeader.gridLinesCheckEl.removeAttribute('checked');

    this.axes.removeXGridLines(this.view.upperSubView);
    this.axes.removeYGridLines(this.view.upperSubView);
    
    if (this.view.addLowerSubView) {
      this.axes.removeXGridLines(this.view.lowerSubView);
      this.axes.removeYGridLines(this.view.lowerSubView);
    }
  }

  /**
   * Update the plot when the X axis buttons are clicked.
   *  
   * @param {Event} event The click event
   */
  _onXAxisClick(event) {
    let xScale = event.target.getAttribute('value');
    let yScale = this._getCurrentYScale(this.view.upperSubView);

    this.axes.createXAxis(this.upperLineData, xScale);
    this._plotUpdate(this.upperLineData, xScale, yScale);

    if (this.view.addLowerSubView && this.view.viewOptions.syncXAxisScale) {
      this.axes.createXAxis(this.lowerLineData, xScale);
      this._plotUpdate(this.lowerLineData, xScale, yScale);
    }
  }

  /**
   * Update the plot when the Y axus buttons are clicked.
   *  
   * @param {Event} event The click event 
   */
  _onYAxisClick(event) {
    let xScale = this._getCurrentXScale(this.view.upperSubView);
    let yScale = event.target.getAttribute('value');
    
    this.axes.createYAxis(this.upperLineData, yScale);
    this._plotUpdate(this.upperLineData, xScale, yScale);
    
    if (this.view.addLowerSubView && this.view.viewOptions.syncYAxisScale) {
      this.axes.createYAxis(this.lowerLineData, yScale);
      this._plotUpdate(this.lowerLineData, xScale, yScale);
    }
  }

  /**
   * Plot the lines.
   *  
   * @param {D3LineData} lineData The line data  
   * @param {Object} seriesEnter The D3 series enter selection object
   */
  _plotLine(lineData, seriesEnter) {
    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    let line = this.axes.line(lineData, xScale, yScale);

    seriesEnter.append('path')
        .attr('class', 'data-line')
        .attr('d', (/** @type {D3LineSeriesData */ series) => { 
          return line(series.data);
        })
        .attr('id', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.id; 
        })
        .attr('stroke-dasharray', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.svgDashArray; 
        })
        .attr('stroke', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.color; 
        })
        .attr('stroke-width', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.lineWidth; 
        })
        .style('shape-rendering', 'geometricPrecision')
        .attr('fill', 'none');
  }

  /**
   * 
   * @param {D3LineData} lineData 
   * @param {Object} seriesEnter 
   */
  _plotSymbol(lineData, seriesEnter) {
    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    
    seriesEnter.selectAll('.data-symbol')
        .data((/** @type {D3LineSeriesData} */ series) =>  { 
          return lineData.toMarkerSeries(series); 
        })
        .enter()
        .append('path')
        .attr('class', 'data-symbol')
        .attr('d', (/** @type {D3LineSeriesData} */ series) => {
          let size = Math.pow(2 * series.lineOptions.markerSize, 2);
          return d3.symbol().type(series.lineOptions.d3Symbol).size(size)();
        })
        .attr('transform', (/** @type {D3LineSeriesData} */ series) => {
          let x = this.axes.x(lineData, xScale, series.data);
          let y = this.axes.y(lineData, yScale, series.data);
          let rotate = series.lineOptions.d3SymbolRotate;
          return `translate(${x}, ${y}) rotate(${rotate})`;
        })
        .attr('fill', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.markerColor; 
        })
        .attr('stroke', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.markerEdgeColor; 
        })
        .attr('stroke-width', (/** @type {D3LineSeriesData} */ series) => { 
          return series.lineOptions.markerEdgeWidth; 
        })
        .style('shape-rendering', 'geometricPrecision')
  }

  /**
   * 
   * @param {D3LineData} lineData 
   * @param {String} xScale 
   * @param {String} yScale 
   */
  _plotUpdate(lineData, xScale, yScale) {

    /* Update lines */
    let line = this.axes.line(lineData, xScale, yScale);
    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.data-line')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('d', (/** @type {D3LineSeriesData} */ series) => { 
          return line(series.data);
        });

    /* Update symbols */
    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.data-symbol')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('d', (/** @type {D3LineSeriesData} */ series) => {
          let size = Math.pow(2 * series.lineOptions.markerSize, 2);
          return d3.symbol().type(series.lineOptions.d3Symbol).size(size)();
        })
        .attr('transform', (/** @type {D3LineSeriesData} */ series) => {
          let x = this.axes.x(lineData, xScale, series.data);
          let y = this.axes.y(lineData, yScale, series.data);
          let rotate = series.lineOptions.d3SymbolRotate;
          return `translate(${x}, ${y}) rotate(${rotate})`;
        });
  }

  /**
   * 
   * @param {D3LineData} lineData 
   */
  _setLineData(lineData) {
    if (lineData.subView.options.subViewType == 'lower') {
      this.lowerLineData = lineData;
    } else {
      this.upperLineData = lineData;
    }
  }

}
