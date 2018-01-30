"use strict"


/** 
* @class Gmm
*
* @classdesc class for GmmDistance and Spectra 
*
*
*/
class Gmm{


  //............................ Constructor: Gmm ..............................
  constructor(webApp, wsUrl){
    

    //........................... Variables ....................................
    let _this,
        // Variables
        disable,
        inputs,
        promise,
        url;

    _this = this;
    // Properties of class
    _this.footer;
    _this.footerOptions;
    _this.header;
    _this.spinner;
    
    // Create Footer 
    _this.footer = new Footer();
    _this.footerOptions = {
        rawBtnDisable: true,
        updateBtnDisable: true
    };
    _this.footer.setOptions(_this.footerOptions);

    // Create header
    _this.header = new Header();

    // Create spinner
    _this.spinner = new Spinner();

    // Settings menu                                                            
    _this.settings = new Settings(_this.footer.settingsBtnEl);

    _this.webApp = webApp;
    _this.GmmDistance = "GmmDistance";
    _this.Spectra = "Spectra";

    _this.wsUrl = wsUrl;
    //--------------------------------------------------------------------------

    
    //......................... Update Plot on Click ...........................  
    $(_this.footer.updateBtnEl).click(function (){   
      inputs = $("#inputs").serialize();
      url = _this.wsUrl + "?" + inputs; 
      _this.spinner.on();
      window.location.hash = inputs;
      $(_this.footer.rawBtnEl).off();
      Gmm.updatePlot(_this, url);
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
  

    //....................... Event Listeners ..................................
    $(document).keypress(function(event){
      if(event.which == 13 && !$("#update-plot").prop("disabled")) {
        $("#update-plot").click();
      }
    });
    
    $('[data-toggle="tooltip"]').tooltip(); 
    //--------------------------------------------------------------------------
  
    
    //........................ Get Parameters ..................................
    promise = $.getJSON(_this.wsUrl);
    promise.done(function(usage){
      Gmm.buildInputs(_this, usage);
    });
    promise.fail(function(){
      console.log("JSON Error");
    });
    //--------------------------------------------------------------------------
  
  
  }
  //---------------------- End Constructor: Gmm --------------------------------

  
  
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
  static buildInputs(_this, usage) {
    
    let gmmAlphaOptions,
        gmmGroupOptions,
        members,
        optGroup,
        options,
        params;
    
    _this.spinner.off();
    
    params = usage.parameters;
    _this.parameters = params;

    /* Alphabetical GMMs. */
    gmmAlphaOptions = $();
    params.gmm.values.forEach(function (gmm) {
      gmmAlphaOptions = gmmAlphaOptions.add($('<option>')
        .attr('value', gmm.id)
        .attr('id', gmm.id)
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


    if (_this.webApp == _this.GmmDistance){
      $("#rMax").val(_this.options.rMaxDefault);
      let imtOptions = $();
      imtOptions = imtOptions.add($("<option>")
          .attr("value", "default")
          .text("Select a GMM")
      );
      $("#imt").append(imtOptions);
      
      $("#gmms").change(function(){
        Gmm.setImts(_this);
      });
    }

    Gmm.checkQuery(_this, gmmAlphaOptions);
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
    

    rX = Gmm.rX_val();
    zTop = Gmm.zTop_val();
    footwall = $("#hw-fw-fw").hasClass("active");
    rRup = Math.hypot(rX, zTop);

    if (footwall) {
      return [rX, rRup, rX];
    }

    δ = Gmm.dip_val();
    W = Gmm.width_val();
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
  static checkQuery(_this, gmmOptions){
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
    if (_this.webApp == _this.Spectra){
      $("input[type*='checkbox']").prop("checked",false);
      $("#zHyp,#rRup,#rJB").prop("readOnly",false);
      $("#hw-fw-hw").prop("disabled", true);
      $("#hw-fw-fw").prop("disabled", true);
    }
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
    if (_this.webApp == _this.Spectra) Gmm.updateFocalMech();
    if (_this.webApp == _this.GmmDistance) Gmm.setImts(_this);
    let gmm = document.querySelector("#"+$("#gmms").val()[0]);
    gmm.scrollIntoView();
    $("#fault-style .btn").removeClass("focus");
    //--------------------------------------------------------------------------
    
    
    //............................ Plot ........................................ 
    inputs = $("#inputs").serialize();
    url = _this.wsUrl + "?" + inputs;
    _this.footerOptions.rawBtnDisable = false;
    _this.footerOptions.updateBtnDisable = false;
    _this.footer.setOptions(_this.footerOptions);
    Gmm.updatePlot(_this, url);
    //--------------------------------------------------------------------------

  
  }
  //----------------------- End Method: checkQuery -----------------------------
  
  

  //......................... Method: dip_val .................................. 
  static dip_val() {
    return parseFloat($("#dip").val()) * Math.PI / 180.0;
  }
  //----------------------- End Method: dip_val --------------------------------
  
  
  
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

  
  
  //....................... Method: setImts .................................... 
  static setImts(_this){
    
    let selectedGmms = $("#gmms").val();
    let supportedImts = [];
    
    selectedGmms.forEach(function(selectedGmm){
      let gmm = _this.parameters.gmm.values.find(function(gmm){
          return gmm.id == selectedGmm;
      });
      supportedImts.push(gmm.supportedImts);
    });
    
    let commonImts = GmmDistance
        .supportedValues(supportedImts, _this.parameters.imt);
    
    let imtOptions = $();
    commonImts.forEach(function(imt){
      imtOptions = imtOptions.add($("<option>")
          .attr("value", imt.value)
          .text(imt.display)
      );
    });
    $("#imt").empty().append(imtOptions);
  
  }
  //------------------------ End Method: setImts -------------------------------
  


  //.......................... Method: supportedValues ......................... 
  static supportedValues(values,params){
    
    let allValues = values.toString().split(",");
    let uniqueValues = [];
    allValues.forEach(function(val){
      if ($.inArray(val, uniqueValues) == -1) uniqueValues.push(val);
    });
    
    let commonValues = uniqueValues.filter(function(val,jv){
      return values.every(function(d,i){
        return d.includes(val);
      });
    });
    
    let supportedParams = params.values.filter(function(par){
      return commonValues.find(function(val){
        return val == par.value;
      })
    });
    
    return supportedParams;
  }
  //------------------------- End Method: supportedValues ----------------------
  
  
  
  //...................... Method: updateDistance ..............................
  static updateDistance() {
    if (!$("#r-check").prop("checked")) return;
    var r = Gmm.calcDistances();
    $("#rJB").val(r[0].toFixed(2));
    $("#rRup").val(r[1].toFixed(2));
  }
  //--------------------- End Method: updateDistance ---------------------------



  //..................... Method: updateFocalMech ..............................
  /* Update focal mech selection based on rake. */
  static updateFocalMech() {
    let rake;
     
    rake = Gmm.rake_val();
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
    var hypoDepth = Gmm.zTop_val() + 
        Math.sin(Gmm.dip_val()) * Gmm.width_val() / 2.0;
    $("#zHyp").val(hypoDepth.toFixed(2));
  }
  //--------------------- End Method: updateHypoDepth --------------------------

 
  
  //......................... Method: updatePlot ............................... 
  static updatePlot(_this, url){
    
    if(_this.webApp == _this.GmmDistance){
      GmmDistance.updatePlot(_this, url);
    }else if (_this.webApp == _this.Spectra){
      Spectra.updatePlot(_this, url);
    }
  }
  //---------------------- End Method: updatePlot -----------------------------

  

  //...................... Method: updateRake ..................................
  /* Update rake if out of focal mech range */
  static updateRake(id) {
    $("#rake").val(Gmm.checkRakeRange(id, Gmm.rake_val()));
  }
  //---------------------- End Method: updateRake ------------------------------
  
  
  
  //......................... Method: width_val ................................ 
  static width_val() {
    return  parseFloat($("#width").val());
  }
  //---------------------- End Method: width_val -------------------------------



  //......................... Method: zTop_val ................................. 
  static zTop_val() {
    return parseFloat($("#zTop").val());
  }
  //----------------------- End Method: zTop_val -------------------------------



}
//----------------------- End Class: Gmm ---------------------------------------



