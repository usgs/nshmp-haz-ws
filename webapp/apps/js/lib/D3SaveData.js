'use strict';

/**
* @class Save
* 
* @fileoverview This class will save a SVG element as a figure or 
*     save data from a data table.
*/
export default class D3SaveData { 
  
  constructor(builder) {
    this.dataSeries = builder.data;
    this.filename = builder.filename;
    this.fileFormat = builder.fileFormat;
    this.dataSeriesLabels = builder.dataSeriesLabels;
    this.dataRowLabels = builder.dataRowLabels;

    let delimiter = this.fileFormat == 'txt' ? '\t' : ',';
    let dataRow = [];

    this.dataSeries.forEach((series, i) => {
      let seriesTranspose = d3.transpose(series);
      dataRow.push([this.dataRowLabels[0], this.dataSeriesLabels[i]]);
      
      seriesTranspose.forEach((dataArray, ida) => {
        dataRow.push([
          this.dataRowLabels[ida + 1], 
          dataArray.join(delimiter)
        ]);
      })
      dataRow.push('');
    });
  
    let file = new Blob(
        [dataRow.join('\n')], 
        {type:'text/' + this.fileFormat}
    );
    let aEl = document.createElement('a');
    aEl.download = this.filename + '.' + this.fileFormat;
    aEl.href = URL.createObjectURL(file);
    aEl.click();

  }

  /**
  * @method Builder
  * 
  * Builder for D3SaveData
  */
  static get Builder() {
    return class Builder {
      
      constructor() {}
    
      build() {
        return new D3SaveData(this);
      }

      data(data) {
        this.data = data;
        return this;
      }

      dataRowLabels(dataRowLabels) {
        this.dataRowLabels = dataRowLabels;
        return this;
      }

      dataSeriesLabels(dataSeriesLabels) {
        this.dataSeriesLabels = dataSeriesLabels;
        return this;
      }
      
      filename(filename) {
        this.filename = filename;
        return this;
      }
      
      fileFormat(fileFormat) {
        this.fileFormat = fileFormat.toLowerCase();
        return this;
      }
      
    }
  }

}
