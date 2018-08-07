
import D3LineOptions from '../options/D3LineOptions.js';

/**
 * @fileoverview Container class to hold XY values and assoiciated 
 *    D3LineOptions
 * 
 * @class D3LineSeriesData
 * @author Brandon Clayton
 */
export default class D3LineSeriesData {

  /**
   * @param {Array<Array<Number>>} xyValues The xy values
   * @param {D3LineOptions} options The line options
   */
  constructor(xyValues, options) {
    this.data = xyValues;
    this.lineOptions = options;
  }

}
