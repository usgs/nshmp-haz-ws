'use strict';

/**
* @class SaveMetadata
*/
export default class D3SaveMetadata { 
  
  constructor(builder) {
    this.filename = builder.filename;
    this.fileFormat = builder.fileFormat;
    this.metadata = builder.metadata;

    d3.select('body')
        .selectAll('*')
        .classed('hidden-print', true);

    let metadataD3 = d3.select('body')
        .append('div')
        .attr('class', 'save-metadata-table visible-print-block');

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
            .style('padding', '0')
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
    
    let cssD3 = d3.select('head')
        .append('link')
        .attr('rel', 'stylesheet')
        .attr('href', '/nshmp-haz-ws/apps/css/MetadataPrint.css');
    window.print();
    cssD3.remove();
    
    d3.select('body')
        .selectAll('*')
        .classed('hidden-print', false);
    metadataD3.remove();
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
