'use strict';

import Save from './Save.js';

/**
* @class D3View
*
* @fileoverview D3View class creates the panel in which  
*   a upper plot and lower plot can reside. Panel can consist of
*   a panel header and a panel footer. 
*
* The creation of the panel is chainable, for example, to get
*     a plot panel that consists of a header and a footer with 
*     buttons for line plotting:
*       let view = new D3View(containerEl)
*           .withHeader
*           .withLinePlotFooter();
*
* This class is the parent for the plotting classes and contains chainable
*   methods to set the follwing:
*     - Plot title
*     - Lower/upper data
*     - Lower/upper data table title
*     - Lower/upper download filename
*     - Lower/upper data series ids
*     - Lower/upper data series labels
*     - Lower/upper metadata
*     - Lower/upper X-label
*     - Lower/upper Y-label 
*
* @typedef {Object} ViewOptions
* @property {String} colSizeMin - Bootstrap column panel minimum size
* @property {String} colSizeMinCenter - Bootstrap column panel centered min size
* @property {String} colSizeMax - Bootstrap column panel max size
* @property {String} colSizeDefault - Default column size: min or max
* @property {Boolean} disableXAxisBtns - Whether to disable X axis buttons
* @property {Boolean} disableYAxisBtns - Whether to disable Y axis buttons
* @property {Boolean} plotLowerPanel - Whether a plot will exist is lower panel
* @property {Boolean} printLowerPanel - Wheter to print lower plot
* @property {Boolean} syncSelections - Whether to sync upper and lower plots
*     when clicking on data 
* @property {Boolean} syncXAxis - Whether to sync upper and lower plots
*     when clicking the X axis log and linear buttons
* @property {Boolean} syncYAxis - Whether to sync upper and lower plots
*     when clicking the Y axis log and linear buttons
* 
*
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class D3View {
  
  /**
  * @param {!HTMLElement} containerEl - DOM element to append to
  * @param {ViewOptions=} options - General options for plot panel
  * @param {PlotOptions=} plotOptionsUpper - Upper plot options
  * @param {PlotOptions=} plotOptionsLower - Lower plot options
  */
  constructor(containerEl, 
      options = {}, 
      plotOptionsUpper = {}, 
      plotOptionsLower = {}) {
    /** @type {HTMLElement} */
    this.containerEl = containerEl;
    /** @type {String} */
    this.resizeFull = 'icon resize glyphicon glyphicon-resize-full';
    /** @type {String} */
    this.resizeSmall = 'icon resize glyphicon glyphicon-resize-small';
    
    /** @type {ViewOptions} */
    this.options = {
      colSizeMin: 'col-md-6',
      colSizeMinCenter: 'col-md-offset-3 col-md-6',
      colSizeMax: 'col-md-offset-1 col-md-10',
      colSizeDefault: 'max',
      disableXAxisBtns: false,
      disableYAxisBtns: false,
      plotLowerPanel: false,
      printLowerPanel: true,
      syncSelections: false,
      syncXAxis: true,
      syncYAxis : true,
      xAxisScale: 'log',
      yAxisScale: 'log',
    };
    // Override options
    this.options = $.extend({}, this.options, options);

    let plotOptions = {
      labelFontSize: 16,
      legendLocation: 'topright',
      legendOffset: 5,
      legendPaddingX: 20,
      legendPaddingY: 15,
      legendLineBreak: 20,
      legendFontSize: 14,
      linewidth: 2.5,
      linewidthSelection: 4.5,
      marginBottom: 50,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      plotHeight: 504,
      plotWidth: 896,
      pointRadius: 3.5,
      pointRadiusSelection: 5.5,
      pointRadiusTooltip: 8.5,
      printTitle: true,
      printFooter: true,
      printFooterPadding: 20,
      printFooterLineBreak: 20,
      printFooterFontSize: 14,
      printHeight: 8.5,
      printWidth: 11,
      printPlotWidth: 10,
      printDpi: 600,
      printMarginTop: 1,
      printMarginLeft: 0,
      showData: true,
      showLegend: true,
      tickFontSize: 12,
      tickExponentFontSize: 10,
      titleFontSize: 20,
      tooltipOffset: 10,
      tooltipPadding: 10,
      tooltipText: ['Label:', 'X Value:', 'Y Value:'],
      tooltipXToExponent: false,
      tooltipYToExponent: false,
      transitionDuration: 500,
      xAxisNice: true,
      xAxisScale: this.options.xAxisScale,
      xLabelPadding: 8,
      xTickMarks: 10,
      xAxisLocation: 'bottom',
      yAxisNice: true,
      yAxisScale: this.options.yAxisScale,
      yLabelPadding: 10,
      yAxisLocation: 'left',
      yTickMarks: 10,
    };

    /** @type {HTMLElement} */
    this.plotFooterEl = undefined; 
    /** @type {HTMLElement} */
    this.plotHeaderEl = undefined; 
    /** @type {HTMLElement} */
    this.plotResizeEl = undefined; 
    /** @type {HTMLElement} */
    this.plotTitleEl = undefined; 
    /** @type {HTMLElement} */
    this.saveAsMenuEl = undefined; 
    
    /** @type {HTMLElement} */
    this.el = this.createPlotPanel();
    this.createSvgStructure();
    /** @type {HTMLElement} */
    this.plotBodyEl = this.el.querySelector('.panel-outer'); 
    /** @type {HTMLElement} */
    this.plotPanelEl = this.el.querySelector('.panel');
    /** @type {HTMLElement} */
    this.tableEl = this.plotBodyEl.querySelector('.data-table');
    
    let lowerPanelEl = this.el.querySelector('.panel-lower');
    /** @type {Panel} */
    this.lowerPanel = {
      allDataEl: lowerPanelEl.querySelector('.all-data'),
      color: d3.schemeCategory10,
      data: undefined,
      dataFilename: 'data',
      dataTableTitle: 'Data',
      ids: undefined,
      labels: undefined,
      legendEl: lowerPanelEl.querySelector('.legend'),
      line: undefined,
      metadata: undefined,
      options: $.extend({}, plotOptions, plotOptionsLower),
      panelId: 'lower-panel',
      plotBodyEl: lowerPanelEl,
      plotEl: lowerPanelEl.querySelector('.plot'),
      plotFilename: 'figure',
      plotHeight: undefined,
      plotWidth: undefined,
      plotScale: 1,
      svgEl: lowerPanelEl.querySelector('svg'),
      svgHeight: undefined,
      svgWidth: undefined,
      tooltipEl: lowerPanelEl.querySelector('.d3-tooltip'),
      xAxisEl: lowerPanelEl.querySelector('.x-axis'),
      xBounds: undefined,
      xExtremes: undefined, 
      xLabel: 'X',
      yAxisEl: lowerPanelEl.querySelector('.y-axis'),
      yBounds: undefined,
      yExtremes: undefined, 
      yLabel: 'Y',
    };
  
    let upperPanelEl = this.el.querySelector('.panel-upper');
    /** @type {Panel} */
    this.upperPanel = {
      allDataEl: upperPanelEl.querySelector('.all-data'),
      color: d3.schemeCategory10,
      data: undefined,
      dataFilename: 'data',
      dataTableTitle: 'Data',
      ids: undefined,
      labels: undefined,
      legendEl: upperPanelEl.querySelector('.legend'),
      line: undefined,
      metadata: undefined,
      options: $.extend({}, plotOptions, plotOptionsUpper),
      panelId: 'upper-panel',
      plotBodyEl: upperPanelEl,
      plotEl: upperPanelEl.querySelector('.plot'),
      plotFilename: 'figure',
      plotHeight: undefined,
      plotWidth: undefined,
      plotScale: 1,
      svgEl: upperPanelEl.querySelector('svg'),
      svgHeight: undefined,
      svgWidth: undefined,
      tooltipEl: upperPanelEl.querySelector('.d3-tooltip'),
      xAxisEl: upperPanelEl.querySelector('.x-axis'),
      xBounds: undefined,
      xExtremes: undefined, 
      xLabel: 'X',
      yAxisEl: upperPanelEl.querySelector('.y-axis'),
      yBounds: undefined,
      yExtremes: undefined, 
      yLabel: 'Y',
    };
  
    // Update SVG view box
    this.setSvgViewBox();
  }

  /**
  * @method createDataTable
  *
  */
  createDataTable(panel) {
    if (!panel.options.showData) return;
    
    let panelDim = this.plotBodyEl.getBoundingClientRect();
   
    // Update table height and width
    d3.select(this.tableEl)
        .style('height', panelDim.height + 'px')
        .style('width', panelDim.width + 'px');
  
    d3.select(this.tableEl)
        .selectAll('.' + panel.panelId + '-tables')
        .remove();
         
    // Create table
    panel.data.forEach((dataSet, ids) => {
      let tableBodyD3 = d3.select(this.tableEl)
          .append('table')
          .attr('class', 'table table-bordered table-condensed ' + 
              panel.panelId + '-tables')
          .append('tbody')
          .attr('class', 'data-table-body')
      
      if(ids == 0){
        tableBodyD3.append('tr')
            .append('th')
            .attr('class', 'data-table-title')
            .attr('colspan', dataSet.length+1)
            .text(panel.dataTableTitle);
      }
      
      tableBodyD3.append('tr')
          .append('th')
          .attr('colspan', dataSet.length+1)
          .text(panel.labels[ids]);
      
      let tableRowX = tableBodyD3.append('tr');
      tableRowX.append('td')
          .attr('nowrap', true)
          .text(panel.options.tooltipText[1]);
      
      let tableRowY = tableBodyD3.append('tr');
      tableRowY.append('td')
          .attr('nowrap', true)
          .text(panel.options.tooltipText[2]);
      
      dataSet.forEach((dataPair, idp) => {
        tableRowX.append('td')
            .text(dataPair[0]);
        tableRowY.append('td')
            .text(dataPair[1]);
      })
    });
    
    $(window).resize(() => {
      let panelDimResize = this.plotBodyEl.getBoundingClientRect();
      // Update table height and width
      d3.select(this.tableEl)
          .style('height', panelDimResize.height + 'px')
          .style('width', panelDimResize.width + 'px');
    });
  }

  /**
  * @method createPlotPanel
  * 
  * Creates the general plot panel with SVG elements for a upper 
  *     and lower plot. 
  * @return {D3View} - Return the class instance to be chainable
  */
  createPlotPanel() {
    if (this.options.colSizeDefault == 'min') {
      this.colSize = this.options.colSizeMin;
    } else { 
      this.colSize = this.options.colSizeMax; 
    }

    let containerD3 = d3.select(this.containerEl);
        
    let elD3 = containerD3.append('div')
        .attr('class', 'D3View hidden ' + this.colSize)
        
    let plotPanelD3 = elD3.append('div')
        .attr('class', 'panel panel-default');

    let panelBodyD3 = plotPanelD3.append('div')
        .attr('class', 'panel-body panel-outer');
    
    panelBodyD3.append('div')
        .attr('class', 'panel-body panel-upper');
    
    panelBodyD3.append('div')
        .attr('class', 'panel-body panel-lower')
        .classed('hidden', !this.options.plotLowerPanel);
    
    panelBodyD3.append('div')
        .attr('class', 'data-table hidden');
     
    return elD3.node(); 
  }

  /**
  * @method createSvgStructure
  */
  createSvgStructure() {
    let svgD3 = d3.select(this.el)
        .select('.panel-outer')
        .selectAll('.panel-body')
        .append('svg')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('preserveAspectRatio', 'xMinYMin meet');
    
    let plotD3  = svgD3.append('g')
        .attr('class', 'plot');

    let dataD3 = plotD3.append('g')
        .attr('class', 'all-data');
    
    // X-axis
    let xD3 = plotD3.append('g')
        .attr('class','x-axis');
    xD3.append('g')
        .attr('class','x-tick')
        .append('text')
        .attr('class', 'x-label')
        .attr('fill', 'black');
    
    // Y-axis
    let yD3 = plotD3.append('g')
        .attr('class', 'y-axis');
    yD3.append('g')
        .attr('class', 'y-tick')
        .append('text')
        .attr('class', 'y-label')
        .attr('fill', 'black');
    
    plotD3.append('g')
        .attr('class', 'legend');
    
    plotD3.append('g')
        .attr('class', 'd3-tooltip');
  }

  /**
  * @method createSaveMenu
  *
  * Creates the dropup save menu in the panel footer.
  */
  createSaveMenu() {
    let saveAsD3 = d3.select(this.plotFooterEl)
        .append('span')
        .attr('class', 'dropup icon');

    saveAsD3.append('div')
        .attr('class', 'glyphicon glyphicon-save' +
            ' footer-button dropdown-toggle')
        .attr('data-toggle', 'dropdown')
        .attr('aria-hashpop', true)
        .attr('aria-expanded', true);
    
    let saveMenu = [
      { label: 'Save Figure As:', id: 'dropdown-header', class: 'plot' }, 
      { label: 'JPEG', id: 'jpeg', class: 'plot' }, 
      { label: 'PDF/Print', id: 'pdf', class: 'plot' }, 
      { label: 'PNG', id: 'png', class: 'plot' },
      { label: 'SVG', id: 'svg', class: 'plot' },
      { label: 'Save Data As:', id: 'dropdown-header', class: 'data' },
      { label: 'CSV', id: 'csv', class: 'data' },
      { label: 'TSV', id: 'tsv', class: 'data' }
    ];

    let saveListD3 = saveAsD3.append('ul')
        .attr('class', 'dropdown-menu dropdown-menu-right save-as-menu')
        .attr('aria-labelledby', 'save-as-menu')
        .style('min-width', 'auto');
    saveListD3.selectAll('li')
        .data(saveMenu)
        .enter()
        .append('li')
        .html((d,i) => {
          if (d.id != 'dropdown-header') {
            return '<a id=' + d.id + ' class=' + d.class + 
                '>' +d.label + '</a>';
          }
          else return d.label;
        })
        .attr('class', (d,i) => {return d.id})
        .style('cursor', 'pointer');
    
    this.saveAsMenuEl = this.el.querySelector('.save-as-menu'); 
    
    this.onSaveMenuClick();
  }
  
  /**
  * @method hide
  *
  * Hide or show the plot panel
  * @param {!Boolean} toHide - Whether to hide the plot panel
  */
  hide(toHide){
    d3.select(this.el).classed('hidden', toHide);
  }
 
  /**
  * @method onPlotDataViewSwitch
  *
  */
  onPlotDataViewSwitch() {
    $(this.plotFooterEl).find('.plot-data-btns').on('click', (event) => {
      let selectedValue = $(event.target).find('input').val();
      
      if (selectedValue == 'plot'){
        d3.select(this.tableEl)
            .classed('hidden', true);
        
        d3.select(this.upperPanel.plotBodyEl)
            .classed('hidden', false);
        
        if (this.options.plotLowerPanel)
          d3.select(this.lowerPanel.plotBodyEl)
              .classed('hidden', false);
      }else{
        d3.select(this.tableEl)
            .classed('hidden', false);
        
        d3.select(this.upperPanel.plotBodyEl)
            .classed('hidden', true);
        
        if (this.options.plotLowerPanel){
          d3.select(this.lowerPanel.plotBodyEl)
              .classed('hidden', true);
        }
      }
    });
  }
  
  /**
  * @method onPanelResize
  *
  * Resizes the plot panel when the resize glyphicon is clicked
  */
  onPanelResize() {
    let nplots = d3.selectAll('.D3View') 
        .filter((d, i, els) => {
          return !d3.select(els[i]).classed('hidden')
        }).size();
    
    let isMax = d3.select(this.el)
        .classed(this.options.colSizeMax);
    
    d3.select(this.el)
        .classed(this.options.colSizeMax, false)
        .classed(this.options.colSizeMin, false)
        .classed(this.options.colSizeMinCenter, false)
    
    if (isMax){
      this.colSize = nplots == 1 ? this.options.colSizeMinCenter : 
          this.options.colSizeMin;
      d3.select(this.el)
          .classed(this.options.colSizeMinCenter, false)
          .classed(this.colSize, true);
      d3.select(this.plotResizeEl)
          .attr('class', this.resizeFull);
    }else{
      this.colSize = this.options.colSizeMax;
      d3.select(this.el)
          .classed(this.colSize, true);
      d3.select(this.plotResizeEl)
          .attr('class', this.resizeSmall);
    }
  }
  
  /**
  * @method onSaveMenuClick
  *
  */
  onSaveMenuClick() {
    $(this.saveAsMenuEl).find('a').on('click', (event) => {
      if ($(event.target).hasClass('data')) {
        Save.saveData(
            this.tableEl, this.upperPanel.dataFilename, event.target.id);
      } else {
        Save.saveFigure(
            this.upperPanel, this.plotTitleEl.textContent, event.target.id);
        if (this.options.plotLowerPanel &&
              this.options.printLowerPanel){
          Save.saveFigure(
              this.lowerPanel, this.plotTitleEl.textContent, event.target.id);
        }
      }
    });
  }

  /**
  * @method panelResize
  *
  * Resizes the plot panel
  * @param {String} colSize - String identifier to the col size to use.
  *     Possible values: min or max.
  */
  panelResize(colSize){
    d3.select(this.el)
        .classed(this.options.colSizeMax, false)
        .classed(this.options.colSizeMin, false)
        .classed(this.options.colSizeMinCenter, false)
    if (colSize == 'min'){
      d3.select(this.el)
          .classed(this.options.colSizeMin, true);
      d3.select(this.plotResizeEl)
          .classed(this.resizeSmall, false)
          .classed(this.resizeFull, true)
    }
    else{
      d3.select(this.el)
        .classed(this.options.colSizeMax, true);
      d3.select(this.plotResizeEl)
          .classed(this.resizeSmall, false)
          .classed(this.resizeFull, true)
    }
  }

  /**
  * @method setLowerData 
  *
  * Sets the lower plot data. This method is chainable.
  * @param {!Array<Array<Number, Number>>} data - The data to plot 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerData(data) {
    this.lowerPanel.data = data;
    return this;
  }

  /**
  * @method setLowerDataTableTitle
  *
  * Sets the lower data table title. This method is chainable.
  * @param {!String} title - The title for the lower data 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerDataTableTitle(title) {
    this.lowerPanel.dataTableTitle = title;
    return this;
  }

  /**
  * @method setLowerPlotFilename
  *
  * Sets the lower plot filename for download. This method is chainable.
  * @param {!String} filename - The filename for downloading 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerPlotFilename(filename) {
    this.lowerPanel.plotFilename = filename;
    return this;
  }
 
  /**
  * @method setLowerPlotIds
  *
  * Sets the lower plot ids. This method is chainable.
  * @param {!Array<String>} ids - Array of ids for each data series 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerPlotIds(ids) {
    this.lowerPanel.ids = ids;
    return this;
  }

  /**
  * @method setLowerPlotLabels
  *
  * Sets the lower plot labels. This method is chainable.
  * @param {!Array<String>} labels - Array of labels for each data series 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerPlotLabels(labels) {
    this.lowerPanel.labels = labels;
    return this;
  }

  /**
  * @method setLowerMetadata
  *
  * Sets the lower plot metadata. This method is chainable.
  * @param {!Object} metadata - Metadata for plots 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerMetadata(metadata) {
    this.lowerPanel.metadata = metadata;
    return this;
  }

  /**
  * @method setLowerXLabel
  *
  * Sets the lower plot X label. This method is chainable.
  * @param {!String} xLabel - X label 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerXLabel(xLabel) {
    this.lowerPanel.xLabel = xLabel;
    return this;
  }

  /**
  * @method setLowerYLabel
  *
  * Sets the lower plot Y label. This method is chainable.
  * @param {!String} yLabel - Y label 
  * @return {D3View} - Return the class instance to be chainable
  */
  setLowerYLabel(yLabel) {
    this.lowerPanel.yLabel = yLabel;
    return this;
  }

  /**
  * @method setPlotTitle
  *
  * Sets the plot panel header title. This method is chainable.
  * @param {!String} title - Title for plot panel
  * @return {D3View} - Return the class instance to be chainable
  */
  setPlotTitle(title) {
    this.plotTitleEl.textContent = title;  
    return this;
  }

  /**
  * @method setSvgViewBox 
  *
  * Update the view box dimensions on the SVG elements
  */
  setSvgViewBox() { 
    // Update lower plot dimensions
    this.lowerPanel.svgHeight = this.lowerPanel.options.plotHeight;
    this.lowerPanel.svgWidth = this.lowerPanel.options.plotWidth;
    this.lowerPanel.plotHeight = this.lowerPanel.svgHeight -
        this.lowerPanel.options.marginTop - 
        this.lowerPanel.options.marginBottom;
    this.lowerPanel.plotWidth = this.lowerPanel.svgWidth -
        this.lowerPanel.options.marginLeft - 
        this.lowerPanel.options.marginRight;

    d3.select(this.el)
        .select('.panel-lower')
        .select('svg')
        .attr('viewBox', '0 0 ' + this.lowerPanel.svgWidth + 
            ' ' + this.lowerPanel.svgHeight)
        .select('.plot')
        .attr('transform', 'translate(' + 
            this.lowerPanel.options.marginLeft + ',' +
            this.lowerPanel.options.marginTop +')');
    
    // Update upper plot dimension 
    this.upperPanel.svgHeight = this.upperPanel.options.plotHeight;
    this.upperPanel.svgWidth = this.upperPanel.options.plotWidth;
    this.upperPanel.plotHeight = this.upperPanel.svgHeight -
        this.upperPanel.options.marginTop - 
        this.upperPanel.options.marginBottom;
    this.upperPanel.plotWidth = this.upperPanel.svgWidth -
        this.upperPanel.options.marginLeft - 
        this.upperPanel.options.marginRight;
    
    d3.select(this.el)
        .select('.panel-upper')
        .select('svg')
        .attr('viewBox', '0 0 ' + this.upperPanel.svgWidth + 
            ' ' + this.upperPanel.svgHeight)
        .select('.plot')
        .attr('transform', 'translate(' + 
            this.upperPanel.options.marginLeft + ',' +
            this.upperPanel.options.marginTop +')');
  }
  
  /**
  * @method setUpperData 
  *
  * Sets the upper plot data. This method is chainable.
  * @param {!Array<Array<Number, Number>>} data - The data to plot 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperData(data) {
    this.upperPanel.data = data;
    return this;
  }

  /**
  * @method setUpperDataTableTitle
  *
  * Sets the upper data table title. This method is chainable.
  * @param {!String} title - The title for the upper data 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperDataTableTitle(title) {
    this.upperPanel.dataTableTitle = title;
    return this;
  }

  /**
  * @method setUpperPlotFilename
  *
  * Sets the upper plot filename for download. This method is chainable.
  * @param {!String} filename - The filename for downloading 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperPlotFilename(filename) {
    this.upperPanel.plotFilename = filename;
    return this;
  }
 
  /**
  * @method setUpperPlotIds
  *
  * Sets the upper plot ids. This method is chainable.
  * @param {!Array<String>} ids - Array of ids for each data series 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperPlotIds(ids) {
    this.upperPanel.ids = ids;
    return this;
  }

  /**
  * @method setUpperPlotLabels
  *
  * Sets the upper plot labels. This method is chainable.
  * @param {!Array<String>} labels - Array of labels for each data series 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperPlotLabels(labels) {
    this.upperPanel.labels = labels;
    return this;
  }

  /**
  * @method setUpperMetadata
  *
  * Sets the upper plot metadata. This method is chainable.
  * @param {!Object} metadata - Metadata for plots 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperMetadata(metadata) {
    this.upperPanel.metadata = metadata;
    return this;
  }

  /**
  * @method setUpperXLabel
  *
  * Sets the upper plot X label. This method is chainable.
  * @param {!String} xLabel - X label 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperXLabel(xLabel) {
    this.upperPanel.xLabel = xLabel;
    return this;
  }

  /**
  * @method setUpperYLabel
  *
  * Sets the upper plot Y label. This method is chainable.
  * @param {!String} yLabel - Y label 
  * @return {D3View} - Return the class instance to be chainable
  */
  setUpperYLabel(yLabel) {
    this.upperPanel.yLabel = yLabel;
    return this;
  }

  /**
  * @method withHeader
  *
  * Creates a header on the plot panel. This method is chainable. 
  * @return {D3View} - Return the class instance to be chainable
  */
  withPlotHeader() {
    let plotHeaderD3 = d3.select(this.plotPanelEl)
        .append('div')
        .attr('class', 'panel-heading')
        .lower();

    let plotTitleD3 = plotHeaderD3.append('h2')
        .attr('class', 'panel-title')
    
    plotTitleD3.append('div')
        .attr('class', 'plot-title')
        .attr('contenteditable', true);
        
    plotHeaderD3.append('span')
        .attr('class',() => {
          return this.colSize == this.options.colSizeMin
            ? this.resizeFull : this.resizeSmall; 
        });
    
    this.plotHeaderEl = this.el.querySelector('.panel-heading');
    this.plotResizeEl = this.el.querySelector('.resize');
    this.plotTitleEl = this.el.querySelector('.plot-title');
    
    $(this.plotResizeEl).on('click',() => { this.onPanelResize() });
    
    return this;
  }
  
  /**
  * @method withPlotFooter
  *
  * Creates the footer in the plot panel a plot/data button. 
  *     This method is chainable.
  * @return {D3View} - Return the class instance to be chainable
  */
  withPlotFooter() {
    let plotFooterD3 = d3.select(this.plotPanelEl)
        .append('div')
        .attr('class', 'panel-footer');
    
    let footerBtnsD3 = plotFooterD3.append('div')
        .attr('class', 'btn-toolbar footer-btn-toolbar')
        .attr('role', 'toolbar');
    
    let buttons = [
      {
        class: 'plot-data-btns',
        col: 'col-xs-offset-4 col-xs-4',
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
          }
        ]
      }
    ];
    
    // Create buttons  
    let xAxisD3 = footerBtnsD3.selectAll('div')
        .data(buttons)
        .enter()
        .append('div')
        .attr('class', (d, i) => {return d.col + ' footer-btn-group';})
        .append('div')
        .attr('class', (d, i) => { 
          return 'btn-group btn-group-xs btn-group-justified ' + d.class;
        })
        .attr('data-toggle', 'buttons')
        .attr('role', 'group');
    
    xAxisD3.selectAll('label')
        .data((d, i) => {return d.btns})
        .enter()
        .append('label')
        .attr('class',(d, i) => {
          return 'btn btn-xs btn-default footer-button ' + d.class
        })
        .attr('for', (d, i) => {return d.name})
        .html((d, i) => {
          return '<input type="radio" name="' + d.name + '"' +
              ' value="' + d.value + '"/> ' + d.text;
        });
    
    xAxisD3.select('.plot-btn')
        .classed('active', true);

    this.plotFooterEl = this.el.querySelector('.panel-footer');
    // Create the save menu
    this.createSaveMenu();
    // Update buttons
    this.onPlotDataViewSwitch(); 

    return this;
  }

}
