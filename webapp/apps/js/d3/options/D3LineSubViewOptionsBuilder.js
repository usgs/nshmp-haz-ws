
import D3BaseViewOptionsBuilder from './D3BaseSubViewOptionsBuilder.js';
import D3LineSubViewOptions from './D3LineSubViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Builder for D3LineSubViewOptions.
 * 
 * Use D3LineSubViewOptions.lowerBuilder() or
 *    D3LineSubViewOptions.upperBuilder() for new instance of builder.
 * 
 * @class D3LineSubViewOptionsBuilder
 * @extends D3BaseViewOptionsBuilder
 * @author Brandon Clayton
 */
export default class D3LineSubViewOptionsBuilder 
    extends D3BaseViewOptionsBuilder {

  /** @private */
  constructor() {
    super();

    /** @type {Number} */
    this._axisLabelFontWeight = 500;
    /** @type {Array<Number>} */
    this._defaultXLimit = [ 0.01, 10 ];
    /** @type {Array<Number>} */
    this._defaultYLimit = [ 0.01, 1 ];
    /** @type {String} */
    this._gridLineColor = '#E0E0E0';
    /** @type {Number} */
    this._gridLineWidth = 0.75;
    /** @type {Number} */
    this._labelFontSize = 16;
    /** @type {Number} */
    this._legendFontSize = 14;
    /** @type {Number} */
    this._legendLineBreak = 20;
    /** @type {String} */
    this._legendLocation = 'top-right';
    /** @type {Number} */
    this._legendOffset = 5;
    /** @type {Number} */
    this._legendPaddingX = 20;
    /** @type {Number} */
    this._legendPaddingY = 15;
    /** @type {String} */
    this._referenceLineColor = '#9E9E9E';
    /** @type {Number} */
    this._referenceLineWidth = 1;
    /** @type {Number} */
    this._tickExponentFontSize = 8;
    /** @type {Number} */
    this._tickFontSize = 12
    /** @type {Number} */
    this._translationDuration = 500;
    /** @type {String} */
    this._xAxisLocation = 'bottom';
    /** @type {Boolean} */
    this._xAxisNice = true;
    /** @type {String} */
    this._xAxisScale = 'log';
    /** @type {String} */
    this._xLabel = '';
    /** @type {Number} */
    this._xLabelPadding = 8;
    /** @type {Number} */
    this._xTickMarks = 8;
    /** @type {String} */
    this._yAxisLocation = 'left';
    /** @type {Boolean} */
    this._yAxisNice = true;
    /** @type {String} */
    this._yAxisScale = 'log';
    /** @type {String} */
    this._yLabel = '';
    /** @type {Number} */
    this._yLabelPadding = 10;
    /** @type {Number} */
    this._yTickMarks = 6;
  }

  /**
   * Return new D3LineSubViewOptions
   * @returns {D3LineSubViewOptions} Sub view options
   */
  build() {
    this._checkHeight();
    this._checkWidth();
    return new D3LineSubViewOptions(this);
  }

  /**
   * Set the font weight for the X and Y axis labels.
   * Default: 500
   * @param {Number} weight The font weight 
   */
  axisLabelFontWeight(weight) {
    NshmpError.checkArgumentInteger(weight);
    this._axisLabelFontWeight = weight;
    return this;
  }

  /**
   * Set the default X limit when the D3LineView is shown with no data. 
   * Default: [ 0.01, 10 ] 
   * @param {Array<Number>} xLimit The [ min, max] for the X axis
   */
  defaultXLimit(xLimit) {
    NshmpError.checkArgumentArrayOf(xLimit, 'number');
    NshmpError.checkArgument(xLimit.length, 'Array must be length 2');
    this._defaultXLimit = xLimit;
    return this;
  }

  /**
   * Set the default Y limit when the D3LineView is shown with no data. 
   * Default: [ 0.01, 1 ] 
   * @param {Array<Number>} yLimit The [ min, max ] for the Y axis
   */
  defaultXLimit(xLimit) {
    NshmpError.checkArgumentArrayOf(xLimit, 'number');
    NshmpError.checkArgument(xLimit.length, 'Array must be length 2');
    this._defaultXLimit = xLimit;
    return this;
  }

  /**
   * Set the grid line color in HEX, rgb, or string name.
   * Default: 'E0E0E0'
   * @param {String} color The grid line color
   */
  gridLineColor(color) {
    NshmpError.checkArgumentString(color);
    this._gridLineColor = color;
    return this;
  }

  /**
   * Set the grid line width.
   * Default: 0.75
   * @param {Number} width The grid line width
   */
  gridLineWidth(width) {
    NshmpError.checkArgumentNumber(width);
    this._gridLineWidth = width;
    return this;
  }

  /**
   * Set the axis labels font size  in px.
   * Default: 16
   * @param {Number} size The font size
   */
  labelFontSize(size) {
    NshmpError.checkArgumentInteger(size);
    this._labelFontSize = size;
    return this;
  }

  /**
   * Set the legend font size in px.
   * Default: 14
   * @param {Number} size The font size
   */
  legendFontSize(size) {
    NshmpError.checkArgumentInteger(size);
    this._legendFontSize = size;
    return this;
  }

  /**
   * Set the line break distance between legend enteries in px.
   * Default: 20
   * @param {Number} lineBreak The line break
   */
  legendLineBreak(lineBreak) {
    NshmpError.checkArgumentInteger(lineBreak);
    this._legendLineBreak = lineBreak;
    return this;
  }

  /**
   * Set the legend location: 'bottomLeft || 'bottomRight' ||
   *    'topLeft' || 'topRight'
   * Default: 'top-right'
   * @param {String} loc The location
   */
  legendLocation(loc) {
    loc = loc.toLowerCase();
    NshmpError.checkArgument(
        loc == 'bottom-left' || loc == 'bottom-right' || 
            loc == 'top-left' || loc == 'top-right',
        `Legend location [${loc}] not supported`);

    this._legendLocation = loc;
    return this;
  }

  /**
   * The offset around the outside of the legend in px.
   * Default: 5
   * @param {Number} offset The offset
   */
  legendOffset(offset) {
    NshmpError.checkArgumentInteger(offset);
    this._legendOffset = offset;
    return this;
  }

  /**
   * Set the interior legend padding in the X direction in px.
   * Default: 20
   * @param {Number} pad The padding
   */
  legendPaddingX(pad) {
    NshmpError.checkArgumentInteger(pad);
    this._legendPaddingX = pad;
    return this;
  }

  /**
   * Set the interior legend padding in the Y direction in px.
   * Default: 15
   * @param {Number} pad The padding
   */
  legendPaddingY(pad) {
    NshmpError.checkArgumentInteger(pad);
    this._legendPaddingY = pad;
    return this;
  }

  /**
   * Set the reference line color in HEX, RGB, or string name.
   * Default: '#9E9E9E'
   * @param {String} color The color
   */
  referenceLineColor(color) {
    NshmpError.checkArgumentString(color);
    this._referenceLineColor = color;
    return this;
  }
  
  /**
   * Set the reference line width. 
   * Default: 1.0
   * @param {Number} width The width
   */
  referenceLineWidth(width) {
    NshmpError.checkArgumentNumber(width);
    this._referenceLineWidth = width;
    return this;
  }
  
  /**
   * Set the font size of the exponents on the axes tick marks.
   * Only in log scale.
   * Default: 6
   * @param {Number} size The font size
   */
  tickExponentFontSize(size) { 
    NshmpError.checkArgumentInteger(size);
    this._tickExponentFontSize = size;
    return this; 
  } 
  
  /**
   * Set the axes tick mark font size.
   * Default: 12  
   * @param {Number} size 
   */
  tickFontSize(size) {
    NshmpError.checkArgumentInteger(size);
    this._tickFontSize = size;
    return this; 
  }

  /**
   * Set the transition duration in milliseconds. Used when switching 
   *    between log and linear scale.
   * Default: 500 
   * @param {Number} time The duration
   */
  translationDuration(time) { 
    NshmpError.checkArgumentInteger(time);
    this._translationDuration = time;
    return this; 
  } 
  
  /**
   * Set the X axis location: 'top' || 'bottom'
   * Default: 'bottom' 
   * @param {String} loc The location
   */
  xAxisLocation(loc) { 
    loc = loc.toLowerCase();
    NshmpError.checkArgument(
        loc == 'bottom' || loc == 'top',
        `X axis location [${loc}] not supported`);
    
    this._xAxisLocation = loc;
    return this; 
  } 
  
  /**
   * Whether to extend the X domain to nice round numbers.
   * Default: true 
   * @param {Boolean} bool Whether to have a nice domain
   */
  xAxisNice(bool) { 
    NshmpError.checkArgumentBoolean(bool);
    this._xAxisNice = bool;
    return this; 
  } 
  
  /**
   * Set the X axis scale: 'log' || 'linear'
   * Default: 'log' 
   * @param {String} scale The X axis scale
   */
  xAxisScale(scale) { 
    scale = scale.toLowerCase();
    NshmpError.checkArgument(
        scale == 'log' || scale == 'linear',
        `X axis scale [${scale}] not supported`);

    this._xAxisScale = scale;
    return this; 
  } 

  /**
   * Set the X axis label; can be an HTML string.
   * Default: ''
   * @param {String} label The X axis label 
   */
  xLabel(label) {
    NshmpError.checkArgumentString(label);
    this._xLabel = label;
    return this;
  }
  
  /**
   * Set the X label padding in px.
   * Default: 8
   * @param {Number} pad The padding
   */
  xLabelPadding(pad) { 
    NshmpError.checkArgumentInteger(pad);
    this._xLabelPadding = pad;
    return this; 
  } 
  
  /**
   * Set the number of X axis tick marks.
   * The specified count is only a hint; the scale may return more or 
   *    fewer values depending on the domain.
   *  Default: 8
   * @param {Number} count Number of tick marks
   */
  xTickMarks(count) { 
    NshmpError.checkArgumentInteger(count);
    this._xTickMarks = count;
    return this; 
  } 
  
  /**
   * Set the Y axis location: 'left' || 'right'
   * Default: 'left' 
   * @param {String} loc The location
   */
  yAxisLocation(loc) { 
    loc = loc.toLowerCase();
    NshmpError.checkArgument(
        loc == 'left' || loc == 'right',
        `Y axis location [${loc}] not supported`);
    
    this._yAxisLocation = loc;
    return this; 
  } 
  
  /**
   * Whether to extend the Y domain to nice round numbers.
   * Default: true 
   * @param {Boolean} bool Whether to have a nice domain
   */
  yAxisNice(bool) { 
    NshmpError.checkArgumentBoolean(bool);
    this._yAxisNice = bool;
    return this; 
  } 
  
  /**
   * Set the Y axis scale: 'log' || 'linear'
   * Default: 'log' 
   * @param {String} scale The Y axis scale
   */
  yAxisScale(scale) { 
    scale = scale.toLowerCase();
    NshmpError.checkArgument(
        scale == 'log' || scale == 'linear',
        `Y axis scale [${scale}] not supported`);

    this._yAxisScale = scale;
    return this; 
  } 
  
  /**
   * Set the Y axis label; can be an HTML string.
   * Default: ''
   * @param {String} label The Y axis label 
   */
  yLabel(label) {
    NshmpError.checkArgumentString(label);
    this._yLabel = label;
    return this;
  }
  
  /**
   * Set the Y label padding in px.
   * Default: 10
   * @param {Number} pad The padding
   */
  yLabelPadding(pad) { 
    NshmpError.checkArgumentInteger(pad);
    this._yLabelPadding = pad;
    return this; 
  } 
  
  /**
   * Set the number of Y axis tick marks.
   * The specified count is only a hint; the scale may return more or 
   *    fewer values depending on the domain.
   * Default: 6
   * @param {Number} count Number of tick marks
   */
  yTickMarks(count) { 
    NshmpError.checkArgumentInteger(count);
    this._yTickMarks = count;
    return this; 
  } 
  
}
