'use strict'

import D3LinePlot from './lib/D3LinePlot.js';
import GmmBeta from './lib/GmmBeta.js';
import Constraints from './lib/Constraints.js';
import Tools from './lib/Tools.js';
import NshmpError from './lib/NshmpError.js';


/** 
 * @fileoverview Class for spectra-plot.html, response spectra web app.
 * This class plots the results of nshmp-haz-ws/gmm/spectra web service.
 * This class will first call out to nshmp-haz-ws/gmm/spectra web service
 *     to obtain the usage and create the control panel with the following:
 *     - Ground motions models
 *     - Magnitude
 *     - Rake
 *     - zHyp
 *     - Fault mech (strike-slip, normal, reverse)
 *     - zTop
 *     - Dip
 *     - Width
 *     - rX
 *     - rRup
 *     - rJB
 *     - Vs30
 *     - Vs30 measured or inferred
 *     - Z1.0
 *     - Z2.5
 * Once the control panel is set, it can be used to select desired
 *     parameters and plot ground motion vs. period. 
 *                                                                               
 * @class Spectra 
 * @extends GmmBeta
 * @author bclayton@usgs.gov (Brandon Clayton)
 */
export default class SpectraMulti extends GmmBeta {

  constructor(config) {
    let webApp = 'Spectra';
    let wsUrl = '/nshmp-haz-ws/gmm/spectra'
    
    super(webApp, wsUrl, config);

    this.header.setTitle('Response Spectra');

    /** The main content element for plots - @type {HTMLElement} */ 
    this.contentEl = document.querySelector('#content'); 
    
    /* Magnitude buttons */
    this.MwBtns = [
      { text: '4.0', value: 4.0 },
      { text: '4.5', value: 4.5 },
      { text: '5.0', value: 5.0 },
      { text: '5.5', value: 5.5 },
      { text: '6.0', value: 6.0 },
      { text: '6.5', value: 6.5 },
      { text: '7.0', value: 7.0 },
      { text: '7.5', value: 7.5 },
      { text: '8.0', value: 8.0 },
      { text: '8.5', value: 8.5 },
    ];
    
    /* Rake Buttons */
    this.rakeBtns = [
      { text: 'Strike-Slip', id: 'fault-style-strike', value: 0.0 },
      { text: 'Normal', id: 'fault-style-normal', value: -90 },
      { text: 'Reverse', id: 'fault-style-reverse', value: 90 },
    ];

    /* Hanging wall - foot wall */
    this.hwFwBtns = [
      { text: 'Hanging Wall', id: 'hw-fw-hw', value: 'hw', isActive: true },
      { text: 'Foot Wall', id: 'hw-fw-fw', value: 'fw'},
    ];

    /* Vs30 buttons */
    this.vs30Btns = [
      { text: '180', value: 180.0 },
      { text: '259', value: 259.0 },
      { text: '360', value: 360.0 },
      { text: '537', value: 537.0 },
      { text: '760', value: 760.0 },
      { text: '1150', value: 1150.0 },
      { text: '2000', value: 2000.0 },
      { text: '3000', value: 3000.0 },
    ];

    /* What parameters are multi-selectable */
    this.multiSelectValues = [
      { text: 'Ground Motion Models', value: 'gmms' },
      { text: 'Mw', value: 'Mw' },
      { text: 'Vs30', value: 'vs30' },
    ];

    /* Get the usage and create control panel */
    this.getUsage();
  }

