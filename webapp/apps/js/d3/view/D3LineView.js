
import D3BaseView from './D3BaseView.js';
import { D3BaseViewBuilder } from './D3BaseView.js';
import D3LineSubView from './D3LineSubView.js';
import D3LineSubViewOptions from '../options/D3LineSubViewOptions.js';
import D3LineViewOptions from '../options/D3LineViewOptions.js';
import Preconditions from '../../error/Preconditions.js';

/**
 * @fileoverview Create a view for line plots. The view can 
 *    contain an upper and lower D3LineSubView for multiple SVG
 *    plots in a single D3LineView.
 * 
 * Must use D3LineView.builder() to create a D3LineView instance.
 * See D3LineViewBuilder.
 * 
 * @class D3LineView
 * @extends D3BaseView
 * @author Brandon Clayton
 */
export default class D3LineView extends D3BaseView {

  /**
   * @private
   * Must use D3LineView.builder() to create new instance of D3LineView
   * 
   * @param {D3LineViewBuilder} builder The builder
   */
  constructor(builder) {
    super(builder);

    /* Update types */
    /** @type {D3LineSubView} Lower sub view */
    this.lowerSubView;
    /** @type {D3LineSubView} Upper sub view */
    this.upperSubView;
    /** @type {D3LineView~LineViewFooterEls} */
    this.viewFooter;
    /** @type {D3LineViewOptions} */
    this.viewOptions;
  }

