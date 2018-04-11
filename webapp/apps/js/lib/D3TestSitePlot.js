'use strict';

import TestSiteView from './TestSiteView.js';
import D3Tooltip from './D3Tooltip.js';

/**
* Place holder class. 
*
* TODO: 
*   Make work with TestSiteView.
*/
export default class D3TestSitePlot extends TestSiteView {

  constructor(latEl, lonEl, btnEl) {

    super(latEl, lonEl, btnEl);
      
    this.mapBorderUrl = '/nshmp-haz-ws/data/us.json';
    this.mapUrl = '/nshmp-haz-ws/data/americas.json';
    
    this.options = {                                                            
      backgroundColor: '#C0C0C0',                                               
      mapFill: 'white',                                                         
      mapStroke: 'black',                                                       
      mapStrokeWidth: 2,                                                        
      mapBorderStroke: 'black',                                                 
      mapBorderStrokeWidth: 1,                                                  
      plotHeight: 700,                                                          
      plotWidth: 900,                                                           
      siteColor: 'black',                                                       
      siteSelectedColor: 'red',                                                 
      siteSize: 3,                                                              
      tooltipText: ['', 'Longitude (°): ', 'Latitude (°): '],                   
    }; 

    this.svgEl = this.createSvgStructure();
    this.plotEl = this.svgEl.querySelector('.plot');
    this.tooltipEl = this.svgEl.querySelector('.d3-tooltip');
    this.americasEl = this.svgEl.querySelector('.americas');
    this.bordersEl = this.svgEl.querySelector('.borders');
    this.testSitesEl = this.svgEl.querySelector('.testsites');

    this.projection = d3.geoMercator();
        
    this.path = d3.geoPath()
        .projection(this.projection);
    
    this.getUsage();
  }
 
  /**
  * @method createSvgStructure
  */
  createSvgStructure() {
    let viewBox = '0, 0, ' + this.options.plotWidth +
        ', ' + this.options.plotHeight;
    let svgD3 = d3.select(this.mapBodyEl)
        .append('svg')
        .attr('class', 'D3TestSiteMap')
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', viewBox)
        .style('margin-bottom', '-5px');
    
    let mapD3 = svgD3.append('g')
        .attr('class', 'plot');
    
    mapD3.append('g')
        .attr('class', 'd3-tooltip');
    
    mapD3.append('g')
        .attr('class', 'americas');
    
    mapD3.append('g')
        .attr('class', 'borders');
    
    mapD3.append('g')
        .attr('class', 'testsites');
    
    return svgD3.node();
  }
  
  /**
  * @method getUsage
  */
  getUsage() {
    let testSitePromise = $.getJSON(this.webServiceUrl);
    let mapBorderPromise = $.getJSON(this.mapBorderUrl);
    let mapPromise = $.getJSON(this.mapUrl);
    let promises = [
        testSitePromise,
        mapPromise,
        mapBorderPromise,
    ];
    
    $.when(testSitePromise, mapPromise, mapBorderPromise)
    .done((usage, map, mapBorder) => {
      let usBorders = topojson.mesh(
          mapBorder[0], mapBorder[0].objects.states,
          (a, b) => { return a !== b; });
      let americas = map[0].features;
      
      this.testSites = usage[0].features;
      this.usBorders = usBorders;
      this.americas = americas;
      
      this.updateButton();
    })
    .fail((err) => {
      console.log('getUsage: JSON error - ' + err);
    });
  }
  
  /**
  * @method plotMap
  */
  plotData(regionId) {
    d3.select(this.useLocationBtnEl)
        .property('disabled', true); 
    
    let testSiteData = this.testSites.filter((feature) => {
      return feature.properties.regionId == regionId;
    })[0];
    this.createSiteList(testSiteData);
        
    let regionBounds = testSiteData.properties.regionBounds;

    this.projection.fitSize(
        [this.options.plotWidth, this.options.plotHeight],
        regionBounds);

    this.plotAmericas();
    this.plotStateBorders();
    this.plotTestSites(testSiteData);
   
    this.onSiteSelect(); 
    this.onSnapGrid();
   
    this.onUseLocation();
  }
   
  /**
  * @method plotAmericas
  */
  plotAmericas() {
    d3.select(this.americasEl)
        .selectAll('path')
        .remove();

    d3.select(this.americasEl)
        .selectAll('path')
        .data(this.americas)
        .enter()
        .append('path')
        .attr('class', 'america-map')
        .attr('d', this.path)
        .attr('fill', this.options.mapFill)
        .attr('stroke', this.options.mapStroke)
        .attr('stroke-width', this.mapStrokeWidth)
        .attr('stroke-linejoin', 'round');
  }
  
