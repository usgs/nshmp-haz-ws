
import { D3LineData } from './data/D3LineData.js';
import { D3LineSeriesData } from './data/D3LineSeriesData.js';

import { Preconditions } from '../error/Preconditions.js';

/**
 * @fileoverview D3 Utilities
 * 
 * @class D3Utils
 * @author Brandon Clayton
 */
export class D3Utils {

  constructor() {}

  /**
   * Increase/decrease the line width, marker size, and marker edge width
   *    of all lines and symbols.
   *    
   * @param {D3LineData} lineData The line data
   * @param {D3LineSeriesData} series The data series
   * @param {NodeList} lineEls The SVG elements of the lines
   * @param {NodeList} symbolEls The SVG elements of the symbols
   * @param {Boolean} isActive Whether the line/symbols have been selected
   *    or deselected
   */
  static linePlotSelection(lineData, series, lineEls, symbolEls, isActive) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);
    Preconditions.checkArgumentInstanceOf(lineEls, NodeList);
    Preconditions.checkStateInstanceOf(symbolEls, NodeList);
    Preconditions.checkArgumentBoolean(isActive);

    let options = series.lineOptions;

    let lineWidth = isActive ?  
        options.lineWidth * options.selectionMultiplier :
        options.lineWidth;

    let symbolSize = isActive ?
        options.d3SymbolSize * options.selectionMultiplier :
        options.d3SymbolSize;

    let edgeWidth = isActive ? 
        options.markerEdgeWidth * options.selectionMultiplier :
        options.markerEdgeWidth;

    let delay = isActive ? lineData.subView.options.translationDuration : 0;
    let flashMultiplier = 1.5;

    if (isActive) {
      d3.selectAll(lineEls)
          .transition()
          .duration(lineData.subView.options.translationDuration)
          .attr('stroke-width', lineWidth * flashMultiplier);

      d3.selectAll(symbolEls)
          .transition()
          .duration(lineData.subView.options.translationDuration)
          .attr('d', series.d3Symbol.size(symbolSize * flashMultiplier)()) 
          .attr('stroke-width', edgeWidth * flashMultiplier);
    } 

    d3.selectAll(lineEls)
        .transition()
        .delay(delay)
        .duration(lineData.subView.options.translationDuration)
        .attr('stroke-width', lineWidth);

    d3.selectAll(symbolEls)
        .transition()
        .delay(delay)
        .duration(lineData.subView.options.translationDuration)
        .attr('d', series.d3Symbol.size(symbolSize)()) 
        .attr('stroke-width', edgeWidth);
  }

}
