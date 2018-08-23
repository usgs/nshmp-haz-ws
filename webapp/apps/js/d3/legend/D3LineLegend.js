
import D3LineData from '../data/D3LineData.js';
import { D3LineLegendOptions } from '../options/D3LineLegendOptions.js';
import D3LineSeriesData from '../data/D3LineSeriesData.js';
import D3LineSubView from '../view/D3LineSubView.js';
import D3XYPair from '../data/D3XYPair.js';
import NshmpError from '../../error/NshmpError.js';
import Preconditions from '../../error/Preconditions.js';

/**
 * @fileoverview Create a legend for a D3LinePlot.
 * 
 * @class D3LineLegend
 * @author Brandon Clayton
 */
export class D3LineLegend {

  constructor() {}

  /**
   * Create a legend on a sub view.
   * 
   * @param {D3LineData} lineData The line data to show in the legend
   */
  create(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    if (!lineData.subView.options.showLegend) return;

    this.remove(lineData);
    this._createLegendTable(lineData);
  }

  /**
   * Hide the legend.
   * 
   * @param {D3LineData} lineData The line data
   */
  hide(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    lineData.subView.svg.legendEl.classList.add('hidden');
  }

  /**
   * Remove the legend from the sub view.
   * 
   * @param {D3LineData} lineData The line data
   */
  remove(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    d3.select(lineData.subView.svg.legendForeignObjectEl)
        .attr('height', 0)
        .attr('width', 0);

    d3.select(lineData.subView.svg.legendTableEl)
        .selectAll('*')
        .remove();
  }

  /**
   * Show the legend if hidden.
   * 
   * @param {D3LineData} lineData The line data 
   */
  show(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    lineData.subView.svg.legendEl.classList.remove('hidden');
  }

  /**
   * @private
   * Add lines representing the data.
   *  
   * @param {SVGElement} tableSvgEl The SVG table element
   * @param {D3LineSeriesData} series The data
   * @param {D3LineLegendOptions} options The legend options
   */
  _addLegendLines(tableSvgEl, series, options) {
    Preconditions.checkArgumentInstanceOfSVGElement(tableSvgEl);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    Preconditions.checkArgumentInstanceOf(options, D3LineLegendOptions);

    d3.select(tableSvgEl)
        .append('line')
        .attr('class', 'legend-line')
        .attr('x2', options.lineLength)
        .attr('stroke-width', series.lineOptions.lineWidth)
        .attr('stroke-dasharray', series.lineOptions.svgDashArray) 
        .attr('stroke', series.lineOptions.color)
        .style('shape-rendering', 'geometricPrecision')
        .attr('fill', 'none');
  }

  /**
   * @private
   * Add the symbols representing the data.
   *  
   * @param {SVGElement} tableSvgEl The SVG table element 
   * @param {D3LineSeriesData} series The data
   * @param {D3LineLegendOptions} options The legend options
   */
  _addLegendSymbols(tableSvgEl, series, options) {
    Preconditions.checkArgumentInstanceOfSVGElement(tableSvgEl);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    Preconditions.checkArgumentInstanceOf(options, D3LineLegendOptions);

    let size = series.lineOptions.d3SymbolSize; 
    let symbol =  d3.symbol().type(series.lineOptions.d3Symbol).size(size)();
    let rotate = series.lineOptions.d3SymbolRotate;
    let transform = `translate(${options.lineLength / 2}, 0) rotate(${rotate})`;

    d3.select(tableSvgEl)
        .append('path')
        .attr('d', symbol)
        .attr('transform', transform)
        .attr('fill', series.lineOptions.markerColor)
        .attr('stroke', series.lineOptions.markerEdgeColor)
        .attr('stroke-width', series.lineOptions.markerEdgeWidth)
        .style('shape-rendering', 'geometricPrecision')
  }

  /**
   * @private
   * Add the legend text representing the data.
   * 
   * @param {HTMLElement} tableRowEl The HTML table row element
   * @param {D3LineSeriesData} series The data
   */
  _addLegendText(tableRowEl, series) {
    Preconditions.checkArgumentInstanceOfHTMLElement(tableRowEl);

    d3.select(tableRowEl)
        .append('td')
        .style('padding', '0 5px')
        .attr('nowrap', true)
        .text(series.lineOptions.label);
  }

