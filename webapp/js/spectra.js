"use strict"


/** 
* @class Spectra
*
* @classdesc spectra-plot.html class
*
*
*/
class Spectra{


  //............................ Constructor: Spectra ..........................
  constructor(){
    

    //........................... Variables ....................................
    let _this,
        // Variables
        disable,
        inputs,
        rCompute,
        spectraPromise,
        url;

    _this = this;
    // Properties of class
    _this.footer;
    _this.footerOptions;
    _this.header;
    _this.spinner;
    _this.spectraWs;
     
    // Create Footer 
    _this.footer = new Footer();
    _this.footerOptions = {
        rawBtnDisable: true,
        updateBtnDisable: true
    };
    _this.footer.setOptions(_this.footerOptions);

    // Create header
    _this.header = new Header();
    _this.header.setTitle("Response Spectra");

    // Create spinner
    _this.spinner = new Spinner();
    _this.spinner.on();

    // Plot setup
    Spectra.plotSetup(_this);
    
    _this.spectraWs = "/nshmp-haz-ws/spectra";
    //--------------------------------------------------------------------------

    
    //......................... Update Plot on Click ...........................  
    $(_this.footer.updateBtnEl).click(function (){   
      inputs = $("#inputs").serialize();
      url = _this.spectraWs + "?" + inputs; 
      _this.spinner.on();
      window.location.hash = inputs;
      $(_this.footer.rawBtnEl).off();
      Spectra.updatePlot(_this,url);
    });
    //--------------------------------------------------------------------------
      
   
    //....................... Update Footer Buttons ............................   
    $("#gmms").change(function() { 
      disable = $(":selected", this).length == 0;
      _this.footerOptions.rawBtnDisable = disable;
      _this.footerOptions.updateBtnDisable = disable;
      _this.footer.setOptions(_this.footerOptions);
    });
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

    $(document).keypress(function(event){
      if(event.which == 13 && !$("#update-plot").prop("disabled")) {
        $("#update-plot").click();
      }
    });
    
    $('[data-toggle="tooltip"]').tooltip(); 
    //--------------------------------------------------------------------------
  
    
    //................... Get Spectra Parameters ............................... 
    spectraPromise = $.getJSON(_this.spectraWs);
    spectraPromise.done(function(usage){
      Spectra.buildInputs(spectra,usage);
    });
    spectraPromise.fail(function(){
      console.log("JSON Error");
    });
    //--------------------------------------------------------------------------
  
  
  }
  //---------------------- End Constructor: Spectra ----------------------------

  
  
  //...................... Method: addToggle ...................................
  /* Add toggle behavier to all button children of id. */
  static addToggle(id, callback) {
    $("#" + id + " button").click(function(event) {
      if ($(this).hasClass("active")) return;
      $(this).siblings().removeClass("active");
      $(this).addClass("active");
      callback($(this).attr('id'));
    });
  }
  //-------------------- End Method: addToggle ---------------------------------
 
  
  
  //........................... Method: buildInputs ............................
  /* process usage response */
  static buildInputs(spectra,usage) {
    
    let gmmAlphaOptions,
        gmmGroupOptions,
        members,
        optGroup,
        options,
        params;
    
    spectra.spinner.off();
    
    params = usage.parameters;

    /* Alphabetical GMMs. */
    gmmAlphaOptions = $();
    params.gmm.values.forEach(function (gmm) {
      gmmAlphaOptions = gmmAlphaOptions.add($('<option>')
        .attr('value', gmm.id)
        .text(gmm.label));

    });

    /* Grouped GMMs. */
    gmmGroupOptions = $();
    params.group.values.forEach(function (group) {
      members = group.data;
      optGroup = $('<optgroup>')
          .attr('label', group.label)
          .attr("id",group.id);
      gmmGroupOptions = gmmGroupOptions.add(optGroup);
      optGroup.append(gmmAlphaOptions
        .filter(function (index, gmmOption) {
          return members.includes(gmmOption.getAttribute("value")); })
        .clone());
    });

    /* Bind option views to sort buttons */
    $("#gmm-sorter input").change(function() {
      options = this.value === "alpha" ? gmmAlphaOptions : gmmGroupOptions;
      $("#gmms").empty().append(options);
      $("#gmms").scrollTop(0);
    });

    /* Set initial view to groups */
    $("#gmms").empty().append(gmmGroupOptions);

    /* Populate fields with defaults. */
    Object.keys(params)
      .filter(function (key) {
        if (key === "gmms") return false;
        if (key === "groups") return false;
        return true; })
      .forEach(function (key, index) {
        $("input[name='" + key + "']").val(params[key].value); });

    Spectra.checkQuery(spectra,gmmAlphaOptions);
  }
  //----------------------- End Method: buildInputs ----------------------------
  
  
  
