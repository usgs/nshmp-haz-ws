
import { WebServiceResponse, ServiceParameter } from './WebServiceResponse.js';
import { Preconditions } from '../error/Preconditions.js';
import Tools from '../lib/Tools.js';

/**
 * 
 */
export class HazardServiceResponse extends WebServiceResponse {

  /**
   * 
   * @param {Object} hazardResponse 
   */
  constructor(hazardResponse) {
    Preconditions.checkArgumentObject(hazardResponse);
    super(hazardResponse);

    Preconditions.checkStateObjectProperty(hazardResponse, 'response');
    Preconditions.checkStateArrayOf(hazardResponse.response, 'object');

    /** @type Array<HazardResponse> The hazard responses */
    this.response = hazardResponse.response.map((response) => {
      return new HazardResponse(response);
    });
    
  }

  /**
   * 
   * @param {String} imt 
   */
  getResponse(imt) {
    Preconditions.checkArgumentString(imt);

    return this.response.find((response) => { 
      return response.metadata.imt.value == imt;
    });
  }

  /**
   * 
   * @param {String} component 
   * @param {Number} returnPeriod 
   * @returns {Array<Array<Number>>} The response spectrum
   */
  calculateResponseSpectrum(component, returnPeriod) {
    let xValues = [];
    let yValues = [];

    for (let response of this.response) {
      xValues.push(Tools.imtToValue(response.metadata.imt.value));
      yValues.push(response.toResponseSpectrum(component, returnPeriod));
    }

    return [ xValues, yValues ];
  }

  /**
   * 
   * @param {Number} returnPeriod 
   */
  toResponseSpectrum(returnPeriod) {
    Preconditions.checkArgumentNumber(returnPeriod);

    return new HazardResponseSpectrum(this, returnPeriod);
  }

}

export class HazardResponse {
  
  /**
   * 
   * @param {Object} response 
   */
  constructor(response) {
    Preconditions.checkArgumentObject(response);
    Preconditions.checkStateObjectProperty(response, 'metadata');
    Preconditions.checkStateObjectProperty(response, 'data');
    Preconditions.checkStateArrayOf(response.data, 'object');

    /** @type {HazardResponseMetadata} The response metadata */
    this.metadata = new HazardResponseMetadata(response);

    /** @type {Array<HazardResponseData>} The response data */
    this.data = response.data.map((data) => {
      return new HazardResponseData(data, this.metadata.xValues);
    });

  }

  /**
   * 
   * @param {String} component 
   */
  getDataComponent(component) {
    this._checkDataComponent(component);

    return this.data.find((data) => {
      return data.component == component;
    });
  }

  /**
   * Get all data components except for Total
   */
  getDataComponents() {
    return this.data.filter((data) => {
      return data.component != 'Total';
    });
  }

  /**
   * 
   * @param {String} component 
   * @param {Number} returnPeriod 
   * @returns {Number} The response spectrum value
   */
  toResponseSpectrum(component, returnPeriod) {
    this._checkDataComponent(component);
    Preconditions.checkArgumentNumber(returnPeriod);

    let responseData = this.getDataComponent(component);
    let xValues = this.metadata.xValues;
    let yValues = responseData.yValues;

    let afeIndexBelowReturnPeriod = yValues.findIndex((y) => {
      return y < returnPeriod;
    });

    let x0 = xValues[afeIndexBelowReturnPeriod - 1];
    let x1 = xValues[afeIndexBelowReturnPeriod];
    let y0 = yValues[afeIndexBelowReturnPeriod - 1];
    let y1 = yValues[afeIndexBelowReturnPeriod];

    let x = Tools.returnPeriodInterpolation(x0, x1, y0, y1, returnPeriod);
    x = isNaN(x) ? null : Number(x.toFixed(6));

    return x;
  }