  /**
   * @private
   * Add each D3LineSeriesData to the legend.
   * 
   * @param {HTMLElement} tableRowEl The HTML table row element
   * @param {D3LineSeriesData} series The data
   * @param {D3LineLegendOptions} options The legend options
   */
  _addSeriesToLegend(tableRowEl, series, options) {
    Preconditions.checkArgumentInstanceOfHTMLElement(tableRowEl);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    Preconditions.checkArgumentInstanceOf(options, D3LineLegendOptions);

    let lineOptions = series.lineOptions;
    let markerSize = 2 * lineOptions.markerSize;
    let lineWidth = lineOptions.lineWidth;

    let rowWidth = options.lineLength;
    let rowHeight = options.fontSize > markerSize && 
        options.fontSize > lineWidth  ? options.fontSize : 
        markerSize > lineWidth ? markerSize : lineWidth;

    let tableSvgD3 = d3.select(tableRowEl)
        .append('td')
        .style('padding', '0 5px')
        .style('height', `${rowHeight}px`)
        .style('width', `${rowWidth}px`)
        .style('line-height', 0)
        .append('svg')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('height', rowHeight) 
        .attr('width', rowWidth)
        .append('g')
        .attr('transform', `translate(0, ${rowHeight / 2})`);

    let tableSvgEl = tableSvgD3.node();
    this._addLegendLines(tableSvgEl, series, options);
    this._addLegendSymbols(tableSvgEl, series, options);
    this._addLegendText(tableRowEl, series);
  }

  /**
   * @private 
   * Add all legend entries as table row.
   * 
   * @param {D3LineData} lineData The line data 
   * @param {Array<Array<D3LineSeriesData>>} tableRowData The data 
   * @param {D3LineLegendOptions} options The legend options
   */
  _addTableRows(lineData, tableRowData, options) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    for (let row of tableRowData) {
      Preconditions.checkArgumentArray(row);
      for (let data of row) {
        Preconditions.checkArgumentInstanceOf(data, D3LineSeriesData);
      }
    }
    Preconditions.checkArgumentInstanceOf(options, D3LineLegendOptions);

    let showExtraEntries = tableRowData.length > options.maxRows;
    tableRowData = showExtraEntries ? tableRowData.slice(0, options.maxRows) : 
        tableRowData;

    let tableEl = lineData.subView.svg.legendTableEl;
    d3.select(tableEl)
        .selectAll('tr')
        .data(tableRowData)
        .enter()
        .append('tr')
        .style('cursor', 'pointer')
        .each((
            /** @type {Array<D3LineSeriesData>} */ data, 
            /** @type {Number}*/ i, 
            /** @type {Array<HTMLElement>}*/ els) => {
          for (let series of data) {
            this._addSeriesToLegend(els[i], series, options);
          }
        });

