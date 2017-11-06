'use strict';



/**
* D3 View for plots
*
* Creates a Bootstrap panel element with a 
* panel header, body, and footer.
* 
* The panel header contains the plot title
* The panel body will contain the plot 
* The panel footer contains the X/Y scale buttons
*
*
* @method checkPlots()
*         static method that is called in the constructor
*
* @method setOption(options) {Object}
*         method to set the plot options
*
* @method updateOptions(obj) {D3View object}
*         static method to update the options 
*
*
* @param el
*        selected html element to contruct the Bootstap panel
*
* @param options {object}
*        options for plot view
*
* @param options.isTitleHidden {Boolean}
*        default true
*        when true, plot panel heading is hidden
*
* @param options.legendLocation {String}
*        default "topright"
*                
* @param options.linewidth {Integer}
*        default 3
*        linewidth of plot curves
*
* @param options.marginBottom {Integer}
*        default 50
*
* @param options.marginLeft {Integer}
*        default 20
*
* @param options.marginRight {Integer}
*        default 20
*
* @param options.marginTop {Integer}
*        default 50
*
* @param options.pointRadius {Integer}
*        default 5
*        radius of points
*
* @param options.title {String}
*        default ""
*        plot title
*
* @param options.xAxisScale {String}
*        default "log"
*        X axis scale
*
* @param options.yAxisScale {String}
*        default "log"
*        Y axis scale
*
* @param plotPanel
*        selected html element of the Bootstrap panel
*
* @param plotTitle
*        selected html element of the Bootstrap panel header for plot title
*
* @param plotBody
*        selected html element of the Bootstrap panel body for plot
*
* @param plotFooter
*        selected html element of the Bootstrap panel footer for axes buttons
*
*/



class D3View{

