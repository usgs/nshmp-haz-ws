
import D3LineData from './D3LineData.js';
import D3LineSubView from '../view/D3LineSubView.js';
import D3LineOptions from '../options/D3LineOptions.js';
import D3LineSeriesData from './D3LineSeriesData.js'; 
import Preconditions from '../../error/Preconditions.js';

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
    /** @type {D3LineSubView} */
    this._subView = undefined;
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
    Preconditions.checkNotNull(this._subView, 'Must set subView');
    Preconditions.checkNotUndefined(this._subView, 'Must set subView');

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
    Preconditions.checkArgumentArrayOf(scheme, 'string');
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
    Preconditions.checkArgumentArrayOf(xValues, 'number');
    Preconditions.checkArgumentArrayOf(yValues, 'number');
    Preconditions.checkArgument(
        xValues.length == yValues.length, 
        'Arrays must have same length');
   
    Preconditions.checkArgumentInstanceOf(lineOptions, D3LineOptions);

    let xyValues = d3.zip(xValues, yValues);
    let seriesData = new D3LineSeriesData(xyValues, lineOptions);
    this._series.push(seriesData); 
    return this;
  }

  /**
   * Create a D3LineDataBuilder from multiple D3LineData.
   * 
   * @param {...D3LineData} lineData 
   */
  of(...lineData) {
    let color = [];
    let xLims = [];
    let yLims = [];
    let subViewType = lineData[0].subView.options.subViewType;

    for (let data of lineData) {
      Preconditions.checkArgumentInstanceOf(data, D3LineData);
      Preconditions.checkState(
          data.subView.options.subViewType == subViewType,
          'Must all be same sub view type');

      this._series.push(...data.series);
      color = color.concat(data.colorScheme);
      xLims.push(data.getXLimit());
      yLims.push(data.getYLimit());
    }

    let xMin = d3.min(xLims, (x) => { return x[0]; });
    let xMax = d3.max(xLims, (x) => { return x[1]; });

    let yMin = d3.min(yLims, (y) => { return y[0]; });
    let yMax = d3.max(yLims, (y) => { return y[1]; });

    this.colorScheme(color);
    this.subView(lineData[0].subView);
    this.xLimit([ xMin, xMax ]);
    this.yAxisReverse(lineData[0].yAxisReverse);
    this.yLimit([ yMin, yMax ]);

    return this;
  }

  /**
   * Set the line sub view for which to plot the data.
   * 
   * @param {D3LineSubView} view The sub view to plot the data 
   */
  subView(view) {
    Preconditions.checkArgumentInstanceOf(view, D3LineSubView);
    this._subView = view;
    return this;
  }

  /**
   * Set the X limits for the X axis.
   * Default: 'auto'
   * 
   * @param {Array<Number>} lim The X axis limits: [ xMin, xMax ]
   */
  xLimit(lim) {
    Preconditions.checkArgumentArrayLength(lim, 2);
    Preconditions.checkArgumentArrayOf(lim, 'number');
    Preconditions.checkArgument(lim[1] > lim[0], 'xMax must be greater than xMin');

    this._xLimit = lim; 
    return this;
  }

  /**
   * Whether to reverse the Y axis direction.
   * Default: false
   * 
   * @param {Boolean} bool To reverse Y axis
   */
  yAxisReverse(bool) {
    Preconditions.checkArgumentBoolean(bool);
    this._yAxisReverse = bool;
    return this;
  }

  /**
   * Set the Y limits for the Y axis.
   * Default: 'auto'
   * 
   * @param {Array<Number>} lim The Y axis limits: [ yMin, yMax ]
   */
  yLimit(lim) {
    Preconditions.checkArgumentArrayLength(lim, 2);
    Preconditions.checkArgumentArrayOf(lim, 'number');
    Preconditions.checkArgument(lim[1] > lim[0], 'yMax must be greater than yMin');

    this._yLimit = lim; 
    return this;
  }

  /** @private */
  _updateColorScheme() {
    let nSeries = this._series.length;
    let colors = this._colorScheme || d3.schemeCategory10;
    let nColors = colors.length;
    let nCat = Math.ceil( this._series.length / nColors );

    for (let index = 0; index < nCat; index++) {
      colors.concat(colors);
    }

    return colors.length > nSeries ? colors.slice(0, nSeries) : colors;
  }

}
