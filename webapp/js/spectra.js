

spinner("on");      // Put up a spinner while loading 


var rakes = {
  "checkRange": function(mech, value) {
    if (mech == "reverse") return (value > 45.0 && value < 135.0) ? value : 90.0;
    if (mech == "normal") return (value < -45.0 && value > -135.0) ? value : -90.0;
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
  spinner("off"); // Remove spinner once loaded 

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
    var optGroup = $('<optgroup>').attr('label', group.label);
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
}




//#####################################################################################
//
//................................... Plot ............................................

//............................. Footer Buttons .......................................
$("#footer").ready(function(){

  $("#update-plot").prop("disabled",true);                            // Disable plot button on start up
  $("#raw-data").prop("disabled",true);                               // Disable raw data button on start up

  $("#update-plot").click(function (){                                // If update button is click, update plot
    var url = "/nshmp-haz-ws/spectra?" + $("#inputs").serialize();    // Make URL
    spinner("on");                                                    // Turn on spinner while getting data
    updatePlot(url);                                                  // Plot
  });

  
  $("#gmms").change(function() {                                      // Check selection of GMMs
    var disable = $(":selected", this).length == 0;                   // Check to see if there is a selection
    $("#update-plot").prop("disabled", disable);                      // Update button status
    $("#raw-data").prop("disabled", disable);                         // Update button status
  });

});
//------------------------------------------------------------------------------------



//................................. Get Data and Plot ................................
function updatePlot(url) {
  
  var plot_id         = document.getElementById("spectra-plot");                    // Get plot dom 
  var plot_panel_id   = document.getElementById("spectra-plot-panel");              // Get spectra plot panel dom 
  
  d3.json(url, function(error, response) {
    if (error) return console.warn(error);
    if (response.status == "ERROR") {
      svg.append("text")
          .attr("y", margin.top)
          .attr("x", margin.left)
          .text(response.message);
      return;
    }  
    spinner("off");   // Remove spinner once loaded

    var dataset = response.means;
    var series = dataset.data;
    var xlabel = dataset.xLabel;
    var ylabel = dataset.yLabel;

    var y_scale = "linear";
    var x_scale = "linear";

    var series_label_displays = [];
    var series_label_values   = [];
    var series_data           = [];
  
    series.forEach(function(d, i) {
      series_label_displays.push(d.label);
      series_label_values.push(d.id);
      series_data.push(d3.zip(d.data.xs, d.data.ys));
    });
    
    var tooltip_text = ["GMM", "Period (s)", "MGM (g)"]
 
    var plot_info = {                                     // Plot info object
      series_data:              series_data,              // Series data to plot
      series_label_displays:    series_label_displays,    // Series label displays
      series_label_values:      series_label_values,      // Series label values
      xlabel:        xlabel,                              // X label
      ylabel:        ylabel,                              // Y label
      plot_id:       "spectra-plot",                      // DOM ID for plot
      x_scale:       x_scale,                             
      y_scale:       y_scale,
      tooltip_text:  tooltip_text,
      xaxis_btn:    "spectra-plot-xaxis",
      yaxis_btn:    "spectra-plot-yaxis",
      margin:       {top:30,right:15,bottom:50,left:70},  // Margin for D3
      resize:       "spectra-plot-resize"                 // DOM ID for resize element 
    };
    
    plot_curves(plot_info);

    $("#raw-data").click(function(){
      window.open(url);
    });

  });
}
//------------------------------------------------------------------------------------


//---------------------------- End: Plot ----------------------------------------------
//
//#####################################################################################


