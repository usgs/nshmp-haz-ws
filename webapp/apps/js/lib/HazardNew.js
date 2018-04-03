'uset strict';

import Constraints from './Constraints.js';
import Footer from './Footer.js';
import Header from './Header.js';
import Spinner from './Spinner.js';
import Tools from './Tools.js';

/**
* @class Hazard
*
* @fileoverview Parent class for hazard based web apps including:
*     - DynamicCompare
*     - ModelCompare
*     - ModelExplorer
*
* This class contains common HTML elements including:
*     - #control: control panel
*     - #imt: IMT select menu
*     - #inputs: input form
*     - #lat: latitude input
*     - #lon: longitude input
*     - #return-period: return period input
*     - #return-period-btns: return period buttons
*     - #vs30: vs30 select menu
*
* @author Brandon Clayton
*/
export default class Hazard {
  
  /**
  * @param {String} webApp - Identifier of the application being used.
  *     Possible values: 'DynamicCompare', 'ModelComparison', 'ModelExplorer'.
  * @param {String} webServiceUrl - URK to corresponding web servce.
  *     Possible values: '/nshmp-haz-ws/hazard', '/nshmp-haz-ws/source/models'
  * @param {Config} config - The config file.
  */
  constructor(webApp, webServiceUrl, config) {
    /** @type {Footer} */
    this.footer = new Footer();
    this.footerOptions = {
        rawBtnDisable: true,
        updateBtnDisable: true,
    };
    this.footer.setOptions(this.footerOptions);
    
    /** @type {Header} */
    this.header = new Header();
    /** @type {Spinner} */
    this.spinner = new Spinner();
    /** @type {String} */
    this.currentWebApp = webApp;
    /** @type {String} */
    this.webServiceUrl = webServiceUrl;
    /** @type {Object} */
    this.config = config;

    /** @type {HTMLElement} */
    this.controlPanelEl = document.querySelector("#control");
    /** @type {HTMLElement} */
    this.imtEl = document.querySelector("#imt");
    /** @type {HTMLElement} */
    this.inputsEl = document.querySelector('#inputs');
    /** @type {HTMLElement} */
    this.latEl = document.querySelector("#lat");
    /** @type {HTMLElement} */
    this.lonEl = document.querySelector("#lon");
    /** @type {HTMLElement} */
    this.returnPeriodEl = document.querySelector('#return-period');
    /** @type {HTMLElement} */
    this.returnPeriodBtnsEl = document.querySelector('#return-period-btns');
    /** @type {HTMLElement} */
    this.vs30El = document.querySelector("#vs30");
    
    /**
    * Web applications extending the Hazard class
    * @enum {String}
    */
    this.WebApps = {
      MODEL_EXPLORER: 'ModelExplorer',
      MODEL_COMPARISON: 'ModelComparison',
      DYNAMIC_COMPARISON: 'DynamicComparison',
    };
  
    /** @type {String} */
    this.dynamicUrl = this.config.server.dynamic + '/nshmp-haz-ws/hazard';
    /** @type {String} */
    this.staticUrl = this.config.server.static + '/hazws/staticcurve/1';
 
    /* Update plot on click */ 
    $(this.footer.updateBtnEl).click((event) => {
      $(this.footer.rawBtnEl).off();
      this.footerOptions.rawBtnDisable = false;
      this.footer.setOptions(this.footerOptions);
      this.updatePlot();
    });
  }
  
  /**
  * @method checkCoordinates
  *
  * Given a region in the web service usage parameters, 
  *     check to see the inputted value in either
  *     the latitude or longitude input is correct.
  * @param {HTMLElement} el - The input element.
  * @param {Object} region - The region to check lat or lon against. 
  */
  checkCoordinates(el, region) {
    let min = el.id == 'lat' ? region.minlatitude :
        region.minlongitude;
    
    let max = el.id == 'lat' ? region.maxlatitude :
        region.maxlongitude;
    
    Constraints.check(el, min, max);
  }
  
  /**
  * @method checkReturnPeriod
  *
  * Check the return period input value using the Contraints.check method.
  *     If the value is out of range or bad, the plot cannot be updated.
  */
  checkReturnPeriod() {
    let period = this.parameters.returnPeriod;
    Constraints.check(
        this.returnPeriodEl, period.values.minimum, period.values.maximum);
  }

  /**
  * @method getUsage
  *
  * Get web service usage and set this.parameters to usage.parameters.
  * @param {Callback=} callback - An optional callback. 
  */
  getUsage(callback = () => {}) {
    this.callback = callback;
    let promise = $.getJSON(this.webServiceUrl);

    promise.done((usage) => {
      this.parameters = usage.parameters;
      this.buildInputs();
      this.callback();
    });
    
    promise.fail((err) => {
      console.log("getUsage: JSON error");
    });
  }

  /**
  * @method onReturnPeriodChange
  *
  * Listen for a return period button to be clicked or the return period
  *     input to be changed. Update the value of the input with the new button
  *     value. If a value is input, check to see if the value matches
  *     any of the button values and make that button active.
  */
  onReturnPeriodChange() {
    /* Update input with button value */
    $(this.returnPeriodBtnsEl).on('click', (event) => {
      let el = $(event.target).closest('.btn').find('input');
      let val = el.val();
      this.returnPeriodEl.value = val;
      $(this.returnPeriodEl).trigger('change');
      this.checkReturnPeriod();
    });
    
    /* See if input value matches a button value */
    $(this.returnPeriodEl).on('input', (event) => {
      this.checkReturnPeriod();
      
      d3.select(this.returnPeriodBtnsEl)
          .selectAll('label')
          .classed('active', false)
          .selectAll('input')
          .select((d, i, els) => {
            if (this.returnPeriodEl.value == els[i].value) {
              return els[i].parentNode;
            }
          })
          .classed('active', true);
    });
 
  }

  /**
  * @method setDefaultReturnPeriod
  *
  * Set the default return period value and button.
  */
  setDefaultReturnPeriod() {
    d3.select(this.returnPeriodBtnsEl)
        .selectAll('input')
        .filter('input[value="' + this.options.defaultReturnPeriod + '"]')
        .select((d, i, els) => { return els[0].parentNode })
        .classed('active', true);
    this.returnPeriodEl.value = this.options.defaultReturnPeriod;
  }

}
