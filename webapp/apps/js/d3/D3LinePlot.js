
import { D3LineAxes } from './axes/D3LineAxes.js';
import { D3LineData } from './data/D3LineData.js';
import { D3LineLegend } from './legend/D3LineLegend.js';
import { D3LineSeriesData } from './data/D3LineSeriesData.js';
import { D3LineSubView } from './view/D3LineSubView.js';
import { D3LineView } from './view/D3LineView.js';
import { D3SaveFigure} from './D3SaveFigure.js';
import { D3SaveLineData } from './D3SaveLineData.js';
import { D3Tooltip } from './D3Tooltip.js';
import { D3Utils } from './D3Utils.js';

import { Preconditions } from '../error/Preconditions.js';

/**
 * @fileoverview Plot D3LineData
 * 
 * @class D3LinePlot
 * @author Brandon Clayton
 */
export class D3LinePlot {

  /**
   * New D3LinePlot instance.
   * 
   * @param {D3LineView} view The line view 
   * 
   * @todo Add a D3View.legendIsChecked and D3View.gridlinesIsChecked method
   * @todo Add gridlines check and legend check color options
   * @todo Add data view table and metadata view table
   * @todo Add ablity to plot a reference line at zero
   * @todo Add ability to reverse the Y axis
   * @todo Add method to get a certain data element in the plot
   * @todo Add method to remove small values from the data
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
    if (this.view.addLowerSubView) {
      this._setLineData(this._getDefaultLowerLineData());
    }
    /** @type {D3Tooltip} */
    this.tooltip = new D3Tooltip();
    /** @type {D3LineLegend} */
    this.legend = new D3LineLegend(this);

