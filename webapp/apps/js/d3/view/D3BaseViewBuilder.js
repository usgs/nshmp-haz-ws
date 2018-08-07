
import D3BaseView from './D3BaseView.js';
import D3BaseSubViewOptions from '../options/D3BaseSubViewOptions.js';
import D3BaseViewOptions from '../options/D3BaseViewOptions.js';
import Preconditions from '../../error/Preconditions.js';

/**
 * @fileoverview Builder for D3BaseView.
 * 
 * Use D3BaseView.builder() for new instance of builder.
 * 
 * @class D3BaseViewBuilder
 * @author Brandon Clayton
 */
export default class D3BaseViewBuilder {

  /** @private */
  constructor() {
    this._setDefaultViewOptions();

    this._defaultHeaderOptions = {
      addGridLineToggle: true,
      addLegendToggle: true,
    };

    this._defaultFooterOptions = {
      addSaveMenu: true,
    };

    /** @type {HTMLElement} */
    this._containerEl = undefined;
    /** @type {Boolean} */
    this._addHeader = false;
    /** @type {Boolean} */
    this._addFooter = false;
    /** @type {Boolean} */
    this._addLowerSubView = false;

    this._headerOptions = undefined;
    this._footerOptions = undefined;
  }

  /**
   * Return a new D3BaseView 
   */
  build() {
    Preconditions.checkNotUndefined(
        this._containerEl,
        'Container element not set');
    return new D3BaseView(this);
  }

  /**
   * Add a lower sub view; adds the ability to have an upper and lower 
   *    plot in a single view.
   * 
   * Default D3BaseSubViewOptions are applied from
   *    D3BaseSubViewOptions.lowerWithDefaults().
   * 
   * Use Builder.setLowerSubViewOptions to set custom settings.
   */
  addLowerSubView() {
    this._addLowerSubView = true;
    return this;
  }

  /**
   * Add a footer to the view. Default footer consists of a:
   *    - button group to switch between a plot, data, and 
   *        metadata view
   *    - save menu to save the data and figures
   *  
   * @param {Object} options The footer options. 
   */
  addViewFooter(options = {}) {
    this._footerOptions = Object.assign(
        {}, 
        this._defaultFooterOptions, 
        options);
    this._addFooter = true;
    return this;
  }

  /**
   * Add a header to the view. Default header consists of a:
   *    - title
   *    - resize toggle to resize the view
   * 
   * Use D3BaseView.setTitle to set the title for the panel header
   *    and plot title.
   *  
   * @param {Object} options The header options.
   */
  addViewHeader(options = {}) {
    this._headerOptions = Object.assign(
        {}, 
        this._defaultHeaderOptions, 
        options);
    this._addHeader = true;
    return this;
  }

  /**
   * Set the container element, where the view will be appended to.
   * 
   * @param {HTMLElement} el The container element to put the view. 
   */
  setContainerEl(el) {
    Preconditions.checkArgumentInstanceOfHTMLElement(el);
    this._containerEl = el;
    return this;
  }

  /**
   * Set the lower sub view options.
   * 
   * @param {D3BaseSubViewOptions} options The lower sub view options. 
   */
  setLowerSubViewOptions(options) {
    Preconditions.checkArgumentInstanceOf(options, D3BaseSubViewOptions);
    this._lowerSubViewOptions = options;
    return this;
  }

  /**
   * Set the upper sub view options.
   * 
   * @param {D3BaseSubViewOptions} options The upper sub view options.
   */
  setUpperSubViewOptions(options) {
    Preconditions.checkArgumentInstanceOf(options, D3BaseSubViewOptions);
    this._upperSubViewOptions = options;
    return this;
  }

  /**
   * Set the view options.
   * 
   * @param {D3BaseViewOptions} options The view options.
   */
  setViewOptions(options) {
    Preconditions.checkArgumentInstanceOf(options, D3BaseViewOptions);
    this._viewOptions = options;
    return this;
  }

  /**
   * @private
   * Set the default view options
   */
  _setDefaultViewOptions() {
    /** @type {D3BaseViewOptions} */
    this._viewOptions = D3BaseViewOptions.withDefaults();
    /** @type {D3BaseSubViewOptions} */
    this._upperSubViewOptions = D3BaseSubViewOptions.upperWithDefaults();
    /** @type {D3BaseSubViewOptions} */
    this._lowerSubViewOptions = D3BaseSubViewOptions.lowerWithDefaults();
  }

}