  /**
   * Create the control panel with a:
   *    - Multi-selectable select menu
   *    - GMM select menu
   *    - Event parameters:
   *        - Mw
   *        - Rake
   *        - zHyp
   *    - Source parameters:
   *        - zTop 
   *        - Dip 
   *        - Width
   *    - Path parameters: 
   *        - rX 
   *        - rRup 
   *        - rJB
   *    - Site parameters:
   *        - Vs30
   *        - Z1p0
   *        - Z2p5
   */
  createControlPanel() {
    this.spinner.off();

    /** Multi-selectable select menu - @type {HTMLElement} */
    this.multiSelectEl = this._createMultiSelect();

    /* Create the GMM sorter and select menu */
    let gmmEls = this.controlPanel.createGmmSelect(this.parameters);
    /** GMM select menu - @type {HTMLElement} */
    this.gmmsEl = gmmEls.gmmsEl;
    /** GMM group sorter element - @type {HTMLElement} */
    this.gmmGroupEl = gmmEls.gmmGroupEl;
    /** GMM alpha sorter element - @type {HTMLElement} */
    this.gmmAlphaEl = gmmEls.gmmAlphaEl;
    /** GMM alpha select option elements - @type {Array<HTMLElement>} */
    this.gmmAlphaOptions = gmmEls.gmmAlphaOptions;
    /** GMM group select option elements - @type {Array<HTMLElement>} */
    this.gmmGroupOptions = gmmEls.gmmGroupOptions;
    
    this._createEventParameters(this.parameters);
    this._createSourceParameters(this.parameters);
    this._createPathParameters(this.parameters);
    this._createSiteParameters(this.parameters);

    /* Add event listeners */
    this._listeners();

    /* Check URL query */
    this.checkQuery();
  }
  
  /**
   * Get metadata about all chosen parameters.
   * 
   * @returns {Object} The metadata with all chosen parameters. 
   */
  getMetadata() {
    let gmms = this.getCurrentGmms(); 

    let metadata = {
      'Ground Motion Models': gmms, 
      'M<sub>W</sub>': this.getParameterValues(this.MwEl), 
      'Rake (°)': this.getParameterValues(this.rakeEl),
      'Z<sub>Top</sub> (km)': this.getParameterValues(this.zTopEl),
      'Dip (°)': this.getParameterValues(this.dipEl),  
      'Width (km)': this.getParameterValues(this.widthEl),
      'R<sub>X</sub> (km)': this.getParameterValues(this.rXEl),
      'R<sub>Rup</sub> (km)': this.getParameterValues(this.rRupEl),
      'R<sub>JB</sub> (km)': this.getParameterValues(this.rJBEl),
      'V<sub>s</sub>30 (m/s)': this.getParameterValues(this.vs30El),
      'Z<sub>1.0</sub> (km)': this.getParameterValues(this.z1p0El),
      'Z<sub>2.5</sub> (km)': this.getParameterValues(this.z2p5El),
    };

    return metadata;
  }

  /**
   * Find the value(s) of a particular element.
   * 
   * @param {HTMLElement} el The parameter to get chosen values from. 
   * @returns {Array<Number> | Number} The parameter values.
   */
  getParameterValues(el) {
    let multiSelectParam = this.multiSelectEl.value;
    let btnGroupEl = d3.select(this.multiSelectEl).data()[0];

    if (multiSelectParam == el.id) {
      return $(':checked', btnGroupEl).map((i, d) => {
        return d.value;
      }).get();
    } else {
      return el.value;
    }
  }

  /**
   * Plot ground motions Vs. period in the upper plot panel
   * 
   * @param {Array<Object>} responses An array of JSON returns 
   *     from gmm/spectra web service
   */
  plotGmm(responses) {
    let metadata = this.getMetadata();
    metadata.url = window.location.href;
    metadata.date = responses[0].date;
  
    let seriesInfo = this._responsesToData(responses, 'means');

    this.plot.setUpperData(seriesInfo.data)
        .setMetadata(metadata)
        .setUpperDataTableTitle(seriesInfo.display)
        .setUpperPlotFilename('spectraMean')
        .setUpperPlotIds(seriesInfo.ids)
        .setUpperPlotLabels(seriesInfo.labels)
        .setUpperXLabel(seriesInfo.xLabel)
        .setUpperYLabel(seriesInfo.yLabel)
        .plotData(this.plot.upperPanel);
  }

  /**
   * Set the plot options for the ground motion Vs. period and
   *    the accompanying sigma plot.
   * 
   * @return {D3LinePlot} New instance of D3LinePlot
   */
  plotSetup() {
    let plotOptions = {
      plotLowerPanel: true,
      syncSelections: true,
      syncXAxis: true,
      syncYAxis: false,
      xAxisScale: 'linear',
    };

    let meanTooltipText = ['GMM:', 'Period (s):', 'MGM (g):'];
    let meanPlotOptions = {
      legendLocation: 'topright',
      tooltipText: meanTooltipText,
      yAxisScale: 'linear',
    };
    
    let sigmaTooltipText = ['GMM:', 'Period (s):', 'SD:'];
    let sigmaPlotOptions = {
      plotHeight: 224,
      plotWidth: 896,
      showLegend: false,
      tooltipText: sigmaTooltipText,
      yAxisScale: 'linear',
    };
    
    return new D3LinePlot(
        this.contentEl,
        plotOptions,
        meanPlotOptions,
        sigmaPlotOptions)
        .withPlotHeader()
        .withPlotFooter();
  }

