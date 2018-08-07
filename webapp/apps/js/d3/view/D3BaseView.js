
import D3BaseSubView from './D3BaseSubView.js';
import D3BaseSubViewOptions from '../options/D3BaseSubViewOptions.js';
import D3BaseViewBuilder from './D3BaseViewBuilder.js';
import D3BaseViewOptions from '../options/D3BaseViewOptions.js';
import NshmpError from '../../lib/NshmpError.js';

/**
 * @fileoverview Create a base view for plots to reside. The view 
 *    can contain an upper and lower D3BaseSubView for multiple SVG
 *    plots in a single D3BaseView.
 * 
 * Must use D3BaseView.builder() to create a D3BaseView.
 * See D3BaseViewBuilder.
 * 
 * @class D3BaseView
 * @author Brandon Clayton
 */
export default class D3BaseView {

  /**
   * @private 
   * Must use D3BaseView.builder() to create new instance of D3BaseView.
   * 
   * @param {D3BaseViewBuilder} builder The builder 
   */
  constructor(builder) {
    NshmpError.checkArgument(
        builder instanceof D3BaseViewBuilder,
      'Must be an instance of D3BaseViewBuilder');

    /** @type {Boolean} Whether to add a footer in the view */
    this.addFooter = builder._addFooter;
    /** @type {Boolean} Whether to add a header in the view */
    this.addHeader = builder._addHeader;
    /** @type {Boolean} Whether to add a lower sub view */
    this.addLowerSubView = builder._addLowerSubView;
    
    /** @type {HTMLElement} Container element to append view */
    this.containerEl = builder._containerEl;
    /** @type {Object} View footer options */
    this.footerOptions = builder._footerOptions;
    /** @type {Object} View header options */
    this.headerOptions = builder._headerOptions;
    /** @type {D3BaseViewOptions} View options */
    this.viewOptions = builder._viewOptions;
    /** @type {String} Track the size: 'min' || 'minCenter' || 'max' */
    this._currentViewSize = this.viewOptions.viewSizeDefault;
   
    /** @type {String} */
    this.resizeFullIcon = 'resize glyphicon glyphicon-resize-full';
    /** @type {String} */
    this.resizeSmallIcon = 'resize glyphicon glyphicon-resize-small';
    /** @type {String} The plot title text */
    this._titleText = '';

    let viewEls = this._createView();
    /** @type {HTMLElement} Data view, data table element */
    this.dataTableEl = viewEls.dataTableEl;
    /** @type {HTMLElement} Metadata view element */
    this.metadataTableEl = viewEls.metadataTableEl;
    /** @type {HTMLElement} Bootstrap panel body element */
    this.viewPanelBodyEl = viewEls.viewPanelBodyEl;
    /** @type {HTMLElement} Bootstrap panel element */
    this.viewPanelEl = viewEls.viewPanelEl;
    /** @type {HTMLElement} Main view element */
    this.viewEl = viewEls.viewEl;

    /** @type {D3BaseSubView} Upper sub view */
    this.upperSubView = this._createSubView(
        this.viewPanelBodyEl, 
        builder._upperSubViewOptions);
    
    /** @type {D3BaseSubView} Lower sub view */
    this.lowerSubView = undefined;
    if (this.addLowerSubView) {
      this.lowerSubView = this._createSubView(
        this.viewPanelBodyEl,
        builder._lowerSubViewOptions);
    }

    /** @type {ViewHeaderEls} Elements of the view header */
    this.viewHeader = this._createViewHeader();
    /** @type {ViewFooterEls} Elements of the view footer */
    this.viewFooter = this._createViewFooter();

    this._addEventListeners();
  }

  /**
   * Return a new D3BaseViewBuilder
   * 
   * @return {D3BaseViewBuilder} new Builder
   */
  static builder() {
    return new D3BaseViewBuilder();
  }

  /**
   * Return the plot title HTML text
   */
  getTitle() {
    return this._titleText;
  }

