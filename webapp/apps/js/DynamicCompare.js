'use strict';

import Constraints from './lib/Constraints.js';
import D3LinePlot from './lib/D3LinePlot.js';
import Hazard from './lib/HazardNew.js';
import LeafletTestSitePicker from './lib/LeafletTestSitePicker.js';
import Tools from './lib/Tools.js';

/**
* @class DynamicCompare
*
* @fileoverview Class for the dynamic compare webpage, dynamic-compare.html.
*
* This class contains two plot panels with the following plots:
*     first panel: 
*         - Model comparison of ground motion Vs. annual frequency of exceedence 
*         - Percent difference between the models
*     second panel: 
*         - Response spectrum of the models
*         - Percent difference of the response spectrum
*
* The class first class out to the source model webservice, 
*     nshmp-haz-ws/source/models, to get the usage and build the 
*     following menus: 
*         - Model
*         - Second Model
*         - IMT
*         - Vs30
* 
* The IMT and Vs30 menus are created by the common supported values
*     between the two selected models.
* 
* Bootstrap tooltips are created and updated for the latitude, longitude,
*     and return period inputs.
* 
* The inputs, latitude, longitude, and return period, are monitored. If 
*     a bad or out of range value is entered the update button will 
*     remain disabled. Once all inputs are correctly entered the update
*     button or enter can be pressed to render the results.
* 
* The return period allowable minimum and maximum values are updated
*     based on the choosen models such that the response spectrum
*     is defined for the entire bounds for both models. 
*
* The results are rendered using the D3View and D3LinePlot classes.
* 
* @author Brandon Clayton
*/
export default class DynamicCompare extends Hazard {

  /** @param {!Config} config - The config file */
  constructor(config) {
    let webApp = 'DynamicCompare';
    let webServiceUrl = '/nshmp-haz-ws/source/models';
    super(webApp, webServiceUrl, config);
    this.header.setTitle('Dynamic Compare');

    /**
    * @typedef {Object} DynamicCompareOptions
    * @property {String} defaultFirstModel - The default selected first model
    * @property {String} defaultSecondModel - The default selected second model
    * @property {String} defaultImt - The default selected IMT.
    *     If this IMT is not available, IMT will default to another value.
    * @property {Number} defaultTimeHorizon - The default time horizon.
    * @property {Number} defaultVs30 - The default vs30 value.
    *     If this vs30 value is not available, vs30 will default to another
    *     value;
    */
    this.options = {
      defaultFirstModel: 'WUS_2008',
      defaultSecondModel: 'WUS_2014',
      defaultImt: 'PGA',
      defaultReturnPeriod: 2475,
      defaultVs30: 760,
    };

    /** @type {HTMLElement} */
    this.contentEl = document.querySelector('#content');
    /** @type {HTMLElement} */
    this.firstModelEl = document.querySelector('#first-model');
    /** @type {HTMLElement} */
    this.secondModelEl = document.querySelector('#second-model'); 
    /** @type {HTMLElement} */
    this.modelsEl = document.querySelector('.model');
    /** @type {HTMLElement} */
    this.testSitePickerBtnEl = document.querySelector('#test-site-picker');
    /** @type {Object} */
    this.comparableModels = undefined;
   
    /* Get webservice usage */ 
    this.getUsage();

    /** @type {D3LinePlot} */
    this.spectraPlot = this.plotSetupSpectra();
    /** @type {D3LinePlot} */
    this.hazardPlot = this.plotSetupHazard();
     
    /* Check latitude values on change */
    $(this.latEl).on('input', (event) => {
      this.onCoordinate(event);
    });
   
    /* Check longitude values on change */ 
    $(this.lonEl).on('input', (event) => {
      this.onCoordinate(event);
    });
 
    /* Listen for input changes */ 
    this.footer.onInput(this.inputsEl, this.footerOptions);
 
    /* Listen for return period to change */ 
    this.onReturnPeriodChange();

    /* @type {LeafletTestSitePicker} */
    this.testSitePicker = new LeafletTestSitePicker(
        this.latEl,
        this.lonEl,
        this.testSitePickerBtnEl); 
  
    /* Bring Leaflet map up when clicked */
    $(this.testSitePickerBtnEl).on('click', (event) => {
      let model = Tools.stringToParameter(
          this.parameters.models,
          this.firstModelEl.value);
      
      this.testSitePicker.plotMap(model.region.value);
    });
  }

