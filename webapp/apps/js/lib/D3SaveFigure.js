'use strict';

/**
* @class Save
* 
* @fileoverview This class will save a SVG element as a figure. 
*   Figure types:
*       - pdf (This brings up the print dialog)
*       - png
*       - svg
*       -jpeg
*  Use builder for class:
*     new D3SaveFigure.Builder()
*         .filename('myFile')
*         .options({})
*         .metadata(url, date)
*         .plotFormat('png')
*         .plotHeight(current svg height)
*         .plotWidth(current svg width)
*         .plotMarginLeft(current plot margin left)
*         .plotMarginTop(current plot margin top)
*         .plotTitle('My Title')
*         .svgEl(the svg element)
*         .build();
*
* @author bclayton@usgs.gov (Brandon Clayton)
*
* @typedef {Object} D3SaveFigureBuilder - Builder class
* @property {String} filename - Filename for download with no extension.
* @property {String=} plotTitle - Title to add to plot.
* @property {String} plotFormat - Format for download. 
*     Formats: 'png' || 'svg' || 'pdf' || 'jpeg'
* @property {Object} metadata - Url and date to be printed on bottom of page.
* @property {Number} plotMarginLeft - Original plot margin left in px.
* @property {Number} plotMarginTop - Original plot margin top in px.
* @property {Number} plotHeight - Original SVG plot height in px.
* @property {Number} plotWidth - Original SVG plot width in px. 
* @property {HTMLElement} svgEl - SVG dom element to convert to image.
*
*/
export default class D3SaveFigure { 

  /**
  * @param {D3SaveFigureBuilder} builder - The builder for this class.
  */ 
  constructor(builder) {
    /** @type {String} */
    this.filename = builder.filename;
    /** @type {String} */
    this.plotTitle = builder.plotTitle;
    /** @type {String} */
    this.plotFormat = builder.plotFormat;
    /** @type {Object} */ 
    this.metadata = builder.metadata;
    /** @type {Number} */
    this.originalPlotMarginLeft = builder.plotMarginLeft;
    /** @type {Number} */
    this.originalPlotMarginTop = builder.plotMarginTop;
    /** @type {Number} */
    this.originalPlotHeight = builder.plotHeight;
    /** @type {Number} */
    this.originalPlotWidth = builder.plotWidth;
    /** @type {HTMLElement} */
    this.svgEl = builder.svgEl;
    
    /** @type {Number} */ 
    this.baseDpi = 96; 
    let plotRatio = this.originalPlotWidth / this.originalPlotHeight;

    /** 
    * @typedef {Object} D3SaveFigureOptions - Options for D3saveFigure 
    * @property {Number} footerFontSize - Font size of footer in px.
    *     Deafult: 14
    * @property {Number} footerLineBreak - Line break in px.
    *     Deafult: 20
    * @property {Number} footerPadding - Padding around footer in px.
    *     Deafult: 20
    * @property {Number} marginLeft - Left margin for image in inches.
    *     Deafult: 0
    * @property {Number} marginTop - Top margin for image in inches.
    *     Deafult: 0.5
    * @property {Number} pageHeight - Total page height in inches.
    *     Deafult: 8.5
    * @property {Number} pageWidth - Total page width in inches.
    *     Deafult: 11
    * @property {Number} printDpi - Resolution of image in DPI.
    *     Deafult: 600
    * @property {Boolean} printCenter - Whether to print image in center.
    *     Deafult: true
    * @property {Boolean} printFooter - Whether to print footer.
    *     Deafult: true
    * @property {Boolean} printTitle - Whether to print title.
    *     Deafult: true
    * @property {Number} svgHeight - Plot height in inches.
    *     Deafult: calculated to keep aspect ratio
    * @property {Number} svgWidth - Plot width in inches.
    *     Deafult: 9
    * @property {Number} titleFontSize - Title font size in px. 
    *     Deafult: 20
    */
    this.options = {
      footerFontSize: 14,
      footerLineBreak: 20,
      footerPadding: 20,
      marginLeft: 0,
      marginTop: 0.5,
      pageHeight: 8.5,
      pageWidth: 11,
      printDpi: 600,
      printCenter: true,
      printFooter: true,
      printTitle: true,
      svgHeight: (10 / plotRatio),
      svgWidth: 9,
      titleFontSize: 20,
    };
    $.extend(this.options, builder.options || {});

    // Update DPI
    let dpi = this.plotFormat == 'pdf' || this.plotFormat == 'svg' ? 
        this.baseDpi : this.options.printDpi; 
    this.options.printDpi = dpi;
    /** @type {Number} */
    this.dpiScale = this.options.printDpi / this.baseDpi;

    /** @type {Number} */ 
    this.marginTopInPx = this.options.marginTop * this.options.printDpi + 
        this.originalPlotMarginTop * this.dpiScale;
    
    /** @type {Number} */ 
    this.svgHeightInPx = this.options.svgHeight * this.options.printDpi;
    /** @type {Number} */ 
    this.svgWidthInPx = this.options.svgWidth * this.options.printDpi;
    
    /** @type {Number} */ 
    this.pageHeightInPx = this.options.pageHeight * this.options.printDpi; 
    /** @type {Number} */ 
    this.pageWidthInPx = this.options.pageWidth * this.options.printDpi; 
    
    /** @type {Number} */ 
    let marginLeft = this.options.marginLeft * this.options.printDpi + 
        this.originalPlotMarginLeft * this.dpiScale;
    /** @type {Number} */ 
    this.marginLeftInPx = this.options.printCenter ?
        (this.pageWidthInPx - this.svgWidthInPx + marginLeft) / 2 :
        marginLeft;
    
    let svgImg = this.createSvgImage();
    let canvas = this.createCanvasContext();
    // Make SVG into desired format
    svgImg.onload = () => {
      canvas.canvasContext.fillStyle = 'white';
      canvas.canvasContext.fillRect(0, 0, 
          this.pageWidthInPx, this.pageHeightInPx);
      canvas.canvasContext.drawImage(svgImg, 0, 0);
      
      let aEl = document.createElement('a');
      aEl.download = this.filename; 
      let imgSrc; 
      switch (this.plotFormat){
        // SVG
        case 'svg':
          imgSrc = svgImg.src; 
          aEl.href = imgSrc;
          aEl.click();
          break;
        // JPEG or PNG
        case 'png':
        case 'jpeg':
          canvas.canvasEl.toBlob((blob) => {
            imgSrc = URL.createObjectURL(blob);
            aEl.href = imgSrc;
            aEl.click();
          }, 'image/' + this.plotFormat, 1.0);
          break;
        // PDF
        case 'pdf':
          this.saveAsPdf(svgImg)
      }
    }  
  }

