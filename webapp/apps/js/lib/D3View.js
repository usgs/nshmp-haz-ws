'use strict';

import D3SaveFigure from './D3SaveFigure.js';
import D3SaveData from './D3SaveData.js';
import D3SaveMetadata from './D3SaveMetadata.js';

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
    this.resizeFull = 'resize glyphicon glyphicon-resize-full';
    /** @type {String} */
    this.resizeSmall = 'resize glyphicon glyphicon-resize-small';
    
    /** 
    * @typedef {Object} ViewOptions
    * @property {String} colSizeMin - Bootstrap column panel minimum size.
    *     Default: 'col-md-6'.
    * @property {String} colSizeMinCenter - Bootstrap column panel 
    *     centered min size. 
    *     Default: 'col-md-offset-3 col-md-6'.
    * @property {String} colSizeMax - Bootstrap column panel max size.
    *     Default: 'col-md-offset-1 col-md-10'.
    * @property {String} colSizeDefault - Default column size: min or max.
    *     Default: 'max'.
    * @property {Boolean} disableXAxisBtns - Whether to disable X axis buttons.
    *     Default: false.
    * @property {Boolean} disableYAxisBtns - Whether to disable Y axis buttons.
    *     Default: false.
    * @property {Boolean} plotLowerPanel - Whether a plot will exist 
    *     is lower panel. 
    *     Default: false.
    * @property {Boolean} printLowerPanel - Wheter to print lower plot.
    *     Default: true.
    * @property {Boolean} syncSelections - Whether to sync upper and 
    *     lower plots when clicking on data. 
    *     Default: false.
    * @property {Boolean} syncXAxis - Whether to sync upper and lower plots
    *     when clicking the X axis log and linear buttons. 
    *     Default: true.
    * @property {Boolean} syncYAxis - Whether to sync upper and lower plots
    *     when clicking the Y axis log and linear buttons. 
    *     Default: true.
    * @property {String} xAxisScale - X axis scale: 'log' || 'linear' for
    *     D3LinePlot. This value is overridden with the PlotOptions value
    *     if syncXAxis is false. 
    *     Default: 'log'.
    * @property {String} yAxisScale - Y axis scale: 'log' || 'linear' for
    *     D3LinePlot. This value is overridden with the PlotOptions value
    *     if syncYAxis is false.
    *     Default: 'log'.
    */
    this.options = {
      addLegendCheckBtn: true,
      addGridLineCheckBtn: true,
      disableXAxisBtns: false,
      disableYAxisBtns: false,
      syncSelections: false,
      colSizeMin: 'col-sm-12 col-md-6',
      colSizeMinCenter: 'col-sm-offset-1 col-sm-10 col-xl-offset-2 ' 
            + 'col-xl-8 col-xxl-offset-3 col-xxl-6',
      colSizeMax: 'col-sm-12 col-xl-offset-1 col-xl-10 col-xxl-offset-2 col-xxl-8', 
      colSizeDefault: 'max',
      plotLowerPanel: false,
      printLowerPanel: true,
      syncXAxis: true,
      syncYAxis : true,
      xAxisScale: 'log',
      yAxisScale: 'log',
    };
    // Override options
    this.options = $.extend({}, this.options, options);

    /**
    * @typedef {Object} PlotOptions
    * @property {Number} labelFontSize - Font size of X/Y labels in px.
    *     Default: 16.
    * @property {String} lengendLocation - Location of legend: 'topright' ||
    *     'topleft' || 'bottomright' || 'bottomleft'. Default: 'topright'.
    * @property {Number} legendOffset - Offset around legend in px.
    *     Default: 5.
    * @property {Number} legendPaddingX - Padding inside legend in X in px.
    *     Default: 20.
    * @property {Number} legendPaddingY - Padding inside legend in Y in px.
    *     Default: 15.
    * @property {Number} legendLineBreak - Distance between each label in
    *     the legend in px. Default: 20.
    * @property {Number} legendFontSize - Font size of legend in px.
    *     Default: 14.
    * @property {Number} linewidth - Data line linewidth. Default: 2.5.
    * @property {Number} linewidthSelection - Data line linewidth when selected.
    *     Default: 4.5.
    * @property {Number} marginBottom - Margin bottom around plot in px.
    *     Default: 50.
    * @property {Number} marginLeft - Margin left around plot in px.
    *     Default: 70.
    * @property {Number} marginRight - Margin right around plot in px.
    *     Default: 20.
    * @property {Number} marginTop - Margin top around plot in px.
    *     Default: 20.
    * @property {Number} plotHeight - Plot height in px for plot aspect.
    *     Default: 504.
    * @property {Number} plotWidth - Plot width in px for plot aspect.
    *     Default: 896.
    * @property {Number} pointRadius - Data point radius. Default: 3.5.
    * @property {Number} pointRadiusSelection - Data point radius when selected.
    *     Default: 5.5.
    * @property {Number} pointRadiusTooltip - Data point radius when 
    *     selected and mouse is over data point. Default: 8.5.
    * @property {Boolean} printTitle - Whether to add the plot title to the 
    *     printed version. Default: true.
    * @property {Boolean} printFooter - Whether to add the metadata to the 
    *     printed version. Default: true.
    * @property {Number} printFooterPadding - Padding around printed footer.
    *     Default: 20.
    * @property {Number} printFooterLineBreak - Distance between each line
    *     in printed footer. Default: 20.
    * @property {Number} printFooterFontSize - Font size for printed footer. 
    *     Default: 14.
    * @property {Number} printHeight - Printed page height in inches.
    *     Default: 8.5.
    * @property {Number} printWidth - Printed page width in inches.
    *     Default: 11.
    * @property {Number} printPlotWidth - Plot width in inches for printed
    *     version. Height is determined from plot ratio.  
    *     Default: 10. 
    * @property {Number} printDpi - Print quality in dots per inch.
    *     Default: 600.
    * @property {Number} printMarginTop - Top margin in inches on page.
    *     Default: 1.
    * @property {Number} printMarginLeft - Left margin in inches on page.
    *     Default: 0.
    * @property {Boolean} showData - Whether to show data in data table view.
    *     Default: true.
    * @property {Boolean} showLegend - Whether to show legend on plot.
    *     Default: true.
    * @property {Number} tickFontSize - Font size of tick labels.
    *     Default 12.
    * @property {Number} tickExponentFontSize - Font size of the exponent
    *     in the tick label. Default: 10.
    * @property {Number} titleFontSize - Font size of the title when printed.
    *     Default: 20.
    * @property {Number} tooltipOffset - Offset in Y in px from data point for 
    *     tooltip.
    *     Default: 10.
    * @property {Number} tooltipPadding - Padding inside tooltip in px.
    *     Default: 10.
    * @property {Array<String>} tooltipText - Array of labels for the tooltip.
    *     Must be length of three and is ordered: line-label, x-label, y-label.
    *     Default: ['Label:', 'X Value:', 'Y Value:'].
    * @property {Boolean} tooltipXToExponent - Whether to put X values in 
    *     exponent form in tooltip.
    *     Default: false.
    * @property {Boolean} tooltipYToExponent - Whether to put Y values in 
    *     exponent form in tooltip.
    *     Default: false.
    * @property {Number} transitionDuration - Time in miliseconds for 
    *     transitions when updating the plot from linear to log.
    *     Default: 500.
    * @property {String} xAxisLocation - Location for the X axis: 
    *     'top' || 'bottom'.
    *     Default: 'bottom'.
    * @property {Boolean} xAxisNice - Whether to extend the X domain to round
    *     number. d3.domain.nice.
    *     Default: true.
    * @property {String} xAxisScale - X axis scale: 'log' || 'linear' for
    *     D3LinePlot. This value is overridden with the ViewOptions value
    *     if syncXAxis is true.
    *     Default: 'log'.
    * @property {Number} xLabelPadding - Padding around X-label.
    *     Default: 8.
    * @property {Number} xTickMarks - The number of tick marks in X axis. 
    *     This is only suggested as D3 may override this value.
    *     Default: 10.
    * @property {String} yAxisLocation - Location for the Y axis: 
    *     'top' || 'bottom'.
    *     Default: 'bottom'.
    * @property {Boolean} yAxisNice - Whether to extend the Y domain to round
    *     number. d3.domain.nice.
    *     Default: true.
    * @property {String} yAxisScale - Y axis scale: 'log' || 'linear' for
    *     D3LinePlot. This value is overridden with the ViewOptions value
    *     if syncYAxis is true.
    *     Default: 'log'.
    * @property {Number} yLabelPadding - Padding around Y-label.
    *     Default: 10.
    * @property {Number} yTickMarks - The number of tick marks in Y axis. 
    *     This is only suggested as D3 may override this value.
    *     Default: 10.
    */
    let plotOptions = {
      gridLinewidth: 0.75,
      gridLineColor: '#E0E0E0',
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
      plotReturnPeriod: false,
      plotZeroReferenceLine: false,
      printTitle: true,
      printCenter: true,
      printFooter: true,
      printFooterPadding: 20,
      printFooterLineBreak: 20,
      printFooterFontSize: 14,
      printPageHeight: 8.5,
      printPageWidth: 11,
      printDpi: 600,
      printMarginTop: 1,
      printMarginLeft: 0,
      referenceLineStroke: '#9E9E9E',
      referenceLineStrokeWidth: 1,
      selectionIncrement: 2,
      showData: true,
      showLegend: true,
      tickFontSize: 12,
      tickExponentFontSize: 10,
      titleFontSize: 16,
      tooltipFontSize: 12,
      tooltipOffsetX: 2,
      tooltipOffsetY: 8,
      tooltipPadding: 10,
      tooltipText: ['Label:', 'X value:', 'Y value'],
      tooltipXToExponent: false,
      tooltipYToExponent: false,
      transitionDuration: 500,
      xAxisLocation: 'bottom',
      xAxisNice: true,
      xAxisScale: this.options.xAxisScale,
      xLabelPadding: 8,
      xTickMarks: 8,
      yAxisLocation: 'left',
      yAxisNice: true,
      yAxisScale: this.options.yAxisScale,
      yLabelPadding: 10,
      yTickMarks: 6,
    };

    /** 
    * @typedef {Array<Number, Number>} SiteLocation - Use setSiteLocation 
    *   method.
    *   Format: [Logitude, Latitude]
    */
    this.siteLocation = undefined;

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
    this.metadataTableEl = this.plotBodyEl.querySelector('.metadata-table');
    /** @type {HTMLElement} */
    this.tableEl = this.plotBodyEl.querySelector('.data-table');

    this.lowerPanel = this.createPlotPanelObject('lower', 
        $.extend({}, plotOptions, plotOptionsLower));

    this.upperPanel = this.createPlotPanelObject('upper', 
        $.extend({}, plotOptions, plotOptionsUpper));
  
    // Update SVG view box
    this.setSvgViewBox();
  }

  /**
  * @method createDataTable
  *
  */
  createDataTable(panel) {
    let panelDim = this.plotBodyEl.getBoundingClientRect();
    let plotRatio = Number((panelDim.width / panelDim.height).toFixed(8)); 

    // Update table height and width
    d3.select(this.tableEl)
        .style('height', panelDim.height + 'px')
        .style('width', panelDim.width + 'px');
  
    // On window resize
    this.onResize(plotRatio);
    if (!panel.options.showData) return;
    
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
      
      let dataSetTranspose = d3.transpose(dataSet);
      dataSetTranspose.forEach((dataArray, ida) => {
        let tableRow = tableBodyD3.append('tr')
        tableRow.append('td')
            .attr('nowrap', true)
            .text(panel.options.tooltipText[ida + 1]);
        dataArray.forEach((datum) => {
          tableRow.append('td')
              .text(datum);
        });
      });
    });
  }

  /**
  * @method createMetadataTable
  *
  */
  createMetadataTable() {
    let panelDim = this.plotBodyEl.getBoundingClientRect();
    let plotRatio = Number((panelDim.width / panelDim.height).toFixed(8)); 

    // Update table height and width
    d3.select(this.metadataTableEl)
        .style('height', panelDim.height + 'px')
        .style('width', panelDim.width + 'px');
  
    // On window resize
    this.onResize(plotRatio);
   
    d3.select(this.metadataTableEl)
        .selectAll('table')
        .remove();
    
    let tableBodyD3 = d3.select(this.metadataTableEl)
        .append('table')
        .attr('class', 'table table-bordered table-condensed ')
        .append('tbody')
        .attr('class', 'metadata-table-body');
    
    for (let key in this.metadata) {
      if (key == 'url' || key == 'time') break;

      let values = this.metadata[key];
      let isArray = Array.isArray(values);
      let tableRowD3 = tableBodyD3.append('tr');
      
      tableRowD3.append('th')
          .attr('nowrap', true)
          .html(key);
      
      if (isArray) {
        tableRowD3.selectAll('tr')
            .data(values)
            .enter()
            .append('tr')
            .append('td')
            .attr('nowrap', true)
            .text((d) => { return d; });
      } else {
        tableRowD3.append('td')
            .attr('nowrap', true)
            .text(values);
      }
    }
  }

  /**
  * @method createPanelFooter
  * 
  * Create the panel footer with input buttons.
  * @param {Array<Object>} btns - Buttons to add.
  * @param {Boolean=} withSaveMenu - Whether to add save menu. 
  */
  createPanelFooter(btns, withSaveMenu = true) {
     let plotFooterD3 = d3.select(this.plotPanelEl)
        .append('div')
        .attr('class', 'panel-footer');
    
    let footerToolbarD3 = plotFooterD3.append('div')
        .attr('class', 'btn-toolbar footer-btn-toolbar')
        .attr('role', 'toolbar');

    // Create buttons
    let footerBtnsD3 = footerToolbarD3.selectAll('div')
        .data(btns)
        .enter()
        .append('div')
        .attr('class', (d, i) => {return d.col + ' footer-btn-group';})
        .append('div')
        .attr('class', (d, i) => {
          return 'btn-group btn-group-xs btn-group-justified ' + d.class;
        })
        .attr('data-toggle', 'buttons')
        .attr('role', 'group');
    
    footerBtnsD3.selectAll('label')                                                   
        .data((d, i) => {return d.btns})
        .enter()
        .append('label')
        .attr('class',(d, i) => {
          return 'btn btn-xs btn-default footer-button ' + d.class;
        })
        .attr('for', (d, i) => {return d.name})
        .html((d, i) => {
          return '<input type="radio" name="' + d.name + '"' +
              ' value="' + d.value + '"/> ' + d.text;
        });
    
    this.plotFooterEl = this.el.querySelector('.panel-footer');
    // Create the save menu
    if (withSaveMenu) this.createSaveMenu();
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
        .attr('class', 'data-table panel-table hidden');
    
    panelBodyD3.append('div')
        .attr('class', 'metadata-table panel-table hidden');

    return elD3.node(); 
  }

  /**
  * @method createPlotPanelObject
  *
  * @typedef {Object} Panel
  * @property {HTMLElement} allDataEl - All data group inside SVG.
  * @property {Array<String>} color -  Array of colors for the plots.
  *     Value: d3.schemeCategory10.
  * @property {Array<Array<Array<Number, Number>>>} data - Data to plot.
  *     Format: [ [ [x11, y11], ... ], [ [x21, y21], ...], ...].
  *     Use setUpperData or setLowerData methods.
  * @property {String} dataTableTitle - Title for data.
  *     Default: 'Data'.
  *     Use setUpperDataTableTitle or setLowerDataTableTitle method.
  * @property {Array<String>} ids - ID corresponding to each data series.
  *     Format: [ ['id1'], ['id2], ... ].
  *     Use setUpperPlotIds or setLowerPlotIds method.
  * @property {Array<String>} labels - Labels corresponding to each 
  *     data series. 
  *     Format: [ ['Label 1'], ['Label 2'], ... ].
  *     Use setUpperPlotLabels or setLowerPlotLabels method.
  * @property {HTMLElement} legendEl - Legend element.
  * @property {Function} line - D3 line function.
  * @property {{url: {String}, date: {Date} }} metadata -
  *     Metadata to print underneath plot.
  *     Use setUpperMetadata or setLowerMetadata methods.
  * @property {PlotOptions} options - Plot options for specific panel.
  * @property {String} panelId - Panel id: 'lower' || 'upper'.
  * @property {HTMLElement} plotBodyEl - Upper or lower panel body.
  * @property {HTMLElement} plotEl - Upper or lower panel plot group inside
  *     SVG element.
  * @property {String} plotFilename - Download filename.
  * @property {Number} plotHeight - Calculated plot height. 
  *     options.plotHeight - options.marginBottom - options.marginTop.
  * @property {Number} plotWidth - Calculated plot width.
  *     options.plotWidth - options.marginLeft - options.marginRight.
  * @property {Number} plotScale - Calculated value from the current 
  *     panel width Vs. the plot width. plotWidth / panelWidth.
  * @property {HTMLElement} svgEl - Upper or lower SVG element.
  * @property {Number} svgHeight - options.plotHeight.
  * @property {Number} svgWidth - options.plotWidth.
  * @property {HTMLElement} tooltipEl - Tooltip element inside SVG.
  * @property {HTMLElement} xAxisEl - X-axis element inside SVG.
  * @property {Function} xBounds - D3 axis function. d3.range().domain().
  * @property {Array<Number, Number>} xExtremes - Min and max X value.
  *     Format: [min, max].
  * @property {String} xLabel - X axis label.
  *     Use setUpperXLabel or setLowerXLabel methods.
  * @property {HTMLElement} yAxisEl - Y-axis element inside SVG.
  * @property {Function} yBounds - D3 axis function. d3.range().domain().
  * @property {Array<Number, Number>} yExtremes - Min and max Y value.
  *     Format: [min, max].
  * @property {String} yLabel - Y axis label.
  *     Use setUpperYLabel or setLowerYLabel methods.
  */
  createPlotPanelObject(panel, options) {
    panel = panel.toLowerCase();
    let panelEl = this.el.querySelector('.panel-' + panel);
    let svgHeight = options.plotHeight;
    let svgWidth = options.plotWidth;
    let plotHeight = svgHeight -
        options.marginTop - options.marginBottom;
    let plotWidth = svgWidth -
        options.marginLeft - options.marginRight;
    return {
      data: undefined,
      dataTableTitle: 'Data',
      ids: undefined,
      labels: undefined,
      metadata: undefined,
      options: options, 
      panelId: panel + '-panel',
      plotBodyEl: panelEl,
      plotEl: panelEl.querySelector('.plot'),
      plotFilename: 'figure',
      plotHeight: plotHeight,
      plotWidth: plotWidth,
      svgEl: panelEl.querySelector('svg'),
      svgHeight: svgHeight,
      svgWidth: svgWidth,
      tooltipEl: panelEl.querySelector('.d3-tooltip'),
    };
  
  }

  /**
  * @method createSvgStructure
  *
  * Create the basic SVG structure
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
      { label: 'Save Metadata As:', id: 'dropdown-header', class: 'metadata' },
      { label: 'PDF/Print', id: 'pdf', class: 'metadata' },
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
  * @method idToLabel
  *
  * Given and ID, return the corresponding label.
  * @param {Panel} panel - Panel with data.
  * @param {String} id - ID to search and match.
  * @return {String} - Label of matching ID.
  */
  idToLabel(panel, id) {
    let iLabel = panel.ids.findIndex((d, i) => { return d == id; });
    return panel.labels[iLabel]; 
  }

  /**
  * @method onPlotDataViewSwitch
  *
  */
  onPlotDataViewSwitch() {
    $(this.plotFooterEl).find('.plot-data-btns').on('click', (event) => {
      let selectedValue = $(event.target).find('input').val();
      let panelDim = this.plotBodyEl.getBoundingClientRect();

      if (selectedValue == 'plot'){
        d3.select(this.tableEl)
            .classed('hidden', true);
        
        d3.select(this.metadataTableEl)
            .classed('hidden', true);
        
        d3.select(this.upperPanel.plotBodyEl)
            .classed('hidden', false);

        if (this.options.plotLowerPanel)
          d3.select(this.lowerPanel.plotBodyEl)
              .classed('hidden', false);
      }else if (selectedValue == 'data') {
        d3.select(this.tableEl)
            .classed('hidden', false)
            .style('height', panelDim.height + 'px')
            .style('width', panelDim.width + 'px');
        
        d3.select(this.upperPanel.plotBodyEl)
            .classed('hidden', true);
        
        d3.select(this.metadataTableEl)
            .classed('hidden', true);
        
        if (this.options.plotLowerPanel){
          d3.select(this.lowerPanel.plotBodyEl)
              .classed('hidden', true);
        }
      } else if (selectedValue == 'metadata') {
        d3.select(this.metadataTableEl)
            .classed('hidden', false)
            .style('height', panelDim.height + 'px')
            .style('width', panelDim.width + 'px');
        
        d3.select(this.upperPanel.plotBodyEl)
            .classed('hidden', true);
        
        d3.select(this.tableEl)
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
    d3.select(this.metadataTableEl)
        .classed('hidden', true);
    
    d3.select(this.tableEl)
        .classed('hidden', true);
    
    d3.select(this.plotFooterEl)
        .select('.plot-data-btns')
        .selectAll('label')
        .classed('active', false);
    
    d3.select(this.plotFooterEl)
        .select('.plot-btn')
        .classed('active', true);
    
    d3.select(this.upperPanel.plotBodyEl)
        .classed('hidden', false);
    
    if (this.options.plotLowerPanel)
      d3.select(this.lowerPanel.plotBodyEl)
          .classed('hidden', false);
    
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
      let lowerSaveOptions = {
        footerFontSize: this.lowerPanel.options.printFooterFontSize,
        footerLineBreak: this.lowerPanel.options.printFooterLineBreak,
        footerPadding: this.lowerPanel.options.printFooterPadding,
        marginLeft: this.lowerPanel.options.printMarginLeft,
        marginTop: this.lowerPanel.options.printMarginTop,
        pageHeight: this.lowerPanel.options.printPageHeight,
        pageWidth: this.lowerPanel.options.printPageWidth,
        printDpi: this.lowerPanel.options.printDpi,
        printCenter: this.lowerPanel.options.printCenter,
        printFooter: this.lowerPanel.options.printFooter,
        printLegend: this.legendCheckEl.checked,
        printTitle: this.lowerPanel.options.printTitle,
        titleFontSize: this.lowerPanel.options.titleFontSize,
      };
      
      let upperSaveOptions = {
        footerFontSize: this.upperPanel.options.printFooterFontSize,
        footerLineBreak: this.upperPanel.options.printFooterLineBreak,
        footerPadding: this.upperPanel.options.printFooterPadding,
        marginLeft: this.upperPanel.options.printMarginLeft,
        marginTop: this.upperPanel.options.printMarginTop,
        pageHeight: this.upperPanel.options.printPageHeight,
        pageWidth: this.upperPanel.options.printPageWidth,
        printDpi: this.upperPanel.options.printDpi,
        printCenter: this.upperPanel.options.printCenter,
        printFooter: this.upperPanel.options.printFooter,
        printLegend: this.legendCheckEl.checked,
        printTitle: this.upperPanel.options.printTitle,
        titleFontSize: this.upperPanel.options.titleFontSize,
      };
      
      if ($(event.target).hasClass('data')) {
        let saveBuilder = new D3SaveData.Builder()
            .filename(this.upperPanel.plotFilename)
            .fileFormat(event.target.id);

        for (let panel of [this.upperPanel, this.lowerPanel]) {
          if (!panel.options.showData) continue; 
          saveBuilder.addData(panel.data)
              .addDataRowLabels(panel.options.tooltipText)
              .addDataSeriesLabels(panel.labels)
        }
        saveBuilder.build();
      } else if ($(event.target).hasClass('metadata')) {
        new D3SaveMetadata.Builder()
            .filename('metadata')
            .fileFormat(event.target.id)
            .metadata(this.metadata)
            .build();
      } else {
        new D3SaveFigure.Builder()
            .filename(this.upperPanel.plotFilename)
            .options(upperSaveOptions)
            .metadata(this.metadata) 
            .plotFormat(event.target.id)
            .plotHeight(this.upperPanel.svgHeight)
            .plotMarginLeft(this.upperPanel.options.marginLeft)
            .plotMarginTop(this.upperPanel.options.marginTop)
            .plotTitle(this.plotTitleEl.textContent)
            .plotWidth(this.upperPanel.svgWidth)
            .svgEl(this.upperPanel.svgEl)
            .build();
           
        if (this.options.plotLowerPanel &&
              this.options.printLowerPanel){
          new D3SaveFigure.Builder()
              .filename(this.lowerPanel.plotFilename)
              .options(lowerSaveOptions)
              .metadata(this.metadata) 
              .plotFormat(event.target.id)
              .plotHeight(this.lowerPanel.svgHeight)
              .plotMarginLeft(this.lowerPanel.options.marginLeft)
              .plotMarginTop(this.lowerPanel.options.marginTop)
              .plotTitle(this.plotTitleEl.textContent)
              .plotWidth(this.lowerPanel.svgWidth)
              .svgEl(this.lowerPanel.svgEl)
              .build();
        }
      }
    });
  }

  /**
  * @method onResize
  *
  * Update the table height and width to keep aspect ratio
  */
  onResize(plotRatio) {
    $(window).off();
    $(window).resize(() => {
      let panelDimResize = this.plotBodyEl.getBoundingClientRect();
      let width = panelDimResize.width;
      let height = Number((width / plotRatio).toFixed(6));
      
      // Update metadata table height and width
      d3.select(this.metadataTableEl)
          .style('height', height + 'px')
          .style('width', width + 'px');

      // Update table height and width
      d3.select(this.tableEl)
          .style('height', height + 'px')
          .style('width', width + 'px');
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
  * @method setLowerTimeHorizon
  *
  */
  setLowerTimeHorizon(timeHorizon) {
    this.lowerPanel.timeHorizon = timeHorizon;
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
  * @method setMetadata
  *
  * Sets the metadata and creates the metadata table. 
  *     This method is chainable.
  * @param {!Object} metadata - Metadata for plots 
  * @return {D3View} - Return the class instance to be chainable
  */
  setMetadata(metadata) {
    this.metadata = metadata;
    this.createMetadataTable();
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
  * @method setPlotScale
  *
  * Calculate a scaling value from the current plot width and the viewbox
  *     width.
  * @param {Panel} panel - Upper or lower plot panel.
  */
  setPlotScale(panel) {
    let svgGeom = panel.svgEl.getBoundingClientRect();
    let width = svgGeom.width;
    panel.plotScale = panel.svgWidth / width;
  }
  
  /**
  * @method setTimeHorizonUsage 
  *
  */
  setTimeHorizonUsage(usage) {
    this.timeHorizonUsage = usage;
    return this;
  }

  /**
  * @method setSiteLocation
  *
  * Sets the site location. This method is chainable.
  * @param {!Object} site - Site location
  * @property {Number} latitude
  * @property {Number} longitude
  * @return {D3View} - Return the class instance to be chainable
  */
  setSiteLocation(site) {
    this.siteLocation = [site.longitude, site.latitude];
    return this;
  }

  /**
  * @method setSvgViewBox 
  *
  * Update the view box dimensions on the SVG elements
  */
  setSvgViewBox() { 
    // Update lower plot dimensions
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
  * @method setUpperTimeHorizon
  *
  */
  setUpperTimeHorizon(timeHorizon) {
    this.upperPanel.timeHorizon = timeHorizon;
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
    
    let plotTitleWidth = this.options.addLegendCheckBtn &&
        this.options.addGridLineCheckBtn ? 'calc(100% - 8em)' :
        this.options.addLegendCheckBtn || 
        this.options.addGridLineCheckBtn ? 'calc(100% - 5em)' :
        'calc(100% - 2em)';

    plotTitleD3.append('div')
        .attr('class', 'plot-title')
        .attr('contenteditable', true)
        .style('width', plotTitleWidth);
    
    let iconsD3 = plotHeaderD3.append('span')
        .attr('class', 'icon');

    if (this.options.addGridLineCheckBtn) {
      iconsD3.append('div')
          .attr('class', 'grid-line-check glyphicon glyphicon-th')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Click to toggle grid lines')
          .property('checked', true)
          .style('margin-right', '2em');
     
      this.gridLinesCheckEl = this.el.querySelector('.grid-line-check');
      $(this.gridLinesCheckEl).tooltip({container: 'body'});
    }

    if (this.options.addLegendCheckBtn) {
      iconsD3.append('div')
          .attr('class', 'legend-check glyphicon glyphicon-th-list')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Click to toggle legend')
          .property('checked', true)
          .style('margin-right', '2em');
    
      this.legendCheckEl = this.el.querySelector('.legend-check');
      $(this.legendCheckEl).tooltip({container: 'body'});
    }

    iconsD3.append('div')
        .attr('class',() => {
          return this.colSize == this.options.colSizeMin
            ? this.resizeFull : this.resizeSmall; 
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', 'Click to resize');
    
    this.plotHeaderEl = this.el.querySelector('.panel-heading');
    this.plotResizeEl = this.el.querySelector('.resize');
    this.plotTitleEl = this.el.querySelector('.plot-title');
    
    $(this.plotResizeEl).on('click',() => { this.onPanelResize() });

    $(this.plotResizeEl).tooltip({container: 'body'});

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
          }, {
            name: 'metadata',
            value: 'metadata',
            text: 'Metadata',
            class: 'metadata-btn',
          }
        ]
      }
    ];
    
    this.createPanelFooter(buttons, true /* With save menu */); 
    d3.select(this.el)
        .select('.plot-btn')
        .classed('active', true);

    this.plotFooterEl = this.el.querySelector('.panel-footer');
    // Update buttons
    this.onPlotDataViewSwitch(); 

    return this;
  }

}
