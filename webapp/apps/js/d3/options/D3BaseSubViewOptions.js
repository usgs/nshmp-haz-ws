
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Create options for D3BaseSubView.
 * 
 * Use D3BaseSubViewOptions.lowerBuilder or 
 *    D3BaseSubViewOptions.upperBuilder to customize options 
 *    for lower and upper sub view or use 
 *    D3BaseSubViewOptions.upperWithDefaults() or 
 *    D3BaseSubViewOptions.lowerWithDefaults() for default options.
 * 
 * Note: The only difference between upperWithDefaults() and 
 *    lowerWithDefault() is the plot height. The lower view defaults with
 *    224 px for plot height while the upper is 504 px.
 * 
 * @class D3BaseSubViewOptions
 * @author Brandon Clayton
 */
export default class D3BaseSubViewOptions {

  /** 
   * @private
   * Must use D3BaseSubViewOptions.Builder
   * 
   * @param {D3BaseSubViewOptions.Builder} builder The builder 
   */
  constructor(builder) {
    NshmpError.checkArgument(
        builder.constructor.name == 'D3SubViewOptionsBuilder',
        'Must be D3BaseSubViewOptions.Builder');

    /** 
     * Margin bottom for the SVG plot in px.
     * Default: 50
     * @type {Number}
     */
    this.marginBottom = builder._marginBottom;
    
    /** 
     * Margin left for the SVG plot in px.
     * Default: 70
     * @type {Number}
     */
    this.marginLeft = builder._marginLeft;
    
    /** 
     * Margin right for the SVG plot in px.
     * Default: 20
     * @type {Number}
     */
    this.marginRight = builder._marginRight;

    /** 
     * Margin top for the SVG plot in px.
     * Default: 20
     * @type {Number}
     */
    this.marginTop = builder._marginTop;

    /**
     * SVG plot height for SVG view box in px.
     * Default: 504 (upper) || 224 (lower)
     * @type {Number}
     */
    this.plotHeight = builder._plotHeight;

    /**
     * SVG plot width for SVG view box in px.
     * Default: 896
     * @type {Number}
     */
    this.plotWidth = builder._plotWidth;

    /* Make immutable */
    if (new.target == D3BaseSubViewOptions) Object.freeze(this);
  }

  /** 
   * Return new D3BaseSubViewOptions.Builder for lower sub view 
   */
  static lowerBuilder() {
    const LOWER_PLOT_HEIGHT = 224;
    return new D3BaseSubViewOptions.Builder().plotHeight(LOWER_PLOT_HEIGHT);
  }

  /** 
   * Return new D3BaseSubViewOptions for lower sub view 
   */
  static lowerWithDefaults() {
    return D3BaseSubViewOptions.lowerBuilder().build();
  }

  /** 
   * Return new D3BaseSubViewOptions.Builder for upper sub view 
   */
  static upperBuilder() {
    return new D3BaseSubViewOptions.Builder();
  }

  /** 
   * Return new D3BaseSubViewOptions for upper sub view 
   */
  static upperWithDefaults() {
    return D3BaseSubViewOptions.upperBuilder().build();
  }

  /** 
   * Build D3BaseSubViewOptions
   */
  static get Builder() {
    return class D3SubViewOptionsBuilder {

      /** @private */
      constructor() {
        /** @type {Number} */
        this._marginBottom = 50;
        /** @type {Number} */
        this._marginLeft = 70;
        /** @type {Number} */
        this._marginRight = 20;
        /** @type {Number} */
        this._marginTop = 20;
        /** @type {Number} */
        this._plotHeight = 504;
        /** @type {Number} */
        this._plotWidth = 896;
      }

      /**
       * Return new D3BaseSubViewOptions
       */
      build() {
        this._checkHeight();
        this._checkWidth();
        return new D3BaseSubViewOptions(this);
      }

      /**
       * Set the bottom margin for the SVG plot in px.
       * Default: 50
       * 
       * @param {Number} margin The bottom margin 
       */
      marginBottom(margin) {
        NshmpError.checkArgumentInteger(margin);
        this._marginBottom = margin; 
        return this;
      }

      /**
       * Set the left margin for the SVG plot in px.
       * Default: 70
       * 
       * @param {Number} margin The left margin 
       */
      marginLeft(margin) {
        NshmpError.checkArgumentInteger(margin);
        this._marginLeft = margin;
        return this;
      }

      /**
       * Set the right margin for the SVG plot in px.
       * Default: 20
       * 
       * @param {Number} margin The right margin 
       */
      marginRight(margin) {
        NshmpError.checkArgumentInteger(margin);
        this._marginRight = margin;
        return this;
      }

      /**
       * Set the top margin for the SVG plot in px.
       * Default: 20
       * 
       * @param {Number} margin The top margin 
       */
      marginTop(margin) {
        NshmpError.checkArgumentInteger(margin);
        this._marginTop = margin;
        return this;
      }

      /**
       * Set the SVG plot height in px.
       * Default: 504 (upper) || 224 (lower)
       * 
       * @param {number} height The plot height
       */
      plotHeight(height) {
        NshmpError.checkArgumentInteger(height);
        this._plotHeight = height;
        return this;
      }

      /**
       * Set the SVG plot width in px.
       * Default: 896
       * 
       * @param {number} width The plot width
       */
      plotWidth(width) {
        NshmpError.checkArgumentInteger(width);
        this._plotWidth = width;
        return this;
      }

      _checkHeight() {
        let heightCheck = this._plotHeight - 
            this._marginBottom - this._marginTop;

        NshmpError.checkState(
          heightCheck > 0,
          'Height must be greater than (marginTop + marginBottom)');
      }

      _checkWidth() {
        let widthCheck = this._plotWidth - 
            this._marginLeft - this._marginRight;

        NshmpError.checkState(
          widthCheck > 0,
          'Width must be greater than (marginLeft + marginRight)');
      }

    }

  }

}