    this._addDefaultAxes();
    this._addEventListeners();
  }

  /**
   * Select lines on multiple sub views that have the same id. 
   * 
   * @param {String} id The id of the lines to select
   * @param {Array<D3LinePlot>} linePlots The line plots
   * @param {Array<D3LineData>} lineDatas The line data
   */
  static selectLineOnSubViews(id, linePlots, lineDatas) {
    Preconditions.checkArgumentString(id);
    Preconditions.checkArgumentArrayInstanceOf(linePlots, D3LinePlot);
    Preconditions.checkArgumentArrayInstanceOf(lineDatas, D3LineData);
    Preconditions.checkState(
        linePlots.length == lineDatas.length,
        'Number of line plots and line datas must be the same');

    for (let i = 0; i < linePlots.length; i++) {
      let linePlot = linePlots[i];
      let lineData = lineDatas[i]; 
      
      Preconditions.checkStateInstanceOf(linePlot, D3LinePlot);
      Preconditions.checkStateInstanceOf(lineData, D3LineData);

      linePlot.selectLine(id, lineData); 
    }
  }

  /**
   * Sync selections between multiple sub views.
   *  
   * @param  {Array<D3LinePlot>} linePlots The line plots
   * @param {Array<D3LineData>} lineDatas The line data
   */
  static syncSubViews(linePlots, lineDatas) {
    Preconditions.checkArgumentArrayInstanceOf(linePlots, D3LinePlot);
    Preconditions.checkArgumentArrayInstanceOf(lineDatas, D3LineData);
    Preconditions.checkState(
        linePlots.length == lineDatas.length,
        'Number of line plots and line datas must be the same');

    for (let lineData of lineDatas) {
      d3.select(lineData.subView.svg.dataContainerEl)
          .selectAll('.data-enter')
          .on('click', (/** @type {D3LineSeriesData} */ series) => {
            Preconditions.checkStateInstanceOf(series, D3LineSeriesData);
            D3LinePlot.selectLineOnSubViews(
                series.lineOptions.id,
                linePlots,
                lineDatas);
          });
    }
  }

  /**
   * Clear all plots off a D3LineSubView.
   * 
   * @param {D3LineData} lineData 
   */
  clear(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    this.legend.remove(lineData);

    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('*')
        .remove();
  }

  /**
   * Fire a custom function when a line or symbol is selected.
   * Arguments passed to the callback function:
   *    - D3LineData: The line data passed into onPlotSelection
   *    - D3LineSeriesData: The series data from the plot selection
   * 
   * @param {D3LineData} lineData The line data
   * @param {Function} callback Function to call when plot is selected
   */
  onPlotSelection(lineData, callback) {
    lineData.subView.svg.dataContainerEl.addEventListener('plotSelection', (e) => {
      let series = e.detail;
      Preconditions.checkStateInstanceOf(series, D3LineSeriesData);
      callback(lineData, series);
    });
  }

  /**
   * Creates a 2-D line plot from D3LineData.
   *  
   * @param {D3LineData} lineData The line data to plot
   */
  plot(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    lineData = this._dataEnter(lineData);
    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    this.axes.createXAxis(lineData, xScale);
    this.axes.createYAxis(lineData, yScale);
    this.legend.create(lineData);

    this._plotSelectionEventListener(lineData);
  }

  /**
   * Select lines of multiple line data given an id.
   *  
   * @param {String} id of line to select
   * @param {...D3LineData} lineDatas The line data
   */
  selectLine(id, ...lineDatas) {
    Preconditions.checkArgumentString(id);

    this.legend.selectLegendEntry(id, ...lineDatas);

    for (let lineData of lineDatas) {
      Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
      this._resetPlotSelection(lineData);

      d3.select(lineData.subView.svg.dataContainerEl)
          .selectAll(`#${id}`)
          .each((
              /** @type {D3LineSeriesData} */ series,
              /** @type {Number} */ i,
              /** @type {NodeList} */ els) => {
            Preconditions.checkStateInstanceOf(series, D3LineSeriesData);
            Preconditions.checkStateInstanceOfSVGElement(els[i]);
            this._plotSelection(lineData, series, els[i]);
          });
    }
  }

  /**
   * Sync the plot selections between the upper and lower sub views.
   */
  syncSubViews() {
    for (let lineData of [this.upperLineData, this.lowerLineData]) {
      d3.select(lineData.subView.svg.dataContainerEl)
          .selectAll('.data-enter')
          .on('click', (/** @type {D3LineSeriesData} */ series) => {
            Preconditions.checkStateInstanceOf(series, D3LineSeriesData);
            this.selectLine(
                series.lineOptions.id,
                this.upperLineData,
                this.lowerLineData);
          });
    }
  }

  /**
   * @private
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
   * @private
   * Add all event listeners
   */
  _addEventListeners() {
    this.view.viewFooter.saveMenuEl.querySelectorAll('a').forEach((el) => {
      el.addEventListener('click', (e) => { 
        this._onSaveMenu(e);
      });
    });

    this.view.viewFooter.xAxisBtnEl.addEventListener('click', () => { 
      this._onXAxisClick(event); 
    });
    
    this.view.viewFooter.yAxisBtnEl.addEventListener('click', () => { 
      this._onYAxisClick(event); 
    });

    this.view.viewHeader.gridLinesCheckEl.addEventListener('click', () => { 
      this._onGridLineIconClick(); 
    });

    this.view.viewHeader.legendCheckEl.addEventListener('click', () => {
      this._onLegendIconClick();
    });
  }

  /**
   * @private
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
    
    let seriesDataEnterEls = seriesDataEnter.nodes();
    this._plotLine(updatedLineData, seriesDataEnterEls);
    this._plotSymbol(updatedLineData, seriesDataEnterEls);

    return updatedLineData;
  }

  /**
   * @private
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
   * @private
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
   * @private
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
   * @private
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
   * @private
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
   * @private
   * Event handler for mouse over plot symbols; add tooltip.
   * 
   * @param {D3LineData} lineData The line data
   * @param {D3LineSeriesData} series The data series
   */
  _onDataSymbolMouseover(lineData, series) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);

    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    
    let xyPair = series.data[0];
    let tooltipX = this.axes.x(lineData, xScale, xyPair);
    let tooltipY = this.axes.y(lineData, yScale, xyPair);

    let tooltipText = [ 
      series.lineOptions.label,
      `${lineData.subView.options.xLabel}: ${xyPair.x}`,
      `${lineData.subView.options.yLabel}: ${xyPair.y}`,
    ];
    
    this.tooltip.create(lineData.subView, tooltipText, tooltipX, tooltipY);
  }

  /**
   * @private
   * Event handler for mouse out of plot symols; remove toolip.
   *  
   * @param {D3LineData} lineData The line data
   */
  _onDataSymbolMouseout(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    this.tooltip.remove(lineData.subView);
  }

  /**
   * @private
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
   * @private
   * Event handler for legend icon click; add/remove legend.
   * 
   * @param {D3LineData} lineData The line data
   */
  _onLegendIconClick() {
    let isChecked = this.view.viewHeader.legendCheckEl.getAttribute('checked');

    if (isChecked) {
      this.view.viewHeader.legendCheckEl.removeAttribute('checked');
      this.legend.hide(this.upperLineData);

      if (this.view.addLowerSubView) {
        this.legend.hide(this.lowerLineData);
      }
    } else {
      this.view.viewHeader.legendCheckEl.setAttribute('checked', 'true');
      this.legend.show(this.upperLineData);

      if (this.view.addLowerSubView) {
        this.legend.show(this.lowerLineData);
      }
    }
  }

  /**
   * @private
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
   * Save/preview figure or data
   * 
   * @param {Event} event The event
   */
  _onSaveMenu(event) {
    let saveType = event.target.getAttribute('data-type');
    let saveFormat = event.target.getAttribute('data-format');
    let imageOnly = this.view.viewFooter.imageOnlyEl.checked;

    switch(saveType) {
      case 'save-figure':
        if (imageOnly) D3SaveFigure.saveImageOnly(this.view, saveFormat);
        else D3SaveFigure.save(this.view, saveFormat);
        break;
      case 'preview-figure':
        if (imageOnly) D3SaveFigure.previewImageOnly(this.view, saveFormat);
        else D3SaveFigure.preview(this.view, saveFormat);
        break;
      case 'save-data':
        D3SaveLineData.saveCSV(this.upperLineData, this.lowerLineData); 
        break;
      default: 
        throw new NshmpError(`Save type [${saveType}] not supported`);
    }
  }

  /**
   * @private
   * Update the plot when the X axis buttons are clicked.
   *  
   * @param {Event} event The click event
   */
  _onXAxisClick(event) {
    if (event.target.hasAttribute('disabled')) return;

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
   * @private
   * Update the plot when the Y axus buttons are clicked.
   *  
   * @param {Event} event The click event 
   */
  _onYAxisClick(event) {
    if (event.target.hasAttribute('disabled')) return;

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
   * @private
   * Plot the lines.
   *  
   * @param {D3LineData} lineData The line data  
   * @param {Array<SVGElement>} seriesEnter
   */
  _plotLine(lineData, seriesEnterEls) {
    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    let line = this.axes.line(lineData, xScale, yScale);

    d3.selectAll(seriesEnterEls)
        .append('path')
        .attr('class', 'plot-line')
        .attr('d', (/** @type {D3LineSeriesData */ series) => { 
          return line(series.data);
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
   * @private
   * Select the line and symbol.
   * 
   * @param {D3LineData} lineData The line data
   * @param {D3LineSeriesData} series The data series
   * @param {SVGElement} dataEl The data SVG element
   */
  _plotSelection(lineData, series, dataEl) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    Preconditions.checkArgumentInstanceOfSVGElement(dataEl);

    d3.select(dataEl).raise();
    let isActive = dataEl.classList.toggle('active');
    let lineEls = dataEl.querySelectorAll('.plot-line');
    let symbolEls = dataEl.querySelectorAll('.plot-symbol');

    D3Utils.linePlotSelection(lineData, series, lineEls, symbolEls, isActive);

    let selectionEvent = new CustomEvent(
        'plotSelection', 
        { detail: series });
    lineData.subView.svg.dataContainerEl.dispatchEvent(selectionEvent);
  }

  /**
   * @private
   * Plot selection event listner.
   * 
   * @param {D3LineData} lineData The line data
   */
  _plotSelectionEventListener(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.data-enter')
        .on('click', (/** @type {D3LineSeriesData} */ series) => {
          Preconditions.checkStateInstanceOf(series, D3LineSeriesData);
          this.selectLine(series.lineOptions.id, lineData);
        });
  }

  /**
   * @private
   * Plot the symbols.
   * 
   * @param {D3LineData} lineData The line data
   * @param {Array<SVGElement>} seriesEnter The SVG elements
   */
  _plotSymbol(lineData, seriesEnterEls) {
    let xScale = this._getCurrentXScale(lineData.subView);
    let yScale = this._getCurrentYScale(lineData.subView);
    
    d3.selectAll(seriesEnterEls)
        .selectAll('.plot-symbol')
        .data((/** @type {D3LineSeriesData} */ series) =>  { 
          return lineData.toMarkerSeries(series); 
        })
        .enter()
        .append('path')
        .attr('class', 'plot-symbol')
        .attr('d', (/** @type {D3LineSeriesData} */ series) => {
          return series.d3Symbol(); 
        })
        .attr('transform', (/** @type {D3LineSeriesData} */ series) => {
          let x = this.axes.x(lineData, xScale, series.data[0]);
          let y = this.axes.y(lineData, yScale, series.data[0]);
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
        .on('mouseover', (/** @type {D3LineSeriesData} */series) => {
          this._onDataSymbolMouseover(lineData, series);
        })
        .on('mouseout', () => {
          this._onDataSymbolMouseout(lineData);
        });
  }

  /**
   * @private
   * Update the plot
   *  
   * @param {D3LineData} lineData The line data
   * @param {String} xScale The current X scale
   * @param {String} yScale The current Y scale
   */
  _plotUpdate(lineData, xScale, yScale) {

    /* Update lines */
    let line = this.axes.line(lineData, xScale, yScale);
    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.plot-line')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('d', (/** @type {D3LineSeriesData} */ series) => { 
          return line(series.data);
        });

    /* Update symbols */
    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.plot-symbol')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('d', (/** @type {D3LineSeriesData} */ series) => {
          return series.d3Symbol(); 
        })
        .attr('transform', (/** @type {D3LineSeriesData} */ series) => {
          let x = this.axes.x(lineData, xScale, series.data[0]);
          let y = this.axes.y(lineData, yScale, series.data[0]);
          let rotate = series.lineOptions.d3SymbolRotate;
          return `translate(${x}, ${y}) rotate(${rotate})`;
        });
  }

  /**
   * @private
   * Reset all plot selections
   * 
   * @param {D3LineData} lineData The line data 
   */
  _resetPlotSelection(lineData) {
    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.plot-line')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('stroke-width', (/** @type {D3LineSeriesData} */ series) => {
          return series.lineOptions.lineWidth;
        });

    d3.select(lineData.subView.svg.dataContainerEl)
        .selectAll('.plot-symbol')
        .transition()
        .duration(lineData.subView.options.translationDuration)
        .attr('d', (/** @type {D3LineSeriesData}*/ series) => {
          return series.d3Symbol.size(series.lineOptions.d3SymbolSize)();
        })
        .attr('stroke-width', (/** @type {D3LineSeriesData} */ series) => {
          return series.lineOptions.markerEdgeWidth;
        });
  }

  /**
   * @private
   * Set the current line data.
   * 
   * @param {D3LineData} lineData The line data to set
   */
  _setLineData(lineData) {
    if (lineData.subView.options.subViewType == 'lower') {
      this.lowerLineData = lineData;
    } else {
      this.upperLineData = lineData;
    }
  }

}
