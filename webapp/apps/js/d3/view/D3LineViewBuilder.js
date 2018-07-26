
import D3BaseViewBuilder from './D3BaseViewBuilder.js';
import D3LineSubViewOptions from '../options/D3LineSubViewOptions.js';
import D3LineViewOptions from '../options/D3LineViewOptions.js';
import D3LineView from './D3LineView.js';

/**
 * @fileoverview Builder for D3LineView.
 * 
 * Use D3LineView.builder() for new instance of builder.
 * 
 * @class D3LineViewBuilder
 * @extends D3BaseViewBuilder
 * @author Brandon Clayton
 */
export default class D3LineViewBuilder extends D3BaseViewBuilder { 

  /** @private */
  constructor() {
    super();
  }

  /**
   * Returns a new D3LineView instance
   */
  build() {
    return new D3LineView(this);
  }

  /**
   * @override
   * @private
   * Set the default line view options
   */
  _setDefaultViewOptions() {
    /** @type {D3LineViewOptions} */
    this._viewOptions = D3LineViewOptions.withDefaults();
    /** @type {D3LineSubViewOptions} */
    this._upperSubViewOptions = D3LineSubViewOptions.upperWithDefaults();
    /** @type {D3LineSubViewOptions} */
    this._lowerSubViewOptions = D3LineSubViewOptions.lowerWithDefaults();
  }

}
