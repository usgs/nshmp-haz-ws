
import D3BaseSubViewOptions from '../options/D3BaseSubViewOptions.js';
import Preconditions from '../../error/Preconditions.js';

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
    Preconditions.checkArgumentInstanceOfHTMLElement(containerEl);
    Preconditions.checkArgumentInstanceOf(options, D3BaseSubViewOptions);

    /** @type {HTMLElement} Container element to append sub view */
    this.containerEl = containerEl;
    /** @type {D3BaseSubViewOptions} Sub view options */
    this.options = options;

    /** @type {Number} The SVG view box height in px */
    this.svgHeight = this.options.plotHeight - 
        this.options.marginTop - this.options.marginBottom;
    /** @type {Number} The SVG view box width in px */
    this.svgWidth = this.options.plotWidth - 
        this.options.marginLeft - this.options.marginRight;
    
    /** @type {Number} Plot height in px */
    this.plotHeight = this.svgHeight - 
        this.options.paddingBottom - this.options.paddingTop;
    /** @type {Number} Plot width in px */
    this.plotWidth = this.svgWidth - 
        this.options.paddingLeft - this.options.paddingRight;
      
    /** @type {HTMLElement}  The sub view element */
    this.subViewBodyEl = this._createSubView();
    /** @type {BaseSubViewSVGEls} SVG elements */
    this.svg = this._createSVGStructrue();
  }

  /**
   * @package
   * Create the SVG structure for the sub view.
   * 
   * @returns {BaseSubViewSVGEls} The SVG elements.
   * 
   * @typedef {Object} BaseSubViewSVGEls - The base SVG elements
   * @property {SVGElement} innerPlotEl The inner plot group element
   * @property {SVGElement} outerPlotEl The outer plot group element
   * @property {SVGElement} svgEl The main SVG element
   * @property {SVGElement} tooltipEl The tooltip group element
   * @property {SVGElement} tooltipForeignObjectEl The tooltip foreign object
   * @property {SVGElement} tooltipTableEl The tooltip entries
   */
  _createSVGStructrue() {
    let svgD3 = d3.select(this.subViewBodyEl) 
        .append('svg')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ` +
            `${this.options.plotWidth} ${this.options.plotHeight}`);
    
    let outerPlotD3 = svgD3.append('g')
        .attr('class', 'outer-plot')
        .attr('transform', `translate(` + 
            `${this.options.marginLeft}, ${this.options.marginTop})`);
    
    let outerFrameD3 = outerPlotD3.append('rect')
        .attr('height', this.svgHeight)
        .attr('width', this.svgWidth)
        .attr('fill', 'none');
    
    let innerPlotD3 = outerPlotD3.append('g')
        .attr('class', 'inner-plot')
        .attr('transform', `translate(` + 
            `${this.options.paddingLeft}, ${this.options.paddingTop})`);
    
    let innerFrameD3 = innerPlotD3.append('rect')
        .attr('height', this.plotHeight)
        .attr('width', this.plotWidth)
        .attr('fill', 'none');
    
    /* Tooltip Group */
    let tooltipD3 = innerPlotD3.append('g')
        .attr('class', 'd3-tooltip');

    let tooltipForeignObjectD3 = tooltipD3.append('foreignObject');
    let tooltipTableD3 = tooltipForeignObjectD3.append('xhtml:table');

    let els = {
      innerPlotEl: innerPlotD3.node(),
      innerFrameEl: innerFrameD3.node(),
      outerPlotEl: outerPlotD3.node(),
      outerFrameEl: outerFrameD3.node(),
      svgEl: svgD3.node(),
      tooltipEl: tooltipD3.node(),
      tooltipForeignObjectEl: tooltipForeignObjectD3.node(),
      tooltipTableEl: tooltipTableD3.node(),
    };

    for (let el of Object.values(els)) {
      Preconditions.checkNotUndefined(el);
      Preconditions.checkState(
        el instanceof HTMLElement || el instanceof SVGElement,
        'Element not defined');
    }

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
