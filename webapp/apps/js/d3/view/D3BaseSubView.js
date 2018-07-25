
import D3BaseSubViewOptions from '../options/D3BaseSubViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @package
 * @fileoverview Create a base sub view for D3BaseView. Adds
 *    basic SVG structure for a plot.
 * 
 * @class D3BaseSubView
 * @author Brandon Clayton
 */
export default class D3BaseSubView {

  /**
   * Create new sub view.
   * 
   * @param {HTMLElement} containerEl Container element to append sub view
   * @param {D3BaseSubViewOptions} options The sub view options
   */
  constructor(containerEl, options) {
    NshmpError.checkArgument(
        containerEl instanceof HTMLElement, 
        'containerEl must be HTMLElement');

    NshmpError.checkArgument(
        options instanceof D3BaseSubViewOptions,
        'Options must be instance of D3BaseSubViewOptions');

    /** @type {HTMLElement} Container element to append sub view */
    this.containerEl = containerEl;
    /** @type {D3BaseSubViewOptions} Sub view options */
    this.options = options;

    /** @type {Number} Plot height in px */
    this.plotHeight = this.options.plotHeight - 
        this.options.marginTop - this.options.marginBottom;
    /** @type {Number} Plot width in px */
    this.plotWidth = this.options.plotWidth - 
        this.options.marginLeft - this.options.marginRight;
    
    /** @type {Number} The SVG view box height in px */
    this.svgHeight = this.options.plotHeight;
    /** @type {Number} The SVG view box width in px */
    this.svgWidth = this.options.plotWidth;
      
    /** @type {HTMLElement}  The sub view element */
    this.subViewBodyEl = this._createSubView();
    /** @type {D3BaseSubView~BaseSubViewSVGEls} SVG elements */
    this.svg = this._createSVGStructrue();
  }

  /**
   * @package
   * Create the SVG structure for the sub view.
   * 
   * @returns {BaseSubViewSVGEls} The SVG elements.
   * 
   * @typedef {Object} D3BaseSubView~BaseSubViewSVGEls - The base SVG elements
   * @property {SVGElement} plotGroupEl The plot group element
   * @property {SVGElement} svgEl The main SVG element
   */
  _createSVGStructrue() {
    let svgD3 = d3.select(this.subViewBodyEl) 
        .append('svg')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${this.svgWidth} ${this.svgHeight}`);
    
    let plotD3 = svgD3.append('g')
        .attr('class', 'plot')
        .attr('transform', `translate(` + 
            `${this.options.marginLeft}, ${this.options.marginRight})`);
    
    let els = {
      plotGroupEL: plotD3.node(),
      svgEl: svgD3.node(),
    };

    return els;
  }

  /**
   * @package
   * Create the sub view.
   * 
   * @returns {HTMLElement} The sub view element
   */
  _createSubView() {
    let subViewD3 = d3.select(this.containerEl)
        .append('div')
        .attr('class', 'panel-body');
    
    return subViewD3.node();
  }

}
