
import D3BaseViewOptions from './D3BaseViewOptions.js';
import D3LineViewOptionsBuilder from './D3LineViewOptionsBuilder.js';

/**
 * @fileoverview Create options for D3LineView
 * 
 * Use Builder to customize the options or use 
 *    D3LineViewOptions.withDefaults()
 * 
 * @class D3LineViewOptions
 * @extends D3BaseViewOptions
 * @author Brandon Clayton
 */
export default class D3LineViewOptions extends D3BaseViewOptions {

  /** 
   * @private 
   * Use D3LineViewOptions.builder()
   * 
   * @param {D3LineViewOptionsBuilder} builder The builder 
   */
  constructor(builder) {
    super(builder);

    /**
     * Whether to disable the X axis buttons on the view's footer.
     * Default: false
     * @type {Boolean}
     */
    this.disableXAxisBtns = builder._disableXAxisBtns;

    /**
     * Whether to disable the Y axis buttons on the view's footer.
     */
    this.disableYAxisBtns = builder._disableYAxisBtns;

    /**
     * Whether to sync the plot selections between the the upper and 
     *    lower sub views.
     * Default: false
     * @type {Boolean}
     */
    this.syncSubViewsSelections = builder._syncSubViewsSelections;

    /**
     * Whether to sync the upper and 
     *    lower sub views Y axis scale, 'log' or 'linear', when toggling
     *    the X axis buttons in the view's footer.
     * Default: false
     * @type {Boolean}
     */
    this.syncXAxisScale = builder._syncXAxisScale;

    /**
     * Whether to sync the upper and 
     *    lower sub views Y axis scale, 'log' or 'linear', when toggling
     *    the Y axis buttons in the view's footer.
     * Default: false
     * @type {Boolean}
     */
    this.syncYAxisScale = builder._syncYAxisScale;

    /**
     * The X axis scale: 'log' || 'linear'
     * NOTE: Overriden by D3LineSubViewOptions.xAxisScale if 
     *    syncXAxisScale is false.
     * Default: 'log'
     * @type {String}
     */
    this.xAxisScale = builder._xAxisScale;

    /**
     * The Y axis scale: 'log' || 'linear'
     * NOTE: Overriden by D3LineSubViewOptions.yAxisScale if 
     *    syncYAxisScale is false.
     * Default: 'log'
     * @type {String}
     */
    this.yAxisScale =  builder._yAxisScale;

    /* Make immutable */
    if (new.target == D3LineViewOptions) Object.freeze(this);
  }

  /**
   * @override 
   * Return a new D3LineViewOptions instance with default options 
   */
  static withDefaults() {
    return D3LineViewOptions.builder().build();
  }

  /**
   * @override 
   * Return a new D3LineViewOptionsBuilder
   */
  static builder() {
    return new D3LineViewOptionsBuilder(); 
  }

}