  //..................... Method: calcDistances ................................
  static calcDistances() {

    //........................ Variables .......................................
    let δ,
        cosδ,
        footwall,
        h1, 
        h2,
        rCut1,
        rCut2,
        rJB,
        rRup,
        rX,
        sinδ, 
        W,
        Wx,
        Wz, 
        zBot,
        zTop;
    //--------------------------------------------------------------------------
    

    rX = Spectra.rX_val();
    zTop = Spectra.zTop_val();
    footwall = $("#hw-fw-fw").hasClass("active");
    rRup = Math.hypot(rX, zTop);

    if (footwall) {
      return [rX, rRup, rX];
    }

    δ = Spectra.dip_val();
    W = Spectra.width_val();
    sinδ = Math.sin(δ);
    cosδ = Math.cos(δ);
    Wx = W * cosδ;
    Wz = W * sinδ;
    rJB = Math.max(0.0, rX - Wx);
    h1 = zTop / cosδ;
    rCut1 = h1 * sinδ;

    if (rX < rCut1) {
      return [rJB, rRup, rX];
    }

    zBot = zTop + Wz;
    h2 = zBot / cosδ;
    rCut2 = Wx + h2 * sinδ;

    if (rX >= rCut2) {
      rRup = Math.hypot(zBot, rJB);
      return [rJB, rRup, rX];
    }

    /*  
     * Linear scaling of distance normal
     * to top and bottom of fault.
     */
    rRup = h1 + (h2 - h1) * ((rX - rCut1) / (rCut2 - rCut1));
    return [rJB, rRup, rX];
  }
  //----------------------- End Method: calcDistance ---------------------------
  
  
  
  //.................... Method: checkRakeRange ................................
  static checkRakeRange(mech, value) {
    let isNormal,
        isReverse,
        isStrike;
    
    isNormal = value < -45.0 && value > -135.0;
    isReverse = value > 45.0 && value < 135.0;
    isStrike = !isReverse && !isNormal;
    if (mech == "fault-style-reverse") return isReverse ? value : 90.0;
    if (mech == "fault-style-normal") return isNormal ? value : -90.0;
    return isStrike ? value : 0.0;
  }
  //------------------- End Method: checkRakeRange -----------------------------
 
  
  
  //...................... Method: checkQuery ..................................
  static checkQuery(spectra,gmmOptions){
    let inputs,
        key,
        pars,
        url,
        value;
         
    url = window.location.hash.substring(1);
    if (!url) return;
    
    //................... Update Buttons and Checkboxes ........................
    $(".gmm-group").removeClass("active");
    $(".gmm-alpha").addClass("active");
    $(".gmm-alpha input").prop("checked",true);
    $("#gmms").empty().append(gmmOptions);
    $("input[type*='checkbox']").prop("checked",false);
    $("#zHyp,#rRup,#rJB").prop("readOnly",false);
    $("#hw-fw-hw").prop("disabled", true);
    $("#hw-fw-fw").prop("disabled", true);
    //--------------------------------------------------------------------------

    
    //.................... Set Parameters ......................................
    pars = url.split("&");
    key;
    value;
    pars.forEach(function(par,i){
      key = par.split("=")[0]; 
      value  = par.split("=")[1]; 
      if (key == "gmm"){
        $( "#gmms option[value='"+value+"']")
            .prop("selected",true);
      }else{
        $("input[name='"+key+"']").val(value);
      }
    });
    Spectra.updateFocalMech();
    $("#gmms")[0].scrollIntoView();
    $("#fault-style .btn").removeClass("focus");
    //--------------------------------------------------------------------------
    
    
    //............................ Plot ........................................ 
    inputs = $("#inputs").serialize();
    url = "/nshmp-haz-ws/spectra?"+ inputs;
    spectra.footerOptions.rawBtnDisable = false;
    spectra.footerOptions.updateBtnDisable = false;
    spectra.footer.setOptions(spectra.footerOptions);
    Spectra.updatePlot(spectra,url);
    //--------------------------------------------------------------------------

  
  }
  //----------------------- End Method: checkQuery -----------------------------
  
  

  //......................... Method: dip_val .................................. 
  static dip_val() {
    return parseFloat($("#dip").val()) * Math.PI / 180.0;
  }
  //----------------------- End Method: dip_val --------------------------------
  
  
  
  //..................... Method: plotSetup ....................................
  static plotSetup(spectra){

    //.......................... Variables .....................................
    let contentEl,
        meanPlotOptions,
        meanTooltipText,
        sigmaTooltipText,
        sigmaPlotOptions;

    // Properties of class
    spectra.meanPlot;
    spectra.sigmaPlot;

    contentEl = document.querySelector("#content");
    //--------------------------------------------------------------------------


    //....................... Mean Plot Setup ..................................
    meanTooltipText = ["GMM", "Period (s)", "MGM (g)"];
    meanPlotOptions = {
        legendLocation: "topright",
        title: "Response Spectra",
        tooltipText: meanTooltipText,
        xAxisScale: "linear",
        yAxisScale: "linear"
    };
    spectra.meanPlot = new D3LinePlot(contentEl,meanPlotOptions);
    //--------------------------------------------------------------------------


    //..................... Sigma Plot Setup ...................................
    sigmaTooltipText = ["GMM", "Period (s)", "SD"];
    sigmaPlotOptions = {
        legendFontSize: 10,
        legendLineBreak: 12,
        legendPadding: 5,
        legendLocation: "topright",
        plotHeight: 224,
        plotWidth: 896,
        plotRatio: 4/1,
        title: "Response Spectra: Sigma",
        tooltipText: sigmaTooltipText,
        xAxisScale: "linear",
        yAxisScale: "linear"
    };
    spectra.sigmaPlot = new D3LinePlot(contentEl,sigmaPlotOptions);
    //--------------------------------------------------------------------------

  
  }
  //------------------ End Method: plotSetup -----------------------------------
 
  
  
