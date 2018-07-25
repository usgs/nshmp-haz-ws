
import D3BaseSubViewOptions from './D3BaseSubViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Create options for D3LineSubView.
 * 
 * Use D3LineSubViewOptions.lowerBuilder or
 *    D3LineSubViewOptions.upperBuilder to customize options 
 *    for lower and upper sub view or use 
 *    D3LineSubViewOptions.upperWithDefaults() or 
 *    D3LineSubViewOptions.lowerWithDefaults() for default options.
 * 
 * Note: The only difference between upperWithDefaults() and 
 *    lowerWithDefault() is the plot height. The lower view defaults with
 *    224 px for plot height while the upper is 504 px.
 * 
 * @class D3LineSubViewOptions
 * @extends D3BaseSubViewOptions
 * @author Brandon Clayton
 */
export default class D3LineSubViewOptions extends D3BaseSubViewOptions {

  /** 
   * @private
   * Must use D3LineSubViewOptions.Builder
   * 
   * @param {D3LineSubViewOptions.Builder} builder The builder 
   */
  constructor(builder) {
    super(builder);

    /** 
     * Color of axes grid lines.
     * Default: '#E0E0E0' 
     * @type {String}
     */
    this.gridLineColor = builder._gridLineColor; 

    /**
     * Width of axes grid lines.
     * Default: 0.75 
     * @type {Number}
     */
    this.gridLineWidth = builder._gridLineWidth;
    
    /** 
     * Axes label font size in px. 
     * Default: 16
     * @type {Number}
     */
    this.labelFontSize = builder._labelFontSize;
    
    /** 
     * Legend font size in px.
     * Default: 14
     * @type {Number}
     */
    this.legendFontSize = builder._legendFontSize;
    
    /** 
     * Line break between legend entries in px.
     * Default: 20
     * @type {Number}
     */
    this.legendLineBreak = builder._legendLineBreak;
    
    /**
     * Legend location: 'bottomLeft' || 'bottomRight' || 
     *    'topLeft' || 'topRight'
     * Default: 'topRight'
     * @type {String}
     */
    this.legendLocation = builder._legendLocation;
    
    /**
     * The offset around the outside of the legend in px.
     * Default: 5
     * @type {Number}
     */
    this.legendOffset = builder._legendOffset;
    
    /**
     * The interior padding of the legend in the X direction in px.
     * Default: 20
     * @type {Number}
     */
    this.legendPaddingX = builder._legendPaddingX;
    
    /**
     * The interior padding of the legend in the Y direction in px.
     * Default: 20
     * @type {Number}
     */
    this.legendPaddingY = builder._legendPaddingY;
    
    /**
     * Color of a reference line.
     * Default: '9E9E9E'
     * @type {String}
     */
    this.referenceLineColor = builder._referenceLineColor;

    /**
     * Line width of the reference line.
     * Default: 1.0
     * @type {Number}
     */
    this.referenceLineWidth = builder._referenceLineWidth;

    /**
     * The font size of the exponents on the tick mark values in px. 
     * Only when in log space.
     * Default: 8
     * @type {Number}
     */
    this.tickExponentFontSize = builder._tickExponentFontSize;

    /**
     * The tick mark values font size in px.
     * Default: 12
     * @type {Number}
     */
    this.tickFontSize = builder._tickFontSize;

    /**
     * The duration for any plot animations in milliseconds.
     * e.g. switching between log and linear scales.
     * Default: 500
     * @type {Number}
     */
    this.translationDuration = builder._translationDuration;

    /**
     * The X axis location: 'top' || 'bottom'
     * Default: 'bottom'
     * @type {String}
     */
    this.xAxisLocation = builder._xAxisLocation;

    /**
     * Extend the domain to start and end on nice round numbers.
     * Default: true
     * @type {Boolean}
     */
    this.xAxisNice = builder._xAxisNice;

    /**
     * The X axis scale: 'log' || 'linear'
     * Default: 'log'
     * @type {String}
     */
    this.xAxisScale = builder._xAxisScale;

    /**
     * Padding around the X label in px.
     * Default: 8
     * @type {Number}
     */
    this.xLabelPadding = builder._xLabelPadding;

    /**
     * The number of tick marks for the X axis.
     * The specified count is only a hint; the scale may return more or 
     *    fewer values depending on the domain.
     * Default: 8
     * @type {Number}
     */
    this.xTickMarks = builder._xTickMarks;

    /**
     * The Y axis location: 'left' || 'right'
     * Default: 'left'
     * @type {String}
     */
    this.yAxisLocation = builder._yAxisLocation;

    /**
     * Extend the domain to start and end on nice round numbers.
     * Default: true
     * @type {Boolean}
     */
    this.yAxisNice = builder._yAxisNice;

    /**
     * The Y axis scale: 'log' || 'linear'
     * Default: 'log'
     * @type {String}
     */
    this.yAxisScale = builder._yAxisScale;

    /**
     * Padding around the Y label in px.
     * Default: 10
     * @type {Number}
     */
    this.yLabelPadding = builder._yLabelPadding;

    /**
     * The number of tick marks for the Y axis.
     * The specified count is only a hint; the scale may return more or 
     *    fewer values depending on the domain.
     * Default: 6
     * @type {Number}
     */
    this.yTickMarks = builder._yTickMarks;


    /* Make immutable */
    if (new.target == D3LineSubViewOptions) Object.freeze(this);
  }

  /** 
   * Return new D3LineSubViewOptions.Builder for lower sub view 
   */
  static lowerBuilder() {
    const LOWER_PLOT_HEIGHT = 224;
    return new D3LineSubViewOptions.Builder().plotHeight(LOWER_PLOT_HEIGHT);
  }

  /** 
   * Return new D3LineSubViewOptions for lower sub view 
   */
  static lowerWithDefaults() {
    return D3LineSubViewOptions.lowerBuilder().build();
  }

  /** 
   * Return new D3LineSubViewOptions.Builder for upper sub view 
   */
  static upperBuilder() {
    return new D3LineSubViewOptions.Builder();
  }

  /** 
   * Return new D3LineSubViewOptions for upper sub view 
   */
  static upperWithDefaults() {
    return D3LineSubViewOptions.upperBuilder().build();
  }

  /** 
   * Build D3LineSubViewOptions
   */
  static get Builder() {
    return class D3SubViewOptionsBuilder extends D3BaseSubViewOptions.Builder {

      /** @private */
      constructor() {
        super();

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
        this._legendLocation = 'topRight';
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
       * Default: 'topRight'
       * @param {String} loc The location
       */
      legendLocation(loc) {
        loc = loc.toLowerCase();
        NshmpError.checkArgument(
            loc == 'bottomleft' || loc == 'bottomright' || 
                loc == 'topleft' || loc == 'topright',
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

  }

}
