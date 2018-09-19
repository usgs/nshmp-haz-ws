
import { D3BaseSubView } from './D3BaseSubView.js';
import { D3LineSubViewOptions } from '../options/D3LineSubViewOptions.js';

import { Preconditions } from '../../error/Preconditions.js';

/**
 * @package
 * @fileoverview Create a sub view for a D3LineView. Adds the 
 *    line plot SVG structure for a line plot.
 * 
 * @class D3LineSubView
 * @extends D3BaseSubView
 * @author Brandon Clayton 
 */
export class D3LineSubView extends D3BaseSubView {

  /**
   * Create a new sub view for D3LineView
   * 
   * @param {HTMLElement} containerEl Container element to append sub view
   * @param {D3LineSubViewOptions} options The sub view options
   */
  constructor(containerEl, options) {
    super(containerEl, options);

    /* Update types */
    /** @type {D3LineSubViewSVGEls} Line plot SVG elements */
    this.svg;
    /** @type {D3LineSubViewOptions} Sub view options for line plot */
    this.options;
  }

  /**
   * @override
   * @package
   * Create the sub view SVG structure for a line plot.
   * 
   * @returns {D3LineSubViewSVGEls} The SVG elements
   * 
   * @typedef {Object} D3LineSubViewSVGEls - The line plot SVG elements
   * @property {SVGElement} dataContainerEl The data container group element
   * @property {SVGElement} gridLinesEl The grid lines group element 
   * @property {SVGElement} legendEl The legend group element
   * @property {SVGElement} legendForeignObjectEl The legend foreign object
   * @property {SVGElement} legendTableEl The legend table for entries
   * @property {SVGElement} innerPlotEl The inner plot group element
   * @property {SVGElement} outerPlotEl The outer plot group element
   * @property {SVGElement} svgEl The main SVG element
   * @property {SVGElement} tooltipEl The tooltip group element
   * @property {SVGElement} tooltipForeignObjectEl The tooltip foreign object
   * @property {SVGElement} tooltipTableEl The tooltip entries
   * @property {SVGElement} xAxisEl The X axis group element
   * @property {SVGElement} xGridLinesEl The X axis grid lines group element
   * @property {SVGElement} xLabelEl The X label group element
   * @property {SVGElement} xTickMarksEl The Y tick marks group element
   * @property {SVGElement} yAxisEl The Y axis group element
   * @property {SVGElement} yGridLinesEl The Y axis grid lines group element
   * @property {SVGElement} yLabelEl The Y label group element
   * @property {SVGElement} yTickMarksEl The Y tick marks group element
   */
  _createSVGStructrue() {
    let svg = super._createSVGStructrue();
    let svgEl = svg.svgEl;
    let outerPlotEl = svg.outerPlotEl; 
    let innerPlotEl = svg.innerPlotEl;
    let tooltipEl = svg.tooltipEl;

    /* Grid Lines */
    let gridLinesD3 = d3.select(innerPlotEl)
        .append('g')
        .attr('class', 'grid-lines');
    let xGridLinesD3 = gridLinesD3.append('g')
        .attr('class', 'x-grid-lines');
    let yGridLinesD3 = gridLinesD3.append('g')
        .attr('class', 'y-grid-lines');

    /* X Axis */
    let xAxisD3 = d3.select(innerPlotEl)
        .append('g')
        .attr('class', 'x-axis');
    let xTickMarksD3 = xAxisD3.append('g')
        .attr('class', 'x-tick-marks');
    let xLabelD3 = xAxisD3.append('text')
        .attr('class', 'x-label')
        .attr('fill', 'black');
    
    /* Y Axis */
    let yAxisD3 = d3.select(innerPlotEl)
        .append('g')
        .attr('class', 'y-axis');
    let yTickMarksD3 = yAxisD3.append('g')
        .attr('class', 'y-tick-marks');
    let yLabelD3 = yAxisD3.append('text')
        .attr('class', 'y-label')
        .attr('fill', 'black')
        .attr('transform', 'rotate(-90)');

    /* Data Container Group */
    let dataContainerD3 = d3.select(innerPlotEl)
        .append('g')
        .attr('class', 'data-container-group');

    /* Legend Group */
    let legendD3 = d3.select(innerPlotEl)
        .append('g')
        .attr('class', 'legend')
        .style('line-height', '1.5');

    let legendForeignObjectD3 = legendD3.append('foreignObject');

    let legendTableD3 = legendForeignObjectD3
        .append('xhtml:table')
        .attr('xmlns', 'http://www.w3.org/1999/xhtml');

    d3.select(tooltipEl).raise();

    let els = {
      dataContainerEl: dataContainerD3.node(),
      gridLinesEl: gridLinesD3.node(),
      legendEl: legendD3.node(),
      legendForeignObjectEl: legendForeignObjectD3.node(),
      legendTableEl: legendTableD3.node(),
      innerPlotEl: innerPlotEl,
      outerPlotEl: outerPlotEl,
      svgEl: svgEl,
      tooltipEl: tooltipEl, 
      tooltipForeignObjectEl: svg.tooltipForeignObjectEl,
      tooltipTableEl: svg.tooltipTableEl,
      xAxisEl: xAxisD3.node(),
      xGridLinesEl: xGridLinesD3.node(),
      xLabelEl: xLabelD3.node(),
      xTickMarksEl: xTickMarksD3.node(),
      yAxisEl: yAxisD3.node(),
      yGridLinesEl: yGridLinesD3.node(),
      yLabelEl: yLabelD3.node(),
      yTickMarksEl: yTickMarksD3.node(),
    };

    for (let el of Object.values(els)) {
      Preconditions.checkNotUndefined(el);
      Preconditions.checkState(
        el instanceof HTMLElement || el instanceof SVGElement,
        'Element not defined');
    }

    return els;
  }

}