  //......................... Method: rake_val ................................. 
  static rake_val() {
    return parseFloat($("#rake").val());
  }
  //----------------------- End Method: rake_val -------------------------------

 
 
  //......................... Method: rX_val ................................... 
  static rX_val() {
    return parseFloat($("#rX").val());
  }
  //----------------------- End Method: rX_val ---------------------------------

  

  //...................... Method: updateDistance ..............................
  static updateDistance() {
    if (!$("#r-check").prop("checked")) return;
    var r = Spectra.calcDistances();
    $("#rJB").val(r[0].toFixed(2));
    $("#rRup").val(r[1].toFixed(2));
  }
  //--------------------- End Method: updateDistance ---------------------------



  //..................... Method: updateFocalMech ..............................
  /* Update focal mech selection based on rake. */
  static updateFocalMech() {
    let rake;
     
    rake = Spectra.rake_val();
    if (rake > 45.0 && rake < 135.0 
          && !$("#fault-style-reverse").hasClass("active")) {
      $("#fault-style-reverse").click();
      return;
    }
    if (rake < -45.0 && rake > -135.0 
          && !$("#fault-style-normal").hasClass("active")) {
      $("#fault-style-normal").click();
      return;
    }
    if (!$("#fault-style-strike").hasClass("active")) {
      $("#fault-style-strike").click();
    }

  }
  //------------------- End Method: updateFocalMech ----------------------------


  
  //...................... Method: updateHypoDepth .............................
  static updateHypoDepth() {
    var hypoDepth = Spectra.zTop_val() + 
        Math.sin(Spectra.dip_val()) * Spectra.width_val() / 2.0;
    $("#zHyp").val(hypoDepth.toFixed(2));
  }
  //--------------------- End Method: updateHypoDepth --------------------------

  

  //....................... Method: updatePlot .................................
  static updatePlot(spectra,url) {

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
      
      spectra.spinner.off();
     
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
      
      spectra.meanPlot.data = seriesData;
      spectra.meanPlot.ids = seriesIds;
      spectra.meanPlot.labels = seriesLabels;
      spectra.meanPlot.metadata = metadata;
      spectra.meanPlot.xLabel = mean.xLabel;
      spectra.meanPlot.yLabel = mean.yLabel;
      
      spectra.meanPlot.plotData();
      d3.select(spectra.meanPlot.el)
          .classed(spectra.meanPlot.options.colSizeMax,true) 
          .classed(spectra.meanPlot.options.colSizeMin,false);
      d3.select(spectra.meanPlot.plotResizeEl)
          .attr("class",spectra.meanPlot.resizeSmall); 
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
      
      spectra.sigmaPlot.data = seriesData;
      spectra.sigmaPlot.ids = seriesIds;
      spectra.sigmaPlot.labels = seriesLabels;
      spectra.sigmaPlot.metadata = metadata;
      spectra.sigmaPlot.xLabel = sigma.xLabel;
      spectra.sigmaPlot.yLabel = sigma.yLabel;
      
      spectra.sigmaPlot.plotData();
      d3.select(spectra.sigmaPlot.el)
          .classed(spectra.sigmaPlot.options.colSizeMax,true)
          .classed(spectra.sigmaPlot.options.colSizeMin,false);
      d3.select(spectra.sigmaPlot.plotResizeEl)
          .attr("class",spectra.sigmaPlot.resizeSmall); 
      //------------------------------------------------------------------------
      
      
      $(spectra.footer.rawBtnEl).click(function(){
        window.open(url);
      });

    });
    //--------------------------------------------------------------------------
 
  
  }
  //------------------------ End Method: updatePlot ----------------------------



  //......................... Method: width_val ................................ 
  static width_val() {
    return  parseFloat($("#width").val());
  }
  //---------------------- End Method: width_val -------------------------------



  //...................... Method: updateRake ..................................
  /* Update rake if out of focal mech range */
  static updateRake(id) {
    $("#rake").val(Spectra.checkRakeRange(id, Spectra.rake_val()));
  }
  //---------------------- End Method: updateRake ------------------------------



  //......................... Method: zTop_val ................................. 
  static zTop_val() {
    return parseFloat($("#zTop").val());
  }
  //----------------------- End Method: zTop_val -------------------------------



}
//----------------------- End Class: Spectra -----------------------------------



