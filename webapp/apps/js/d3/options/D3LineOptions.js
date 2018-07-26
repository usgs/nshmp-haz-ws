
import D3LineOptionsBuilder from './D3LineOptionsBuilder.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Options for customizing a line in a line plot.
 * 
 * Use D3LineOptions.builder() to get new instance of D3LineOptionsBuilder.
 * See D3LineOptions.builder()
 * See D3LineOptionsBuilder
 * 
 * @class D3LineOptions
 * @author Brandon Clayton
 */
export default class D3LineOptions {

  /**
   * @private
   * Must use D3LineOptions.builder()
   *  
   * @param {D3LineOptionsBuilder} builder The builder 
   */
  constructor(builder) {
    NshmpError.checkArgument(
        builder instanceof D3LineOptionsBuilder,
        'Must use D3LineOptionsBuilder');

    /**
     * The line color.
     * The default color is set based on the current color scheme
     *    in D3LineData.colorScheme
     * @type {String}
     */
    this.color = builder._color;

    /**
     * The id of the line, should have no spaces.
     * @type {String}
     */
    this.id = builder._id;

    /**
     * The label of the line to show in the tooltip and legend
     * @type {String}
     */
    this.label = builder._label;

    /**
     * The line style: 
     *    - '-' || 'solid': Solid line
     *    - '--' || 'dashed': Dashed line
     *    - ':' || 'dotted': Dotted line
     *    - '-:' || 'dash-dot': Dahsed-dotted
     *    - 'none': No line
     * 
     * Default: 'solid'
     * @type {String}
     */
    this.lineStyle = builder._lineStyle;

    /**
     * The line width.
     * Default: 2.0
     * @type {Number}
     */
    this.lineWidth = builder._lineWidth;

    /**
     * The marker style:
     *    - 's' || 'square': Square markers
     *    - 'o' || 'circle': Circle markers
     * 
     * Default: 'circle'
     * @type {String}
     */
    this.markerStyle = builder._markerStyle;

    /**
     * The marker color.
     * The default color is set based on the current color scheme
     *    in D3LineData.colorScheme
     * @type {String}
     */
    this.markerColor = builder._markerColor;

    /**
     * The marker size.
     * Default: 2.0
     * @type {Number}
     */
    this.markerSize = builder._markerSize;

    /**
     * Whether to show the data in the legend.
     * Default: true
     * @type {Boolean}
     */
    this.showInLegend = builder._showInLegend;

    /**
     * The SVG dash array based on the lineStyle
     * @type {String}
     */
    this.svgDashArray = this._getDashArray();

    /**
     * The SVG marker style base on markerStyle
     * @type {String}
     */
    this.svgMarkerStyle = this._getMarkerStyle();

    /* Make immutable */
    Object.freeze(this);
  }
  
  /**
   * Create a new D3LineOptions with default options.
   * @returns {D3LineOptions} New D3LineOptions instance
   */
  static withDefaults() {
    return D3LineOptions.builder().build();
  }

  /**
   * Returns a new D3LineOptionsBuilder
   * @returns {D3LineOptionsBuilder} New builder
   */
  static builder() {
    return new D3LineOptionsBuilder(); 
  }

  /**
   * @private 
   */
  _getDashArray() {
    let dashArray;

    switch(this.lineStyle) {
      case '-' || 'solid':
        dashArray = '';
        break;
      case '--' || 'dashed':
        dashArray = '8, 8';
        break;
      case ':' || 'dotted':
        dashArray = '2, 5';
        break;
      case '-.' || 'dash-dot':
        dashArray = '8, 5, 2, 5';
        break;
      case 'none':
        dashArray = '0, 1';
        break;
      default:
        NshmpError.throwError(`Line style [${this.lineStyle}] not supported`);
    }

    return dashArray;
  }

  /**
   * @private 
   */
  _getMarkerStyle() {
    let marker;

    switch(this.markerStyle) {
      case 'o' || 'circle':
        marker = 'circle';
        break;
      case 's' || 'square':
        marker = 'square';
        break;
      case 'none':
        marker = 'none';
        break;
      default:
        NshmpError.throwError(`Marker [${this.markerStyle}] not supported`);
    }

    return marker;
  }

}
