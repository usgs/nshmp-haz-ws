
import { D3LineOptions } from '../options/D3LineOptions.js';
import { D3Utils } from '../D3Utils.js';
import { D3XYPair } from './D3XYPair.js'; 

import { Preconditions } from '../../error/Preconditions.js';

/**
 * @fileoverview Container class to hold XY values and assoiciated 
 *    D3LineOptions
 * 
 * @class D3LineSeriesData
 * @author Brandon Clayton
 */
export class D3LineSeriesData {

  /**
   * @param {Array<Number>} xValues The X values
   * @param {Array<Number>} yValues The Y values
   * @param {D3LineOptions} options The line options
   */
  constructor(xValues, yValues, options, xStrings, yStrings) {
    Preconditions.checkArgumentArray(xValues);
    Preconditions.checkArgumentArray(yValues);
    Preconditions.checkArgumentInstanceOf(options, D3LineOptions);

    Preconditions.checkArgument(
        xValues.length == yValues.length, 
        'Arrays must have same length');
    
    D3Utils.checkArrayIsNumberOrNull(xValues);
    D3Utils.checkArrayIsNumberOrNull(yValues);

    /**
     * The X values
     * @type {Array<Number>}
     */
    this.xValues = xValues;
    
    /**
     * The Y values
     * @type {Array<Number>}
     */
    this.yValues = yValues;

    /**
     * Custom X value strings to be shown when viewing the data value 
     * @type {Array<String>}
     */
    this.xStrings = xStrings;

    /**
     * Custom Y value strings to be shown when viewing the data value
     * @type {Array<String>}
     */
    this.yStrings = yStrings;

    /**
     * The D3LineOptions associated with XY values
     * @type {D3LineOptions}
     */
    this.lineOptions = options;

    /**
     * The array of XY pair
     * @type {Array<D3XYPair>}
     */
    this.data = [];

    for (let xy of d3.zip(xValues, yValues, xStrings, yStrings)) {
      this.data.push(new D3XYPair(xy[0], xy[1], xy[2], xy[3]));
    }

    /**
     * The D3 symbol generator.
     */
    this.d3Symbol = d3.symbol().type(options.d3Symbol).size(options.d3SymbolSize);
  }

  /**
   * Remove all values under a cut off Y value.
   * 
   * @param {Number} yMinCuttOff The cut off value
   */
  removeSmallValues(yMinCuttOff) {
    Preconditions.checkArgumentNumber(yMinCuttOff);
    this.yValues.map((y) => { return y <= yMinCuttOff ? null : y; });

    this.data.map((xyPair) => {
      if (xyPair.y <= yMinCuttOff) xyPair.y = null;
      return xyPair;
    })
  }

}
