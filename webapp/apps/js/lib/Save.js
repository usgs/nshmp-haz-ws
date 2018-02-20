'use strict';

/**
* @class Save
* 
* @fileoverview This class will save a SVG element as a figure or 
*     save data from a data table.
*
* @typedef {Object} PlotDimensions
* @property {Number} marginLeft - Left print margin in pixels
* @property {Number} marginTop - Top print margin in pixels
* @property {Number} plotHeight - The print plot height 
* @property {Number} plotWidth - The print plot width
* @property {Number} svgHeight - The document height
* @property {Number} svgWidth - The document width
*/
export default class Save { 
  
  /**
  * @method saveFigure
  *
  * Save the SVG element in the panel object to either jpeg,
  *     png, svg, or pdf/print.
  * @param {Panel} panel - The upper or lower panel from D3View
  * @param {String} plotTitle - The plot title
  * @param {String} plotFormat - The desired plot format, either: 
  *     'jpeg', 'png', 'pdf', or 'svg'
  */  
  static saveFigure(panel, plotTitle, plotFormat) {
    let options = panel.options;
    let printDpi = plotFormat == 'pdf' || plotFormat == 'svg' ? 
        96 : options.printDpi;
    let plotRatio = options.plotWidth / options.plotHeight;
    let plotWidth = options.printPlotWidth * printDpi;
    let plotHeight = plotWidth / plotRatio;
    let marginTop = options.printMarginTop * printDpi; 
    let svgHeight = options.printFooter ? options.printHeight * printDpi :
        (plotHeight + marginTop * printDpi);
    let svgWidth = options.printWidth * printDpi;
    let marginLeft = (svgWidth - plotWidth) + 
        (options.printMarginLeft * printDpi);
   
    let plotDim = {
      marginLeft: marginLeft,
      marginTop: marginTop,
      plotHeight: plotHeight,
      plotWidth: plotWidth,
      printDpi: printDpi,
      svgHeight: svgHeight,
      svgWidth: svgWidth,
    };
    
    let svgImg = Save.createSvgImage(panel, plotDim, plotTitle);
    let canvas = Save.createCanvasContext(panel, plotDim);
    // Make SVG into desired format
    svgImg.onload = () => {
      canvas.canvasContext.fillStyle = 'white';
      canvas.canvasContext.fillRect(0, 0, svgWidth, svgHeight);
      canvas.canvasContext.drawImage(svgImg, 0, 0);
      
      let aEl = document.createElement('a');
      let filename = panel.plotFilename; 
      aEl.download = filename; 
      let imgSrc; 
      switch (plotFormat){
        // SVG
        case 'svg':
          imgSrc = svgImg.src; 
          aEl.href = imgSrc;
          aEl.click();
          break;
        // JPEG or PNG
        case 'png':
        case 'jpeg':
          imgSrc = canvas.canvasEl.toDataURL('image/' + plotFormat, 1.0);
          aEl.href = imgSrc;
          aEl.click();
          break;
        // PDF
        case 'pdf':
          Save.saveAsPdf(svgImg, filename);
      }
    }  
  }
 
