"use strict"



// Create Footer 
let footer = new Footer();
let footerOptions = {
    rawBtnDisable: true,
    updateBtnDisable: true
};
footer.setOptions(footerOptions);

// Create header
let header = new Header();
header.setTitle("Response Spectra2");

// Create spinner
let spinner = new Spinner();
spinner.on();



var rakes = {
  "checkRange": function(mech, value) {
    if (mech == "reverse") 
      return (value > 45.0 && value < 135.0) ? value : 90.0;
    if (mech == "normal") 
      return (value < -45.0 && value > -135.0) ? value : -90.0;
    return value;
  }
}


/* Init form controls */
$(function() {

  /* Add toggle behavior to non-form buttons. */
  addToggle("hw-fw", updateDistance);
  addToggle("fault-style", updateRake);

  /* Init distance helper. */
  $("#r-check").change(function(event) {
    var rCompute = this.checked;
    $("#rJB").prop("readonly", rCompute);
    $("#rRup").prop("readonly", rCompute);
    $("#hw-fw-hw").prop("disabled", !rCompute);
    $("#hw-fw-fw").prop("disabled", !rCompute);
    updateDistance();
  });
  $("#rX, #zTop, #dip, #width").on("input", updateDistance);

  $("#z-check").change(function(event) {
    $("#zHyp").prop("readonly", this.checked);
    updateHypoDepth();
  });
  $("#zTop, #dip, #width").on("input", updateHypoDepth);

  $("#rake").on("input", updateFocalMech);

  $(document).keypress(function(event){
    if(event.which == 13 && !$("#update-plot").prop("disabled")) {
      $("#update-plot").click();
    }
  });
});


/* Add toggle behavier to all button children of id. */
function addToggle(id, callback) {
  $("#" + id + " button").click(function(event) {
    if ($(this).hasClass("active")) return;
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    callback($(this).attr('id'));
  });
}

/* Update focal mech selection based on rake. */
function updateFocalMech() {
  var rake = rake_val();
  if (rake > 45.0 && rake < 135.0 && !$("#fault-style-reverse").hasClass("active")) {
    $("#fault-style-reverse").click();
    return;
  }
  if (rake < -45.0 && rake > -135.0 && !$("#fault-style-normal").hasClass("active")) {
    $("#fault-style-normal").click();
    return;
  }
  if (!$("#fault-style-strike").hasClass("active")) {
    $("#fault-style-strike").click();
  }

}

/* Update rake if out of focal mech range */
function updateRake(id) {
  $("#rake").val(checkRakeRange(id, rake_val()));
}

function checkRakeRange(mech, value) {
  var isReverse = value > 45.0 && value < 135.0;
  var isNormal = value > 45.0 && value < 135.0;
  var isStrike = !isReverse && !isNormal;
  if (mech == "fault-style-reverse") return isReverse ? value : 90.0;
  if (mech == "fault-style-normal") return isNormal ? value : -90.0;
  return isStrike ? value : 0.0;
}


function updateHypoDepth() {
  var hypoDepth = zTop_val() + Math.sin(dip_val()) * width_val() / 2.0;
  $("#zHyp").val(hypoDepth.toFixed(2));
}

function updateDistance() {
  if (!$("#r-check").prop("checked")) return;
  var r = calcDistances();
  $("#rJB").val(r[0].toFixed(2));
  $("#rRup").val(r[1].toFixed(2));
}

