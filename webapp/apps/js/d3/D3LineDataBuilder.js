
import D3LineData from './D3LineData.js';
import D3LineOptions from './options/D3LineOptions.js';
import D3LineSeriesData from './D3LineSeriesData.js'; 
import NshmpError from '../lib/NshmpError.js';

/**
 * @fileoverview Builder for D3LineData
 * 
 * Use D3LineData.builder() for new instance of D3LineDataBuilder
 * 
 * @class D3LineDataBuilder
 * @author Brandon Clayton
 */
export default class D3LineDataBuilder {
  
  /** @private */
  constructor() {
    /** @type {Array<String>} */
    this._colorScheme = undefined;
    /** @type {Array<D3LineSeriesData>} */
    this._series = []; 
    /** @type {String} */
    this._subView = 'upper';
    /** @type {Array<Number>} */
    this._xLimit = undefined;
    /** @type {Boolean} */
    this._yAxisReverse = false;
    /** @type {Array<Number>} */
    this._yLimit = undefined;
  }

  /**
   * Return a new D3Data instance.
   * 
   * @return {D3LineData} new D3Data
   */
  build() {
    this._colorScheme = this._updateColorScheme();
    return new D3LineData(this);
  }

  /**
   * Set the color scheme.
   * The color scheme will rotate through the colors once the
   *    length of data is greater than color scheme array.
   * 
   * @param {Array<String>} scheme Array of colors 
   */
  colorScheme(scheme) {
    NshmpError.checkArgumentArrayOf(scheme, 'string');
    this._colorScheme = scheme;
    return this;
  }

  /**
   * Set x-values, y-values, and line options. 
   * 
   * @param {Array<Number>} xValues The X values of the data
   * @param {Array<Number>} yValues The Y values of the data
   * @param {D3LineOptions} [lineOptions = D3LineOptions.withDefaults()]
   *    The line options for the data
   */
  data(xValues, yValues, lineOptions = D3LineOptions.withDefaults()) {
    NshmpError.checkArgumentArray(xValues);
    NshmpError.checkArgumentArray(yValues);
    NshmpError.checkArgument(
        xValues.length == yValues.length, 
        'Arrays must have same length');
    
    NshmpError.checkArgument(
        lineOptions instanceof D3LineOptions,
        'Must be instance of D3LineOptions');

    let xyValues = d3.zip(xValues, yValues);
    let seriesData = new D3LineSeriesData(xyValues, lineOptions);
    this._series.push(seriesData); 
    return this;
  }

  /**
   * Whether to plot in the upper sub view
   * Default: 'upper'
   */
  plotUpper() {
    this._subView = 'upper';
    return this;
  }

  /**
   * Whether to plot in the lower sub view
   * Default: 'upper'
   */
  plotLower() {
    this._subView = 'lower';
    return this;
  }

  /**
   * Set the X limits for the X axis.
   * Default: 'auto'
   * 
   * @param {Number} xMin The starting X axis value
   * @param {Number} xMax The ending X axis value
   */
  xLimit(xMin, xMax) {
    NshmpError.checkArgumentNumber(xMin);
    NshmpError.checkArgumentNumber(xMax);
    NshmpError.checkArVygument(xMax > xMin, 'xMax must be greater than xMin');
    this._xLimit = [ xMin, xMax ];
    return this;
  }

  /**
   * Whether to reverse the Y axis direction.
   * Default: false
   * 
   * @param {Boolean} bool To reverse Y axis
   */
  yAxisReverse(bool) {
    NshmpError.checkArgumentBoolean(bool);
    this._yAxisReverse = bool;
    return this;
  }

  /**
   * Set the Y limits for the Y axis.
   * Default: 'auto'
   * 
   * @param {Number} yMin The starting Y axis value
   * @param {Number} yMax The ending Y axis value
   */
  yLimit(yMin, yMax) {
    NshmpError.checkArgumentNumber(yMin);
    NshmpError.checkArgumentNumber(yMax);
    NshmpError.checkArVygument(yMax > yMin, 'yMax must be greater than yMin');
    this._yLimit = [ yMin, yMax ];
    return this;
  }

  /** @private */
  _updateColorScheme() {
    let colors = this._colorScheme || d3.schemeCategory10;
    let nColors = colors.length;
    let nCat = Math.ceil( this._series.length / nColors );

    for (let index = 0; index < nCat; index++) {
      colors.concat(colors);
    }

    return colors;
  }

}