  /**
  * @method saveAsPdf
  * 
  * Open SVG in new tab and open print dialog
  * @param {Image} svgImg - The svg image
  * @param {String} filename - The download file name
  */ 
  static saveAsPdf(svgImg, filename) {
    let win = window.open();
    let headD3 = d3.select(win.document.head);
    headD3.append('title')
        .text(filename);
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
  * @method saveData
  *
  * Save the data table from the data view in the panel and save
  *     as csv or tsv.
  * @param {HTMLElement} tableEl - The DOM element of the data table
  * @param {String} fileType - File type to save as, either: 
  *     'csv' or 'tsv'
  */
  static saveData(tableEl, filename, fileType) {
    let delimiter = fileType == 'tsv' ? '\t' : ',';
    let file = [];
    
    let tableRowsEl = tableEl.querySelectorAll('tr');
    tableRowsEl.forEach((row,ir) => {
      let tableRows = [];
      row.querySelectorAll('th, td').forEach((dp,idp) => {
        tableRows.push(dp.innerText);
      })
      file.push(tableRows.join(delimiter));
    });
    
    file = new Blob([file.join('\n')], {type:'text/' + fileType});
    let aEl = document.createElement('a');
    aEl.download = filename + '.' + fileType;
    aEl.href = URL.createObjectURL(file);
    aEl.click();
  }

  /**
  * @method createSvgImage
  * 
  * Create the SVG image for canvas
  * @param {Panel} panel - The upper or lower panel
  * @param {PlotDimension} plotDim - The plot dimensions
  * @param {String} plotTitle - The plot title 
  * @return {Image} the svg image
  */  
  static createSvgImage(panel, plotDim, plotTitle) {
    let scalePlot = plotDim.plotWidth / panel.svgWidth;
    let scaleDpi = plotDim.printDpi / 96;
    let plotTransform = 'translate(' + plotDim.marginLeft + 
        ',' + plotDim.marginTop + ')' + ' scale(' + scalePlot + ')';
    plotTitle = panel.options.printTitle ? plotTitle : '';
   
    let svgHtml = d3.select(panel.svgEl).node().outerHTML;
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
        .attr('height', plotDim.svgHeight)
        .attr('width', plotDim.svgWidth)
    
    // Add plot title 
    svgD3.select('.plot')
        .attr('transform', plotTransform)
        .append('text')
        .attr('class', 'plot-title')
        .attr('x', panel.plotWidth / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'text-after-edge')
        .style('font-size', panel.options.titleFontSize)
        .text(plotTitle);
  
    // Remove legend drag symbol
    svgD3.select('.drag')
      .remove(); 

    // Add print footer
    if (panel.options.printFooter) {
      let urlMaxChar = 100;
      let nbreaks = Math.ceil(panel.metadata.url.length / urlMaxChar);
      
      let footerText = [];
      for (let jc = 0; jc < nbreaks; jc++) {
        footerText.push(
            panel.metadata.url.slice(urlMaxChar * jc, urlMaxChar * (jc + 1)));
      }
      footerText.push(panel.metadata.time);
      
      let nlines = footerText.length;
      
      svgD3.append('g')
          .attr('class', 'print-footer')
          .style('font-size', panel.options.printFooterFontSize * scaleDpi)
          .attr('transform', 'translate(' +
              (panel.options.printFooterPadding * scaleDpi) + ',' +
              (plotDim.svgHeight - panel.options.printFooterPadding * 
              scaleDpi) + ')')
          .selectAll('text')
          .data(footerText)
          .enter()
          .append('text')
          .text((d,i) => {return footerText[nlines - i - 1]})
          .attr('y', (d,i) => {
              return -panel.options.printFooterLineBreak * i * scaleDpi;
          });
    }
    
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
  * @param {Panel} panel - The upper or lower panel
  * @param {PlotDimension} plotDim - The plot dimensions
  * @return {{
  *   canvasEl: {HTMLElement} - the canvas DOM element,
  *   canvasContext: the canvas context
  * }} The canvas element and context
  */  
  static createCanvasContext(panel, plotDim) {
    let printHeight = panel.options.printFooter ? panel.options.printHeight :
        (plotDim.plotHeight / plotDim.printDpi + panel.options.printMarginTop);
    
    let canvasDivD3 = d3.select('body')
        .append('div')
        .attr('class', 'svg-to-canvas hidden');
    let canvasD3 = canvasDivD3.append('canvas')
        .attr('height', plotDim.svgHeight)
        .attr('width', plotDim.svgWidth)
        .style('height', printHeight + 'in')
        .style('width', panel.options.printWidth + 'in');

    let canvasEl = canvasD3.node();
    let canvasContext = canvasEl.getContext('2d');
    canvasDivD3.remove();
    
    return {canvasEl: canvasEl, canvasContext: canvasContext};
  }

}
