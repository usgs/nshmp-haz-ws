'use strict';

/**
* @class D3SaveMetadata
*
* @fileoverview Create an iframe and make a table of the metadata and 
*     print.
*/
export default class D3SaveMetadata { 
 
  /**
  * @param {D3SaveMetadataBuilder} builder - The builder.
  */ 
  constructor(builder) {
    this.filename = builder.filename;
    this.fileFormat = builder.fileFormat;
    this.metadata = builder.metadata;
  
    d3.selectAll('.save-metadata-iframe')
        .remove();
         
    let headD3 = d3.select(document.head);
    
    let iframeD3 = d3.select('body')
        .append('iframe')
        .attr('class', 'hidden save-metadata-iframe');
        
    let iframeEl = iframeD3.node();
   
    d3.select(iframeEl.contentWindow.document.head)
        .html(headD3.html());

    let metadataD3 = d3.select(iframeEl.contentWindow.document.body)
        .append('div')
        .attr('class', 'save-metadata-table');
    
    let tableD3 = metadataD3.append('table')
        .attr('class', 'table table-condensed table-bordered');

    let tableBodyD3 = tableD3.append('tbody');
     
    for (let key in this.metadata) {
      if (key == 'url' || key == 'time') break;
      let values = this.metadata[key];
      let isArray = Array.isArray(values);
      let tableRowD3 = tableBodyD3.append('tr');
      tableRowD3.append('th')
          .attr('nowrap', true)
          .html(key);
      
      if (isArray) {
        tableRowD3.append('ul')
            .style('margin', '0')
            .style('padding', '5px 0')
            .selectAll('li')
            .data(values)
            .enter()
            .append('li')
            .attr('class', 'list-group-item')
            .style('border', 'none')
            .style('padding', '2px 5px')
            .text((d) => { return d; });
      } else {
        tableRowD3.append('td')
            .attr('nowrap', true)
            .text(values);
      }
    }
    
    $(iframeEl).ready(() => {
      iframeEl.contentWindow.print();
      
      iframeEl.contentWindow.onafterprint = () => {
        d3.select(iframeEl).remove();
      };
      
    });
  }

  /**
  * @method Builder
  * 
  * Builder for D3SaveMetadata
  */
  static get Builder() {
    return class Builder {
      
      constructor() {}
    
      build() {
        return new D3SaveMetadata(this);
      }

      filename(filename) {
        this.filename = filename;
        return this;
      }
      
      fileFormat(fileFormat) {
        this.fileFormat = fileFormat.toLowerCase();
        return this;
      }
      
      metadata(metadata) {
        this.metadata = metadata;
        return this;
      }
      
    }
  }

}
