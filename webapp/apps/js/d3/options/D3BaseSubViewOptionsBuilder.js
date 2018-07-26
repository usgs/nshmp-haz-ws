
import D3BaseSubViewOptions from './D3BaseSubViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Builder for D3BaseSubViewOptions
 * 
 * Use D3BaseSubViewOptions.lowerBuilder() or
 *    D3BaseSubViewOptions.upperBuilder() to get new instance of builder.
 * 
 * @class D3SubViewOptionsBuilder
 * @author Brandon Clayton
 */
export default class D3BaseSubViewOptionsBuilder {

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