function calcDistances() {
  var rX = rX_val();
  var zTop = zTop_val();
  var footwall = $("#hw-fw-fw").hasClass("active");
  var rRup = Math.hypot(rX, zTop);

  if (footwall) {
    return [rX, rRup, rX];
  }

  var δ = dip_val();
  var W = width_val();
  var sinδ = Math.sin(δ);
  var cosδ = Math.cos(δ);
  var Wx = W * cosδ;
  var Wz = W * sinδ;
  var rJB = Math.max(0.0, rX - Wx);
  var h1 = zTop / cosδ;
  var rCut1 = h1 * sinδ;

  if (rX < rCut1) {
    return [rJB, rRup, rX];
  }

  var zBot = zTop + Wz;
  var h2 = zBot / cosδ;
  var rCut2 = Wx + h2 * sinδ;

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

$(function() {
  $('[data-toggle="tooltip"]').tooltip(); 

  /* Fetch parameter data. */
  $.ajax({
    url: "/nshmp-haz-ws/spectra",
    success: buildInputs
  });
});


function rX_val() {
  return parseFloat($("#rX").val());
}

function dip_val() {
  return parseFloat($("#dip").val()) * Math.PI / 180.0;
}

function width_val() {
  return  parseFloat($("#width").val());
}

function zTop_val() {
  return parseFloat($("#zTop").val());
}

function rake_val() {
  return parseFloat($("#rake").val());
}


/* process usage response */
function buildInputs(usage) {
  spinner.off();

  var params = usage.parameters;

  /* Alphabetical GMMs. */
  var gmmAlphaOptions = $();
  params.gmm.values.forEach(function (gmm) {
    gmmAlphaOptions = gmmAlphaOptions.add($('<option>')
      .attr('value', gmm.id)
      .text(gmm.label));

  });

  /* Grouped GMMs. */
  var gmmGroupOptions = $();
  params.group.values.forEach(function (group) {
    var members = group.data;
    var optGroup = $('<optgroup>')
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
    var options = this.value === "alpha" ? gmmAlphaOptions : gmmGroupOptions;
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

  checkQuery(gmmAlphaOptions);
}


function checkQuery(gmmOptions){
  
  let url = window.location.hash.substring(1);
  if (!url) return;
  $(".gmm-group").removeClass("active");
  $(".gmm-alpha").addClass("active");
  $("#gmms").empty().append(gmmOptions);
  $("input[type*='checkbox']").prop("checked",false);
  $("#zHyp,#rRup,#rJB").prop("readOnly",false);
  let pars = url.split("&");
  let key;
  let value;
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
  updateFocalMech();
  let inputs = $("#inputs").serialize();
  url = "/nshmp-haz-ws/spectra?"+ inputs;
  footerOptions.rawBtnDisable = false;
  footerOptions.updateBtnDisable = false;
  footer.setOptions(footerOptions);
  updatePlot(url);
}



//##############################################################################
//
//............................ Plot ............................................

//....................... Footer Buttons .......................................
$("#update-plot").click(function (){   
  let inputs = $("#inputs").serialize();
  let url = "/nshmp-haz-ws/spectra?" + inputs; 
  spinner.on();

  window.location.hash = inputs;
  $("#raw-data").off();
  updatePlot(url);
});

  
$("#gmms").change(function() { 
  let disable = $(":selected", this).length == 0;
  footerOptions.rawBtnDisable = disable;
  footerOptions.updateBtnDisable = disable;
  footer.setOptions(footerOptions);
});
//------------------------------------------------------------------------------



//........................... Get Data and Plot ................................
let contentEl = document.querySelector("#content");
let meanTooltipText = ["GMM", "Period (s)", "MGM (g)"]
let meanPlotOptions = {
    legendLocation: "topright",
    title: "Response Spectra",
    tooltipText: meanTooltipText,
    xAxisScale: "linear",
    yAxisScale: "linear"
};
let meanPlot = new D3LinePlot(contentEl,meanPlotOptions);


let sigmaTooltipText = ["GMM", "Period (s)", "SD"]
let sigmaPlotOptions = {
    legendFontSize: 8,
    legendLineBreak: 14,
    legendLocation: "topright",
    plotHeight: 224,
    plotWidth: 896,
    plotRatio: 4/1,
    title: "Response Spectra: Sigma",
    tooltipText: sigmaTooltipText,
    xAxisScale: "linear",
    yAxisScale: "linear"
};
let sigmaPlot = new D3LinePlot(contentEl,sigmaPlotOptions);

function updatePlot(url) {
  let dataSet,
      metadata,
      series,
      seriesLabels,
      seriesIds,
      seriesData;
  
  d3.json(url, function(error, response) {
    if (error) return console.warn(error);
    if (response.status == "ERROR") {
      svg.append("text")
          .attr("y", margin.top)
          .attr("x", margin.left)
          .text(response.message);
      return;
    }  
    spinner.off();
   
    metadata ={
      version: "1.1",
      url: window.location.href,
      time: new Date()
    }; 
    
    //........................ Plot Means ...................................... 
    let mean = response.means;
    let meanData = mean.data;

    seriesLabels = [];
    seriesIds = [];
    seriesData = [];
      
    meanData.forEach(function(d, i) {
      seriesLabels.push(d.label);
      seriesIds.push(d.id);
      seriesData.push(d3.zip(d.data.xs, d.data.ys));
    });
    
    meanPlot.data = seriesData;
    meanPlot.ids = seriesIds;
    meanPlot.labels = seriesLabels;
    meanPlot.metadata = metadata;
    meanPlot.xLabel = mean.xLabel;
    meanPlot.yLabel = mean.yLabel;
    
    meanPlot.plotData();
    d3.select(meanPlot.el)
        .classed(meanPlot.options.colSizeMax,true) 
        .classed(meanPlot.options.colSizeMin,false);
    d3.select(meanPlot.plotResizeEl)
        .attr("class",sigmaPlot.resizeSmall); 
    //--------------------------------------------------------------------------
    
    
    //........................ Plot Sigma ...................................... 
    let sigma = response.sigmas;
    let sigmaData = sigma.data;

    seriesLabels = [];
    seriesIds = [];
    seriesData = [];
      
    sigmaData.forEach(function(d, i) {
      seriesLabels.push(d.label);
      seriesIds.push(d.id);
      seriesData.push(d3.zip(d.data.xs, d.data.ys));
    });
    
    sigmaPlot.data = seriesData;
    sigmaPlot.ids = seriesIds;
    sigmaPlot.labels = seriesLabels;
    sigmaPlot.metadata = metadata;
    sigmaPlot.xLabel = sigma.xLabel;
    sigmaPlot.yLabel = sigma.yLabel;
    
    sigmaPlot.plotData();
    d3.select(sigmaPlot.el)
        .classed(sigmaPlot.options.colSizeMax,true)
        .classed(sigmaPlot.options.colSizeMin,false);
    d3.select(sigmaPlot.plotResizeEl)
        .attr("class",sigmaPlot.resizeSmall); 
    
    //--------------------------------------------------------------------------
    
    
    $("#raw-data").click(function(){
      window.open(url);
    });

  });
}
//------------------------------------------------------------------------------


//------------------------- End: Plot ------------------------------------------
//
//##############################################################################


