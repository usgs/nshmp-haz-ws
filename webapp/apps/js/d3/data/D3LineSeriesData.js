
import D3LineOptions from '../options/D3LineOptions.js';
import D3XYPair from './D3XYPair.js'; 
import Preconditions from '../../error/Preconditions.js';

/**
 * @fileoverview Container class to hold XY values and assoiciated 
 *    D3LineOptions
 * 
 * @class D3LineSeriesData
 * @author Brandon Clayton
 */
export default class D3LineSeriesData {

  /**
   * @param {Array<Number>} xValues The X values
   * @param {Array<Number>} yValues The Y values
   * @param {D3LineOptions} options The line options
   */
  constructor(xValues, yValues, options) {
    Preconditions.checkArgumentArrayOf(xValues, 'number');
    Preconditions.checkArgumentArrayOf(yValues, 'number');
    Preconditions.checkArgument(
        xValues.length == yValues.length, 
        'Arrays must have same length');
    Preconditions.checkArgumentInstanceOf(options, D3LineOptions);

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

    for (let xy of d3.zip(xValues, yValues)) {
      this.data.push(new D3XYPair(xy[0], xy[1]));
    }
  }

}
