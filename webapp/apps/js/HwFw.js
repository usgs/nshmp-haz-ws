'use strict';

import D3LinePlot from './lib/D3LinePlot.js';
import Constraints from './lib/Constraints.js';
import Gmm from './lib/Gmm.js';

/** 
* @class HwFw
* @extends Gmm
*
* @fileoverview Class for hw-fw.html, hanging wall effects web app.
* This class plots the results of nshmp-haz-ws/gmm/hw-fw web service.
* This class will first call out to nshmp-haz-ws/gmm/hw-fw web service
*     to obtain the usage and create the control panel with the following:
*     - Ground motions models
*     - Intensity measure type
*     - Magnitude
*     - Vs30
*     - Vs30 measured or inferred
*     - Z1.0
*     - Z2.5 
* Once the control panel is set, it can be used to select desired
*     parameters and plot ground motion vs. distance.
* A fault plane is shown underneath the ground motion vs. distance plot.
* To show hanging wall effects, three range sliders are shown next to the
*     fault plane and control the fault plane's:
*     - Dip (range: 0-90)
*     - Width (range: 1-30km)
*     - zTop (range: 0-10km)
* The fault plane is limited to having a fault bottom of 20km.
* Once the fault plane is changed with either of the sliders, the 
*   ground motions vs. distance plot is updated automatically. 
*
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class HwFw extends Gmm {
 
  /**
  * @param {HTMLElement} contentEl - Container element to put plots
  */ 
  constructor(config) {
    let webServiceUrl = '/nshmp-haz-ws/gmm/hw-fw';
    let webApp = 'HwFw';
    super(webApp, webServiceUrl, config);
    this.header.setTitle('Hanging Wall Effects');
    
    /**
    * @type {{
    *   lowerPlotWidth: {number} - Lower plot width in percentage,
    *   minDip: {number} - Minimum dip allowed in degrees,
    *   minWidth: {number} - Minimum width allowed in km,
    *   minZTop: {number} - Minimum zTop allowed in km,
    *   maxDip: {number} - Maximum dip allowed in degrees,
    *   maxWidth: {number} - Maximum width allowed in km,
    *   maxZTop: {number} - Maximum zTop allowed in km,
    *   maxFaultBottom: {number} - Maximum fault bottom allowed in km,
    *   rMaxDefault: {number} - Maximum distance,
    *   rMinDefault: {number} - Minimum distance,
    *   stepDip: {number} - Step in dip in degrees,
    *   stepWidth: {number} - Step in width in km,
    *   stepZTop: {number} - step in zTop in km
    * }} Object 
    */ 
    this.options = {
      lowerPlotWidth: 0.65,  
      minDip: 10,
      minWidth: 1,
      minZTop: 0,
      maxDip: 90,
      maxWidth: 30,
      maxZTop: 10,
      maxFaultBottom: 20,
      rMax: 70,
      rMin: -20,
      stepDip: 5,
      stepWidth: 0.5,
      stepZTop: 0.5,
    };
    
    /** @type {number} */
    this.rMax = this.options.rMax;
    /** @type {number} */
    this.rMin = this.options.rMin; 
    
    /** @type {HTMLElement} */
    this.contentEl = document.querySelector("#content");
    /** @type {HTMLElement} */
    this.dipEl = undefined; 
    /** @type {HTMLElement} */
    this.dipSliderEl = undefined; 
    /** @type {HTMLElement} */
    this.imtEl = document.querySelector('#imt');
    /** @type {HTMLElement} */
    this.widthEl = undefined; 
    /** @type {HTMLElement} */
    this.widthSliderEl = undefined;  
    /** @type {HTMLElement} */
    this.zTopEl = undefined; 
    /** @type {HTMLElement} */
    this.zTopSliderEl = undefined;  
    
    /** @type {D3LinePlot} */
    this.plot = this.plotSetup();

    // Replot on IMT change 
    $(this.imtEl).change((event) => { this.imtOnChange(); }); 
    
    // Build fault plane sliders
    this.faultSliders();  
    
    // Build control panel
    this.getUsage(this.setSliderValues);
  }
  
  /**
  * @method checkFaultExtent
  *
  * Check to see if the fault plane is or well be out of the 
  *     defined fault bottom maximum
  * @return {{
  *   maxDip: {number} - Max dip allowed given other values,
  *   maxWidth: {number} - Max width allowed given other values,
  *   maxZTop: {number} - Max zTop allowed given other values,
  *   pastExtent: {Boolean}
  * }} 
  */
  checkFaultExtent() { 
    let faultCheck = {};
    let dip = this.dip_val();
    let width = this.width_val();
    let zTop = this.zTop_val();
    let faultBottom = width * Math.sin(dip) + zTop;
    let maxFaultBottom = this.options.maxFaultBottom;
    faultCheck.maxDip = Math.asin((maxFaultBottom - zTop) / width);
    faultCheck.maxDip = faultCheck.maxDip * 180.0 / Math.PI;
    faultCheck.maxDip = isNaN(faultCheck.maxDip) ? 90 : faultCheck.maxDip;
    faultCheck.maxWidth = (maxFaultBottom - zTop) / Math.sin(dip);
    faultCheck.maxZTop = maxFaultBottom - width * Math.sin(dip); 
    faultCheck.pastExtent = faultBottom > maxFaultBottom ? true : false;
    
    return faultCheck;
  }
 
  /**
  * @method faultSliders
  *
  * Create range sliders for the fault plane plot
  */
  faultSliders() {
    let sliderInfo = [
      {
        name: 'Dip', 
        sliderId: 'dip-slider',
        valueId: 'dip', 
        min: this.options.minDip, 
        max: this.options.maxDip, 
        step: this.options.stepDip,
        unit: '°',
      },{
        name: 'Width', 
        sliderId: 'width-slider', 
        valueId: 'width', 
        min: this.options.minWidth, 
        max: this.options.maxWidth, 
        step: this.options.stepWidth,
        unit: 'km',
      },{
        name: 'zTop', 
        sliderId: 'zTop-slider', 
        valueId: 'zTop', 
        min: this.options.minZTop, 
        max: this.options.maxZTop, 
        step: this.options.stepZTop,
        unit: 'km',
      }
    ];      
   
    let width = (1 - this.options.lowerPlotWidth) * 100; 
    d3.select(this.plot.lowerPanel.svgEl)
        .style('margin-right', width + '%');
  
    let faultFormD3 =  d3.select(this.plot.lowerPanel.plotBodyEl)
        .append('form')
        .attr('class', 'form fault-form');
  
    let divD3 = faultFormD3.selectAll('div')
        .data(sliderInfo)
        .enter()
        .append('div')
        .attr('class', 'slider-form');
        
    divD3.append('label')
        .attr('for', (d,i) => { return d.sliderId })
        .text((d,i) => { return d.name });
    
    let formD3 = divD3.append('div') 
        .attr('class', 'row');
        
    formD3.append('div')
        .attr('class', 'col-sm-12 col-md-12 col-lg-8')
        .html((d,i) => {
          return '<input class="slider" id=' + d.sliderId + ' type="range"' + 
            ' min=' + d.min + ' max=' + d.max + 
            ' step=' + d.step + ' />'
        });
   
    formD3.append('div')
        .attr('class', 'col-sm-12 col-md-6 col-lg-4')
        .append('div')
        .attr('class', 'input-group input-group-sm')
        .html((d,i) => { 
          return '<input class="form-control input-sm slider-value"' +
            ' id=' + d.valueId + ' type="number"' + 
            'name="' + d.valueId  + '"' +
            ' min=' + d.min + ' max=' + d.max + ' step="' + d.step + '" >' + 
            '<span class="input-group-addon input-sm"> ' + d.unit + ' </span>';
        });

    this.dipSliderEl = document.querySelector('#dip-slider');
    this.dipEl = document.querySelector('#dip');
    this.faultFormEl = document.querySelector('.fault-form');
    this.widthSliderEl = document.querySelector('#width-slider');
    this.widthEl = document.querySelector('#width');
    this.zTopSliderEl = document.querySelector('#zTop-slider');
    this.zTopEl = document.querySelector('#zTop');
    
    // Update tooltips   
    Constraints.addTooltip(
        this.dipEl, this.options.minDip, this.options.maxDip); 
    Constraints.addTooltip(
        this.widthEl, this.options.minWidth, this.options.maxWidth); 
    Constraints.addTooltip(
        this.zTopEl, this.options.minZTop, this.options.maxZTop); 
    
    // Listen for changes on fault form inputs and sliders
    $('.fault-form').bind('input keyup mouseup', (event) => { 
      this.inputsOnInput();
      this.faultSliderOnChange(event) 
    });
  }

  /**
  * @method faultSlidersOnChange
  *
  * Update the fault plane plot with change in each slider or input
  *     field and update ground motion Vs. distance plot if inputted
  *     values are good. 
  * @param {!Event} event - Event that triggered the change 
  */
  faultSliderOnChange(event) {
    let minVal;
    let maxVal;
    let maxValStr; 
    let parEl; 
    let step;
    let sliderEl;
    let valueEl; 
      
    let id = event.target.id;
    let value = parseFloat(event.target.value);
    let inputType = event.target.type;
    let eventType = event.type;
    
    if (!id || id.length == 0 || isNaN(value)){ 
      return;  
    }

    if (id == this.dipSliderEl.id || id == this.dipEl.id) {
      parEl = this.dipEl; 
      sliderEl = this.dipSliderEl;
      valueEl = this.dipEl;
      maxValStr = 'maxDip'; 
      step = this.options.stepDip;
      maxVal = this.options.maxDip;
      minVal = this.options.minDip;
      
    } else if (id == this.widthSliderEl.id || id == this.widthEl.id) {
      parEl = this.widthEl;
      sliderEl = this.widthSliderEl;
      valueEl = this.widthEl;
      step = this.options.stepWidth;
      maxValStr = 'maxWidth';
      maxVal = this.options.maxWidth;
      minVal = this.options.minWidth;
    } else if (id == this.zTopSliderEl.id || id == this.zTopEl.id) {
      parEl = this.zTopEl;
      sliderEl = this.zTopSliderEl;
      valueEl = this.zTopEl;
      maxValStr = 'maxZTop';
      step = this.options.stepZTop;
      maxVal = this.options.maxZTop;
      minVal = this.options.minZTop;
    }
    
    let canSubmit = Constraints.check(valueEl, minVal, maxVal);
    if (!canSubmit) return; 
    
    parEl.value = value;
    sliderEl.value = value;
    valueEl.value = value;
    let faultCheck = this.checkFaultExtent();
    if (faultCheck.pastExtent) {
      // Round down to nearest step
      event.target.value = 
          Math.round((faultCheck[maxValStr] - step) / step) * step; 
      valueEl.value = event.target.value;
      parEl.value = event.target.value;
      return;
    }
     
    this.plotFaultPlane();
    if (inputType == 'range' && 
          (eventType == 'keyup' || eventType == 'mouseup')) {
      this.updatePlot();
    } else if (inputType != 'range') {
      this.updatePlot();
    }
  }

  /**
  * @method getFaultPlaneData
  *
  * Calculate the the X,Y coordinates of the fault plane based on:
  *     - Dip
  *     - Width
  *     - zTop
  * @return {{
  *   seriesData: {Array<Array<number, number>>},
  *   seriesIds: {Array<String>},
  *   seriesLabels: {Array<String>}
    }} Object
  */
  getFaultPlaneData() {
    let dip = this.dip_val();
    let width = this.width_val();
    let zTop = this.zTop_val();
    
    let xMin = 0;
    let xMax = width * Math.cos(dip);
    let x = [xMin, Number(xMax.toFixed(4))];
    
    let yMin = -zTop;
    let yMax = - width * Math.sin(dip) - zTop;
    let y = [yMin, Number(yMax.toFixed(4))];
  
    let seriesInfo = {
      seriesData: [d3.zip(x, y)],
      seriesIds: ['fault'],
      seriesLabels: ['Fault'],
    };

    return seriesInfo;
  }

  /**
  * @method getFaultPlaneDomain 
  *
  * Calculate the X and Y domain to make the ground motion vs. distance
  *     plot have the same X scale
  * @return {{
  *   xDomain: {Array<number, number},
  *   yDomain: {Array<number, number>}
  * }} 
  */
  getFaultPlaneDomain() {
    let lowerXWidth = d3.select(this.plot.lowerPanel.xAxisEl)
        .select('.domain')
        .node()
        .getBoundingClientRect()
        .width;
    
    let upperXWidth = d3.select(this.plot.upperPanel.xAxisEl)
        .select('.domain')
        .node()
        .getBoundingClientRect()
        .width;

    let rMin = this.rMin;
    let rMax = this.rMax;
    // Calculate lower plot X limit to match upper plot 
    let xLimit = ((lowerXWidth * (rMax - rMin)) / upperXWidth) + rMin;
    
    let xDomain = [rMin, xLimit];
    let yDomain = [-this.options.maxFaultBottom, 0];
    
    let x = xLimit - rMin;
    let y = this.options.maxFaultBottom;
    let plotRatio = x / y;
    let plotWidth = this.plot.upperPanel.options.plotWidth * 
        this.options.lowerPlotWidth;
    let plotHeight = plotWidth / plotRatio;
    let options = this.plot.lowerPanel.options;
    // Update lower plot svg height
    this.plot.lowerPanel.svgHeight = plotHeight;
    // Update lower plot height
    this.plot.lowerPanel.plotHeight = plotHeight - 
        options.marginTop - options.marginBottom; 
    // Update lower plot svg width
    this.plot.lowerPanel.svgWidth = plotWidth;
    // Update lower plot height
    this.plot.lowerPanel.plotWidth = plotWidth - 
        options.marginLeft - options.marginRight; 
    // Update the svg view box
    this.plot.setSvgViewBox();

    let domain = {
      xDomain: xDomain,
      yDomain: yDomain,
    };
    
    return domain;
  }
  
  /**
  * @method getMetadata
  *
  * Get current chosen parameters.
  * @return {{
  *   key: value || Array<Values>
  * }} Object - Metadata containing key and value pairs.
  */
  getMetadata() {
    let gmms = this.getCurrentGmms();
    
    let metadata = {
      'Ground Motion Models': gmms,
      'Intensity Measure Type': $(this.imtEl).find(':selected').text(),
      'M<sub>W</sub>': this.MwEl.value,
      'Z<sub>Top</sub> (km)': this.zTopEl.value,
      'Dip (°)': this.dipEl.value,
      'Width (km)': this.widthEl.value,
      'Minimum Rupture Distance (km)': this.rMin,
      'Maximum Rupture Distance (km)': this.rMax,
      'V<sub>S</sub>30 (m/s)': this.vs30El.value,
      'Z<sub>1.0</sub> (km)': this.z1p0El.value,
      'Z<sub>2.5</sub> (km)': this.z2p5El.value,
    };
    
    return metadata;
  }

  /**
  * Plot the fault plane in the lower plot panel 
  */
  plotFaultPlane() {
    let seriesInfo = this.getFaultPlaneData();    
    
    let tickMarks = d3.select(this.plot.upperPanel.xAxisEl)
        .selectAll(".tick")
        .size(); 
    tickMarks = Math.ceil(tickMarks / 2);
    this.plot.lowerPanel.options.xTickMarks = tickMarks;
    
    this.plot.setLowerData(seriesInfo.seriesData)
        .setLowerPlotFilename('faultPlane')
        .setLowerPlotIds(seriesInfo.seriesIds)
        .setLowerPlotLabels(seriesInfo.seriesLabels)
        .setLowerXLabel('km')
        .setLowerYLabel('km')
        .plotData(this.plot.lowerPanel);
    
    let domain = this.getFaultPlaneDomain();
    // Replot with new domain
    this.plot.plotData(
        this.plot.lowerPanel, 
        domain.xDomain, 
        domain.yDomain);
    
    // Convert Y axis to positive down
    d3.select(this.plot.lowerPanel.yAxisEl)
        .selectAll(".tick")
        .selectAll("text")
        .text((d, i) => { return Math.abs(Number(d));});
  }

  /**
  * Plot ground motion vs. distance in the upper plot panel
  * @param {Object} response JSON return from the gmm/hw-fw web service
  */ 
  plotGmm(response) {
    let metadata = this.getMetadata();
    metadata.url = window.location.href;
    metadata.time = new Date();
    
    let mean = response.means;
    let meanData = mean.data;
    let seriesLabels = [];
    let seriesIds = [];
    let seriesData = [];
      
    meanData.forEach((d, i) => {
      seriesLabels.push(d.label);
      seriesIds.push(d.id);
      seriesData.push(d3.zip(d.data.xs, d.data.ys));
    });
   
    let selectedImt = $(':selected', this.imtEl);
    let selectedImtVal = selectedImt.val();
    
    this.plot.setUpperData(seriesData)
        .setMetadata(metadata)
        .setUpperDataTableTitle('Median Ground Motion')
        .setUpperPlotFilename('hwFw' + selectedImtVal)
        .setUpperPlotIds(seriesIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperXLabel(mean.xLabel)
        .setUpperYLabel(mean.yLabel)
        .plotData(this.plot.upperPanel);
  }

  /**
  * Set the plot options for the ground motion vs. distance plot
  *     and the fault plane plot.
  * @return {D3LinePlot} New instance of D3LinePlot 
  */ 
  plotSetup() {
    let plotOptions = {
      colSizeMinCenter: 'col-md-offset-2 col-md-8',
      disableXAxisBtns: true,
      plotLowerPanel: true,
      syncXAxis: false,
      syncYAxis: false, 
    };

    let meanTooltipText = ['GMM:', 'Distance (km):', 'MGM (g):'];
    let meanPlotOptions = {
      pointRadius: 2.75,
      selectionIncrement: 1,
      tooltipText: meanTooltipText,
      xAxisNice: false,
      xAxisScale: 'linear',
      yAxisScale: 'linear',
    };
    
    let faultPlotOptions = {
      marginTop: 50,
      marginBottom: 20,
      linewidth: 4,
      selectionIncrease: 0, 
      pointRadius: 0,
      plotWidth: 896 * this.options.lowerPlotWidth, 
      printTitle: false,
      showData: false,
      showLegend: false,
      transitionDuration: 0,
      xAxisNice: false,
      xAxisScale: 'linear',
      xAxisLocation: 'top',
      yAxisScale: 'linear',
    };
  
    return new D3LinePlot(
        this.contentEl,
        plotOptions,
        meanPlotOptions,
        faultPlotOptions)
        .withPlotHeader()
        .withPlotFooter(); 
  }
  
  /**
  * @method setSliderValues
  *
  * Set the slider values to match the input fields
  */
  setSliderValues() {
    this.dipSliderEl.value = this.dipEl.value;
    this.widthSliderEl.value = this.widthEl.value;
    this.zTopSliderEl.value = this.zTopEl.value;
  }

  /**
  * @override 
  * @method serializeGmmUrl
  *
  * Serialize all forms for ground motion web wervice and set
  *     set the hash of the window location to reflect the form values.
  */
  serializeGmmUrl(){
    let controlInputs = $(this.inputsEl).serialize();
    let faultInputs = $(this.faultFormEl).serialize();
    let inputs = controlInputs + '&' + faultInputs + 
        '&rMin=' + this.rMin +
        '&rMax=' + this.rMax;
    let dynamic = this.config.server.dynamic;
    let url = dynamic + this.webServiceUrl + '?' + inputs;
    window.location.hash = inputs;
    
    return url; 
  }
 
  /**
  * Call the ground motion web service and plot the results 
  */
  updatePlot() {
    let url = this.serializeGmmUrl(); 
    // Call ground motion hw-fw web service 
    let promise = $.getJSON(url);
    this.spinner.on(promise, 'Calculating');

    promise.done((response) => {
      this.spinner.off();
      this.footer.setMetadata(response.server);

      let selectedImt = $(':selected', this.imtEl);
      let selectedImtDisplay = selectedImt.text();
      this.plot.setPlotTitle('Hanging Wall Effects: ' + 
          selectedImtDisplay);
      
      // Plot ground motion Vs. distance
      this.plotGmm(response);
      // Plot fault plane
      this.plotFaultPlane();
      // Show raw JSON results on click
      $(this.footer.rawBtnEl).off() 
      $(this.footer.rawBtnEl).click((event) => {
        window.open(url);
      });
    });
  }

}
