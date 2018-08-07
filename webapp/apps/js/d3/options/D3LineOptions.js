
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
    NshmpError.checkArgumentInstanceOf(builder, D3LineOptionsBuilder);

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
     * Default: 'solid'
     * @type {String}
     */
    this.lineStyle = builder._lineStyle;

    /**
     * The line width.
     * Default: 2.5
     * @type {Number}
     */
    this.lineWidth = builder._lineWidth;

    /**
     * The marker color.
     * The default color is set based on the current color scheme
     *    in D3LineData.colorScheme
     * @type {String}
     */
    this.markerColor = builder._markerColor;

    /**
     * The marker edge color.
     * The default color is set based on the current color scheme
     *    in D3LineData.colorScheme
     * @type {String}
     */
    this.markerEdgeColor = builder._markerEdgeColor;

    /**
     * The marker edge width.
     * Default: 0.5
     * @type {Number} 
     */
    this.markerEdgeWidth = builder._markerEdgeWidth;

    /**
     * The marker size.
     * Default: 3.5
     * @type {Number}
     */
    this.markerSize = builder._markerSize;

    /**
     * The marker style:
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
     * @type {String}
     */
    this.markerStyle = builder._markerStyle;

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
     * The D3 symbol associated with the marker style.
     * @type {Object}
     */
    this.d3Symbol = this._getD3Symbol();

    /**
     * The D3 symbol rotate.
     * @type {Number}
     */
    this.d3SymbolRotate = this._getD3SymbolRotate();

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
  _getD3Symbol() {
    let symbol;

    switch(this.markerStyle) {
      case '+' || 'plus-sign':
      case 'x' || 'cross':
        symbol = d3.symbolCross;
        break;
      case 'd' || 'diamond':
        symbol = d3.symbolDiamond;
        break;
      case '*' || 'star':
        symbol = d3.symbolStar;
        break;
      case '^' || 'up-triangle': 
      case 'v' || 'down-triangle':
      case '<' || 'left-triangle': 
      case '>' || 'right-triangle':
        symbol = d3.symbolTriangle;
        break;
      case 'o' || 'circle':
        symbol = d3.symbolCircle;
        break;
      case 's' || 'square':
        symbol = d3.symbolSquare;
        break;
      case 'none':
        symbol = null;
        break;
      default:
        NshmpError.throwError(`Marker [${this.markerStyle}] not supported`);
    }

    NshmpError.checkState(symbol != undefined, 'D3 symbol not found');

    return symbol;
  }

  /**
   * @private
   */
  _getD3SymbolRotate() {
    let rotate;

    switch(this.markerStyle) {
      case 'x' || 'cross':
        rotate = 45; 
        break;
      case 'v' || 'down-triangle':
        rotate = 180;
        break;
      case '<' || 'left-triangle':
        rotate = -90;
        break;
      case '>' || 'right-triangle':
        rotate = 90;
        break;
      default:
        rotate = 0;
    }

    return rotate;
  }

}