  /**
   * Hide the view.
   */
  hide() {
    this.viewEl.classList.add('hidden');
  }

  /**
   * Remove the view.
   */
  remove() {
    this.viewEl.remove();
  }

  /**
   * Show the view.
   */
  show() {
    this.viewEl.classList.remove('hidden');
  }

  /**
   * Set the plot title. Shows the title in the view header if present.
   * 
   * @param {String} title The plot title
   */
  setTitle(title) {
    this._titleText = title;

    if (this.addHeader) {
      this.viewHeader.titleEl.innerHTML = title;
    }
  }

  /**
   * Update the view size.
   * 
   * @param {String} viewSize The view size: 'min' || 'minCenter' || 'max'
   */
  updateViewSize(viewSize) {
    d3.select(this.viewEl)
        .classed(this.viewOptions.viewSizeMax, false)
        .classed(this.viewOptions.viewSizeMin, false)
        .classed(this.viewOptions.viewSizeMinCenter, false)
    
    switch(viewSize) {
      case 'minCenter':
        this._currentViewSize = 'minCenter';
        d3.select(this.viewEl).classed(this.viewOptions.viewSizeMinCenter, true);
        d3.select(this.viewHeader.viewResizeEl)
            .attr('class', this.resizeFullIcon);
        break;
      case 'min':
        this._currentViewSize = 'min';
        d3.select(this.viewEl).classed(this.viewOptions.viewSizeMin, true);
        d3.select(this.viewHeader.viewResizeEl)
            .attr('class', this.resizeFullIcon);
        break;
      case 'max':
        this._currentViewSize = 'max';
        d3.select(this.viewEl).classed(this.viewOptions.viewSizeMax, true);
        d3.select(this.viewHeader.viewResizeEl)
            .attr('class', this.resizeSmallIcon);
        break;
      default:
        NshmpError.throwError(`View size [${viewSize}] not supported`);
    }
  }

  /**
   * @package
   * Add the D3BaseView event listeners.
   */
  _addEventListeners() {
    if (this.addFooter) {
      this.viewFooter.viewSwitchBtnEls
          .addEventListener('click', () => { this._onPlotViewSwitch(); });
    }

    if (this.addHeader) {
      this.viewHeader.viewResizeEl
          .addEventListener('click', () => { this._onViewResize(); });
      
      this.viewHeader.titleEl
          .addEventListener('input', () => { this._onTitleEntry(); });
    }
  }

  /**
   * @package
   * Create a lower or upper sub view.
   * 
   * @param {HTMLElement} el Container element to put sub view 
   * @param {D3BaseSubViewOptions} options Sub view options
   */
  _createSubView(el, options) {
    return new D3BaseSubView(el, options);
  }

