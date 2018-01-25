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
    //--------------------------------------------------------------------------

  
    _this.plot = new D3LinePlot(contentEl,
        {},
        meanPlotOptions,
        {}); 
    
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
      
      
      let selectedImtDisplay = $("#imt :selected").text();
      let selectedImt = $("#imt :selected").val();
      _this.plot.title = "Ground Motion Vs. Distance: " + 
          selectedImtDisplay;
      
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
      _this.plot.upperPanel.dataTableTitle = "Median Ground Motion";
      _this.plot.upperPanel.ids = seriesIds;
      _this.plot.upperPanel.labels = seriesLabels;
      _this.plot.upperPanel.metadata = metadata;
      _this.plot.upperPanel.plotFilename = "gmmDistance" + selectedImt;
      _this.plot.upperPanel.xLabel = mean.xLabel;
      _this.plot.upperPanel.yLabel = mean.yLabel;
      
      _this.plot.plotData(_this.plot.upperPanel);
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



