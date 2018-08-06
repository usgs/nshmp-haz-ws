
import D3LineDataBuilder from './D3LineDataBuilder.js';
import D3LineSubView from './view/D3LineSubView.js';
import D3LineOptions from './options/D3LineOptions.js';
import D3LineSeriesData from './D3LineSeriesData.js';
import NshmpError from '../lib/NshmpError.js';

/**
 * @fileoverview Create the data series for line plots.
 * 
 * Use D3LineData.Builder to build a D3LineData instance.
 * See D3LineData.builder() 
 * See D3LineDataBuilder 
 * 
 * @class D3LineData
 * @author Brandon Clayton
 */
export default class D3LineData {

  /**
   * @private
   * Must use D3LineData.builder()
   * 
   * @param {D3LineDataBuilder} builder The builder
   */
  constructor(builder) {
    NshmpError.checkArgumentInstanceOf(builder, D3LineDataBuilder);

    /** 
     * The color scheme for plotting.
     * The color scheme will rotate through the colors once the
     *    length of data is greater than color scheme array.
     * Default: d3.schemeCategory10
     * @type {Array<String>}
     */
    this.colorScheme = builder._colorScheme;

    /**
     * The series XY values and line options.
     * @type {Array<D3LineSeriesData>}
     */
    this.series = builder._series;

    /** 
     * Which line sub view to plot.
     * @type {D3LineSubView}
     */
    this.subView = builder._subView;
    
    /**
     * The lower and upper limit of the X axis.
     * Default: 'auto'
     * @type {Array<Number>} 
     */
    this.xLimit = builder._xLimit;
    
    /**
     * The lower and upper limit of the Y axis.
     * Default: 'auto'
     * @type {Array<Number>} 
     */
    this.yLimit = builder._yLimit;
    
    /**
     * Whether to reverse the Y axis direction.
     * Default: false
     * @type {Boolean}
     */
    this.yAxisReverse = builder._yAxisReverse;

    this._updateLineOptions();
    
    /* Make immutable */
    Object.freeze(this);
  }

  /**
   * Return a new D3LineDataBuilder.
   * See D3LineDataBuilder 
   * 
   * @return {D3LineDataBuilder} new D3LineDataBuilder
   */
  static builder() {
    return new D3LineDataBuilder(); 
  }

  /**
   * Create a new D3LineData from multiple D3LineData.
   * 
   * @param {...D3LineData} lineData 
   */
  static of (...lineData) {
    let builder = D3LineData.builder().of(...lineData);
    return builder.build();
  }

  /**
   * Get all XY values.
   * 
   * @returns {Array<Array<Number>>} Array of XY values
   */
  getData() {
    let data = [];
    for (let d of this.series) {
      data.push(d.data);
    }

    return data;
  }

  /**
   * Get all the line options associated with the XY values.
   * 
   * @returns {Array<D3LineOptions>} Array of line options.
   */
  getLineOptions() {
    let options = [];
    for (let d of this.series) {
      options.push(d.lineOptions);
    }

    return options;
  }

  /**
   * Get the X limits for the X axis, either from the set xLimit in
   *    the builder or from the min and max values in the data.
   * 
   * @returns {Array<Number>} The [ min, max ] X values
   */
  getXLimit() {
    if (this.xLimit) return this.xLimit;

    let max = this._getXLimitMax();
    let min = this._getXLimitMin();

    return [ min, max ];
  }

  /**
   * Get the Y limits for the Y axis, either from the set yLimit in
   *    the builder or from the min and max values in the data.
   * 
   * @returns {Array<Number>} The [ min, max ] Y values
   */
  getYLimit() {
    if (this.yLimit) return this.yLimit;

    let max = this._getYLimitMax();
    let min = this._getYLimitMin();

    return [ min, max ];
  }

  /**
   * Convert a D3LineSeriesData into an
   *    Array<D3LineSeriesData> where each D3LineSeriesData is a single
   *    XY data point.
   * 
   * @param {D3LineSeriesData} series The series to expand 
   * @returns {Array<D3LineSeriesData>} The new array of D3SeriesData
   */
  toMarkerSeries(series) {
    NshmpError.checkArgumentInstanceOf(series, D3LineSeriesData);

    let markerSeries = [];
    for (let data of series.data) {
      markerSeries.push(new D3LineSeriesData(data, series.lineOptions));
    }
    
    return markerSeries;
  }

  /**
   * @private
   * Get the max X value.
   */
  _getXLimitMax() {
    let max = d3.max(this.series, (/** @type {D3LineSeriesData} */ series) => {
      return d3.max(series.data, (/** @type {Array<Number> */ data) => {
        return data[0];
      });
    });

    return max;
  }

  /**
   * @private
   * Get the min X value.
   */
  _getXLimitMin() {
    let min = d3.min(this.series, (/** @type {D3LineSeriesData} */ series) => {
      return d3.min(series.data, (/** @type {Array<Number> */ data) => {
        return data[0];
      });
    });

    return min;
  }

  /**
   * @private
   * Get the max Y value.
   */
  _getYLimitMax() {
    let max = d3.max(this.series, (/** @type {D3LineSeriesData} */ series) => {
      return d3.max(series.data, (/** @type {Array<Number> */ data) => {
        return data[1];
      });
    });

    return max;
  }

  /**
   * @private
   * Get the min Y value.
   */
  _getYLimitMin() {
    let min = d3.min(this.series, (/** @type {D3LineSeriesData} */ series) => {
      return d3.min(series.data, (/** @type {Array<Number> */ data) => {
        return data[1];
      });
    });

    return min;
  }

  /** @private */
  _updateLineOptions() {
    let index = -1;

    for (let data of this.series) {
      index++;
      let color = data.lineOptions.color || this.colorScheme[index];
      let id = data.lineOptions.id || `id${index}`;
      let label = data.lineOptions.label || `Line ${index}`;
      let markerColor = data.lineOptions.markerColor || this.colorScheme[index];

      data.lineOptions = D3LineOptions.builder().fromCopy(data.lineOptions)
          .color(color)
          .id(id)
          .label(label)
          .markerColor(markerColor)
          .markerEdgeColor(markerColor)
          .build();
    }

  }

}