  /**
   * 
   * @param {String} component 
   */
  _checkDataComponent(component) {
    Preconditions.checkArgument(
        component == 'Total' || 
            component == 'Grid' ||
            component == 'Interface' || 
            component == 'Fault' ||
            component == 'Slab' ||
            component == 'System' ||
            component == 'Cluster' ||
            component == 'Area',
        `Component [${component}] not supported`);
  }

}

export class HazardResponseMetadata {

  /**
   * 
   * @param {Object} response 
   */
  constructor(response) {
    Preconditions.checkArgumentObject(response);

    Preconditions.checkStateObjectProperty(response, 'metadata');
    let metadata = response.metadata;

    Preconditions.checkStateObjectProperty(metadata, 'model');
    Preconditions.checkStateObjectProperty(metadata, 'latitude');
    Preconditions.checkStateObjectProperty(metadata, 'longitude');
    Preconditions.checkStateObjectProperty(metadata, 'imt');
    Preconditions.checkStateObjectProperty(metadata, 'vs30');
    Preconditions.checkStateObjectProperty(metadata, 'xlabel');
    Preconditions.checkStateObjectProperty(metadata, 'ylabel');
    Preconditions.checkStateObjectProperty(metadata, 'xvalues');
    Preconditions.checkStateArrayOf(metadata.xvalues, 'number');

    /** @type {String} The source model */
    this.model = metadata.model;

    /** @type {Number} The latitude */
    this.latitude = metadata.latitude;
    
    /** @type {Number} The longitude */
    this.longitude = metadata.longitude;

    /** @type {ServiceParameter} The IMT parameter */
    this.imt = new ServiceParameter(metadata.imt);

    /** @type {ServiceParameter} The vs30 parameter */
    this.vs30 = new ServiceParameter(metadata.vs30); 
    
    /** @type {String} The X label */
    this.xLabel = metadata.xlabel;
    
    /** @type {Array<Number>} The X values */
    this.xValues = metadata.xvalues;

    /** @type {String} The Y label */
    this.yLabel = metadata.ylabel;
  }

}

export class HazardResponseData { 

  /**
   * 
   * @param {Object} data 
   * @param {Array<Number>} xValues
   */
  constructor(data, xValues) {
    Preconditions.checkArgumentObject(data);
    Preconditions.checkArgumentArrayOf(xValues, 'number');
    
    Preconditions.checkStateObjectProperty(data, 'component');
    Preconditions.checkStateObjectProperty(data, 'yvalues');
    Preconditions.checkStateArrayOf(data.yvalues, 'number');

    /** @type {String} The hazard curve component */
    this.component = data.component;

    /** @type {Array<Number>} The X values */
    this.xValues = xValues; 

    /** @type {Array<Number>} The Y values */
    this.yValues = data.yvalues;
  }

}

export class HazardResponseSpectrum {

  /**
   * 
   * @param {HazardServiceResponse} serviceResponse
   * @param {Number} returnPeriod
   */
  constructor(serviceResponse, returnPeriod) {
    Preconditions.checkArgumentInstanceOf(serviceResponse, HazardServiceResponse);
    Preconditions.checkArgumentNumber(returnPeriod);

    this.data = serviceResponse.response[0].data.map((data) => {
      return new ResponseSpectrumData(serviceResponse, data, returnPeriod);
    });
  }
  
  /**
   * Get all data components except for Total
   */
  getDataComponents() {
    return this.data.filter((data) => {
      return data.component != 'Total';
    });
  }

  /**
   * 
   * @param {String} component 
   */
  getDataComponent(component) {
    // this._checkDataComponent(component);

    return this.data.find((data) => {
      return data.component == component;
    });
  }

}

export class ResponseSpectrumData {

  /**
   * 
   * @param {HazardServiceResponse} serviceResponse 
   * @param {HazardResponseData} data 
   * @param {Number} returnPeriod 
   */
  constructor(serviceResponse, data, returnPeriod) {
    let spectra = serviceResponse.calculateResponseSpectrum(
        data.component,
        returnPeriod);

    this.component = data.component;

    this.xValues = spectra[0];

    this.yValues = spectra[1];
  }

}
