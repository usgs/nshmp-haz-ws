
import D3BaseViewOptionsBuilder from './D3BaseViewOptionsBuilder.js';
import D3LineViewOptions from './D3LineViewOptions.js';
import NshmpError from '../../error/NshmpError.js';

/**
 * @fileoverview Builder for D3LineViewOptions.
 * 
 * Use D3LineViewOptions.builder() for new instance of builder.
 * 
 * @class D3LineViewOptionsBuilder
 * @extends D3BaseViewOptionsBuilder
 * @author Brandon Clayton
 */
export default class D3LineViewOptionsBuilder extends D3BaseViewOptionsBuilder { 
  
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
      NshmpError.checkArgumentString(scale);
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
      NshmpError.checkArgumentString(scale);
      scale = scale.toLowerCase();
      NshmpError.checkArgument(
          scale == 'log' || scale == 'linear',
          `Y axis scale [${scale}] not supported`);
      this._yAxisScale = scale;
    }

    return this;
  }

}
