
import D3BaseViewOptions from './D3BaseViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Builder for D3BaseViewOptions
 * 
 * Use D3BaseViewOptions.builder() for new instance of builder.
 * 
 * @class D3BaseViewOptionsBuilder
 * @author Brandon Clayton
 */
export default class D3BaseViewOptionsBuilder {
  
  /** @private */
  constructor() {
    this._viewSizeMin =  'col-sm-12 col-md-6';
    this._viewSizeMinCenter = 'col-sm-offset-1 col-sm-10 ' + 
        'col-xl-offset-2 col-xl-8 col-xxl-offset-3 col-xxl-6';
    this._viewSizeMax = 'col-sm-12 col-xl-offset-1 col-xl-10 ' +
        'col-xxl-offset-2 col-xxl-8';
    this._viewSizeDefault = 'max';
  }

  /** 
   * Return new D3BaseViewOptions instance 
   */
  build() {
    return new D3BaseViewOptions(this);
  }

  /**
   * Set the D3BaseView view size
   * 
   * @param {String} size The view size, either: 
   *    'min' || 'minCenter' || 'max' 
   */
  viewSize(size) {
    NshmpError.checkArgument(
        size == 'min' || size == 'minCenter' || size == 'max',
        `View size [${size}] not supported`);
    this._viewSizeDefault = size;
    return this;
  }

  /**
   * Set the Bootstrap column size when viewSize is'min'
   *  
   * @param {String} size The Bootstrap column size with 
   *    viewSize is 'min'
   */
  viewSizeMin(size) {
    NshmpError.checkArgumentString(size);
    this._viewSizeMin = size;
    return this;
  }

  /**
   * Set the Bootstrap column size when viewSize is'minCenter'
   *  
   * @param {String} size The Bootstrap column size with 
   *    viewSize is 'minCenter'
   */
  viewSizeMinCenter(size) {
    NshmpError.checkArgumentString(size);
    this._viewSizeMinCenter = size;
    return this;
  }

  /**
   * Set the Bootstrap column size when viewSize is'max'
   *  
   * @param {String} size The Bootstrap column size with 
   *    viewSize is 'max'
   */
  viewSizeMax(size) {
    NshmpError.checkArgumentString(size);
    this._viewSizeMax = size;
    return this;
  }

}
