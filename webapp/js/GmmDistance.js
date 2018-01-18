"use strict"


/** 
* @class GmmDistance
*
* @classdesc gmm-distance.html class
*
*
*/
class GmmDistance extends Gmm{


  //....................... Constructor: GmmDistance ...........................
  constructor(){
    

    //........................... Variables ....................................
    let _this,
        // Variables
        inputs,
        url;
    
    let wsUrl = "/nshmp-haz-ws/gmm/distance";
    let webApp = "GmmDistance";
    _this = super(webApp, wsUrl);
    
    _this.header.setTitle("Ground Motion Vs. Distance");
    _this.spinner.on();
    // Plot setup
    GmmDistance.plotSetup(_this);
    //--------------------------------------------------------------------------

    
    //............................ Options .....................................
    _this.options = {
        rMaxDefault: 300,
    };
    //--------------------------------------------------------------------------

    
    //....................... Event Listeners ..................................
    $("#imt").change(function(){
      _this.spinner.on("Calculating ...");
      inputs = $("#inputs").serialize();
      url = _this.wsUrl + "?" + inputs;
      window.location.hash = inputs;
      Gmm.updatePlot(_this, url);
    });
    
    
    /*
    $("#r-check").change(function(event) {
      rCompute = this.checked;
      $("#rJB").prop("readonly", rCompute);
      $("#rRup").prop("readonly", rCompute);
      $("#hw-fw-hw").prop("disabled", !rCompute);
      $("#hw-fw-fw").prop("disabled", !rCompute);
      GmmDistance.updateDistance();
    });
    
    $("#rX, #zTop, #dip, #width").on("input", GmmDistance.updateDistance);

    $("#z-check").change(function(event) {
      $("#zHyp").prop("readonly", this.checked);
      GmmDistance.updateHypoDepth();
    });
    
    $("#zTop, #dip, #width").on("input", GmmDistance.updateHypoDepth);

    $("#rake").on("input", GmmDistance.updateFocalMech);
    */
    //--------------------------------------------------------------------------
  
    
  
  }
  //---------------------- End Constructor: GmmDistance ------------------------

  
  
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


    //....................... Mean Plot Setup ..................................
    meanTooltipText = ["GMM", "Distance (km)", "MGM (g)"];
    meanPlotOptions = {
        legendLocation: "bottomleft",
        pointRadius: 2.75,
        pointRadiusSelection: 3.5,
        pointRadiusTooltip: 4.5,
        tooltipText: meanTooltipText,
        xAxisScale: "log",
        yAxisScale: "log"
    };
    _this.meanPlot = new D3LinePlot(contentEl,meanPlotOptions);
    //--------------------------------------------------------------------------


    //..................... Sigma Plot Setup ...................................
    /*
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
        xAxisScale: "linear",
        yAxisScale: "linear"
    };
    _this.sigmaPlot = new D3LinePlot(contentEl,sigmaPlotOptions);
    */
    //--------------------------------------------------------------------------
   
  
  }
  //------------------ End Method: plotSetup -----------------------------------
 
  

  //....................... Method: updatePlot .................................
  static updatePlot(_this,url) {

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
     
      let selectedImtDisplay = $("#imt :selected").text();
      let selectedImt = $("#imt :selected").val();

      _this.meanPlot.data = seriesData;
      _this.meanPlot.ids = seriesIds;
      _this.meanPlot.labels = seriesLabels;
      _this.meanPlot.metadata = metadata;
      _this.meanPlot.plotFilename = "gmmDistance" + selectedImt;
      _this.meanPlot.title = "Ground Motion Vs. Distance: " + 
          selectedImtDisplay;
      _this.meanPlot.xLabel = mean.xLabel;
      _this.meanPlot.yLabel = mean.yLabel;
      
      _this.meanPlot.plotData();
      //------------------------------------------------------------------------
      
      
      //........................ Plot Sigma .................................... 
      /*
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
      
      _this.sigmaPlot.data = seriesData;
      _this.sigmaPlot.ids = seriesIds;
      _this.sigmaPlot.labels = seriesLabels;
      _this.sigmaPlot.metadata = metadata;
      _this.sigmaPlot.plotFilename = "spectraSigma";
      _this.sigmaPlot.title = "Response Spectra: Sigma";
      _this.sigmaPlot.xLabel = sigma.xLabel;
      _this.sigmaPlot.yLabel = sigma.yLabel;
      
      _this.sigmaPlot.plotData();
      */
      //------------------------------------------------------------------------
      
      $(_this.footer.rawBtnEl).off() 
      $(_this.footer.rawBtnEl).click(function(){
        window.open(url);
      });

    });
    //--------------------------------------------------------------------------
 
  
  }
  //------------------------ End Method: updatePlot ----------------------------



}
//----------------------- End Class: GmmDistance -------------------------------



