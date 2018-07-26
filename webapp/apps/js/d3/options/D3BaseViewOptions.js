
import D3BaseViewOptionsBuilder from './D3BaseViewOptionsBuilder.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Create options for D3BaseView. 
 * 
 * Use D3BaseViewOptions.builder() to customize the options or use 
 *    D3BaseViewOptions.withDefault() for default options.
 * 
 * @class D3BaseViewOptions
 * @author Brandon Clayton
 */
export default class D3BaseViewOptions {

  /**
   * @private 
   * Must use D3BaseViewOptions.builder() 
   * 
   * @param {D3BaseViewOptionsBuilder} builder The builder
   */
  constructor(builder) {
    NshmpError.checkArgument(
        builder instanceof D3BaseViewOptionsBuilder,
        'Must be an instance of D3BaseViewOptionsBuilder');

    /** 
     * The D3BaseView view size to start with, either:
     *    'min' || 'minCenter' || 'max'
     * 
     * Default value: 'max'
     * @type {String}
     */
    this.viewSizeDefault = builder._viewSizeDefault;

    /**
     * The Bootstrap column size when viewSizeDefault is 'max'
     * @type {String}
     */
    this.viewSizeMax = builder._viewSizeMax;

    /**
     * The Bootstrap column size when viewSizeDefault is 'min'
     * @type {String}
     */
    this.viewSizeMin = builder._viewSizeMin;
    
    /**
     * The Bootstrap column size when viewSizeDefault is 'minCenter'
     * @type {String}
     */
    this.viewSizeMinCenter = builder._viewSizeMinCenter;

    /* Make immutable */
    if (new.target == D3BaseViewOptions) Object.freeze(this);
  }

  /** 
   * Return a new D3BaseViewOptions instance with default options 
   */
  static withDefaults() {
    return D3BaseViewOptions.builder().build();
  }

  /** 
   * Return a new D3BaseViewOptions.Builder 
   */
  static builder() {
    return new D3BaseViewOptionsBuilder(); 
  }

}