  /**
   * Plot sigma of ground motions in the lower plot panel
   * 
   * @param {Array<Object>} responses An array of JSON returns 
   *    from gmm/spectra web service
   */
  plotSigma(responses) {
    let seriesInfo = this._responsesToData(responses, 'sigmas');

    this.plot.setLowerData(seriesInfo.data)
        .setLowerDataTableTitle(seriesInfo.display)
        .setLowerPlotFilename('spectraSigma')
        .setLowerPlotIds(seriesInfo.ids)
        .setLowerPlotLabels(seriesInfo.labels)
        .setLowerXLabel(seriesInfo.xLabel)
        .setLowerYLabel(seriesInfo.yLabel)
        .plotData(this.plot.lowerPanel);
  }

  /**
   * Call the ground motion web service and plot the results
   */ 
  updatePlot() {
    let urls = this.serializeGmmUrl();
    let jsonCall = Tools.getJSONs(urls);
    
    this.spinner.on(jsonCall.reject, 'Calculating');

    Promise.all(jsonCall.promises).then((responses) => {
      this.spinner.off();
      NshmpError.checkResponses(responses, this.plot);

      this.footer.setMetadata(responses[0].server);
      this.plot.setPlotTitle('Response Spectra');
      // Plot means
      this.plotGmm(responses);
      // Plot sigmas
      this.plotSigma(responses); 
      // Sync selections
      this.plot.syncSelections();

      $(this.footer.rawBtnEl).off(); 
      $(this.footer.rawBtnEl).click((event) =>{
        for (let url of urls) {
          window.open(url);
        }
      });
    }).catch((errorMessage) => {
      this.spinner.off();
      NshmpError.throwError(errorMessage);
    });

  }