  /**
  * @method addInputTooltip
  *
  * Add an input tooltip for latitude, longitude, and return period 
  *     using Constraints.addTooltip.
  */
  addInputTooltip() {
    let model = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    let region = model.region;

    Constraints.addTooltip(
        this.latEl,
        region.minlatitude,
        region.maxlatitude); 
        
    Constraints.addTooltip(
        this.lonEl,
        region.minlongitude,
        region.maxlongitude); 
  
    let periodValues = this.parameters.returnPeriod.values;
    Constraints.addTooltip(
        this.returnPeriodEl,
        periodValues.minimum,
        periodValues.maximum);
  }

  /**
  * @method buildInputs
  *
  * Process usage response from nshmp-haz-ws/source/models and set menus.
  */
  buildInputs() {
    this.spinner.off();
    this.setComparableModels();
    
    this.setFirstModelMenu();
    this.setSecondModelMenu();
    this.setParameterMenu(this.imtEl, this.options.defaultImt);
    this.setParameterMenu(this.vs30El, this.options.defaultVs30);
    this.setDefaultReturnPeriod();
    this.addInputTooltip();

    $(this.controlPanelEl).removeClass('hidden');

    /* Update menus when first model changes */ 
    this.onFirstModelChange();
    
    this.testSitePicker.on('testSiteLoad', (event) => {
      this.checkQuery();
    });
    
  }
  
  /**
  * @method checkQuery
  *
  * Check the current hash part of the URL for parameters, if they
  *     exist plot the results. 
  */
  checkQuery() {
    let url = window.location.hash.substring(1);
    let urlObject = Tools.urlQueryStringToObject(url);
    
    /* Make sure all pramameters are present in URL */
    if (!urlObject.hasOwnProperty('model') ||
        !urlObject.hasOwnProperty('latitude') ||
        !urlObject.hasOwnProperty('longitude') ||
        !urlObject.hasOwnProperty('imt') ||
        !urlObject.hasOwnProperty('returnperiod') ||
        !urlObject.hasOwnProperty('vs30')) return false;
  
    /* Update values for the menus */ 
    this.firstModelEl.value = urlObject.model[0];
    $(this.firstModelEl).trigger('change');
    this.secondModelEl.value = urlObject.model[1];
    this.latEl.value = urlObject.latitude;
    this.lonEl.value = urlObject.longitude;
    this.imtEl.value = urlObject.imt;
    this.vs30El.value = urlObject.vs30;
    this.returnPeriodEl.value = urlObject.returnperiod;
  
    /* Trigger events to update tooltips */
    $(this.latEl).trigger('input');
    $(this.lonEl).trigger('input'); 
    $(this.returnPeriodEl).trigger('input'); 
    this.addInputTooltip();

    /* Get and plot results */
    $(this.inputsEl).trigger('change');
    let keypress = jQuery.Event('keypress');
    keypress.which = 13;
    keypress.keyCode = 13;
    $(document).trigger(keypress);
  }