  /**
  * @method addPrintFooter
  *
  * Add the metadata to the bottom of the page.
  * @param {HTMLElement} svgEl -  SVG element to append the footer information.
  */ 
  addPrintFooter(svgEl) {
    if (!this.options.printFooter) return;
    
    let urlMaxChar = 100;
    let nbreaks = Math.ceil(this.metadata.url.length / urlMaxChar);
    
    let footerText = [];
    for (let jc = 0; jc < nbreaks; jc++) {
      footerText.push(
          this.metadata.url.slice(urlMaxChar * jc, urlMaxChar * (jc + 1)));
    }
    footerText.push(this.metadata.date);
    
    let nlines = footerText.length;
    
    d3.select(svgEl)
        .append('g')
        .attr('class', 'print-footer')
        .style('font-size', this.options.footerFontSize * this.dpiScale)
        .attr('transform', 'translate(' +
            (this.options.footerPadding * this.dpiScale) + ',' +
            (this.pageHeightInPx - this.options.footerPadding * 
            this.dpiScale) + ')')
        .selectAll('text')
        .data(footerText)
        .enter()
        .append('text')
        .text((d,i) => {return footerText[nlines - i - 1]})
        .attr('y', (d,i) => {
            return -this.options.footerLineBreak * i * this.dpiScale;
        });
  }

