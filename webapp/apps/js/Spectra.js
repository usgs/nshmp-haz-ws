"use strict"


/** 
* @class Spectra
*
* @classdesc spectra-plot.html class
*
*
*/
class Spectra extends Gmm{


  //............................ Constructor: Spectra ..........................
  constructor(){
    

    //........................... Variables ....................................
    let _this,
        // Variables
        rCompute;

    let webApp = "Spectra";
    let wsUrl = "/nshmp-haz-ws/gmm/spectra"
    _this = super(webApp, wsUrl);
     
    _this.header.setTitle("Response Spectra");
    _this.spinner.on();
    Spectra.plotSetup(_this);
    //--------------------------------------------------------------------------

    
    //............. Add toggle behavior to non-form buttons ....................
    Spectra.addToggle("hw-fw", Spectra.updateDistance);
    Spectra.addToggle("fault-style", Spectra.updateRake);
    //--------------------------------------------------------------------------


    //....................... Event Listeners ..................................
    $("#r-check").change(function(event) {
      rCompute = this.checked;
      $("#rJB").prop("readonly", rCompute);
      $("#rRup").prop("readonly", rCompute);
      $("#hw-fw-hw").prop("disabled", !rCompute);
      $("#hw-fw-fw").prop("disabled", !rCompute);
      Spectra.updateDistance();
    });
    
    $("#rX, #zTop, #dip, #width").on("input", Spectra.updateDistance);

    $("#z-check").change(function(event) {
      $("#zHyp").prop("readonly", this.checked);
      Spectra.updateHypoDepth();
    });
    
    $("#zTop, #dip, #width").on("input", Spectra.updateHypoDepth);

    $("#rake").on("input", Spectra.updateFocalMech);
    //--------------------------------------------------------------------------
 
  
  }
  //---------------------- End Constructor: Spectra ----------------------------

  
  
  //..................... Method: plotSetup ....................................
  static plotSetup(_this){

    //.......................... Variables .....................................
    let contentEl,
        meanPlotOptions,
        meanTooltipText,
        sigmaTooltipText,
        sigmaPlotOptions;

    // Properties of class
    _this.meanPlot;
    _this.sigmaPlot;

    contentEl = document.querySelector("#content");
    //--------------------------------------------------------------------------

    
    //....................... Plot Options .....................................
    let plotOptions = {
        plotLowerPanel: true,
        syncSelections: true,
        syncXAxis: true,
        syncYAxis: false,
        xAxisScale: "linear",
    };
    //--------------------------------------------------------------------------


    //....................... Mean Plot Setup ..................................
    meanTooltipText = ["GMM", "Period (s)", "MGM (g)"];
    meanPlotOptions = {
        legendLocation: "topright",
        tooltipText: meanTooltipText,
        yAxisScale: "linear"
    };
    //--------------------------------------------------------------------------


    //..................... Sigma Plot Setup ...................................
    sigmaTooltipText = ["GMM", "Period (s)", "SD"];
    sigmaPlotOptions = {
        legendFontSize: 10,
        legendLineBreak: 14,
        legendPaddingX: 15,
        legendPaddingY: 12,
        legendLocation: "topright",
        plotHeight: 224,
        plotWidth: 896,
        plotRatio: 4/1,
        tooltipText: sigmaTooltipText,
        yAxisScale: "linear"
    };
    //--------------------------------------------------------------------------
   
  
  
    _this.plot = new D3LinePlot(contentEl,
        plotOptions,
        meanPlotOptions,
        sigmaPlotOptions);
  }
  //------------------ End Method: plotSetup -----------------------------------
 

  
  //....................... Method: updatePlot .................................
  static updatePlot(_this, url) {

    //........................ Variables .......................................
    let dataSet,
        mean,
        meanData,
        metadata,
        series,
        seriesData,
        seriesIds,
        seriesLabels,
        sigma,
        sigmaData;
    //--------------------------------------------------------------------------

    
    //............................. Query and Plot .............................
    d3.json(url, function(error, response) {
      if (error) return console.warn(error);
      if (response.status == "ERROR") {
        svg.append("text")
            .attr("y", margin.top)
            .attr("x", margin.left)
            .text(response.message);
        return;
      }  
      
      _this.spinner.off();
     
      metadata ={
        version: "1.1",
        url: window.location.href,
        time: new Date()
      }; 
      
      _this.plot.title = "Response Spectra";
      
      //........................ Plot Means .................................... 
      mean = response.means;
      meanData = mean.data;

      seriesLabels = [];
      seriesIds = [];
      seriesData = [];
        
      meanData.forEach(function(d, i) {
        seriesLabels.push(d.label);
        seriesIds.push(d.id);
        seriesData.push(d3.zip(d.data.xs, d.data.ys));
      });
      
      _this.plot.upperPanel.data = seriesData;
      _this.plot.upperPanel.dataTableTitle = "Means";
      _this.plot.upperPanel.ids = seriesIds;
      _this.plot.upperPanel.labels = seriesLabels;
      _this.plot.upperPanel.metadata = metadata;
      _this.plot.upperPanel.plotFilename = "spectraMean";
      _this.plot.upperPanel.xLabel = mean.xLabel;
      _this.plot.upperPanel.yLabel = mean.yLabel;
      
      _this.plot.plotData(_this.plot.upperPanel);
      //------------------------------------------------------------------------
      
      
      //........................ Plot Sigma .................................... 
      sigma = response.sigmas;
      sigmaData = sigma.data;

      seriesLabels = [];
      seriesIds = [];
      seriesData = [];
        
      sigmaData.forEach(function(d, i) {
        seriesLabels.push(d.label);
        seriesIds.push(d.id);
        seriesData.push(d3.zip(d.data.xs, d.data.ys));
      });
      
      _this.plot.lowerPanel.data = seriesData;
      _this.plot.lowerPanel.dataTableTitle = "Sigmas";
      _this.plot.lowerPanel.ids = seriesIds;
      _this.plot.lowerPanel.labels = seriesLabels;
      _this.plot.lowerPanel.metadata = metadata;
      _this.plot.lowerPanel.plotFilename = "spectraSigma";
      _this.plot.lowerPanel.xLabel = sigma.xLabel;
      _this.plot.lowerPanel.yLabel = sigma.yLabel;
      
      _this.plot.plotData(_this.plot.lowerPanel);
      //------------------------------------------------------------------------
    
      _this.plot.syncSelections(_this.plot);
     
      $(_this.footer.rawBtnEl).off(); 
      $(_this.footer.rawBtnEl).click(function(){
        window.open(url);
      });

    });
    //--------------------------------------------------------------------------
 
  
  }
  //------------------------ End Method: updatePlot ----------------------------



}
//----------------------- End Class: Spectra -----------------------------------



