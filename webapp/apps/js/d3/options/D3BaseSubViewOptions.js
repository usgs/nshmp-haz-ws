
import D3BaseSubViewOptionsBuilder from './D3BaseSubViewOptionsBuilder.js';
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
   * Must use D3BaseSubViewOptions.lowerBuilder() or
   *    D3BaseSubViewOptions.upperBuilder()
   * 
   * @param {D3BaseSubViewOptionsBuilder} builder The builder 
   */
  constructor(builder) {
    NshmpError.checkArgument(
        builder instanceof D3BaseSubViewOptionsBuilder,
        'Must be instance of D3BaseSubViewOptionsBuilder');

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
    return new D3BaseSubViewOptionsBuilder().plotHeight(LOWER_PLOT_HEIGHT);
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
    return new D3BaseSubViewOptionsBuilder();
  }

  /** 
   * Return new D3BaseSubViewOptions for upper sub view 
   */
  static upperWithDefaults() {
    return D3BaseSubViewOptions.upperBuilder().build();
  }

}
