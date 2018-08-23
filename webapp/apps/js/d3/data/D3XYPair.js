
import Preconditions from '../../error/Preconditions.js';

/**
 * @fileoverview Container class to hold a X and Y pair 
 * 
 * @class D3LineSeriesData
 * @author Brandon Clayton
 */
export default class D3XYPair {
  
  /**
   * @param {Number} x The X value 
   * @param {Number} y The Y value
   */
  constructor(x, y) {
    Preconditions.checkArgumentNumber(x);
    Preconditions.checkArgumentNumber(y);

    /** @type {Number} */
    this.x = x;
    /** @type {Number} */
    this.y = y;
  }

}
