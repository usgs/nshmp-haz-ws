
/**
 * @fileoverview Error class that will create a Bootstrap modal
 *    with the error message.
 * 
 * @extends Error
 * @author Brandon Clayton
 */
export default class NshmpError extends Error {

  /**
   * Create a Boostrap modal with an error message.
   *  
   * @param {String} errorMessage The error message to display.
   */
  constructor(errorMessage) {
    super(errorMessage);

    if (errorMessage instanceof NshmpError) {
      console.error(errorMessage);
      return;
    }

    this.message = errorMessage;
    let els = this._createErrorModal();
    this.el =  els.get('el');
    this.headerEl = els.get('headerEl');
    this.bodyEl = els.get('bodyEl');

    $(this.el).modal({backdrop: 'static'});

    $(this.el).on('hidden.bs.modal', (event) => {
      d3.select(this.el).remove();
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NshmpError);
    }
  }

  /**
   * Ensures the truth of an expression 
   * @param {Boolean} expression Expression to check 
   * @param {String} errorMessage The exception message to use if the
   *    expression fails
   */
  static checkArgument(expression, errorMessage) {
    if (!expression) {
      throw new NshmpError(`IllegalArgumentException: ${errorMessage}`);
    }
  }

  /**
   * Check whether an argument is an arrray.
   * 
   * @param {Array} arr The array to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentArray(arr, errorMessage = 'Must be an array') {
    NshmpError.checkArgument(Array.isArray(arr), errorMessage);
  }

  /**
   * Check whether an argument is an array and all elements inside the
   *    array are of a specificed type.
   * 
   * @param {Array} arr The array to test 
   * @param {String} typeOf The type of data inside the array
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentArrayOf(arr, typeOf, errorMessage = 'Must be an array') {
    NshmpError.checkArgument(Array.isArray(arr), errorMessage);

    for (let data of arr) {
      NshmpError.checkArgument(typeof(data) == typeOf, `Must be a [${typeOf}]`);
    }
  }

  /**
   * Check whether an argument is a boolean.
   * 
   * @param {Boolean} bool The boolean to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentBoolean(bool, errorMessage = 'Must be a boolean') {
    NshmpError.checkArgument(typeof bool == 'boolean', errorMessage);
  }

  /**
   * Check whether an argument is a integer.
   * 
   * @param {Number} int The number to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentInteger(int, errorMessage = 'Must be an integer') {
    NshmpError.checkArgument(Number.isInteger(int), errorMessage);
  }

  /**
   * Check whether an argument is a number.
   * 
   * @param {Number} num The number to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentNumber(num, errorMessage = 'Must be a number') {
    NshmpError.checkArgument(typeof num == 'number', errorMessage);
  }

  /**
   * Check whether an argument is a object.
   * 
   * @param {Object} obj The object to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentObject(obj, errorMessage = 'Must be an object') {
    NshmpError.checkArgument(typeof obj == 'object', errorMessage);
  }

  /**
   * Check whether an argument is a string.
   * 
   * @param {String} str The string to test 
   * @param {String=} errorMessage An optional error message to show
   */
  static checkArgumentString(str, errorMessage = 'Must be a string') {
    NshmpError.checkArgument(typeof str == 'string', errorMessage);
  }

  /**
   * Ensures the truth of an expression 
   * @param {Boolean} expression Expression to check 
   * @param {String} errorMessage The exception message to use if the
   *    expression fails
   */
  static checkState(expression, errorMessage) {
    if (!expression) {
      throw new NshmpError(`IllegalStateException: ${errorMessage}`);
    }
  }

  /**
   * Check an array of web service responses to see if any web service
   *    response has "status" = "error".
   * 
   * If a web service has an error, a native JavaScript 
   *    Error is thrown to allow a catch method to catch it.
   * 
   * If a web service response has status error and the 
   *    supplied plot has a method clearData, it will be invoked
   *    for the upper panel and lower panel.
   * 
   * @param {Array<Object>} responses The web service responses 
   * @param {D3LinePlot || D3GeoDeagg} plots The plots to clear
   */
  static checkResponses(responses, ...plots) {
    let errorMessage = '';
    let hasError = false;

    for (let response of responses) {
      let status = response.status;
      if (status == 'error') {
        hasError = true;
        errorMessage += '<p>' + response.message + '</p> \n';
      }
    }

    if (hasError) {
      for (let plot of plots) {
        if (plot.clearData) {
          plot.clearData(plot.upperPanel);
          plot.clearData(plot.lowerPanel);
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Check a web service response to see for "status" = "error".
   * 
   * If a web service has an error, a native JavaScript 
   *    Error is thrown to allow a catch method to catch it.
   * 
   * If a web service response has status error and the 
   *    supplied plot has a method clearData, it will be invoked
   *    for the upper panel and lower panel.
   * 
   * @param {Object} response 
   * @param {D3LinePLot || D3GeoDeagg} plots The plots to clear 
   */
  static checkResponse(response, ...plots) {
    return NshmpError.checkResponses([response], ...plots);
  }

  /**
   * Convience method to throw a new NshmpError.
   * If the error message equals 'cancal' an error is not thrown,
   *    useful when canceling a Promise.
   * 
   * @param {String} errorMessage The exception message to use
   */
  static throwError(errorMessage) {
    if (errorMessage instanceof NshmpError) {
      console.error(errorMessage);
      return
    }
    
    if (errorMessage == 'cancel') return;
    
    throw new NshmpError(errorMessage);
  }

  /**
   * Create the Bootstrap modal
   */
  _createErrorModal() {
    /* Modal */
    let overlayD3 = d3.select('body')
        .append('div')
        .attr('class', 'modal error-modal')
        .attr('tabindex', '-1')
        .attr('role', 'dialog');

    /* Modal content */
    let contentD3 = overlayD3.append('div')
        .attr('class', 'modal-dialog vertical-center')
        .attr('role', 'document')
        .style('display', 'grid')
        .style('margin', '0 auto')
        .append('div')
        .attr('class', 'modal-content')
        .style('overflow', 'hidden');
    
    let contentEl = contentD3.node();
    let el = overlayD3.node();

    let headerEl = this._createModalHeader(contentEl);
    let bodyEl = this._createModalBody(contentEl);

    let els = new Map();
    els.set('el', el);
    els.set('headerEl', headerEl);
    els.set('bodyEl', bodyEl);

    return els;
  }

  /**
   * Create the modal header
   * @param {HTMLElement} modalEl The modal element
   */
  _createModalHeader(modalEl) {
    let headerD3 = d3.select(modalEl)
        .append('div')
        .attr('class', 'modal-header')
        .style('background-color', '#EF9A9A');
    
    headerD3.append('button')
        .attr('type', 'button')
        .attr('class', 'btn close')
        .attr('data-dismiss', 'modal')
        .style('opacity', '0.5')
        .append('span')
        .attr('class', 'glyphicon glyphicon-remove')

    headerD3.append('h4')
        .attr('class', 'modal-title')
        .text('Error');
    
    return headerD3.node();
  }

  /**
   * Create the modal body
   * @param {HTMLElement} modalEl The model element
   */
  _createModalBody(modalEl) {
    let bodyD3 = d3.select(modalEl)
        .append('div')
        .attr('class', 'modal-body')
        .style('word-wrap', 'break-word')
        .html(this.message);

    return bodyD3.node();
  }

}
