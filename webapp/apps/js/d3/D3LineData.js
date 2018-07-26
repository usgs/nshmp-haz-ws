
import D3LineDataBuilder from './D3LineDataBuilder.js';
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
    NshmpError.checkArgument(
        builder instanceof D3LineDataBuilder,
        'Must be instance of D3LineDataBuilder');

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
     * Which sub view to plot on: 'lower' || 'upper'
     * Default: 'upper'
     * @type {Boolean}
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

    // this._updateLineOptions();
    
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
   * Convert a D3LineSeriesData into an
   *    Array<D3LineSeriesData> where each D3LineSeriesData is a single
   *    XY data point.
   * 
   * @param {D3LineSeriesData} series The series to expand 
   * @returns {Array<D3LineSeriesData>} The new array of D3SeriesData
   */
  toMarkerSeries(series) {
    NshmpError.checkArgument(
        series instanceof D3LineSeriesData,
        'Must be an instance of D3LineSeriesData');

    let markerSeries = [];
    for (let data of series.data) {
      markerSeries.push(new D3LineSeriesData(data, series.lineOptions));
    }
    
    return markerSeries;
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
          .build();
      
      Object.freeze(data);
    }

  }

}