  /**
   * @package
   * Create the D3BaseView footer with 'Plot', 'Data', and 
   *    'Metadata' buttons and the save menu.
   * 
   * @returns {ViewFooterEls} The HTMLElements associated with
   *    the footer
   * @typedef {Object} ViewFooterEls - The view footer elements
   * @property {HTMLElement} btnToolbarEl The footer button toolbar element 
   * @property {HTMLElement} dataBtnEl The 'Data' button element
   * @property {HTMLElement} footerEl The view footer element
   * @property {HTMLElement} metadataBtnEl The 'Metadata' button element
   * @property {HTMLElement} plotBtnEl The 'Plot' button element
   * @property {HTMLElement} saveMenuEl The save menu element
   * @property {HTMLElement} viewSwitchBtnEls The plot, data, metadata button
   *    group element
   */
  _createViewFooter() {
    if (!this.addFooter) return;

    let viewFooterD3 = d3.select(this.viewPanelEl)
       .append('div')
       .attr('class', 'panel-footer');
    
    let footerToolbarD3 = viewFooterD3.append('div')
       .attr('class', 'btn-toolbar footer-btn-toolbar')
       .attr('role', 'toolbar');

    let footerBtnsD3 = footerToolbarD3.selectAll('div')
        .data(this._viewFooterButtons())
        .enter()
        .append('div')
        .attr('class', (d) => { 
         return `${d.footerBtnGroupColSize} footer-btn-group`; 
        })
        .append('div')
        .attr('class', (d) => {
          return `btn-group btn-group-xs btn-group-justified  ${d.class}`;
        })
        .attr('data-toggle', 'buttons')
        .attr('role', 'group');
   
    footerBtnsD3.selectAll('label')                                                   
        .data((d) => { return d.btns; })
        .enter()
        .append('label')
        .attr('class',(d, i) => {
          return `btn btn-xs btn-default footer-button ${d.class}`;
        })
        .attr('value', (d) => { return d.value; })
        .attr('for', (d) => { return d.name })
        .html((d, i) => {
          return `<input type='radio' name='${d.name}'` +
             ` value='${d.value}' class='check-box'/>  ${d.text}`;
        });
  
    let saveMenuEl = undefined;
    if (this.footerOptions.addSaveMenu) {
      saveMenuEl = this._createSaveMenu(viewFooterD3.node());
    }

    let toolbarEl = footerToolbarD3.node();
    let plotBtnEl = toolbarEl.querySelector('.plot-btn');
    let dataBtnEl = toolbarEl.querySelector('.data-btn');
    let metadataBtnEl = toolbarEl.querySelector('.metadata-btn');

    let els = {
      btnToolbarEl: toolbarEl,
      dataBtnEl: dataBtnEl,
      footerEl: viewFooterD3.node(),
      metadataBtnEl: metadataBtnEl,
      plotBtnEl: plotBtnEl,
      saveMenuEl: saveMenuEl != undefined ? saveMenuEl : undefined,
      viewSwitchBtnEls: toolbarEl.querySelector('.plot-data-btns'),
    };

    d3.select(plotBtnEl).classed('active', true);

    return els;
  }

