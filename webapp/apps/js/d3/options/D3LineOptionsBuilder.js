
import D3LineOptions from'./D3LineOptions.js';
import Preconditions from '../../error/Preconditions.js';

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
    this._lineWidth = 2.5;
    /** @type {String} */
    this._markerStyle = 'o';
    /** @type {String} */
    this._markerColor = undefined;
    /** @type {String} */
    this._markerEdgeColor = undefined;
    /** @type {Number} */
    this._markerEdgeWidth = 0.5;
    /** @type {Number} */
    this._markerSize = 3.5;
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
    Preconditions.checkArgumentInstanceOf(options, D3LineOptions);
    
    this._color = options.color;
    this._id = options.id;
    this._label = options.label;
    this._lineStyle = options.lineStyle;
    this._lineWidth = options.lineWidth;
    this._markerColor = options.markerColor;
    this._markerEdgeColor = options.markerEdgeColor;
    this._markerEdgeWidth = options.markerEdgeWidth;
    this._markerStyle = options.markerStyle;
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
    Preconditions.checkArgumentString(color);
    this._color = color;
    return this;
  }

  /**
   * Set the id of the line.
   * 
   * @param {String} id The id of the line 
   */
  id(id) {
    Preconditions.checkArgumentString(id);
    this._id = id;
    return this;
  }

  /**
   * Set the label for the line. Shown in tooltip and legend.
   * 
   * @param {String} label The label for the line 
   */
  label(label) {
    Preconditions.checkArgumentString(label);
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
    Preconditions.checkArgumentString(style);
    this._lineStyle = style.toLowerCase();
    return this;
  }

  /**
   * Set the line width.
   * Default: 2.5
   * 
   * @param {Number} width The line width 
   */
  lineWidth(width) {
    Preconditions.checkArgumentNumber(width);
    this._lineWidth = width;
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
    Preconditions.checkArgumentString(color);
    this._markerColor = color;
    return this;
  }

  /**
   * Set the marker edge color.
   * The default color is set based on the current color scheme
   *    in D3LineData.colorScheme
   * 
   * @param {String} color The marker edge color 
   */
  markerEdgeColor(color) {
    Preconditions.checkArgumentString(color);
    this._markerEdgeColor = color;
    return this;
  }

  /**
   * Set the marker edge width.
   * Default: 0.5
   * 
   * @param {Number} width The marker edge width 
   */
  markerEdgeWidth(width) {
    Preconditions.checkArgumentNumber(width);
    this._markerEdgeWidth = width;
    return this;
  }

  /**
   * The marker size.
   * Default: 3.5
   * @type {Number}
   */
  markerSize(size) {
    Preconditions.checkArgumentNumber(size);
    this._markerSize = size;
    return this;
  }

  /**
   * Set the marker style:
   *    - 's' || 'square': Square markers
   *    - 'o' || 'circle': Circle markers
   *    - '+' || 'plus-sign': Plus sign markers
   *    - 'x' || 'cross': Cross sign markers
   *    - '^' || 'up-triangle': Up-pointing triangle
   *    - 'v' || 'down-triangle': Down-pointing triangle
   *    - '<' || 'left-triangle': Left-pointing triangle
   *    - '>' || 'right-triangle': Right-pointing triangle
   *    - 'd' || 'diamond': Diamond markers
   *    - '*' || 'star': Star markers
   * Default: 'circle'
   * 
   * @param {String} marker 
   */
  markerStyle(marker) {
    Preconditions.checkArgumentString(marker);
    this._markerStyle = marker.toLowerCase();
    return this;
  }

  /**
   * Whether to show the data in the legend.
   * Default: true
   * @type {Boolean}
   */
  showInLegend(bool) {
    Preconditions.checkArgumentBoolean(bool);
    this._showInLegend = bool;
    return this;
  }

}