  /**
  * @method Builder
  *
  * Builder for D3SaveFigure
  */
  static get Builder() {
    return class Builder {
      constructor() {}

      build() {
       return new D3SaveFigure(this);
      }

      filename(filename) {
        this.filename = filename;
        return this;
      }

      options(options) {
        this.options = options;
        return this;
      }
      
      metadata(url, date) {
        this.metadata = {
          url: url,
          date: date,
        };
        return this;
      }

      plotFormat(format) {
        this.plotFormat = format.toLowerCase();
        return this;
      }
      plotMarginLeft(plotMarginLeft) {
        this.plotMarginLeft = plotMarginLeft;
        return this;
      }

      plotMarginTop(plotMarginTop) {
        this.plotMarginTop = plotMarginTop;
        return this;
      }
      
      plotHeight(height) {
        this.plotHeight = height;
        return this;
      }

      plotTitle(title) {
        this.plotTitle = title;
        return this;
      }

      plotWidth(width) {
        this.plotWidth = width;
        return this;
      }

      svgEl(svgEl) {
        this.svgEl = svgEl;
        return this;
      }

    }
  }
  
  /**
  * @method saveAsPdf
  * 
  * Open SVG in new tab and open print dialog
  * @param {Image} svgImg - The svg image
  */ 
  saveAsPdf(svgImg) {
    let win = window.open();
    let headD3 = d3.select(win.document.head);
    headD3.append('title')
        .text(this.filename);
    headD3.append('meta')
      .attr('name', 'viewport')
      .attr('content', 'width=device-width, initial-scale=1.0');
    headD3.append('meta')
        .attr('charset', 'UTF-8');
    let styleD3 = headD3.append('style');
    let promise = $.ajax({
      url: '/nshmp-haz-ws/apps/css/Print.css',
      type: 'GET',
    });
    
    d3.select(win.document.body)
        .append('div')
        .attr('class', 'svg-img')
        .html(svgImg.outerHTML);
     
    promise.done((css) => {
      styleD3.html(css);
      win.print();
      win.close();
    });
  
  }
 
  /**
  * @method createSvgImage
  * 
  * Create the SVG image for canvas
  * @return {Image} the svg image
  */  
  createSvgImage() {
    let scalePlot = this.svgWidthInPx / this.originalPlotWidth;
    let plotTransform = 'translate(' + this.marginLeftInPx + 
        ',' + this.marginTopInPx + ')' + ' scale(' + scalePlot + ')';
   
    let svgHtml = d3.select(this.svgEl).node().outerHTML;
    
    // Create copy of plot
    let svgDivD3 = d3.select('body')
        .append('div')
        .attr('class', 'print-plot-svg hidden')
        .html(svgHtml);
    
    // Update svg height and width
    let svgD3 = svgDivD3.select('svg')
        .attr('class', 'plot')
        .attr('preserveAspectRatio', null)
        .attr('viewBox', null)
        .style('font-family', '"Helvetica Neue",Helvetica,Arial,sans-serif')
        .attr('height', this.pageHeightInPx)
        .attr('width', this.pageWidthInPx)
      
    svgD3.select('.plot')
        .attr('transform', plotTransform);
    
    // Add plot title 
    if (this.options.printTitle) {
      svgD3.select('.plot')      
          .append('text')
          .attr('class', 'plot-title')
          .attr('x', this.originalPlotWidth / 2)
          .attr('y', -40)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'text-after-edge')
          .style('font-size', this.options.titleFontSize)
          .text(this.plotTitle);
    }

    // Remove legend drag symbol
    svgD3.select('.drag')
      .remove(); 
    
    // Add print footer
    this.addPrintFooter(svgD3.node());
    
    // Create an image from SVG 
    svgHtml = svgD3.node().outerHTML;
    let svgImgSrc = 'data:image/svg+xml;base64,' + btoa(svgHtml);                 
    let svgImg = new Image();
    svgImg.src = svgImgSrc; 
    svgDivD3.remove();
    
    return svgImg;
  }

  /**
  * @method createSvgImage
  * 
  * Create the canvas element 
  * @return {{
  *   canvasEl: {HTMLElement} - the canvas DOM element,
  *   canvasContext: the canvas context
  * }} The canvas element and context
  */  
  createCanvasContext() {
    let canvasDivD3 = d3.select('body')
        .append('div')
        .attr('class', 'svg-to-canvas hidden');
    let canvasD3 = canvasDivD3.append('canvas')
        .attr('height', this.pageHeightInPx)
        .attr('width', this.pageWidthInPx)
        .style('height', this.options.pageHeight + 'in')
        .style('width', this.options.pageWidth + 'in');

    let canvasEl = canvasD3.node();
    let canvasContext = canvasEl.getContext('2d');
    canvasDivD3.remove();
    
    return {canvasEl: canvasEl, canvasContext: canvasContext};
  }

}