  /**
   * @package
   * Create the D3BaseView header with plot title, legend toggle,
   *    grid lines toggle, and resize toggle.
   * 
   * @returns {ViewHeaderEls} The HTMLElements associated with
   *    the header
   * @typedef {Object} ViewHeaderEls - The view header elements
   * @property {HTMLElement} gridLinesCheckEl The grid lines check element
   * @property {HTMLElement} headerEl The view's header element
   * @property {HTMLElement} iconsEl The header icons element
   * @property {HTMLElement} legendCheckEl The legend check element
   * @property {HTMLElement} titleContainerEl The title container element
   * @property {HTMLElement} titleEl The title element
   * @property {HTMLElement} viewResizeEl The resize element
   */
  _createViewHeader() {
    if (!this.addHeader) return;

    let viewHeaderD3 = d3.select(this.viewPanelEl)
        .append('div')
        .attr('class', 'panel-heading')
        .lower();

    let viewTitleD3 = viewHeaderD3.append('h2')
        .attr('class', 'panel-title')
    
    let viewTitleWidth = this.headerOptions.addLegendToggle &&
        this.headerOptions.addGridLineToggle ? 'calc(100% - 8em)' :
        this.headerOptions.addLegendToggle || 
        this.headerOptions.addGridLineToggle ? 'calc(100% - 5em)' :
        'calc(100% - 2em)';

    let plotTitleD3 = viewTitleD3.append('div')
        .attr('class', 'plot-title')
        .attr('contenteditable', true)
        .style('width', viewTitleWidth);
    
    let iconsD3 = viewHeaderD3.append('span')
        .attr('class', 'icon');

    let gridLinesCheckD3 = undefined;
    if (this.headerOptions.addGridLineToggle) {
      gridLinesCheckD3 = iconsD3.append('div')
          .attr('class', 'grid-line-check glyphicon glyphicon-th')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Click to toggle grid lines')
          .property('checked', true)
          .style('margin-right', '2em');
     
      $(gridLinesCheckD3.node()).tooltip({container: 'body'});
      gridLinesCheckD3.node().setAttribute('checked', true); 
    }

    let legendCheckD3 = undefined;
    if (this.headerOptions.addLegendToggle) {
      legendCheckD3 = iconsD3.append('div')
          .attr('class', 'legend-check glyphicon glyphicon-th-list')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Click to toggle legend')
          .property('checked', true)
          .style('margin-right', '2em');
    
      $(legendCheckD3.node()).tooltip({container: 'body'});
    }

    let viewResizeD3 = iconsD3.append('div')
        .attr('class',() => {
          return this._currentViewSize == 'min'
            ? this.resizeFullIcon : this.resizeSmallIcon; 
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', 'Click to resize');
    
    $(viewResizeD3.node()).tooltip({container: 'body'});

    let gridLinesCheckEl = gridLinesCheckD3 != undefined ? 
        gridLinesCheckD3.node() : undefined;
    
    let legendCheckEl = legendCheckD3 != undefined ?  
        legendCheckD3.node() : undefined;

    let els = {
      gridLinesCheckEl: gridLinesCheckEl,
      headerEl: viewHeaderD3.node(),
      iconsEl: iconsD3.node(),
      legendCheckEl: legendCheckEl, 
      titleContainerEl: viewTitleD3.node(),
      titleEl: plotTitleD3.node(),
      viewResizeEl: viewResizeD3.node(),
    };

    return els;
  }

  /**
   * @package
   * Create the main D3BaseView.
   * 
   * @returns {Object<HTMLElement>} The elements associated with 
   *    the view.
   */
  _createView() {
    let sizeDefault = this.viewOptions.viewSizeDefault;
    let viewSize = sizeDefault == 'min' ? this.viewOptions.viewSizeMin : 
        sizeDefault == 'minCenter' ? this.viewOptions.viewSizeMinCenter :
        this.viewOptions.viewSizeMax;

    let containerD3 = d3.select(this.containerEl);
        
    let elD3 = containerD3.append('div')
        .attr('class', 'D3View')
        .classed(viewSize, true);
        
    let plotViewD3 = elD3.append('div')
        .attr('class', 'panel panel-default');

    let viewBodyD3 = plotViewD3.append('div')
        .attr('class', 'panel-body panel-outer');
    
    let dataTableD3 = viewBodyD3.append('div')
        .attr('class', 'data-table panel-table hidden');
    
    let metadataTableD3 = viewBodyD3.append('div')
        .attr('class', 'metadata-table panel-table hidden');

    let els = {
      viewEl: elD3.node(),
      viewPanelEl: plotViewD3.node(),
      viewPanelBodyEl: viewBodyD3.node(),
      dataTableEl: dataTableD3.node(),
      metadataTableEl: metadataTableD3.node(),
    };

    return els;
  }

  /**
   * @package
   * Create the save menu on the D3BaseView footer.
   * 
   * @param {HTMLElement} viewFooterEl The view footer element
   */
  _createSaveMenu(viewFooterEl) {
    let saveAsD3 = d3.select(viewFooterEl)
        .append('span')
        .attr('class', 'dropup icon');

    saveAsD3.append('div')
        .attr('class', 'glyphicon glyphicon-save' +
            ' footer-button dropdown-toggle')
        .attr('data-toggle', 'dropdown')
        .attr('aria-hashpop', true)
        .attr('aria-expanded', true);
    
    let saveListD3 = saveAsD3.append('ul')
        .attr('class', 'dropdown-menu dropdown-menu-right save-as-menu')
        .attr('aria-labelledby', 'save-as-menu')
        .style('min-width', 'auto');

    let saveDataEnter = saveListD3.selectAll('li')
        .data(this._saveMenuButtons())
        .enter()
        .append('li');

    saveDataEnter.filter((d) => { return d.format == 'dropdown-header'})
        .text((d) => { return d.label; })
        .attr('class', (d) => { return d.format; })
        .style('cursor', 'initial');

    saveDataEnter.filter((d) => { return d.format != 'dropdown-header'})
        .html((d) => {
          return `<a data-format=${d.format} data-type=${d.type}> ${d.label} </a>`; 
        })
        .style('cursor', 'pointer');
    
    return saveListD3.node();
  }

  /**
   * @package
   * Switch between the Plot, Data, and Metadata view.
   */
  _onPlotViewSwitch() {
    let selectedView = $(event.target).find('input').val();
    let viewDim = this.viewPanelBodyEl.getBoundingClientRect();

    d3.select(this.dataTableEl).classed('hidden', true);
    d3.select(this.metadataTableEl).classed('hidden', true);
    d3.select(this.upperSubView.subViewBodyEl).classed('hidden', true);

    if (this.addLowerSubView) {
      d3.select(this.lowerSubView.subViewBodyEl).classed('hidden', true);
    }
    
    switch(selectedView) {
      case 'plot':
        d3.select(this.upperSubView.subViewBodyEl).classed('hidden', false);

        if (this.addLowerSubView) {
          d3.select(this.lowerSubView.subViewBodyEl).classed('hidden', false);
        }
        break;
      case 'data':
        d3.select(this.dataTableEl)
            .classed('hidden', false)
            .style('height', `${viewDim.height}px`)
            .style('width', `${viewDim.width}px`);
        
        break;
      case 'metadata':
        d3.select(this.metadataTableEl)
            .classed('hidden', false)
            .style('height', `${viewDim.height}px`)
            .style('width', `${viewDim.width}px`);
        
        break;
      default:
        NshmpError.throwError(`[${selectedView}] not supported`);
    }
  }

  /**
   * @package
   * Update the title text on input.
   */
  _onTitleEntry() {
    this._titleText = this.viewHeader.titleEl.innerHTML;
  }

  /**
   * @package
   * Update the view size when the resize toggle is clicked.
   */
  _onViewResize() {
    this.viewFooter.plotBtnEl.click();

    let nViews = d3.selectAll('.D3View') 
        .filter((d, i, els) => {
          return !d3.select(els[i]).classed('hidden');
        }).size();
    
    switch(this._currentViewSize) {
      case 'max':
        this._currentViewSize = nViews == 1 ? 'minCenter' : 'min';
        this.updateViewSize(this._currentViewSize);
        break;
      case 'min':
      case 'minCenter':
        this._currentViewSize = 'max';
        this.updateViewSize(this._currentViewSize);
        break;
      default:
        NshmpError.throwError(`View size [${this._currentViewSize}] not supported`);
    }
  }

  /**
   * @private
   * 
   * The save menu buttons.
   * 
   * @returns {Array<Object>} The save menu buttons
   */
  _saveMenuButtons() {
    let buttons = [
      { label: 'Preview Figure as:', format: 'dropdown-header', type: 'preview' },
      { label: 'JPEG', format: 'jpeg', type: 'preview' }, 
      { label: 'PNG', format: 'png', type: 'preview' },
      { label: 'SVG', format: 'svg', type: 'preview' },
      { label: 'Save Figure As:', format: 'dropdown-header', type: 'plot' }, 
      { label: 'JPEG', format: 'jpeg', type: 'plot' }, 
      { label: 'PDF', format: 'pdf', type: 'plot' }, 
      { label: 'PNG', format: 'png', type: 'plot' },
      { label: 'SVG', format: 'svg', type: 'plot' },
      { label: 'Save Data As:', format: 'dropdown-header', type: 'data' },
      { label: 'CSV', format: 'csv', type: 'data' },
    ];

    return buttons;
  }

  /**
   * @package
   * The D3BaseView footer buttons: Plot, Data, and Metadata.
   * 
   * @returns {Array<Object>} The buttons
   */
  _viewFooterButtons() {
    let buttons = [
      {
        class: 'plot-data-btns',
        footerBtnGroupColSize: 'col-xs-offset-3 col-xs-6',
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