  /**
   *  Get the X axis scale based on the D3LineViewOptions.synXAxisScale 
   *    and D3LineSubViewOptions.xAxisScale.
   * 
   * @param {D3LineSubView} subView 
   * @returns {String} The X axis scale: 'log' || 'linear'
   */
  getXAxisScale(subView) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);

    return this.viewOptions.syncXAxisScale ? this.viewOptions.xAxisScale :
        subView.options.xAxisScale;
  }
  /**
   *  Get the Y axis scale based on the D3LineViewOptions.synYAxisScale 
   *    and D3LineSubViewOptions.yAxisScale.
   * 
   * @param {D3LineSubView} subView 
   * @returns {String} The Y axis scale: 'log' || 'linear'
   */
  getYAxisScale(subView) {
    Preconditions.checkArgumentInstanceOf(subView, D3LineSubView);

    return this.viewOptions.syncYAxisScale ? this.viewOptions.yAxisScale :
        subView.options.yAxisScale;
  }

  /**
   * @override
   * Return a new D3LineViewBuilder
   * 
   * @returns {D3LineViewBuilder} new Builder
   */
  static builder() {
    return new D3LineViewBuilder();
  }

  /**
   * @private
   * Create the X axis buttons on the view's footer.
   */
  _addXAxisBtns(footer) {
    let xAxisBtnEl = footer.btnToolbarEl.querySelector('.x-axis-btns');
    let xLinearBtnEl = xAxisBtnEl.querySelector('.x-linear-btn');
    let xLogBtnEl = xAxisBtnEl.querySelector('.x-log-btn');
    
    if (this.viewOptions.disableXAxisBtns) {
      xLinearBtnEl.setAttribute('disabled', 'disabled');
      xLogBtnEl.setAttribute('disabled', 'disabled'); 
    }

    if (this.viewOptions.syncXAxisScale) {
      let xScaleEl = this.viewOptions.xAxisScale == 'log' ?
          xLogBtnEl : xLinearBtnEl;
      
      xScaleEl.classList.add('active');
    } else {
      let xScaleEl = this.upperSubView.options.xAxisScale == 'log' ?
          xLogBtnEl : xLinearBtnEl;
        
      xScaleEl.classList.add('active');
    }

    let els = {
      xAxisBtnEl: xAxisBtnEl,
      xLinearBtnEl: xLinearBtnEl,
      xLogBtnEl: xLogBtnEl
    };
    return els;
  }

  /**
   * @private
   * Create the Y axis buttons on the view's footer
   */
  _addYAxisBtns(footer) {
    let yAxisBtnEl = footer.btnToolbarEl.querySelector('.y-axis-btns');
    let yLinearBtnEl = yAxisBtnEl.querySelector('.y-linear-btn');
    let yLogBtnEl = yAxisBtnEl.querySelector('.y-log-btn');
    
    if (this.viewOptions.disableYAxisBtns) {
      yLinearBtnEl.setAttribute('disabled', 'disabled');
      yLogBtnEl.setAttribute('disabled', 'disabled'); 
    }

    if (this.viewOptions.syncYAxisScale) {
      let yScaleEl = this.viewOptions.yAxisScale == 'log' ?
          yLogBtnEl : yLinearBtnEl;
      
      yScaleEl.classList.add('active');
    } else {
      let yScaleEl = this.upperSubView.options.yAxisScale == 'log' ?
          yLogBtnEl : yLinearBtnEl;
        
      yScaleEl.classList.add('active');
    }

    let els = {
      yAxisBtnEl: yAxisBtnEl,
      yLinearBtnEl: yLinearBtnEl,
      yLogBtnEl: yLogBtnEl
    };
    return els;
  }

  /**
   * @override
   * @package
   * Create the sub views.
   * 
   * @param {HTMLElement} el Container element to append sub view
   * @param {D3LineSubViewOptions} options Sub view options
   * @returns {D3LineSubView} The line sub view
   */
  _createSubView(el, options) {
    return new D3LineSubView(el, options);
  }

  /**
   * @override
   * @package
   * Create the D3LineView footer.
   * 
   * @return {LineViewFooterEls} The elements associated with the footer
   * @typedef {Object} D3LineView~LineViewFooterEls - The view footer elements
   * @property {HTMLElement} btnToolbarEl The footer button toolbar element 
   * @property {HTMLElement} dataBtnEl The 'Data' button element
   * @property {HTMLElement} footerEl The view footer element
   * @property {HTMLElement} metadataBtnEl The 'Metadata' button element
   * @property {HTMLElement} plotBtnEl The 'Plot' button element
   * @property {HTMLElement} saveMenuEl The save menu element
   * @property {HTMLElement} viewSwitchBtnEls The plot, data, metadata button
   *    group element
   * @property {HTMLElement} xAxisBtnEl The X axis button element
   * @property {HTMLElement} xLinearBtnEl The X axis linear button
   * @property {HTMLElement} xLogBtnEl The X axis log button
   * @property {HTMLElement} yAxisBtnEl The Y axis button element
   * @property {HTMLElement} yLinearBtnEl The Y axis linear button
   * @property {HTMLElement} yLogBtnEl The Y axis log button
   */
  _createViewFooter() {
    let footer = super._createViewFooter();

    let xAxisEls = this._addXAxisBtns(footer);
    footer.xAxisBtnEl = xAxisEls.xAxisBtnEl;
    footer.xLinearBtnEl = xAxisEls.xLinearBtnEl;
    footer.xLogBtnEl = xAxisEls.xLogBtnEl;

    let yAxisEls = this._addYAxisBtns(footer);
    footer.yAxisBtnEl = yAxisEls.yAxisBtnEl;
    footer.yLinearBtnEl = yAxisEls.yLinearBtnEl;
    footer.yLogBtnEl = yAxisEls.yLogBtnEl;

    for (let el of Object.values(footer)) {
      Preconditions.checkStateInstanceOfHTMLElement(el);
      Preconditions.checkNotUndefined(el);
    }

    return footer;
  }

  /**
   * @override
   * The view footer buttons
   */
  _viewFooterButtons() {
    let buttons = [
      {
        class: 'x-axis-btns',
        footerBtnGroupColSize: 'col-xs-3',
        btnGroupColSize: 'col-xs-12',
        btns: [
          {
            name: 'x-axis-x',
            value: 'linear',
            text: 'X: Linear',
            class: 'x-linear-btn',
          }, {
            name: 'x-axis-y',
            value: 'log',
            text: 'X: Log',
            class: 'x-log-btn',
          }
        ]
      }, {
        class: 'y-axis-btns',
        footerBtnGroupColSize: 'col-xs-3',
        btnGroupColSize: 'col-xs-12',
        btns: [
          {
            name: 'y-axis-x',
            value: 'linear',
            text: 'Y: Linear',
            class: 'y-linear-btn',
          }, {
            name: 'y-axis-y',
            value: 'log',
            text: 'Y: Log',
            class: 'y-log-btn',
          }
        ]
      }, {
        class: 'plot-data-btns',
        footerBtnGroupColSize: 'col-xs-6',
        btnGroupColSize: 'col-xs-12',
        btns: [
          {
            name: 'plot',
            value: 'plot',
            text: 'Plot',
            class: 'plot-btn',
          }, {
            name: 'data',
            value: 'data',
            text: 'Data',
            class: 'data-btn',
          }, {
            name: 'metadata',
            value: 'metadata',
            text: 'Metadata',
            class: 'metadata-btn',
          }
        ]
      } 
    ];

    return buttons;
  }

}

/**
 * @fileoverview Builder for D3LineView.
 * 
 * Use D3LineView.builder() for new instance of builder.
 * 
 * @class D3LineViewBuilder
 * @extends D3BaseViewBuilder
 * @author Brandon Clayton
 */
export class D3LineViewBuilder extends D3BaseViewBuilder { 

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
