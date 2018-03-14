'use strict'

/**
* @class Footer
*
* @fileoverview Creates the footer to be used with all 
*     nshmp-haz-ws webapps. 
*     The footer contains two buttons: 
*       - raw-data: When clicked would open a new 
*          tab with raw JSON return.
*       - update-plot: When clicked would update the plot(s).
*
* @author bclayton@usgs.gov (Brandon Clayton)
*
*
* @typedef {Object} FooterOptions - Options for page footer
* @property {String} position - CSS position: fixed || absolute
* @property {Boolean} rawBtnDisable - Whether the raw button is disabled or not
* @property {Boolean} updateBtnDisable - Whether the update button is disabled
*
*
* @typedef {Object} Server - Server object from nshmp-haz-ws response.
* @property {{
*   url: {String},
*   version: {String},
* }} nshmp-haz - nshmp-haz info.
* @property {{
*   url: {String},
*   version: {String},
* }} nshmp-haz-ws - nshmp-haz-ws info.
* @poperty {Number} threads - Number of threads used.
* @property {String} servlet.
* @property {String} calc - Calculation time.
*/
export default class Footer{
  
  /**
  * @param {HTMLElement=} containerEl - DOM element to put the footer
  */ 
  constructor(containerEl = document.querySelector('body')) {
    /** @type {FooterOptions} */
    this.options = {
      position: 'fixed',
      rawBtnDisable: false,
      updateBtnDisable: false,
    };       

    let btns = [
      {
        class: 'btn btn-primary',
        id: 'update-plot',
        text: 'Update',
      }, {
        class: 'btn btn-danger pull-right',
        id: 'raw-data',
        text: 'Raw Data',
      }
    ];
    
    // Append footer to body
    let footerD3 = d3.select(containerEl)
        .append('div')
        .attr('class', 'Footer')
        .attr('id', 'footer');
    
    // Add footer buttons
    footerD3.append('div')
        .attr('class', 'footer-btns')
        .selectAll('button')
        .data(btns)
        .enter()
        .append('button')
        .attr('class', (d) => { return d.class; })
        .attr('id', (d) => { return d.id; })
        .text((d) => { return d.text; })
    
    // Add info icon
    footerD3.append('div')
        .attr('class', 'glyphicon glyphicon-info-sign code-info-icon disabled')
        .property('disabled', true)
        .attr('data-toggle', 'false')
        .attr('data-target', '#code-info-collapse');
    
    // Add collapsable div for metadata
    footerD3.append('div')
        .attr('class', 'collapse code-info-collapse')
        .attr('id', 'code-info-collapse')
        .append('div')
        .attr('class', 'well')
        .attr('id', 'code-info');

    /* 
    btnRightD3.append('span')
        .attr('class', 'glyphicon glyphicon-cog settings-btn')
        .attr('title', 'Settings');
    */

    footerD3.lower();

    /** @type {HTMLElment} */
    this.footerEl = footerD3.node();
    /** @type {HTMLElment} */
    this.codeInfoEl = this.footerEl.querySelector('#code-info');
    /** @type {HTMLElment} */
    this.codeInfoIconEl = this.footerEl.querySelector('.code-info-icon');
    this.codeInfoCollapseEl = this.footerEl
        .querySelector('#code-info-collapse');
    /** @type {HTMLElment} */
    this.rawBtnEl = this.footerEl.querySelector('#raw-data');
    /** @type {HTMLElment} */
    this.updateBtnEl = this.footerEl.querySelector('#update-plot');
    //this.settingsBtnEl = this.footerEl.querySelector('.settings-btn');
    
    this.onCodeInfo();
    this.onDocumentKeypress();
  }
  
  /**
  * @method onCodeInfo
  */
  onCodeInfo() {
    $(this.codeInfoIconEl).on('click', (event) => {
      let isDisabled = d3.select(event.target).property('disabled');
      if (isDisabled) return;
      $(this.codeInfoCollapseEl).collapse('toggle');
    });
  }

  /**
  * @method onDocumentKeypress
  */
  onDocumentKeypress() {
    let returnKeyCode = 13;

    $(document).keypress((event) => {
      let isDisabled = $(this.updateBtnEl).prop('disabled');
      let isAlreadyLoading = $('*').hasClass('Spinner'); 
      if (event.which == returnKeyCode && !isDisabled && !isAlreadyLoading) {
        $(this.updateBtnEl).click();
      }
    });
  }

  /**
  * @method removeButtons
  *
  * Remove the update and raw data buttons
  */
  removeButtons() {
    d3.select(this.rawBtnEl)
        .remove();

    d3.select(this.updateBtnEl)
        .remove();

    return this;
  }

  /**
  * @method removeInfoIcon
  */ 
  removeInfoIcon() {
    d3.select(this.codeInfoIconEl)
        .remove();

    return this;
  }

  /**
  * @method setMetadata
  *
  * Set the collapsable panel with the nshmp-haz version number.
  * @param {Server} server - Server object from response.
  */
  setMetadata(server) {
    if (server == undefined) return;

    d3.select(this.codeInfoIconEl)
        .property('disabled', false)
        .classed('disabled', false);

    let codeInfo = [
      ['nshmp-haz version: ' + server['nshmp-haz'].version],
      ['nshmp-haz-ws version: ' + server['nshmp-haz-ws'].version],
      ['Cores used: ' + server['threads']],
    ];
    
    d3.select(this.codeInfoEl)
        .selectAll('div')
        .data(codeInfo)
        .enter()
        .append('div')
        .text((d) => { return d; });
  }

  /**
  * @method setOptions
  *
  * Set the footer options
  *
  * @param {FooterOptions} options -  Footer options 
  */
  setOptions(options) {
    options.position = options.position == 'fixed' || 
        options.position == 'absolute' ? options.position : 'fixed';
         
    $.extend(this.options, options);
    this.updateOptions();
  }

  /**
  * @method updateOptions
  *
  * Update the footer options: whether to disable the footer buttons;
  */
  updateOptions() {
    d3.select(this.footerEl)
        .style('position', this.options.position);
         
    d3.select(this.rawBtnEl)
        .property('disabled', this.options.rawBtnDisable);   
  
    d3.select(this.updateBtnEl)
        .property('disabled', this.options.updateBtnDisable);
  }

}
