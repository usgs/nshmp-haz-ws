
import D3BaseSubView from './D3BaseSubView.js';
import D3BaseSubViewOptions from '../options/D3BaseSubViewOptions.js';
import D3BaseViewOptions from '../options/D3BaseViewOptions.js';
import { D3SaveFigure } from '../D3SaveFigure.js';
import NshmpError from '../../error/NshmpError.js';
import Preconditions from '../../error/Preconditions.js';

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
    Preconditions.checkArgumentInstanceOf(builder, D3BaseViewBuilder);

    /** @type {Boolean} Whether to add a lower sub view */
    this.addLowerSubView = builder._addLowerSubView;
    
    /** @type {HTMLElement} Container element to append view */
    this.containerEl = builder._containerEl;
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
    /** @type {Map<String, Array<String | Number>>} The metadata */
    this._metadata = new Map();

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

    /** @type {SVGElement} The SVG element in the data table view */
    this.dataTableSVGEl = this._updateDataMetadata(this.dataTableEl);
    /** @type {SVGElement} The SVG element in the metadata view */
    this.metadataTableSVGEl = this._updateDataMetadata(this.metadataTableEl);

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
   * Create the metadata table in the 'Metadata' view.
   *  
   * @param {Map<String, Array<String | Number>>} metadata The metadata
   */
  createMetadataTable() {
    let metadata = this.getMetadata();
    this.viewFooter.metadataBtnEl.removeAttribute('disabled');

    d3.select(this.metadataTableSVGEl)
        .selectAll('*')
        .remove();

    let foreignObjectD3 = d3.select(this.metadataTableSVGEl)
        .append('foreignObject')
        .attr('height', '100%')
        .attr('width', '100%')
        .style('overflow', 'scroll');

    let tableRowsD3 = foreignObjectD3.append('xhtml:table')
        .attr('class', 'table table-bordered table-hover')
        .append('tbody')
        .selectAll('tr')
        .data([ ...metadata.keys() ])
        .enter()
        .append('tr');

    tableRowsD3.append('th')
        .text((/** @type {String} */ key) => {
          return key;
        });

    tableRowsD3.append('td')
        .selectAll('p')
        .data((/** @type {String} */ key) => { return metadata.get(key); })
        .enter()
        .append('p')
        .text((/** @type {String | Number} */ val) => { return val; });
  }

  /**
   * Return the metadata.
   * 
   * @returns {Map<String, Array<String | Number>>}
   */
  getMetadata() {
    return new Map(this._metadata);
  }

  /**
   * Return the plot title HTML text
   */
  getTitle() {
    return new String(this._titleText);
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
   * 
   * @param {Map<String, Array<String | Number>>} metadata 
   */
  setMetadata(metadata) {
    Preconditions.checkArgumentInstanceOfMap(metadata);
    for (let [key, value] of metadata) {
      Preconditions.checkArgumentString(key);
      Preconditions.checkArgumentArray(value);
    }

    this._metadata = metadata;
  }

  /**
   * Set the plot title. Shows the title in the view header if present.
   * 
   * @param {String} title The plot title
   */
  setTitle(title) {
    Preconditions.checkArgumentString(title);
    this._titleText = title;
    this.viewHeader.titleEl.innerHTML = title;
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
    this.viewFooter.viewSwitchBtnEls
        .addEventListener('click', () => { this._onPlotViewSwitch(); });

    this.viewHeader.viewResizeEl
        .addEventListener('click', () => { this._onViewResize(); });
    
    this.viewHeader.titleEl
        .addEventListener('input', () => { this._onTitleEntry(); });
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
   * @property {HTMLElement} imageOnlyEl The image only check box in the save menu
   * @property {HTMLElement} metadataBtnEl The 'Metadata' button element
   * @property {HTMLElement} plotBtnEl The 'Plot' button element
   * @property {HTMLElement} saveMenuEl The save menu element
   * @property {HTMLElement} viewSwitchBtnEls The plot, data, metadata button
   *    group element
   */
  _createViewFooter() {
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
        .attr('for', (d) => { return d.name; })
        .html((d, i) => {
          return `<input type='radio' name='${d.name}'` +
             ` value='${d.value}' class='check-box'/>  ${d.text}`;
        })
        .each((d, i, els) => {
          if (d.disabled) {
            els[i].setAttribute('disabled', 'true');
          }
        })
  
    let saveMenuEl = this._createSaveMenu(viewFooterD3.node());
    let imageOnlyEl = saveMenuEl.querySelector('#image-only');
    let toolbarEl = footerToolbarD3.node();
    let plotBtnEl = toolbarEl.querySelector('.plot-btn');
    let dataBtnEl = toolbarEl.querySelector('.data-btn');
    let metadataBtnEl = toolbarEl.querySelector('.metadata-btn');

    let els = {
      btnToolbarEl: toolbarEl,
      dataBtnEl: dataBtnEl,
      footerEl: viewFooterD3.node(),
      imageOnlyEl: imageOnlyEl,
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
      legendCheckD3.node().setAttribute('checked', true); 
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
        .style('padding-left', '10px')
        .html((d) => {
          return `<a data-format=${d.format} data-type=${d.type}> ${d.label} </a>`; 
        })
        .style('cursor', 'pointer');

    saveListD3.append('li')
          .attr('role', 'seperator')
          .attr('class', 'divider');

    saveListD3.append('li')
        .attr('class', 'dropdown-header')
        .attr('data-type', 'image-only')
        .html('Save/Preview Image Only: ' + 
            '<input type="checkbox" name="image-only" id="image-only">')

    let saveListEl = saveListD3.node();
    Preconditions.checkStateInstanceOfHTMLElement(saveListEl);
    
    return saveListD3.node();
  }

  /**
   * @package
   * Switch between the Plot, Data, and Metadata view.
   */
  _onPlotViewSwitch() {
    if (event.target.hasAttribute('disabled')) return;

    let selectedView = event.target.getAttribute('value');

    Preconditions.checkState(
        selectedView == 'data' ||
        selectedView == 'metadata' ||
        selectedView == 'plot',
        `Selected view [${selectedView}] is not supported`);

    this.dataTableEl.classList.toggle(
        'hidden',
        selectedView != 'data');

    this.metadataTableEl.classList.toggle(
        'hidden',
        selectedView != 'metadata');

    this.upperSubView.subViewBodyEl.classList.toggle(
        'hidden',
        selectedView != 'plot');

    if (this.addLowerSubView) {
      this.lowerSubView.subViewBodyEl.classList.toggle(
          'hidden',
          selectedView != 'plot');
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
      { label: 'Preview Figure as:', format: 'dropdown-header', type: 'preview-figure' },
      { label: 'JPEG', format: 'jpeg', type: 'preview-figure' }, 
      { label: 'PNG', format: 'png', type: 'preview-figure' },
      { label: 'SVG', format: 'svg', type: 'preview-figure' },
      { label: 'Save Figure As:', format: 'dropdown-header', type: 'save-figure' }, 
      { label: 'JPEG', format: 'jpeg', type: 'save-figure' }, 
      { label: 'PNG', format: 'png', type: 'save-figure' },
      { label: 'SVG', format: 'svg', type: 'save-figure' },
      { label: 'Save Data As:', format: 'dropdown-header', type: 'save-data' },
      { label: 'CSV', format: 'csv', type: 'save-data' },
    ];

    return buttons;
  }

  /**
   * @private
   * Add SVG element to the data and metadata view to match the 
   *    SVG element in the plot view.
   *  
   * @param {HTMLElement} el The data or metadata element
   */
  _updateDataMetadata(el) {
    Preconditions.checkArgumentInstanceOfHTMLElement(el);

    let plotHeight = this.addLowerSubView ? 
        this.upperSubView.options.plotHeight + this.lowerSubView.options.plotHeight + 1:
        this.upperSubView.options.plotHeight;
    
    let plotWidth = this.upperSubView.options.plotWidth;
    
    let svgD3 = d3.select(el)
        .append('svg')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ` +
            `${plotWidth} ${plotHeight}`);

    let svgEl = svgD3.node();
    Preconditions.checkStateInstanceOfSVGElement(svgEl);
    return svgEl;
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
            disabled: false,
          }, {
            name: 'data',
            value: 'data',
            text: 'Data',
            class: 'data-btn',
            disabled: true,
          }, {
            name: 'metadata',
            value: 'metadata',
            text: 'Metadata',
            class: 'metadata-btn',
            disabled: true,
          }
        ]
      }
    ];
    
    return buttons;
  }

}

/**
 * @fileoverview Builder for D3BaseView.
 * 
 * Use D3BaseView.builder() for new instance of builder.
 * 
 * @class D3BaseViewBuilder
 * @author Brandon Clayton
 */
export class D3BaseViewBuilder {

  /** @private */
  constructor() {
    this._setDefaultViewOptions();

    this._defaultHeaderOptions = {
      addGridLineToggle: true,
      addLegendToggle: true,
    };

    /** @type {HTMLElement} */
    this._containerEl = undefined;
    /** @type {Boolean} */
    this._addLowerSubView = false;

    this._headerOptions = this._defaultHeaderOptions;
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
   * Set the container element, where the view will be appended to.
   * 
   * @param {HTMLElement} el The container element to put the view. 
   */
  containerEl(el) {
    Preconditions.checkArgumentInstanceOfHTMLElement(el);
    this._containerEl = el;
    return this;
  }

  /**
   * Set the lower sub view options.
   * 
   * @param {D3BaseSubViewOptions} options The lower sub view options. 
   */
  lowerSubViewOptions(options) {
    Preconditions.checkArgumentInstanceOf(options, D3BaseSubViewOptions);
    this._lowerSubViewOptions = options;
    return this;
  }

  /**
   * Set the upper sub view options.
   * 
   * @param {D3BaseSubViewOptions} options The upper sub view options.
   */
  upperSubViewOptions(options) {
    Preconditions.checkArgumentInstanceOf(options, D3BaseSubViewOptions);
    this._upperSubViewOptions = options;
    return this;
  }

  /**
   * Set the view options.
   * 
   * @param {D3BaseViewOptions} options The view options.
   */
  viewOptions(options) {
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
