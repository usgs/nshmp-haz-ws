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


    //......................... Plot Options ...................................
    let plotOptions = {
        plotLowerPanel: true,
        printLowerPanel: false,
        syncAxis: false    
    };
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


    //..................... Sigma Plot Setup ...................................
    //faultTooltipText = ["GMM", "Period (s)", "SD"];
    let faultPlotOptions = {
        marginTop: 50,
        marginBottom: 20,
        linewidth: 4,
        linewidthSelection: 4,
        plotHeight: 896*0.65/2,
        plotWidth: 896*0.65,
        plotRatio: 2/1,
        pointRadius: 0,
        pointRadiusSelection: 0,
        pointRadiusTooltip: 0,
        showData: false,
        showLegend: false,
        transitionDuration: 0,
        xAxisScale: "linear",
        xAxisLocation: "top",
        yAxisScale: "linear",
    };
    //--------------------------------------------------------------------------
  
  
    _this.plot = new D3LinePlot(contentEl,
        plotOptions,
        meanPlotOptions,
        faultPlotOptions); 
  
  
  
    d3.select(_this.plot.lowerPanel.svgEl)
        .style("margin-right", "35%");
        
  
    let faultFormD3 =  d3.select(_this.plot.lowerPanel.plotBodyEl)
        .append("div")
        .attr("class", "form form-horizontal fault-form");
        
    faultFormD3.append("label")
        .attr("class", "control-spacer control-group")
        .attr("for", "dip-slider")
        .text("Dip:");

    let dipSliderD3 = faultFormD3.append("div")
        .attr("class", "form-group form-group-sm")
        
    dipSliderD3.append("div") 
        .attr("class", "col-md-8")
        .html("<input class='slider' id='dip-slider' type='range' " + 
            "name='dip-slider' min='0' max='90' step='5' />");
        
    dipSliderD3.append("div")
        .attr("class", "col-md-4")
        .append("div")
        .attr("class", "input-group input-group-sm")
        .html("<input class='form-control input-sm' " +
            "id='dip-slider-value' type='text' readonly >"+
            "<span class='input-group-addon'> ° </span>")
    

    $('[data-toggle="tooltip"]').tooltip()
    _this.dipSliderEl = document.querySelector("#dip-slider");
    _this.dipSliderValueEl = document.querySelector("#dip-slider-value");
  
    
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
      
      
      //........................ Plot Fault .................................... 
      let dip = GmmDistance.dip_val();
      let width = GmmDistance.width_val();
      let zTop = GmmDistance.zTop_val();
      
      let xMin = 0;
      let xMax = width * Math.cos(dip);
      let x = [xMin, Number(xMax.toFixed(4))];
     
      let yMin = -zTop;
      let yMax = - width * Math.sin(dip) - zTop;
      let y = [yMin, Number(yMax.toFixed(4))];
      
      seriesLabels = [];
      seriesIds = [];
      seriesData = [];
        
      seriesLabels.push("Fault");
      seriesIds.push("fault");
      seriesData.push(d3.zip(x, y));
      
      _this.plot.lowerPanel.data = seriesData;
      _this.plot.lowerPanel.ids = seriesIds;
      _this.plot.lowerPanel.labels = seriesLabels;
      _this.plot.lowerPanel.metadata = metadata;
      _this.plot.lowerPanel.xLabel = "km"; 
      _this.plot.lowerPanel.yLabel = "km";
      
      let xDomain = [-1, width];
      let yDomain = [-width-zTop, 0];
      _this.plot.plotData(_this.plot.lowerPanel, xDomain, yDomain);
      //------------------------------------------------------------------------
     
      _this.dipSliderEl.value = $("#dip").val();
      _this.dipSliderValueEl.value = $("#dip").val();
     
      _this.dipSliderEl.oninput = function(){
        $("#dip").val(this.value);
        _this.dipSliderValueEl.value = this.value;;
        dip = GmmDistance.dip_val();
        xMax = width * Math.cos(dip);
        x = [xMin, Number(xMax.toFixed(4))];
       
        yMax = - width * Math.sin(dip) - zTop;
        y = [yMin, Number(yMax.toFixed(4))];
        _this.plot.lowerPanel.data = [d3.zip(x, y)];
        _this.plot.plotData(_this.plot.lowerPanel, xDomain, yDomain);
      };


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