  /**
  * @method getMetadataHazard
  *
  * Get the metadata, associated with the hazard plots,
  *     about the selected parameters in the control panel.
  * @return {{
  *   'Models': {Array<String>} - Selected models,
  *   'Latitude': {Number} - Latitude,
  *   'Longitude': {Number} - Longitude,
  *   'Intensity Measure Type': {String} - Selcted IMT,
  *   'Vs30': {String} - Selected vs30,
  * }} Object
  */
  getMetadataHazard() {
    let models = [
      $(':selected', this.firstModelEl).text(),
      $(':selected', this.secondModelEl).text(),
    ];
    
    let metadata = {
      'Models': models,  
      'Latitude': this.latEl.value,
      'Longitude': this.lonEl.value,
      'Intensity Measure Type': $(':selected', this.imtEl).text(),
      'V<sub>s</sub>30': $(':selected', this.vs30El).text(),
    };
    
    return metadata;
  }
  
  /**
  * @method getMetadataSpectra
  *
  * Get the metadata, associated with the response spectra plots,
  *     about the selected parameters in the control panel.
  * @return {{
  *   'Models': {Array<String>} - Selected models,
  *   'Latitude': {Number} - Latitude,
  *   'Longitude': {Number} - Longitude,
  *   'Vs30': {String} - Selected vs30,
  *   'Return Period (years)': {Number} - Return period,
  * }} Object
  */
  getMetadataSpectra() {
    let models = [
      $(':selected', this.firstModelEl).text(),
      $(':selected', this.secondModelEl).text(),
    ];
    
    let metadata = {
      'Models': models,  
      'Latitude': this.latEl.value,
      'Longitude': this.lonEl.value,
      'V<sub>s</sub>30': $(':selected', this.vs30El).text(),
      'Return Period (years)': this.returnPeriodEl.value,
    };
    
    return metadata;
  }

  /**
  * @method getResponseSpectraExtremes
  */
  getResponseSpectraExtremes(results) {
    let returnPeriod = 1 / this.parameters.returnPeriod.values.maximum; 
    let supportedValues = this.modelSupports('imt');
    
    let spectraGm = []; 
    for (let result of results) {
      let responses = result.response.filter((response) => {
        return supportedValues.find((sp) => {
          return sp.value == response.metadata.imt.value;
        });
      });
      
      for (let response of responses) {
        let imt = response.metadata.imt.value;
        let xValues = response.metadata.xvalues;
        let data = response.data.filter((data) => {
          return data.component == 'Total';
        })[0];
        
        let values = data.yvalues.filter((val) => {
          return val > returnPeriod;
        });
        let index = data.yvalues.indexOf(values.pop());
        
        let x0 = xValues[index];
        let x1 = xValues[index + 1];
        let y0 = data.yvalues[index];
        let y1 = data.yvalues[index + 1];
        
        let gm = Tools.returnPeriodInterpolation(x0, x1, y0, y1, returnPeriod);
        gm = isNaN(gm) ? null : Number(gm.toFixed(6));
        spectraGm.push(gm);
      }
    }
  
    let maxSpectraGm = d3.max(spectraGm);
    maxSpectraGm = isNaN(maxSpectraGm) ? 1.0 : maxSpectraGm;
     
    return [0, maxSpectraGm]; 
  }

  /**
  * @method modelSupports
  *
  * Find the supported IMT or Vs30 values between the two selected models.
  * @param {String} param -  The parameters to search, 'imt' || 'vs30'.
  * @return {Object} The supported values from the usage. Output 
  *     from Tools.supportedParameters
  */
  modelSupports(param) {
    let firstModel = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    
    let secondModel = Tools.stringToParameter(
        this.parameters.models,
        this.secondModelEl.value);
    
    let supports = [];
    supports.push(firstModel.supports[param]);
    supports.push(secondModel.supports[param]);
    
    let supportedValues = Tools.supportedParameters(
        this.parameters[param],
        supports);
    
    return supportedValues;
  }

  /**
  * @method onCoordinate 
  *
  * On longitude or latitude input, check that the coordinate values 
  *     input are good values.
  * @param {Event} event - The event that triggered the input.
  */
  onCoordinate(event) {
    let model = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    let region = model.region;
    
    this.checkCoordinates(event.target, region);
  }

