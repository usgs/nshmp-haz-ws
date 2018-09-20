
import { D3LineOptions } from '../options/D3LineOptions.js';
import { D3LineSeriesData } from './D3LineSeriesData.js';
import { D3LineSubView } from '../view/D3LineSubView.js';
import { D3XYPair }from './D3XYPair.js';

import { Preconditions } from '../../error/Preconditions.js';

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
export class D3LineData {

  /**
   * @private
   * Must use D3LineData.builder()
   * 
   * @param {D3LineDataBuilder} builder The builder
   */
  constructor(builder) {
    Preconditions.checkArgumentInstanceOf(builder, D3LineDataBuilder);

    /** 
     * The color scheme for plotting.
     * The color scheme will rotate through the colors once the
     *    length of data is greater than color scheme array.
     * Default: d3.schemeCategory10
     * @type {Array<String>}
     */
    this.colorScheme = builder._colorScheme;

    /**
     * The label for the line data
     * Default: 'upper line data' || 'lower line data'
     * @type {String}
     */
    this.label = builder._label;

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
  static of(...lineData) {
    let builder = D3LineData.builder().of(...lineData);
    return builder.build();
  }

  /**
   * Combine two D3LineData using the D3LineData.series.lineOptions.id 
   *    field to find matching D3LineSeries.
   *  
   * @param {D3LineData} lineData The line data to combine
   */
  concat(lineData) {
    Preconditions.checkArgumentInstanceOf(lineData, D3LineData);
    
    let builder = D3LineData.builder()
        .label(this.label)
        .subView(this.subView);

    for (let series of this.series) {
      let matchingSeriesArray = lineData.series.filter((seriesConcat) => {
        return series.lineOptions.id == seriesConcat.lineOptions.id;
      });

      let xValues = series.xValues;
      let yValues = series.yValues;
      let xStrings = series.xStrings;
      let yStrings = series.yStrings;

      for (let matchingSeries of matchingSeriesArray) {
        xValues = xValues.concat(matchingSeries.xValues);
        yValues = yValues.concat(matchingSeries.yValues);

        xStrings = xStrings.concat(matchingSeries.xStrings);
        yStrings = yStrings.concat(matchingSeries.yStrings);
      }

      builder.data(
          xValues,
          yValues,
          series.lineOptions,
          xStrings,
          yStrings);
    }

    return builder.build();
  }

  /**
   * Get all XY values.
   * 
   * @returns {Array<Array<D3XYPair>>} Array of XY values
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
   * @returns {Array<D3LineSeriesData>} The new array of D3LineSeriesData
   */
  toMarkerSeries(series) {
    Preconditions.checkArgumentInstanceOf(series, D3LineSeriesData);

    let markerSeries = [];
    for (let data of series.data) {
      markerSeries.push(new D3LineSeriesData(
          [ data.x ], 
          [ data.y ], 
          series.lineOptions,
          series.xStrings,
          series.yStrings));
    }
    
    return markerSeries;
  }

  /**
   * Return an Array<D3LineSeriesData> with only
   *    D3LineOptions.showLegend as true.
   * 
   * @returns {Array<D3LineSeriesData>}
   */
  toLegendSeries() {
    let legendSeries = [];
    for (let series of this.series) {
      if (!series.lineOptions.showInLegend) continue;
      legendSeries.push(series);
    }

    return legendSeries;
  }

  /**
   * @private
   * Get the max X value.
   */
  _getXLimitMax() {
    let max = d3.max(this.series, (/** @type {D3LineSeriesData} */ series) => {
      return d3.max(series.data, (/** @type {D3XYPair */ data) => {
        return data.x;
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
      return d3.min(series.data, (/** @type {D3XYPair} */ data) => {
        return data.x;
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
      return d3.max(series.data, (/** @type {D3XYPair} */ data) => {
        return data.y;
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
      return d3.min(series.data, (/** @type {D3XYPair} */ data) => {
        return data.y;
      });
    });

    return min;
  }

  /** @private */
  _updateLineOptions() {
    let index = -1;
    let colorIndex = -1;

    for (let data of this.series) {
      index++;
      let color = data.lineOptions.color || this.colorScheme[++colorIndex];
      let id = data.lineOptions.id || `id${index}`;
      let label = data.lineOptions.label || `Line ${index}`;
      let markerColor = data.lineOptions.markerColor || this.colorScheme[colorIndex];
      markerColor = markerColor == undefined ? color : markerColor;
      let markerEdgeColor = data.lineOptions.markerEdgeColor || 
          this.colorScheme[colorIndex];
      markerEdgeColor = markerEdgeColor == undefined ? color : markerEdgeColor;

      data.lineOptions = D3LineOptions.builder().fromCopy(data.lineOptions)
          .color(color)
          .id(id)
          .label(label)
          .markerColor(markerColor)
          .markerEdgeColor(markerEdgeColor)
          .build();
    }

  }

}

/**
 * @fileoverview Builder for D3LineData
 * 
 * Use D3LineData.builder() for new instance of D3LineDataBuilder
 * 
 * @class D3LineDataBuilder
 * @author Brandon Clayton
 */
export class D3LineDataBuilder {
  
  /** @private */
  constructor() {
    /** @type {Array<String>} */
    this._colorScheme = undefined;

    /** @type {String} */
    this._label = undefined;
    
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

    this._label = this._label == undefined ? 
        `${this._subView.options.subViewType} line data` : this._label;

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
   * @param {Array<String>} xStrings
   * @param {Array<String>} yStrings
   */
  data(
      xValues,
      yValues,
      lineOptions = D3LineOptions.withDefaults(),
      xStrings = undefined,
      yStrings = undefined) {
    Preconditions.checkArgumentArrayOf(xValues, 'number');
    Preconditions.checkArgumentArrayOf(yValues, 'number');
    Preconditions.checkArgument(
        xValues.length == yValues.length, 
        'Arrays must have same length');
   
    Preconditions.checkArgumentInstanceOf(lineOptions, D3LineOptions);

    if (xStrings) {
      Preconditions.checkArgumentArrayOf(xStrings, 'string');
      Preconditions.checkArgumentArrayLength(xStrings, xValues.length);
    } else {
      xStrings = new Array(xValues.length).fill('');
    }

    if (yStrings) {
      Preconditions.checkArgumentArrayOf(yStrings, 'string');
      Preconditions.checkArgumentArrayLength(yStrings, yValues.length);
    } else {
      yStrings = new Array(xValues.length).fill('');
    }

    let seriesData = new D3LineSeriesData(
        xValues,
        yValues,
        lineOptions,
        xStrings,
        yStrings);

    this._series.push(seriesData); 
    return this;
  }

  /**
   * Set the label for the line data.
   * 
   * @param {String} label The label
   */
  label(label) {
    Preconditions.checkArgumentString(label);
    this._label = label;
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
    Preconditions.checkArgument(lim[1] >= lim[0], 'xMax must be greater than xMin');

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
    Preconditions.checkArgument(lim[1] >= lim[0], 'yMax must be greater than yMin');

    this._yLimit = lim; 
    return this;
  }

  /** @private */
  _updateColorScheme() {
    let nSeries = this._series.length;
    let colors = this._colorScheme || d3.schemeCategory10;
    let nColors = colors.length;
    let nCat = Math.ceil( nSeries / nColors );

    for (let index = 0; index < nCat; index++) {
      colors = colors.concat(colors);
    }

    return colors.length > nSeries ? colors.slice(0, nSeries) : colors;
  }

}