  /**
   * Create a form group for dip with a:
   *    - Input form
   *    - Slider  
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createDipFormGroup(params) {
    let inputOptions = {
      id: 'dip',
      label: 'Dip',
      labelColSize: 'col-xs-2',
      max: params.dip.max,
      min: params.dip.min,
      name: 'dip',
      value: params.dip.value,
    };

    let sliderOptions = {
      id: 'dip-slider',
    }

    let dipEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon('°')
        .addInputTooltip()
        .addInputSlider(sliderOptions)
        .syncValues()
        .build();

    this.dipEl = dipEls.inputEl;
    this.dipSliderEl = dipEls.sliderEl;
  }

  /**
   * Create all event parameters:
   *    - Magnitude (input form, slider, buttons)
   *    - Rake (input form, slider, buttons)
   *    - zHyp (input, checkbox)
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createEventParameters(params) {
    this.controlPanel.createLabel({
        appendTo: this.controlPanel.formHorizontalEl,
        label: 'Event Parameters:'});

    /* Magnitude form group*/
    this._createMagnitudeFormGroup(params);
    /* Rake form group */
    this._createRakeFormGroup(params);
    /* zHyp form group */
    this._createZHypFormGroup(params);
  }

  /**
   * Create a form group for magnitude with a:
   *    - Input form
   *    - Slider
   *    - Buttons
   *     
   * @param {Object} params The spectra JSON usage. 
   */
  _createMagnitudeFormGroup(params) {
    let inputOptions = {
      id: 'Mw',
      label: 'M<sub>w</sub>',
      labelColSize: 'col-xs-2',
      max: params.Mw.max,
      min: params.Mw.min,
      name: 'Mw',
      step: 0.1,
      value: params.Mw.value,
    };
    
    let btnOptions = {
      addLabel: false,
      id: 'Mw-btn-group',
      name: 'Mw',
    };
 
    let sliderOptions = {
      id: 'Mw-slider',
    };
  
    this.MwEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputSlider(sliderOptions)
        .addBtnGroup(this.MwBtns, btnOptions)
        .syncValues()
        .addInputTooltip()
        .build();
  
    this.MwEl = this.MwEls.inputEl;
    this.MwBtnGroupEl = this.MwEls.btnGroupEl;
    this.MwSliderEl = this.MwEls.sliderEl;
  }

  /**
   * Create the select menu with the multi-selectable options.
   */
  _createMultiSelect() {
    let selectOptions = {
      id: 'multiple-select',
      label: 'Multi Value Parameter:',
      labelControl: false,
      value: 'gmms',
    };

    let optionArray = this.controlPanel
        .toSelectOptionArray(this.multiSelectValues);

    let multiSelectEls = this.controlPanel.formGroupBuilder()
        .addSelect(optionArray, selectOptions)
        .build();

    return multiSelectEls.selectEl;
  }

  /**
   * Create the path parameters:
   *    - rX (input form, slider)
   *    - rRup (input form, checkbox)
   *    - rJB (input form, buttons)
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createPathParameters(params) {
    this.controlPanel.createLabel({
        appendTo: this.controlPanel.formHorizontalEl,
        label: 'Path Parameters:'});
    
    /* rX form group */
    this._createRXFormGroup(params);
    // TODO Implement rY parameters
    // /* rY form group */
    // this._createRYFormGroup(params);
    /* rRup form group */
    this._createRRupFormGroup(params);
    /* rJB form group */
    this._createRJBFormGroup(params);
  }

  /**
   * Create a form group for rake with a:
   *    - Input form
   *    - Buttons 
   * 
   * @param {Object} params  The spectra JSON usage.
   */
  _createRakeFormGroup(params) {
    let inputOptions = {
      id: 'rake',
      label: 'Rake',
      labelColSize: 'col-xs-2',
      max: params.rake.max,
      min: params.rake.min,
      name: 'rake',
      value: params.rake.value,
    };

    let btnOptions = {
      addLabel: false,
      id: 'fault-style',
      name: 'rake',
    };

    let sliderOptions = {
      id: 'rake-slider',
    };

    this.rakeEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon('°')
        .addInputSlider(sliderOptions)
        .addBtnGroup(this.rakeBtns, btnOptions)
        .syncValues()
        .addInputTooltip()
        .build();

    this.rakeEl = this.rakeEls.inputEl;
    this.faultStyleEl = this.rakeEls.btnGroupEl;
    this.rakeSliderEl = this.rakeEls.sliderEl;
    this.faultStyleStrikeEl = this.rakeEls.btnGroupEl
        .querySelector('#fault-style-strike');
    this.faultStyleNormalEl = this.rakeEls.btnGroupEl
        .querySelector('#fault-style-normal');
    this.faultStyleReverseEl = this.rakeEls.btnGroupEl
        .querySelector('#fault-style-reverse');
  }

  /**
   * Create a form group for rJB with a:
   *    - Input form
   *    - Buttons (hanging wall / footwall)
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createRJBFormGroup(params) {
    let inputOptions = {
      id: 'rJB',
      label: 'R<sub>JB</sub>',
      labelColSize: 'col-xs-2',
      max: params.rJB.max,
      min: params.rJB.min,
      name: 'rJB',
      readOnly: true,
      value: params.rJB.value,
    }

    let btnOptions = {
        btnGroupColSize: 'col-xs-6 col-xs-offset-1',
        id: 'hw-fw',
        paddingTop: 'initial',
    };
    
    let rJBEls = this.controlPanel.formGroupBuilder() 
        .addInput(inputOptions)
        .addInputAddon(params.rJB.units)
        .addInputTooltip()
        .addBtnGroup(this.hwFwBtns, btnOptions)
        .build();    
    
    this.rJBEl = rJBEls.inputEl;
    this.hwFwEl = rJBEls.btnGroupEl;
    this.hwFwHwEl = this.hwFwEl.querySelector('#hw-fw-hw');
    this.hwFwFwEl = this.hwFwEl.querySelector('#hw-fw-fw');
  }

  /**
   * Create a form group for rRup with a:
   *    - Input form
   *    - Checkbox (Derive rJB and rRup)
   * 
   * @param {Object} params 
   */
  _createRRupFormGroup(params) {
    let inputOptions = {
      id: 'rRup',
      label: 'R<sub>Rup</sub>',
      labelColSize: 'col-xs-2',
      max: params.rRup.max,
      min: params.rRup.min,
      name: 'rRup',
      readOnly: true,
      value: params.rRup.value,
    };
   
    let checkboxOptions = {
      checked: true,
      id: 'r-check',
      inputColSize: 'col-xs-6 col-xs-offset-1',
      text: 'Derive R<sub>JB</sub> and R<sub>Rup</sub>',
    };

    let rRupEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.rRup.units)
        .addInputTooltip()
        .addCheckbox(checkboxOptions)
        .build();

    this.rRupEl = rRupEls.inputEl;
    this.rCheckEl = rRupEls.checkboxEl;
  }

  /**
   * Create a rX form group with a:
   *    - Input form
   *    - Slider
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createRXFormGroup(params) {
    let inputOptions = {
      id: 'rX',
      label: 'R<sub>X</sub>',
      labelColSize: 'col-xs-2',
      max: params.rX.max,
      min: params.rX.min,
      name: 'rX',
      value: params.rX.value,
    };

    let sliderOptions = {
      id: 'rX-slider',
    };

    let rXEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.rX.units)
        .addInputTooltip()
        .addInputSlider(sliderOptions)
        .syncValues()
        .build();

    this.rXEl = rXEls.inputEl;
    this.rXSliderEl = rXEls.sliderEl;
  }

  /**
   * Create a form group for rY with a:
   *    - Input form
   * 
   * NOTE: Currently not implimented.
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createRYFormGroup(params) {
    let inputOptions = {
      disabled: true,
      label: 'R<sub>Y</sub>',
      labelColSize: 'col-xs-2',
      id: 'rY',
      name: 'rY',
    };

    let rYEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon('km')
        .build();
    
    this.rYEl = rYEls.inputEl;
  }

  /**
   * Create site parameters:
   *    - Vs30 (input form, slider, buttons)
   *    - Z1p0 (input form)
   *    - Z2p5 (input form)
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createSiteParameters(params) {
    this.controlPanel.createLabel({
        appendTo: this.controlPanel.formHorizontalEl,
        label: 'Site &amp; Basin:'});
    
    /* Vs30 form group */
    this._createVs30FormGroup(params);
    /* Z1p0 */
    this._createZ1p0FormGroup(params);
    /* Z2p5 */
    this._createZ2p5FormGroup(params);
  }

  _createSourceParameters(params) {
    this.controlPanel.createLabel({
        appendTo: this.controlPanel.formHorizontalEl,
        label: 'Source Parameters:'});
    
    /* zTop form group */
    this._createZTopFormGroup(params);
    /* Dip form group */
    this._createDipFormGroup(params);
    /* Width form group */
    this._createWidthFormGroup(params);
  }

  /**
   * Create a form group for vs30 with a:
   *    - Input form
   *    - Slider
   *    - Button group
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createVs30FormGroup(params) {
    let inputOptions = {
      id: 'vs30',
      label: 'V<sub>S</sub>30',
      labelColSize: 'col-xs-2',
      max: params.vs30.max,
      min: params.vs30.min,
      name: 'vs30',
      value: params.vs30.value,
    };

    let sliderOptions = {
      id: 'vs30-slider',
    };

    let btnOptions = {
      id: 'vs30-btn-group',   
      name: 'vs30',
    };

    this.vs30Els = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.vs30.units)
        .addInputTooltip()
        .addInputSlider(sliderOptions)
        .addBtnGroup(this.vs30Btns, btnOptions)
        .syncValues()
        .build();

    this.vs30El = this.vs30Els.inputEl;
    this.vs30SliderEl = this.vs30Els.sliderEl;
    this.vs30BtnGroupEl = this.vs30Els.btnGroupEl;
  }

  /**
   * Create a form group for width with a:
   *    - Input form
   *    - Slider
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createWidthFormGroup(params) {
    let inputOptions = {
      id: 'width',
      label: 'Width',
      labelColSize: 'col-xs-2',
      max: params.width.max,
      min: params.width.min,
      name: 'width',
      value: params.width.value,
    };

    let sliderOptions = {
      id: 'width-slider',
    };

    let widthEls = this.controlPanel.formGroupBuilder() 
        .addInput(inputOptions)
        .addInputAddon(params.width.units)
        .addInputTooltip()
        .addInputSlider(sliderOptions)
        .syncValues()
        .build();

    this.widthEl = widthEls.inputEl;
    this.widthSliderEl = widthEls.sliderEl;
  }

  /**
   * Create a form group for z1p0 with a:
   *    - Input form
   * 
   * @param {Object} params The spectra JSON usage.
   */
  _createZ1p0FormGroup(params) {
    let inputOptions = {
      id: 'z1p0',
      label: 'Z<sub>1.0</sub>',
      labelColSize: 'col-xs-2',
      max: params.z1p0.max,
      min: params.z1p0.min,
      name: 'z1p0',
      value: params.z1p0.value,
    };
    
    let z1p0Els = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.z1p0.units)
        .addInputTooltip()
        .build();

    this.z1p0El = z1p0Els.inputEl;
  }
 
  /**
   * Create a form group for z2p5 with a:
   *    - Input form
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createZ2p5FormGroup(params) {
    let inputOptions = {
      id: 'z2p5',
      label: 'Z<sub>2.5</sub>',
      labelColSize: 'col-xs-2',
      max: params.z2p5.max,
      min: params.z2p5.min,
      name: 'z2p5',
      value: params.z2p5.value,
    };
    
    let z2p5Els = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.z2p5.units)
        .addInputTooltip()
        .build();

    this.z2p5El = z2p5Els.inputEl;
  }
 
  /**
   * Create a form group for zHyp with a:
   *    - Input form
   *    - Checkbox (Centered down dip)
   * 
   * @param {Object} params The spectra JSON usage. 
   */
  _createZHypFormGroup(params) {
    let inputOptions = {
      id: 'zHyp',
      label: 'z<sub>Hyp</sub>',
      labelColSize: 'col-xs-2',
      max: params.zHyp.max,
      min: params.zHyp.min,
      name: 'zHyp',
      readOnly: true,
      step: 0.5,
      value: params.zHyp.value,
    };

    let checkboxOptions = {
      checked: true,
      id: 'z-check',
      inputColSize: 'col-xs-6 col-xs-offset-1',
      text: 'Centered down-dip',
    };

    let zHypEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.zHyp.units)
        .addCheckbox(checkboxOptions)
        .build();
    
    this.zHypEl = zHypEls.inputEl;
    this.zCheckEl = zHypEls.checkboxEl;
  }

  /**
   * Create a form group for zTop with a:
   *    - Input form
   *    - Slider 
   * @param {Object} params  The spectra JSON usage.
   */
  _createZTopFormGroup(params) {
    let inputOptions = {
      id: 'zTop',
      label: 'z<sub>Top</sub>',
      labelColSize: 'col-xs-2',
      max: params.zTop.max,
      min: params.zTop.min,
      name: 'zTop',
      value: params.zTop.value,
    };

    let sliderOptions = {
      id: 'zTop-slider',
    }

    let zTopEls = this.controlPanel.formGroupBuilder()
        .addInput(inputOptions)
        .addInputAddon(params.zTop.units)
        .addInputTooltip()
        .addInputSlider(sliderOptions)
        .syncValues()
        .build();

    this.zTopEl = zTopEls.inputEl;
    this.zTopSliderEl = zTopEls.sliderEl;
  }

  /**
   * Event listeners
   */
  _listeners() {
    d3.select(this.multiSelectEl).datum(this.gmmsEl);
    $(this.multiSelectEl).on('input', (event) => {
      this._onMultiSelectClick(event);
    });
    $(this.multiSelectEl).trigger('input');

    $('input', this.hwFwEl).on('change', (event) => {
      this.updateDistance();
      Tools.resetRadioButton(event.target); 
    });

    $(this.rCheckEl).on('change', (event) => {
      let rCompute = event.target.checked;
      $(this.rJBEl).prop('readonly', rCompute);
      $(this.rRupEl).prop('readonly', rCompute);
      $(this.hwFwHwEl.parentNode).toggleClass('disabled', !rCompute);
      $(this.hwFwFwEl.parentNode).toggleClass('disabled', !rCompute);
      this.updateDistance();
    });
    this.updateDistance();
    

    $(this.rXEl).on('input', () => { this.updateDistance(); });
    
    $(this.dipEl).on('input', () => {
      if (isNaN(this.dip_val())) return;
      this.updateDistance();
      this.updateHypoDepth();
    });

    $(this.widthEl).on('input', () => {
      if (isNaN(this.width_val())) return;
      this.updateDistance();
      this.updateHypoDepth();
    });
    
    $(this.zCheckEl).change((event) => {
      $(this.zHypEl).prop('readonly', event.target.checked);
      this.updateHypoDepth();
    });
    
    $(this.zTopEl).on('input', () => {
      if (isNaN(this.zTop_val())) return;
      this.updateDistance();
      this.updateHypoDepth();
    });
    
    /** @type {D3LinePlot} */
    this.plot = this.plotSetup();

    // On any input
    $(this.controlPanel.inputsEl)
      .on('input change', (event) => { this.inputsOnInput(event); });
	}

  /**
   * Update the parameters based on the chosen parameter allowed
   *    to be multi-selectable.
   * 
   * @param {Event} event The event. 
   */
  _onMultiSelectClick(event) {
    this._resetMultiSelectMenus();
    let param = event.target.value;

    switch(param) {
      case 'gmms':
        d3.select(this.gmmsEl)
            .property('multiple', true)
            .attr('size', 16);
        d3.select(this.multiSelectEl).datum(this.gmmsEl);
        break;
      case 'Mw':
        this.controlPanel.toMultiSelectable(this.MwEls);
        d3.select(this.multiSelectEl).datum(this.MwBtnGroupEl);
        break;
      case 'vs30':
        this.controlPanel.toMultiSelectable(this.vs30Els);
        d3.select(this.multiSelectEl).datum(this.vs30BtnGroupEl);
    };

    $(this.controlPanel.inputsEl).trigger('change');
  }

  /**
   * Reset the multi-selectable parameters to single selectable.
   */
  _resetMultiSelectMenus() {
    /* Reset GMMs */
    d3.select(this.gmmsEl)
        .property('multiple', false)
        .attr('size', 16);
    /* Reset magnitude */
    this.controlPanel.toSingleSelectable(this.MwEls);
    /* Reset vs30 */
    this.controlPanel.toSingleSelectable(this.vs30Els);
  }

  /**
   * Convert an array of JSON responses into arrays
   *    of data, labels, and ids for D3LinePlot.
   * 
   * @param {Array<Object>} responses An array of JSON returns 
   *    from gmm/spectra web service
   * @param {String} whichDataSet Which data set to get from the 
   *    JSON return: 'means' || 'sigmas'
   * @returns {Object} An object with data series information to 
   *    create plots.
   */
  _responsesToData(responses, whichDataSet) {
    let dataSets = [];

    for (let response of responses) {
      for (let data of response[whichDataSet].data) {
        let multiParam = $(':selected', this.multiSelectEl).text();
        let multiParamVal = this.multiSelectEl.value;

        if (multiParamVal != 'gmms') {
          let val = response.request.input[multiParamVal];
          let valStr = val.toString().replace('.', 'p');
          data.id = data.id + '_' + multiParamVal + '_' + valStr;
          data.label = data.label + ' - ' + multiParam + ' = ' + val; 
        }
        dataSets.push(data);
      }
    }
    
    let seriesLabels = [];
    let seriesIds = [];
    let seriesData = [];
      
    dataSets.forEach((d, i) => {
      d.data.xs[0] = 'PGA';
      seriesLabels.push(d.label);
      seriesIds.push(d.id);
      seriesData.push(d3.zip(d.data.xs, d.data.ys));
    });

    let singleResponse = responses[0][whichDataSet];

    let dataInfo = {
      data: seriesData,
      display: singleResponse.label,
      ids: seriesIds,
      labels: seriesLabels,
      xLabel: singleResponse.xLabel,
      yLabel: singleResponse.yLabel,
    };

    return dataInfo;
  }

}