  /**
  * @method onFirstModelChange
  *
  * Update menus when the first model select menu is changed.
  */
  onFirstModelChange() {
    $(this.firstModelEl).on('change', (event) => {
      this.setSecondModelMenu();
      this.setParameterMenu(this.imtEl, this.options.defaultImt);
      this.setParameterMenu(this.vs30El, this.options.defaultVs30);
      this.latEl.value = null;
      this.lonEl.value = null;
      this.addInputTooltip();
    });
  }

  /**
  * @method onImtChange 
  *
  * Update plot to new IMT on change.
  */
  onImtChange(results) {
    let imtValue;
    $(this.imtEl).on('change', (event) => {
      if (imtValue != this.imtEl.value) {
        this.plotHazardCurves(results);
      }
      imtValue = this.imtEl.value;
    });
  }

  /**
  * @method onReturnPeriodDrag
  *
  * When the return period line is being draged it will trigger a 
  *   change on the svg element. Once triggerd, the return period 
  *   value is updated in the control panel.
  * This will then trigger an input event so that the response spectrum can 
  *     be updated.
  */
  onReturnPeriodDrag() {
    let d3ReturnPeriodEl = d3.select(this.hazardPlot.upperPanel.plotEl)
        .select('.return-period')
        .node();

    $(d3ReturnPeriodEl).on('change', (event) => {
      let timeHorizon = parseInt(this.hazardPlot.upperPanel.timeHorizon);
      this.returnPeriodEl.value = timeHorizon; 
      $(this.returnPeriodEl).trigger('input');
    });
  }

