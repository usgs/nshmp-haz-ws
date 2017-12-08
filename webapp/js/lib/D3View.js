'use strict';




/**
* @class D3View 
*
* @classdesc Creates a Bootstrap panel element with a 
* panel header, body, and footer.
* 
* The panel header contains the plot title
* The panel body will contain the plot 
* The panel footer contains the X/Y scale buttons
*
*
* @argument containerEl {Element}
*     DOM selected element to put the html elements
*
*
* @property containerEl
*     selected html element to construct all Bootstrap panels 
*
* @property el
*     selected html element of the created Bootstap panel
*
* @property options {object}
*     options for plot view
*
* @property options.legendLocation {String}
*     default "topright" <br>
*     "topright" || "topleft" || "bottomright" || "bottomleft"     
*           
* @property options.legendOffset {Integer}
*     default 5 <br>
*     margin around legend outline
*
* @property options.legendPadding
*     default 10 <br>
*     padding inside legend outline
*
* @property options.linewidth {Integer}
*     default 3 <br>
*     linewidth of plot curves
*
* @property options.marginBottom {Integer}
*     default 50
*
* @property options.marginLeft {Integer}
*     default 20
*
* @property options.marginRight {Integer}
*     default 20
*
* @property options.marginTop {Integer}
*     default 60
*
* @property options.pointRadius {Integer}
*     default 5 <br>
*     radius of points
*
* @property options.title {String}
*     default "" <br>
*     plot title
*
* @property options.xAxisScale {String}
*     default "log" <br>
*     X axis scale
*
* @property options.yAxisScale {String}
*     default "log" <br>
*     Y axis scale
*
* @property plotPanelEl
*     selected html element of the Bootstrap panel
*
* @property plotTitleEl
*     selected html element of the Bootstrap panel header for plot title
*
* @property plotBodyEl
*     selected html element of the Bootstrap panel body for plot
*
* @property plotFooterEl
*     selected html element of the Bootstrap panel footer for axes buttons
*
*
* @author Brandon Clayton
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
        _plotHeader,
        _plotPanelD3,
        _observerConfig;

    _this = this;
    _this.colSize;
    _this.colSize6;
    _this.colSize12;
    _this.containerEl;
    _this.el;
    _this.options = {};
    _this.plotBodyEl;
    _this.plotFooterEl;
    _this.plotPanelEl;
    _this.plotTitleEL;
    _this.resizeFull;
    _this.resizeSmall;
   
    _this.colSize6 = "col-md-6";
    _this.colSize12 = "col-md-12";
    _this.resizeFull = "resize glyphicon glyphicon-resize-full";
    _this.resizeSmall = "resize glyphicon glyphicon-resize-small";
     
    //--------------------------------------------------------------------------
    

    //............................ Default Options .............................
    _this.options = {
      legendLocation: "topright",
      legendOffset: 5,
      legendPadding: 10,
      legendLineBreak: 20,
      linewidth: 3,
      linewidthSelection: 5,
      marginBottom: 50,
      marginLeft: 70,
      marginRight: 20,
      marginTop: 20,
      pointRadius: 5,
      pointRadiusSelection: 8,
      pointRadiusTooltip: 10,
      printWidth: 11,
      printHeight: 8.5,
      printPlotWidth: 6,
      printPlotHeight: 3,
      printDpi: 300,
      printMarginTop: 1,
      showLegend: true,
      title: "",
      tooltipOffset: 10,
      tooltipPadding: 10,
      tooltipText: ["","X Value","Y Value"],
      xAxisScale: "log",
      yAxisScale: "log",
      xLabelPadding: 8,
      yLabelPadding: 10
    };
    //--------------------------------------------------------------------------
    
     
    //..................... Bootstrap Panel for the Plot .......................
    _containerD3 = d3.select(containerEl);
    _this.colSize = D3View.checkPlots(_this);
    
    _elD3 = _containerD3
        .append("div")
        .attr("class","D3View hidden " + _this.colSize)
        
    _plotPanelD3 = _elD3
        .append("div")
        .attr("class","panel panel-default");
    
    _plotHeader = _plotPanelD3
        .append("div")
        .attr("class","panel-heading");

    _plotHeader = _plotHeader.append("h2")
        .attr("class","panel-title")
    
    _plotHeader
        .append("div")
        .attr("class","plot-title")
        .attr("contenteditable","true");
        
    _plotHeader.append("span")
        .attr("class",function(){
          return _this.colSize == _this.colSize6
            ? _this.resizeFull : _this.resizeSmall; 
        })
        .style("float","right"); 

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
        .attr("class","btn-group btn-group-sm y-axis-btns btn-right")
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
    _this.plotResizeEl = _this.el.querySelector(".resize");
    _this.plotTitleEl = _this.el.querySelector(".plot-title"); 
    //--------------------------------------------------------------------------
  

    //.......................... Mutation Observer ............................. 
    _observerConfig = {                                                         
        attributes: false,                                                       
        childList: true,                                                        
        characterData: false                                                     
      };                                                                        
                                                                                
    _this.plotObserver = new MutationObserver(function(mutations){              
      D3View.checkPlots(_this,true);
    });  
    
    _this.plotObserver.observe(containerEl,_observerConfig);                           
    //--------------------------------------------------------------------------
  
  
    //......................... On Resize ......................................
    d3.select(_this.plotResizeEl)
        .on("click",function(d,i){
          if(_this.colSize == _this.colSize6){
            _this.colSize = _this.colSize12;
            d3.select(_this.el)
                .classed(_this.colSize6,false)
                .classed(_this.colSize,true);
            d3.select(_this.plotResizeEl)
                .attr("class",_this.resizeSmall);
          }else{
            _this.colSize = _this.colSize6;
            d3.select(_this.el)
                .classed(_this.colSize12,false)
                .classed(_this.colSize,true);
            d3.select(_this.plotResizeEl)
                .attr("class",_this.resizeFull);
          }
        });
    //--------------------------------------------------------------------------
     
  }
  //---------------------- End: D3View Constructor ----------------------------



  //................ Method: Check How Many Plots Are There ....................
  /**
  * @method checkPlots
  *
  * @description static method to check if other plots exists to set
  * the coorect panel width, either col-6 or col-12
  *
  * @argument updateStatus {Boolean}
  *     if true will look and see if there is one plot and make sure <br>
  *     it is col-lg-12.
  *
  * @return {String}
  *     string that is a Bootstrap column size, col-lg-6 or col-lg-12
  *
  */
  static checkPlots(linePlot,updateStatus){
    let _colSize,
        _nplots,
        _plotLimit;

    // Check if there are other plots
    _nplots = d3.selectAll(".D3View") 
        .size();
    
    // If there are already plots, make them all bootstrap 6 column    
    if (_nplots > 0){
      _colSize = linePlot.colSize6;
      d3.selectAll(".D3View")
          .each(function(d,i){
            d3.select(this).classed(linePlot.colSize12,false);
            d3.select(this).classed(linePlot.colSize6,true);
            d3.select(this)
                .select(".resize")
                .attr("class",linePlot.resizeFull);
          });
    }else{
      _colSize = linePlot.colSize12;
      d3.select(linePlot.plotResizeEl)
          .attr("class",linePlot.resizeSmall);  
    }

    // Update plot size to large when others are removed
    if (updateStatus && _nplots == 1){
      d3.select(linePlot.el)
            .classed(linePlot.colSize12,true)
            .classed(linePlotcolSize6,false);
      d3.select(linePlot.plotResizeEl)
          .attr("class",linePlot.resizeSmall);  
    } 
      
    return _colSize;
  }
  //----------------- End Method: Check How May Plots Are There ----------------


  
  //................... Method: Set Options ...................................
  /**
  * @method setOptions
  *
  * @description method to set the plot options
  *
  * @argument options {Object}
  *     object of options to set
  *
  */
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
  /**
  * @method updateOptions
  *
  * @description static method to update the options 
  *
  * @argument view {Object}
  *     D3View object
  *
  */
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
