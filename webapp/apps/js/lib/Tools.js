'use strict';

/**
* @class Tools
*
* @fileoverview This class contains static methods that can be used
*     in any web app.
*
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class Tools {

  /**
  * @method setSelectMenu
  *
  * Add options to a select menu with and id, value, and text.
  * @param {HTMLElement} el - Select menu dom element to add options.
  * @param {Object} paramValues - Parameters to add as options, containing
  *     a value and display key.
  */
  static setSelectMenu(el, paramValues) {
    d3.select(el)
        .selectAll('option')
        .remove();

    d3.select(el)
        .selectAll('option')
        .data(paramValues.sort(Tools.sortByDisplayOrder))
        .enter()
        .append('option')
        .attr('id', (d, i) => { return d.value; })
        .attr('value', (d, i) => { return d.value; })
        .text((d, i) => { return d.display; });
  }
  
  /**
  * @method sortByDisplayOrder
  *
  * Sort parameters by display order.
  */
  static sortByDisplayOrder(parA, parB) {
    return (parA.displayorder - parB.displayorder);
  }

  /**
  * @method stringArrayToParameters
  *
  * Given an array of strings of values find the corresponding usage
  *     paramaters with that value. 
  *     For example, editions: ['E2008', 'E2014'], would return 
  *     an array of objects corresponding to E2008 and E2014.
  * @param {Object} usageParams - Usage parmater from web service.
  *     For example: response.parameters.imt || response.parameters.edition
  * @param {Array<String>} values - String values to match in usage.
  * @return {Array<Object>} Array of usage objects.
  */
  static stringArrayToParameters(usageParams, values) {
    let parameters = usageParams.values.filter((par, i) => {
      return values.find((val, iv) => {
        return par.value == val;
      })
    });

    return parameters;
  }

  /**
  * @method stringToParameter
  *
  * Given a string of a value, find the corresponding usage
  *     paramaters with that value. 
  *     For example, editions: 'E2008', would return 
  *     an object corresponding to E2008.
  * @param {Object} usageParams - Usage parmater from web service.
  *     For example: response.parameters.imt || response.parameters.edition
  * @param {String} values - String value to match in usage.
  * @return {Object} Usage objects.
  */
  static stringToParameter(usageParams, value) {
    return usageParams.values.find((par, i) => {
      return par.value == value;
    });
  }
  
  /**
  * @method supportedParameters
  *
  * Given an array of an array of string values, find the common
  *     values that appear in each array. Then find all 
  *     parameter object in the usage that match the common
  *     values.
  * @param {Object} usageParams - Usage parmater from web service.
  *     For example: response.parameters.imt || response.parameters.edition
  * @param {Array<Array<String>>}
  * @return {Array<Object>} Array of usage objects.
  */
  static supportedParameters(usageParams, supports) {
    let uniqueValues = [];
    supports.toString().split(',').forEach((val) => {
      if ($.inArray(val, uniqueValues) == -1) {
        uniqueValues.push(val);
      }
    });
    
    let commonValues = uniqueValues.filter((val, iuv) => {
      return supports.every((support, is) => {
        return support.includes(val);
      })
    });
    
    return Tools.stringArrayToParameters(usageParams, commonValues);
  }
   
  /**
  * @method urlQueryStringToObject
  *
  * Take a URL string and convert into object of key/value pairs.
  * @param {String} url - String to convert to object.
  * @return {Object} - Object of key/value pairs from URL string.
  */
  static urlQueryStringToObject(url) {
    let urlObject = {};
    let pairs = url.split('&');
    pairs.forEach((pair, i) => {
      let key = pair.split('=')[0];
      let value = pair.split('=')[1];
      urlObject[key] = value;
    });
    
    return urlObject;
  }

}
