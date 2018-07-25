
import D3BaseViewOptions from './D3BaseViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

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
   * Use D3LineViewOptions.Builder
   * @param {D3LineViewOptions.Builder} builder The builder 
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
   * Return a new D3LineViewOptions.Builder
   */
  static builder() {
    return new D3LineViewOptions.Builder();
  }

  /**
   * Build D3LineViewOptions
   */
  static get Builder() {
    return class D3ViewOptionsBuilder extends D3BaseViewOptions.Builder { 
     
      /** @private */
      constructor() { 
        super();

        /** @type {Boolean} */
        this._disableXAxisBtns = false;
        /** @type {Boolean} */
        this._disableYAxisBtns= false;
        /** @type {Boolean} */
        this._syncSubViewsSelections = false;
        /** @type {Boolean} */
        this._syncXAxisScale = false;
        /** @type {Boolean} */
        this._syncYAxisScale = false;
        /** @type {String} */
        this._xAxisScale = 'log';
        /** @type {String} */
        this._yAxisScale = 'log';
      }

      /** 
       * Return new D3LineViewOptions instance 
       */
      build() {
        return new D3LineViewOptions(this);
      }

      /**
       * Whether to disable the X axis buttons on the view's footer.
       * Default: false
       * 
       * @param {Boolean} bool Whether to disable X axis buttons
       */
      disableXAxisBtns(bool) {
        NshmpError.checkArgumentBoolean(bool);
        this._disableXAxisBtns = bool;
        return this;
      }

      /**
       * Whether to disable the Y axis buttons on the view's footer.
       * Default: false
       * 
       * @param {Boolean} bool Whether to disable Y axis buttons
       */
      disableYAxisBtns(bool) {
        NshmpError.checkArgumentBoolean(bool);
        this._disableYAxisBtns = bool;
        return this;
      }

      /**
       * Whether to sync selection between the two sub views.
       * Note: The data IDs for the upper and lower sub view must be the 
       *    same to sync.
       * 
       * Default: false
       * 
       * @param {Boolean} bool Whether to sync sub views selections 
       */
      syncSubViewsSelections(bool) {
        NshmpError.checkArgumentBoolean(bool);
        this._syncSubViewsSelections = bool;
        return this;
      }

      /**
       * Choose to sync the X axis scale between the two sub views starting
       *    with a specified scale.
       * 
       * @param {Boolean} bool Whether to sync the X axis scale 
       * @param {String} scale What X axis scale to start with
       */
      syncXAxisScale(bool, scale) {
        NshmpError.checkArgumentBoolean(bool);
        this._syncXAxisScale = bool;

        if (bool) {
          scale = scale.toLowerCase();
          NshmpError.checkArgument(
              scale == 'log' || scale == 'linear',
              `X axis scale [${scale}] not supported`);
          this._xAxisScale = scale;
        }

        return this;
      }

      /**
       * Choose to sync the Y axis scale between the two sub views starting
       *    with a specified scale.
       * 
       * @param {Boolean} bool Whether to sync the Y axis scale 
       * @param {String} scale What Y axis scale to start with
       */
      syncYAxisScale(bool, scale) {
        NshmpError.checkArgumentBoolean(bool);
        this._syncYAxisScale = bool;
        
        if (bool) {
          NshmpError.checkArgument(
              scale == 'log' || scale == 'linear',
              `Y axis scale [${scale}] not supported`);
          this._yAxisScale = scale;
        }

        return this;
      }

    }

  }

}
