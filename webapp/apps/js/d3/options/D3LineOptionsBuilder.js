
import D3LineOptions from'./D3LineOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Builder for D3LineOptions
 * 
 * Use D3LineOptions.builder() for new instance of D3LineOptionsBuilder
 * 
 * @class D3LineOptionsBuilder
 * @author Brandon Clayton
 */
export default class D3LineOptionsBuilder {
  
  /** @private */
  constructor() {
    /** @type {String} */
    this._color = undefined;
    /** @type {String} */
    this._id = undefined;
    /** @type {String} */
    this._label = undefined;
    /** @type {String} */
    this._lineStyle = '-';
    /** @type {Number} */
    this._lineWidth = 2;
    /** @type {String} */
    this._markerStyle = 'o';
    /** @type {String} */
    this._markerColor = undefined;
    /** @type {Number} */
    this._markerSize = 2;
    /** @type {Boolean} */
    this._showInLegend = true;
  }

  /**
   * Returns new D3LineOptions
   * 
   * @returns {D3LineOptions} new D3LineOptions
   */
  build() {
    return new D3LineOptions(this);
  }

  /**
   * Copy D3LineOptions into the builder.
   * 
   * @param {D3LineOptions} options The options to copy
   */
  fromCopy(options) {
    NshmpError.checkArgument(
        options instanceof D3LineOptions,
        'Must be instance of D3LineOptions');
    
    this._color = options.color;
    this._id = options.id;
    this._label = options.label;
    this._lineStyle = options.lineStyle;
    this._lineWidth = options.lineWidth;
    this._markerStyle = options.markerStyle;
    this._markerColor = options.markerColor;
    this._markerSize = options.markerSize;
    this._showInLegend = options.showInLegend;

    return this;
  }

  /**
   * Set the line color.
   * The default color is set based on the current color scheme
   *    in D3LineData.colorScheme.
   * 
   * @param {String} color The line color 
   */
  color(color) {
    NshmpError.checkArgumentString(color);
    this._color = color;
    return this;
  }

  /**
   * Set the id of the line.
   * 
   * @param {String} id The id of the line 
   */
  id(id) {
    NshmpError.checkArgumentString(id);
    this._id = id;
    return this;
  }

  /**
   * Set the label for the line. Shown in tooltip and legend.
   * 
   * @param {String} label The label for the line 
   */
  label(label) {
    NshmpError.checkArgumentString(label);
    this._label = label;
    return this;
  }

  /**
   * Set the line style: 
   *    - '-' || 'solid': Solid line
   *    - '--' || 'dashed': Dashed line
   *    - ':' || 'dotted': Dotted line
   *    - '-:' || 'dash-dot': Dahsed-dotted
   *    - 'none': No line
   * Default: 'solid'
   * 
   * @param {String} style 
   */
  lineStyle(style) {
    NshmpError.checkArgumentString(style);
    this._lineStyle = style.toLowerCase();
    return this;
  }

  /**
   * Set the line width.
   * Default: 2.0
   * 
   * @param {Number} width The line width 
   */
  lineWidth(width) {
    NshmpError.checkArgumentNumber(width);
    this._lineWidth = width;
    return this;
  }

  /**
   * Set the marker style:
   *    - 's' || 'square': Square markers
   *    - 'o' || 'circle': Circle markers
   * 
   * Default: 'circle'
   * 
   * @param {String} marker 
   */
  markerStyle(marker) {
    NshmpError.checkArgumentString(marker);
    this._marker = marker.toLowerCase();
    return this;
  }

  /**
   * Set the marker color.
   * The default color is set based on the current color scheme
   *    in D3LineData.colorScheme
   * 
   * @param {String} color 
   */
  markerColor(color) {
    NshmpError.checkArgumentString(color);
    this._markerColor = color;
    return this;
  }


  /**
   * The marker size.
   * Default: 2.0
   * @type {Number}
   */
  markerSize(size) {
    NshmpError.checkArgumentNumber(size);
    this._markerSize = size;
    return this;
  }

  /**
   * Whether to show the data in the legend.
   * Default: true
   * @type {Boolean}
   */
  showInLegend(bool) {
    NshmpError.checkArgumentBoolean(bool);
    this._showInLegend = bool;
    return this;
  }

}