  /**
  * @method plotHazardCurves
  *
  * Plot the hazard curves of the selected models.
  */
  plotHazardCurves(results) {
    let metadata = this.getMetadataHazard();
    metadata.url = window.location.href;
    metadata.date = results[0].date;

    let seriesData = [];
    let seriesIds = [];  
    let seriesLabels = [];
    for (let result of results) {
      let response = result.response.find((response) => {
        return response.metadata.imt.value == this.imtEl.value;
      });
      let xValues = response.metadata.xvalues;
      let totalData = response.data.find((data) => {
        return data.component == 'Total';
      });
      let yValues = totalData.yvalues;
      let edition = response.metadata.edition.value;
      let region = response.metadata.region.value;
      let model = this.parameters.models.values.find((model) => {
        return model.edition == edition && 
            model.region.value == region;
      });

      seriesData.push(d3.zip(xValues, yValues));
      seriesLabels.push(model.display);
      seriesIds.push(model.value);
    }
    let xLabel = results[0].response[0].metadata.xlabel;
    let yLabel = results[0].response[0].metadata.ylabel;
    let imt = $(':selected', this.imtEl).text();
    let vs30 = $(':selected', this.vs30El).text();
    
    let model = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    
    let siteTitle = this.testSitePicker.getTestSiteTitle(model.region.value);

    let selectedFirstModel = $(':selected', this.firstModelEl).val();
    let selectedSecondModel = $(':selected', this.secondModelEl).val();
    
    let title = siteTitle + ', ' + imt + ', ' + vs30;

    let filename = 'dynamicCompare-' + 
        this.firstModelEl.value + '-' + 
        this.secondModelEl.value;

    this.hazardPlot.setPlotTitle(title)
        .setMetadata(metadata)
        .setTimeHorizonUsage(this.parameters.returnPeriod)
        .setUpperData(seriesData)
        .setUpperDataTableTitle('Hazard')
        .setUpperPlotFilename(filename)
        .setUpperPlotIds(seriesIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperTimeHorizon(this.returnPeriodEl.value)
        .setUpperXLabel(xLabel)
        .setUpperYLabel(yLabel)
        .removeSmallValues(this.hazardPlot.upperPanel, 1e-16)
        .plotData(this.hazardPlot.upperPanel);
    
    this.plotReturnPeriodDifference(seriesData);
    this.plotModelDifference(seriesData);
    
    /* Update response spectrum and return period plot */      
    $(this.returnPeriodEl).on('change input', (event) => {
      this.serializeUrls();
      this.plotReturnPeriodDifference(seriesData);
      this.plotResponseSpectrum(results);
      this.hazardPlot
          .setUpperTimeHorizon(this.returnPeriodEl.value)
          .plotReturnPeriod(this.hazardPlot.upperPanel);
    });
  }

  /**
  * @method plotModelDifference
  *
  * Calculate the percent difference of the selected models and 
  *     plot.
  */
  plotModelDifference(hazardData) {
    let firstModel = hazardData[0];
    let secondModel = hazardData[1];
    let yValues = [];
    let xValues = [];
    for (let i in firstModel) {
      let xValFirst = firstModel[i][0];
      let xValSecond = secondModel[i][0];
      let yValFirst = firstModel[i][1];
      let yValSecond = secondModel[i][1];
      
      if (xValFirst == null) continue;

      let xyPair = secondModel.find((val) => {
        return xValFirst == val[0];
      });
      
      if (xyPair != undefined || xyPair != null) {
        let diff = Tools.percentDifference(yValFirst, yValSecond); 
        if (!isNaN(diff) && diff != null) {
          xValues.push(xyPair[0]);
          yValues.push(Number(diff.toFixed(4))); 
        }
      }
    }
    
    let seriesData = [];
    seriesData.push(d3.zip(xValues, yValues)); 
    let selectedFirstModel = $(':selected', this.firstModelEl).text();
    let selectedSecondModel = $(':selected', this.secondModelEl).text();

    let filename = 'dynamicCompareDiff-' + 
        this.firstModelEl.value + '-' + 
        this.secondModelEl.value;

    let label = selectedFirstModel + ' Vs. ' + selectedSecondModel;  
    let xDomain = this.hazardPlot.upperPanel.xExtremes;

    this.hazardPlot.setLowerData(seriesData)
        .setLowerDataTableTitle('Percent Difference')
        .setLowerPlotFilename(filename)
        .setLowerPlotIds(['percent-difference'])
        .setLowerPlotLabels([label])
        .setLowerXLabel(this.hazardPlot.upperPanel.xLabel)
        .setLowerYLabel('% difference')
        .plotData(this.hazardPlot.lowerPanel, xDomain);
  }

  /**
  * @method plotResponseSpectrum
  *
  * Calculate the response spectrum and plot.
  */
  plotResponseSpectrum(results) {
    let metadata = this.getMetadataSpectra();
    metadata.url = window.location.href;
    metadata.date = results[0].date;

    let returnPeriod = 1 / this.returnPeriodEl.value; 
    let seriesData = [];
    let seriesLabels = [];
    let seriesIds = [];
    let supportedValues = this.modelSupports('imt');

    for (let result of results) {
      let spectraX = [];
      let spectraY = [];

      let responses = result.response.filter((response) => {
        return supportedValues.find((sp) => {
          return sp.value == response.metadata.imt.value;
        });
      });
      
      for (let response of responses) {
        let imt = response.metadata.imt.value;
        let xValues = response.metadata.xvalues;
        let data = response.data.filter((data) => {
          return data.component == 'Total';
        })[0];
        
        let values = data.yvalues.filter((val) => {
          return val > returnPeriod;
        });
        let index = data.yvalues.indexOf(values.pop());
        
        let x0 = xValues[index];
        let x1 = xValues[index + 1];
        let y0 = data.yvalues[index];
        let y1 = data.yvalues[index + 1];
        
        let gm = Tools.returnPeriodInterpolation(x0, x1, y0, y1, returnPeriod);
        gm = isNaN(gm) ? null : Number(gm.toFixed(6));
        let per = imt == 'PGA' ? 'PGA' : Tools.imtToValue(imt);
        spectraX.push(per);
        spectraY.push(gm);
      }
      
      let edition = result.response[0].metadata.edition.value;
      let region = result.response[0].metadata.region.value;
      let model = this.parameters.models.values.find((model) => {
        return model.edition == edition && 
            model.region.value == region;
      });
      seriesData.push(d3.zip(spectraX, spectraY));
      seriesLabels.push(model.display);
      seriesIds.push(model.value);
    }
    
    let model = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    
    let vs30 = $(':selected', this.vs30El).text();
    let siteTitle = this.testSitePicker.getTestSiteTitle(model.region.value);
    
    let title = 'Response Spectrum at ' + 
        this.returnPeriodEl.value + ' years, ' +
        siteTitle + ', ' + vs30;
         
    let xLabel = 'Spectral Period (s)';
    let yLabel = results[0].response[0].metadata.xlabel;

    let filename = 'dynamicCompareSpectra-' + 
        this.firstModelEl.value + '-' + 
        this.secondModelEl.value; 
    
    let bounds = this.getResponseSpectraExtremes(results);
    this.spectraPlot.setPlotTitle(title)
        .setMetadata(metadata)
        .setUpperData(seriesData)
        .setUpperDataTableTitle('Spectrum')
        .setUpperPlotFilename(filename)
        .setUpperPlotIds(seriesIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperXLabel(xLabel)
        .setUpperYLabel(yLabel)
        .plotData(this.spectraPlot.upperPanel, null, bounds);
    
    this.plotResponseSpectrumDifference(seriesData);

    /* Update hazard curves on IMT click */
    this.onSpectraPlotImtClick(this.spectraPlot.upperPanel);
  }

  /**
  * Listen for a data point to be clicked and update the 
  *     hazard curves to that IMT.
  */ 
  onSpectraPlotImtClick(panel) {
    d3.select(panel.allDataEl)
        .selectAll('.data')
        .selectAll('circle')
        .on('click', (d, i, els) => {
          let imtVal = d[0];
          let imt = Tools.valueToImt(imtVal);
          this.imtEl.value = imt;
          $(this.imtEl).trigger('change');
        });
  }
  
  /**
  * @method plotResponseSpectrumDifference
  *
  * Calculate the percent difference of the selected models and 
  *     plot.
  */
  plotResponseSpectrumDifference(spectraData) {
    let firstModel = spectraData[0];
    let secondModel = spectraData[1];
    let yValues = [];
    let xValues = [];
    
    for (let i in firstModel) {
      let xValFirst = firstModel[i][0];
      let xValSecond = secondModel[i][0];
      let yValFirst = firstModel[i][1];
      let yValSecond = secondModel[i][1];
     
      let xVal = secondModel.find((val) => {
        return xValFirst == val[0];
      })[0];
      
      if (!isNaN(xVal) && xVal != null) {
        let diff = Tools.percentDifference(yValFirst, yValSecond); 
        if (!isNaN(diff)) {
          xValues.push(xVal);
          yValues.push(Number(diff.toFixed(4))); 
        }
      }
    }
    let seriesData = [];
    seriesData.push(d3.zip(xValues, yValues)); 
     
    let selectedFirstModel = $(':selected', this.firstModelEl).text();
    let selectedSecondModel = $(':selected', this.secondModelEl).text();

    let label = selectedFirstModel + ' Vs. ' + selectedSecondModel;  
    let xDomain = this.spectraPlot.upperPanel.xExtremes;
    
    let filename = 'dynamicCompareSpectraDiff-' + 
        this.firstModelEl.value + '-' + 
        this.secondModelEl.value;
    
    this.spectraPlot.setLowerData(seriesData)
        .setLowerDataTableTitle('Percent Difference')
        .setLowerPlotFilename(filename)
        .setLowerPlotIds(['percent-difference'])
        .setLowerPlotLabels([label])
        .setLowerXLabel(this.spectraPlot.upperPanel.xLabel)
        .setLowerYLabel('% difference')
        .plotData(this.spectraPlot.lowerPanel, xDomain);
    
    /* Update hazard curves on IMT click */
    this.onSpectraPlotImtClick(this.spectraPlot.lowerPanel);
  }

  /**
  * @method plotReturnPeriodDifference
  *
  */
  plotReturnPeriodDifference(hazardData) {
    let xyValues = Tools.d3XYDataToArrays(hazardData);
    let returnPeriod = 1 / this.returnPeriodEl.value;
    let gmInterpValues = [];

    for (let modelData of xyValues) {
      let values = modelData.yValues.filter((val) => {
        return val > returnPeriod;
      });
      let index = modelData.yValues.indexOf(values.pop());
      
      let x0 = modelData.xValues[index]; 
      let x1 = modelData.xValues[index + 1]; 
      let y0 = modelData.yValues[index]; 
      let y1 = modelData.yValues[index + 1]; 
      
      gmInterpValues.push(Tools.returnPeriodInterpolation(
          x0, x1, y0, y1, returnPeriod));
    }
   
    let percentDifference = Tools.percentDifference(
        gmInterpValues[0],
        gmInterpValues[1]);
    
    let xDomain = this.hazardPlot.upperPanel.xBounds.domain();
    let xMax = xDomain[1];
    
    d3.select(this.hazardPlot.upperPanel.plotEl)
        .select('.return-period')
        .selectAll('text')
        .remove();

    let data = d3.zip([xMax], [returnPeriod]);
    let text = this.returnPeriodEl.value + ' years, % Diff = ' + 
        percentDifference.toFixed(4);

    d3.select(this.hazardPlot.upperPanel.plotEl)
        .select('.return-period')
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', this.hazardPlot.upperPanel.line.x())
        .attr('y', this.hazardPlot.upperPanel.line.y())
        .attr('dy', -10)
        .attr('text-anchor', 'end')
        .text(text);
  }

  /**
  * @method plotSetupHazrd
  *
  * Set the plot options for hazard plots.
  */
  plotSetupHazard() {
    let plotOptions = {
      plotLowerPanel: true,
      syncXAxis: true,
      syncYAxis: false,
    };

    let hazardTooltip = ['Model:', 'GM (g):', 'AFE:'];
    let hazardOptions = {
      legendLocation: 'bottomleft',
      plotReturnPeriod: true,
      tooltipText: hazardTooltip,
      tooltipYToExponent: true,
    };
    
    let diffTooltip = ['', 'GM (g):', '% difference:'];
    let diffOptions = {
      tooltipText: diffTooltip,
      plotHeight: 224,
      showLegend: false,
      yAxisScale: 'linear',
    };
    
    return new D3LinePlot(
        this.contentEl,
        plotOptions,
        hazardOptions,
        diffOptions)
        .withPlotHeader()
        .withPlotFooter();
  }
  
  /**
  * @method plotSetupSpectra
  *
  * Set the plot options for response spectra plot.
  */
  plotSetupSpectra() {
    let plotOptions = {
      plotLowerPanel: true,
      syncXAxis: true,
      syncYAxis: false,
      xAxisScale: 'linear',
    };

    let spectraTooltip = ['Model:', 'Period (s):', 'GM (g):'];
    let spectraOptions = {
      legendLocation: 'topright',
      tooltipText: spectraTooltip,
      yAxisScale: 'linear',
    };
    
    let diffTooltip = ['', 'Period (s):', '% difference:'];
    let diffOptions = {
      tooltipText: diffTooltip,
      plotHeight: 224,
      showLegend: false,
      yAxisScale: 'linear',
    };
    
    return new D3LinePlot(
        this.contentEl,
        plotOptions,
        spectraOptions,
        diffOptions)
        .withPlotHeader()
        .withPlotFooter();
  }
  
  /**
  * @Override
  * @method serializeUrls
  *
  * Get URLs to query.
  */
  serializeUrls() {
    let urls = [];
    let inputs = $(this.inputsEl).serialize();
    let windowUrl = '';
    for (let modelEl of [this.firstModelEl, this.secondModelEl]) {
      let model = Tools.stringToParameter(
          this.parameters.models, 
          modelEl.value);
      let edition = model.edition;
      let region = model.region.value;
      urls.push(this.dynamicUrl + 
          '?edition=' + edition +
          '&region=' + region +
          '&' + inputs);
      windowUrl += '&model=' + modelEl.value; 
    }
    windowUrl += '&' + inputs + 
        '&imt=' + this.imtEl.value +
        '&returnperiod=' + this.returnPeriodEl.value;
    
    window.location.hash = windowUrl.substring(1);
    return urls;
  }

  /**
  * @method setComparableModels
  *
  * Given the models in nshmp-haz-ws/source/models find only models
  *     that can be compared, ones that have that same region.
  */
  setComparableModels() {
    this.comparableModels = this.parameters.models.values.filter((model) => {
      let regions = this.parameters.models.values.filter((modelCheck) => {
        return model.region.value == modelCheck.region.value;
      });
      return regions.length > 1;
    });
  }

  /**
  * @method setFirstModelMenu
  *
  * Set the first model select menu with only comparable models.
  * See setComparableModels().
  */
  setFirstModelMenu() {
    Tools.setSelectMenu(this.firstModelEl, this.comparableModels); 
    this.firstModelEl.value = this.options.defaultFirstModel;
  }

  /**
  * @method setParameterMenu
  *
  * Set select menus with supported values of the selected models.
  * @param {HTMLElement} el - The dom element of the select menu to set.
  */
  setParameterMenu(el, defaultValue) {
    let firstModel = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    
    let secondModel = Tools.stringToParameter(
        this.parameters.models,
        this.secondModelEl.value);
    
    let supports = [];
    supports.push(firstModel.supports[el.id]);
    supports.push(secondModel.supports[el.id]);
    
    let supportedValues = Tools.supportedParameters(
        this.parameters[el.id ], 
        supports);
    
    Tools.setSelectMenu(el, supportedValues); 
    
    let hasDefaultValue = supportedValues.some((val) => {
      return defaultValue == val.value; 
    });

    if (hasDefaultValue) el.value = defaultValue;
  }

  /**
  * @method setSecondModelMenu
  *
  * Set the second model select menu with only comparable models to 
  *     the first selected model.
  */
  setSecondModelMenu() {
    let selectedModel = Tools.stringToParameter(
        this.parameters.models,
        this.firstModelEl.value);
    
    let comparableModels = this.comparableModels.filter((model) => {
      return selectedModel.region.value == model.region.value && 
          selectedModel != model;
    });
    
    Tools.setSelectMenu(this.secondModelEl, comparableModels);
  }

  /**
  * @method updatePlot
  *
  * Call the hazard web service for each model and plot the resuls.
  */
  updatePlot() {
    let urls = this.serializeUrls();
    let promises = [];
     
    for (let url of urls) {
      promises.push($.getJSON(url));
    }
    this.spinner.on(promises, 'Calculating'); 
    
    Promise.all(promises).then((results) => {
      this.spinner.off();
      this.footer.setMetadata(results[0].server); 
      
      /* Update tooltips for input */
      this.addInputTooltip();
      /* Plot response spectrum */
      this.plotResponseSpectrum(results);
      /* Plot hazard curves */
      this.plotHazardCurves(results);
      /* Update plot on IMT change */
      this.onImtChange(results);
      /* Update return period value */ 
      this.onReturnPeriodDrag();
      
      /* Get raw data */
      this.footer.onRawDataBtn(urls); 
    });
  }

}