  //........................... D3View Constructor .............................
  constructor(el){


    //.................................. Variables .............................
    let _this,
        // Variables
        _colSize,
        _elD3,
        _footerBtnsD3,
        _plotPanelD3,
        _plotTitleD3,
        _plotBodyD3,
        _plotFooterD3,
        _xAxisFormD3,
        _xAxisBtnsD3,
        _yAxisFormD3,
        _yAxisBtnsD3;

    _this = this;
    _this.el;
    _this.options;
    _this.plotPanel;
    _this.plotTitle;
    _this.plotBody;
    _this.plotFooter;
    //--------------------------------------------------------------------------
    

    //............................ Default Options ............................
    _this.options = {
      isTitleHidden: true,
      legendLocation: "topright",
      linewidth: 3,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 20,
      marginTop: 20,
      pointRadius: 5,
      title: "",
      xAxisScale: "log",
      yAxisScale: "log",
    };
    console.log(_this);
    //-------------------------------------------------------------------------
    
     
    //..................... Bootstrap Panel for the Plot .......................
    _elD3     = d3.select(el);
    _colSize  = D3View.checkPlots();
    
    // Create bootstrap panel
    _plotPanelD3 = d3.select(el)
        .attr("class","D3View " + _colSize)
        .append("div")
        .attr("class","panel panel-default");
    
    // Create bootstrap panel header for plot title
    _plotTitleD3 = _plotPanelD3
        .append("div")
        .attr("class","panel-heading")
        .classed("hidden",_this.options.isTitleHidden);

    // Create bootstrap panel body to hold plot
    _plotBodyD3 = _plotPanelD3
        .append("div")
        .attr("class","panel-body");
    
    // Create bootstrap footer for X/Y scale buttons 
    _plotFooterD3 = _plotPanelD3
        .append("div")
        .attr("class","panel-footer");

    // Create container for the buttons
    _footerBtnsD3 = _plotFooterD3
        .append("div")
        .attr("class","form-inline axes-btns");
    //--------------------------------------------------------------------------


    //...................... X Axis Buttons ....................................
    _xAxisFormD3 = _footerBtnsD3
        .append("div")
        .attr("class","form-group form-group-sm x-axis");
    
    _xAxisFormD3
        .append("label")
        .attr("for","x-axis-btns")
        .text("X-axis");

    _xAxisBtnsD3 = _xAxisFormD3
        .append("div")
        .attr("class","btn-group btn-group-sm ")
        .attr("id","x-axis-btns")
        .attr("data-toggle","buttons");

    _xAxisBtnsD3
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='xaxis' value='linear'/> Linear");
    
    _xAxisBtnsD3
        .append("label")
        .attr("class","btn btn-sm btn-default active")
        .html("<input type='radio' name='xaxis' value='log'/> Log");
    //--------------------------------------------------------------------------

      
    //........................ Y Axis Buttons ..................................
    _yAxisFormD3 = _footerBtnsD3
        .append("div")
        .attr("class","form-group form-group-sm y-axis");
    
    _yAxisFormD3
        .append("label")
        .attr("for","y-axis-btns")
        .text("Y-axis");

    _yAxisBtnsD3 = _yAxisFormD3
        .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","y-axis-btns")
        .attr("data-toggle","buttons");

    _yAxisBtnsD3
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='yaxis' value='linear'/> Linear");
    
    _yAxisBtnsD3
        .append("label")
        .attr("class","btn btn-sm btn-default active")
        .html("<input type='radio' name='yaxis' value='log'/> Log");
    //--------------------------------------------------------------------------
  
    _this.el = el; 
    _this.plotBody   = el.querySelector(".panel-body");
    _this.plotFooter = el.querySelector(".panel-footer");
    _this.plotPanel  = el.querySelector(".panel");
    _this.plotTitle  = el.querySelector(".panel-heading"); 
  
  }
  //---------------------- End: D3View Constructor ----------------------------


  
  //................... Method: Set Options ...................................
  setOptions(options){
    let _obj,
        _this; 
    
    _obj = this;
    _this = _obj.options;

    _this.legendLocation = options.hasOwnProperty("legendLocation")
        ? options.legendLocation : _this.legendLocation;

    _this.linewidth = options.hasOwnProperty("linewidth")
        ? options.linewidth : _this.linewidth;

    _this.marginBottom = options.hasOwnProperty("marginBottom")
        ? options.marginBottom : _this.marginBottom;

    _this.marginLeft = options.hasOwnProperty("marginLeft")
        ? options.marginLeft : _this.marginLeft;
         
    _this.marginRight = options.hasOwnProperty("marginRight")
        ? options.marginRight : _this.marginRight;

    _this.marginTop = options.hasOwnProperty("marginTop")
        ? options.marginTop : _this.marginTop;

    _this.pointRadius = options.hasOwnProperty("pointRadius")
        ? options.pointRadius : _this.pointRadius;

    _this.title = options.hasOwnProperty("title")
        ? options.title : _this.title;

    _this.xAxisScale = options.hasOwnProperty("xAxisScale")
        ? options.xAxisScale : _this.xAxisScale;

    _this.yAxisScale = options.hasOwnProperty("yAxisScale")
        ? options.yAxisScale : _this.yAxisScale;

    if (_this.title != "") _this.isTitleHidden = false; 
    D3View.updateOptions(_obj); 
  }
  //------------------ End: Method Set Options ---------------------------------

  

  //................... Method: Update Options .................................
  static updateOptions(obj){
    let _btn,
        _input,
        _isActive,
        _this;

    _this = obj;
    
    d3.select(_this.plotTitle)
        .classed("hidden",_this.options.isTitleHidden)
        .text(_this.options.title);
      
    d3.select(_this.plotFooter)
        .select(".x-axis")
        .selectAll("input").each(function(){
          _input = d3.select(this);
          _btn = d3.select(this.parentNode);
          _isActive = _input.attr("value") == _this.options.xAxisScale;
          _btn.classed("active",_isActive)
      });
    
    d3.select(_this.plotFooter)
        .select(".y-axis")
        .selectAll("input").each(function(){
          _input = d3.select(this);
          _btn = d3.select(this.parentNode);
          _isActive = _input.attr("value") == _this.options.yAxisScale;
          _btn.classed("active",_isActive)
      });
  }
  //---------------- End: Method Update Options --------------------------------


  
  //....................... Check How Many Plots Are There .....................
  static checkPlots(){
    let _nplots,
        _colSize,
        _colSize6,
        _colSize12;

    _colSize6  = "col-lg-6";
    _colSize12 = "col-lg-12";

    // Check if there are other plots
    _nplots = d3.selectAll(".D3View") 
        .size();

    // If there are already plots, make them all bootstrap 6 column    
    if (_nplots > 0){
      _colSize = _colSize6;
      d3.selectAll(".D3View")
          .each(function(d,i){
            d3.select(this).classed(_colSize12,false);
            d3.select(this).classed(_colSize6,true);
          });
    }else{
      _colSize = _colSize12;  
    }
      
    return _colSize;
  }
  //----------------- End: Check How May Plots Are There -----------------------




}