  /**
  * @method plotStateBorders
  *
  */ 
  plotStateBorders() {
    d3.select(this.bordersEl)
        .selectAll('path')
        .remove();
    
    d3.select(this.bordersEl)
        .append('path')
        .attr('d', this.path(this.usBorders))
        .attr('fill', 'none')
        .attr('stroke', this.options.mapBorderStroke)
        .attr('stroke-width', this.options.mapBorderStrokeWidth)
        .attr('stroke-linejoin', 'round');
  }

  /**
  * @method plotTestSites
  */
  plotTestSites(testSiteData) {
    d3.select(this.testSitesEl)
        .selectAll('path')
        .remove();
    
    d3.select(this.testSitesEl)
        .selectAll('path')
        .data(testSiteData.features)
        .enter()
        .append('path')
        .classed('selected', (d, i) => {
          let coords = this.getCoordinates(d);
          return coords[0] == this.lonEl.value && 
              coords[1] == this.latEl.value ? 
              true : false;
        })
        .attr('d', (d, i) => {
          let coords = this.getCoordinates(d); 
          let data = JSON.parse(JSON.stringify(d));
          data.geometry.coordinates = coords;
          return this.path(data);
        })
        .attr('id', (d, i) => { return d.properties.locationId; })
        .attr('stroke', this.options.siteColor)
        .attr('fill', this.options.siteColor)
        .attr('stroke-width', this.options.siteSize)
        .style('cursor', 'pointer')
        .filter((d, i, els) => {
          let isSelected = d3.select(els[i]).classed('selected');
          if (isSelected) {
            d3.select(this.useLocationBtnEl)
                .property('disabled', false);
          }

          return isSelected;
        })
        .attr('stroke', this.options.siteSelectedColor)
        .attr('fill', this.options.siteSelectedColor);

    this.createTooltip();
  }

  /**
  * @method onSiteSelect
  *
  * If a test site is clicked update the value of the latitude element
  *     and longitude element and trigger an input event as if
  *     a user updated the field.
  */
  onSiteSelect() {
    d3.select(this.testSitesEl)
        .selectAll('path')
        .on('click', (d, i, els) => {
          d3.select(this.testSitesEl)
              .selectAll('path')
              .classed('selected', false)
              .attr('stroke', this.options.siteColor)
              .attr('fill', this.options.siteColor);
               
          d3.select(els[i])
              .classed('selected', true)
              .attr('stroke', this.options.siteSelectedColor)
              .attr('fill', this.options.siteSelectedColor);
          
          d3.select(this.useLocationBtnEl)
              .property('disabled', false);
        });
  }

  /**
  * @method createTooltip
  *
  * Create a tooltip using the D3Tooltip class when a test site 
  *     is hovered.
  */
  createTooltip() {
    let tooltip;

    d3.select(this.testSitesEl)
        .selectAll('path')
        .on('mouseover', (d, i, els) => {
          let coords = this.getCoordinates(d);
           
          let mouseCoords = this.projection(coords);
          let cx = mouseCoords[0];
          let cy = mouseCoords[1];

          let tooltipText = [
            this.options.tooltipText[0] + d.properties.location,
            this.options.tooltipText[1] + coords[0],
            this.options.tooltipText[2] + coords[1],
          ]; 
          
          tooltip = new D3Tooltip.Builder()
              .coordinates(cx, cy)
              .dataEl(els[i])
              .plotHeight(this.options.plotHeight)
              .plotWidth(this.options.plotWidth)
              .tooltipText(tooltipText)
              .tooltipEl(this.tooltipEl)
              .build();
        })
        .on('mouseout', () => {
          tooltip.remove();
        });
  }

  /**
  * @method onSnapGrid
  *
  * Listen for the snap grid checkbox to be clicked and replot the 
  *     test sites.
  */
  onSnapGrid() {
    $(this.snapGridEl).off();
    $(this.snapGridEl).on('click', (event) => {
      this.updateTestSites();
    });
  }
  
  /**
  * @method updateTestSites
  * 
  * Replot the test sites
  */ 
  updateTestSites() {
    d3.select(this.testSitesEl)
        .selectAll('path')
        .attr('d', (d, i) => {
          let coords = this.getCoordinates(d);
          let data = JSON.parse(JSON.stringify(d));
          data.geometry.coordinates = coords;
          return this.path(data);
        });
  }
 
  /**
  * @method getSelectedSite
  *
  * Find the site that is currently selected on the map.
  */                                                                            
  getSelectedSite() {
    let selectedSiteEl = $('.selected', this.testSitesEl)[0];
    
    return selectedSiteEl == undefined ? null : selectedSiteEl;
  }

  /**
  * @method onUseLocation
  */
  onUseLocation() {
    $(this.useLocationBtnEl).on('click', (event) => {
      let selectedSiteEl = this.getSelectedSite();
      let data = d3.select(selectedSiteEl).data()[0];
      let coords = this.getCoordinates(data);
      
      this.lonEl.value = coords[0];
      this.latEl.value = coords[1];
      
      $(this.latEl).trigger('input');
      $(this.lonEl).trigger('input');
      
      $(this.el).modal('hide');
    });
  }

}
