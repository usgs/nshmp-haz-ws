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
* @typedef {Object} FooterOptions - Options for page footer
* @property {String} position - CSS position: fixed || absolute
* @property {Boolean} rawBtnDisable - Whether the raw button is disabled or not
* @property {Boolean} updateBtnDisable - Whether the update button is disabled
*
* @author bclayton@usgs.gov (Brandon Clayton)
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

    // Append footer to body
    let footerD3 = d3.select(containerEl)
        .append('div')
        .attr('id', 'footer');

    // Append update plot button to footer
    footerD3.append('button')
        .attr('id', 'update-plot')
        .attr('class', 'btn btn-primary')
        .text('Update');
    
    // Append raw data button to footer
    let btnRightD3 = footerD3.append('span')
        .append('div')
        .attr('class', 'btn-float-right');
    
    btnRightD3.append('button')
        .attr('id', 'raw-data')
        .attr('class', 'btn btn-danger')
        .text('Raw Data');
    /* 
    btnRightD3.append('span')
        .attr('class', 'glyphicon glyphicon-cog settings-btn')
        .attr('title', 'Settings');
    */

    footerD3.lower();

    /** @type {HTMLElment} */
    this.footerEl = footerD3.node();
    /** @type {HTMLElment} */
    this.rawBtnEl = this.footerEl.querySelector('#raw-data');
    /** @type {HTMLElment} */
    this.updateBtnEl = this.footerEl.querySelector('#update-plot');
    //this.settingsBtnEl = this.footerEl.querySelector('.settings-btn');
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
