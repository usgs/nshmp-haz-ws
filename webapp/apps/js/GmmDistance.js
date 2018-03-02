'use strict';

import Gmm from './lib/Gmm.js';
import D3LinePlot from './lib/D3LinePlot.js';

/** 
* @class GmmDistance 
* @extends Gmm
*
* @fileoverview Class for gmm-distance..html, ground motion Vs. 
*   distance web app.
* This class plots the results of nshmp-haz-ws/gmm/distance web service.
* This class will first call out to nshmp-haz-ws/gmm/distance web service
*     to obtain the usage and create the control panel with the following:
*     - Ground motions models
*     - Intensity measure type
*     - Magnitude
*     - zTop 
*     - Dip 
*     - Width 
*     - Vs30
*     - Vs30 measured or inferred
*     - Z1.0
*     - Z2.5 
* Once the control panel is set, it can be used to select desired
*     parameters and plot ground motion vs. distance.
* Already defined DOM elements:
*     - #gmms
*     - .gmm-alpha
*     - .gmm-group
*     - #gmm-sorter
*     - #inputs
*     - #Mw
*     - #vs30
*     - #z1p0
*     - #z2p5
*
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class GmmDistance extends Gmm {
 
  /**
  * @param {HTMLElement} contentEl - Container element to put plots
  */ 
  constructor(config) {
    let webServiceUrl = '/nshmp-haz-ws/gmm/distance';
    let webApp = 'GmmDistance';
    super(webApp, webServiceUrl, config);
    this.header.setTitle('Ground Motion Vs. Distance');
    this.spinner.on();
    
    /**
    * @type {{
    *   rMaxDefault: {number} - Maximum distance,
    *   rMinDefault: {number} - Minimum distance,
    * }} Object 
    */ 
    this.options = {
      rMax: 300,
      rMin: 0.001,
    };
    
    /** @type {number} */
    this.rMax = this.options.rMax;
    /** @type {number} */
    this.rMin = this.options.rMin; 

    /** @type {HTMLElement} */
    this.contentEl = document.querySelector('#content'); 
    /** @type {HTMLElement} */
    this.dipEl = document.querySelector('#dip');
    /** @type {HTMLElement} */
    this.imtEl = document.querySelector('#imt');
    /** @type {HTMLElement} */
    this.widthEl = document.querySelector('#width');
    /** @type {HTMLElement} */
    this.zTopEl = document.querySelector('#zTop');
    
    /** @type {D3LinePlot} */
    this.plot = this.plotSetup();
    
    $(this.imtEl).change((event) => { this.imtOnChange(); }); 
    
    this.getUsage();
  }
 
  /**
  * Plot ground motion vs. distance in the upper plot panel
  * @param {Object} response JSON return from the gmm/distance web service
  */ 
  plotGmm(response) {
    let metadata = {
      url: window.location.href,
      time: new Date(),
    }; 
    
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
        .setUpperDataTableTitle('Median Ground Motion')
        .setUpperPlotFilename('gmmDistance' + selectedImtVal)
        .setUpperPlotIds(seriesIds)
        .setUpperPlotLabels(seriesLabels)
        .setUpperMetadata(metadata)
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
    let meanTooltipText = ['GMM:', 'Distance (km):', 'MGM (g):'];
    let meanPlotOptions = {
      legendLocation: 'bottomleft',
      pointRadius: 2.75,
      pointRadiusSelection: 3.5,
      pointRadiusTooltip: 4.5,
      tooltipText: meanTooltipText,
    };
    
    return new D3LinePlot(
        this.contentEl,
        {} /* main plot options */,
        meanPlotOptions,
        {} /* lower panel options */)
        .withPlotHeader()
        .withPlotFooter(); 
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
    let inputs = controlInputs + '&' + 
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
    if (this.rMin < this.options.rMin) return;
    // Call ground motion gmm/distance web service 
    d3.json(url, (error, response) => {
      if (error) return console.warn(error);
      if (response.status == 'ERROR') {
        d3.select(this.plot.upperPanel.svgEl)
            .append('text')
            .attr('y', this.plot.upperPanel.options.marginTop)
            .attr('x', this.plot.upperPanel.options.marginLeft)
            .text(response.message);
        return;
      }  
      
      this.spinner.off();
      let selectedImt = $(':selected', this.imtEl);
      let selectedImtDisplay = selectedImt.text();
      this.plot.setPlotTitle('Ground Motion Vs. Distance: ' + 
          selectedImtDisplay);
    
      // Plot ground motion Vs. distance
      this.plotGmm(response);
      // Show raw JSON results on click
      $(this.footer.rawBtnEl).off() 
      $(this.footer.rawBtnEl).click((event) => {
        window.open(url);
      });
    });
  }

}