    if (showExtraEntries) {
      let nSeries = lineData.toLegendSeries().length; 
      let extraEntries = nSeries - ( options.maxRows * options.numberOfColumns ); 

      d3.select(tableEl)
          .append('tr')
          .append('td')
          .attr('colspan', options.numberOfColumns * 2)
          .style('text-align', 'center')
          .text(`... and ${extraEntries} more ...`);
    }

  }

  /**
   * @private
   * Add the table styling from D3LineLegendOptions.
   * 
   * @param {D3LineData} lineData The line data
   */
  _addTableStyling(lineData) {
    Preconditions.checkStateInstanceOf(lineData, D3LineData);
    let options = lineData.subView.options.legendOptions;

    let padding = `${options.paddingTop}px ${options.paddingRight}px ` +
        `${options.paddingBottom}px ${options.paddingLeft}px`;
    let borderStyle = `${options.borderLineWidth}px ${options.borderStyle} ` +
        `${options.borderColor}`; 

    d3.select(lineData.subView.svg.legendTableEl)
        .style('font-size', `${options.fontSize}px`)
        .style('border-collapse', 'separate')
        .style('border', borderStyle) 
        .style('border-radius', `${options.borderRadius}px`)
        .style('box-shadow', '0 1px 1px rgba(0, 0, 0, 0.05)')
        .style('padding', padding)
        .style('background', options.backgroundColor)
        .style('cursor', 'move')
  }

  /**
   * @private
   * Create the legend table for all legend entries.
   *  
   * @param {D3LineData} lineData The line data
   */
  _createLegendTable(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);

    d3.select(lineData.subView.svg.legendForeignObjectEl)
        .attr('height', '100%')
        .attr('width', '100%');
    
    let options = lineData.subView.options.legendOptions;
    let legendLineSeries = lineData.toLegendSeries();
    let tableRowData = this._getTableRowData(legendLineSeries, options);
    
    this._addTableStyling(lineData);
    this._addTableRows(lineData, tableRowData, options);

    let tableEl = lineData.subView.svg.legendTableEl;
    let legendHeight = parseFloat(d3.select(tableEl).style('height'));
    let legendWidth = parseFloat(d3.select(tableEl).style('width'));

    d3.select(lineData.subView.svg.legendEl) 
        .call(this._legendDrag(lineData.subView, legendHeight, legendWidth));

    let loc = this._legendLocation(lineData.subView, legendHeight, legendWidth);

    d3.select(lineData.subView.svg.legendForeignObjectEl)
        .attr('height', `${legendHeight}px`)
        .attr('width', `${legendWidth}px`)
        .attr('x', loc.x)
        .attr('y', loc.y)
  }

  /**
   * @private
   * Split up the D3LineSeriesData array when using multiple 
   *    columns in a legend;
   * 
   * @param {Array<D3LineSeriesData>} legendLineSeries The line data
   * @param {D3LineLegendOptions} options The legend options
   * @returns {Array<Array<D3LineSeriesData>>}
   */
  _getTableRowData(legendLineSeries, options) {
    for (let series of legendLineSeries) {
      Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    }
    Preconditions.checkArgumentInstanceOf(options, D3LineLegendOptions);
    
    let data = [];
    let nSeries = legendLineSeries.length; 
    let nRows = Math.ceil( nSeries / options.numberOfColumns );

    for (let row = 0; row < nRows; row++) {
      let splitStart = row * options.numberOfColumns;
      let splitEnd = ( row + 1 ) * options.numberOfColumns;
      let series = legendLineSeries.slice(splitStart, splitEnd);
      data.push(series);
    }

    return data;
  }

  /**
   * @private
   * Create a d3 drag function.
   *  
   * @param {D3LineSubView} subView The sub view
   * @param {Number} legendHeight The legend height
   * @param {Number} legendWidth The legend width
   */
  _legendDrag(subView, legendHeight, legendWidth) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);
    Preconditions.checkArgumentNumber(legendHeight);
    Preconditions.checkArgumentNumber(legendWidth);

    let drag = d3.drag()
        .filter(() => {
          return d3.event.target == subView.svg.legendTableEl;
        })
        .on('drag', () => {
          this._onLegendDrag(subView, legendHeight, legendWidth);
        });

    return drag;
  }

  /**
   * @private
   * Calculate the X and Y location of where the legend should be placed.
   * 
   * @param {D3LineSubView} subView The sub view
   * @param {Number} legendHeight The legend height
   * @param {Number} legendWidth The legend width
   * @returns {D3XYPair} 
   */
  _legendLocation(subView, legendHeight, legendWidth) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);
    Preconditions.checkArgumentNumber(legendHeight);
    Preconditions.checkArgumentNumber(legendWidth);

    let x = 0;
    let y = 0;
    let plotHeight = subView.plotHeight;
    let plotWidth = subView.plotWidth;
    let options = subView.options.legendOptions;

    let xRight = plotWidth - legendWidth - options.marginRight
    let xLeft = options.marginLeft;
    let yTop = options.marginTop;
    let yBottom = plotHeight - legendHeight - options.marginBottom;

    switch(options.location) {
      case 'top-right':
        x = xRight 
        y = yTop; 
        break;
      case 'top-left':
        x = xLeft;
        y = yTop; 
        break;
      case 'bottom-right':
        x = xRight; 
        y = yBottom;
        break;
      case 'bottom-left':
        x = xLeft; 
        y = yBottom; 
        break;
      default:
        NshmpError.throwError(`Cannot set [${options.location}] legend location`);
    }

    return new D3XYPair(x, y); 
  }

  /**
   * @private
   * Handle the legend drag event.
   * 
   * @param {D3LineSubView} subView The sub view 
   */
  _onLegendDrag(subView, legendHeight, legendWidth) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);
    d3.event.sourceEvent.stopPropagation();

    let x = parseFloat(subView.svg.legendForeignObjectEl.getAttribute('x'));
    x += d3.event.dx;
    let y = parseFloat(subView.svg.legendForeignObjectEl.getAttribute('y'));
    y += d3.event.dy;

    let plotHeight = subView.plotHeight;
    let plotWidth = subView.plotWidth;
    let options = subView.options.legendOptions;

    let checkLeft = options.marginLeft;
    let checkRight = plotWidth - legendWidth - options.marginRight;
    let checkTop = options.marginTop;
    let checkBottom = plotHeight - legendHeight - options.marginBottom;

    x = x < checkLeft ? checkLeft : 
        x > checkRight ? checkRight : x;

    y = y < checkTop ? checkTop :
        y > checkBottom ? checkBottom : y;

    d3.select(subView.svg.legendForeignObjectEl)
        .attr('x', x)
        .attr('y', y);
  }

}
