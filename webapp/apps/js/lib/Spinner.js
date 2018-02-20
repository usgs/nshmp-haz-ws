'use strict';

/**
* @class Spinner
*
* @fileoverview Creates a loading spinner
* 
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class Spinner{
 
  /**
  * @param {HTMLElement=} containerEl - Optional container element to put 
  *     spinner. Default is body.
  */ 
  constructor(containerEl = document.querySelector('body')) {
    /** @type {HTMLElement */
    this.containerEl = containerEl;
  }

  /**
  * @method off 
  *
  * Remove the loading spinner overlay 
  */
  off() {
    d3.select(this.containerEl)
        .select('.loading-spinner')
        .remove();
  }
  
  /**
  * @method on
  *
  * Create a loading spinner overlay 
  * @param {String=} text - Optional text to put under the spinner. 
  *     Default is 'Loading ...'
  */
  on(text = 'Loading ...') {
    let spinnerD3 = d3.select(this.containerEl)
        .append('div')
        .attr('class', 'loading-spinner');

    spinnerD3.append('div')
        .attr('id', 'overlay');

    let loaderD3 = spinnerD3.append('div')
        .attr('id', 'loader');

    loaderD3.append('div')
        .attr('id', 'spinner');

    loaderD3.append('div')
        .attr('id', 'loader-text')
        .text(text);
  }

}
