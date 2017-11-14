'use strict';




/**
* D3 view for plots
*
* Creates a Bootstrap panel element with a 
* panel header, body, and footer.
* 
* The panel header contains the plot title
* The panel body will contain the plot 
* The panel footer contains the X/Y scale buttons
*
*
* @constructor(Element)
*         selected container element to put all plots
*
*
* @method checkPlots()
*         static method to check if other plots exsists 
*
* @method setOption(options) {Object}
*         method to set the plot options
*
* @method updateOptions(obj) {D3View object}
*         static method to update the options 
*
*
* @param containerEl
*        selected html element to construct all Bootstrap panels 
*
* @param el
*        selected html element of the created Bootstap panel
*
* @param options {object}
*        options for plot view
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
*        default 60
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
  constructor(containerEl){


    //.................................. Variables .............................
    let _this,
        // Variables
        _colSize,
        _containerD3,
        _elD3,
        _footerBtnsD3,
        _plotFooterD3,
        _plotPanelD3;

    _this = this;
    _this.containerEl;
    _this.el;
    _this.options = {};
    _this.plotBodyEl;
    _this.plotFooterEl;
    _this.plotPanelEl;
    _this.plotTitleEL;
    //--------------------------------------------------------------------------
    

    //............................ Default Options .............................
    _this.options = {
      legendLocation: "topright",
      linewidth: 3,
      linewidthSelection: 5,
      marginBottom: 50,
      marginLeft: 60,
      marginRight: 20,
      marginTop: 20,
      pointRadius: 5,
      pointRadiusSelection: 8,
      pointRadiusTooltip: 10,
      showLegend: true,
      title: "",
      tooltipOffset: 10,
      tooltipPadding: 10,
      tooltipText: ["","X Value","Y Value"],
      xAxisScale: "log",
      yAxisScale: "log"
    };
    //--------------------------------------------------------------------------
    
     
    //..................... Bootstrap Panel for the Plot .......................
    _containerD3 = d3.select(containerEl);
    _colSize = D3View.checkPlots();
    
    _elD3 = _containerD3
        .append("div")
        .attr("class","D3View " + _colSize)
        
    _plotPanelD3 = _elD3
        .append("div")
        .attr("class","panel panel-default");
    
    _plotPanelD3
        .append("div")
        .attr("class","panel-heading");

    _plotPanelD3
        .append("div")
        .attr("class","panel-body");
    
    _plotFooterD3 = _plotPanelD3
        .append("div")
        .attr("class","panel-footer");

    _footerBtnsD3 = _plotFooterD3
        .append("div")
        .attr("class","btn-group btn-group-justified axes-btns");
    //--------------------------------------------------------------------------

    
    //...................... X Axis Buttons ....................................
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm x-axis-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='xaxis' value='linear'/> X: Linear");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm x-axis-btns btn-right")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default active")
        .html("<input type='radio' name='xaxis' value='log'/>X: Log");
    //--------------------------------------------------------------------------

      
    //...................... Plot/Data Option Buttons ..........................
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm plot-data-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default active")
        .html("<input type='radio' name='plot' value='plot'/> Plot");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm plot-data-btns btn-right")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='plot' value='data'/> Data");
    //--------------------------------------------------------------------------


    //........................ Y Axis Buttons ..................................
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm y-axis-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='yaxis' value='linear'/> Y: Linear");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-sm y-axis-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-sm btn-default active")
        .html("<input type='radio' name='yaxis' value='log'/>Y: Log");
    //--------------------------------------------------------------------------
  
   
    //..................... DOM Elements .......................................
    _this.el = _elD3.node(); 
    _this.containerEl = containerEl;
    _this.plotBodyEl = _this.el.querySelector(".panel-body");
    _this.plotFooterEl = _this.el.querySelector(".panel-footer");
    _this.plotPanelEl = _this.el.querySelector(".panel");
    _this.plotTitleEl = _this.el.querySelector(".panel-heading"); 
    //--------------------------------------------------------------------------
  

  }
  //---------------------- End: D3View Constructor ----------------------------



  //................ Method: Check How Many Plots Are There ....................
  static checkPlots(){
    let _colSize,
        _colSize6,
        _colSize12,
        _nplots;

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
  //----------------- End Method: Check How May Plots Are There ----------------


  
  //................... Method: Set Options ...................................
  setOptions(options){
    let _this,
        _view; 
    
    _view = this;
    _this = _view.options;

    $.extend(_this,options);
    D3View.updateOptions(_view); 
  }
  //------------------ End Method: Set Options ---------------------------------

  

  //................... Method: Update Options .................................
  static updateOptions(view){
    let _this,
        // variables
        _btn,
        _input,
        _isActive;
    
    _this = view;
   
    // Update plot title 
    d3.select(_this.plotTitleEl)
        .text(_this.options.title);
      
    // Update X scale
    d3.select(_this.plotFooterEl)
        .selectAll(".x-axis-btns")
        .select("input").each(function(){
          _input = d3.select(this);
          _btn = d3.select(this.parentNode);
          _isActive = _input.attr("value") == _this.options.xAxisScale;
          _btn.classed("active",_isActive)
      });
    
    // Update Y scale
    d3.select(_this.plotFooterEl)
        .selectAll(".y-axis-btns")
        .select("input").each(function(){
          _input = d3.select(this);
          _btn = d3.select(this.parentNode);
          _isActive = _input.attr("value") == _this.options.yAxisScale;
          _btn.classed("active",_isActive)
      });
  }
  //---------------- End Method: Update Options --------------------------------


  
}


//----------------------- End Class D3View -------------------------------------
