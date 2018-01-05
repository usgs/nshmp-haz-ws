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
  constructor(containerEl,options){


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
   
    _this.resizeFull = "resize glyphicon glyphicon-resize-full";
    _this.resizeSmall = "resize glyphicon glyphicon-resize-small";
     
    //--------------------------------------------------------------------------
    

    //............................ Default Options .............................
    _this.options = {
      buttonFontSize: 12,
      colSizeMin: "col-md-6",
      colSizeMinCenter: "col-md-offset-3 col-md-6",
      colSizeMax: "col-md-offset-1 col-md-10",
      colSizeDefault: "max", 
      labelFontSize: 16,
      legendLocation: "topright",
      legendOffset: 5,
      legendPaddingX: 20,
      legendPaddingY: 15,
      legendLineBreak: 20,
      legendFontSize: 14,
      linewidth: 2.5,
      linewidthSelection: 4.5,
      marginBottom: 50,
      marginLeft: 60,
      marginRight: 20,
      marginTop: 20,
      plotHeight: 504,
      plotWidth: 896,
      plotRatio: 16/9,
      pointRadius: 3.5,
      pointRadiusSelection: 5.5,
      pointRadiusTooltip: 8.5,
      printTitle: true,
      printFooter: true,
      printFooterPadding: 20,
      printFooterLineBreak: 20,
      printFooterFontSize: 14,
      printHeight: 8.5,
      printWidth: 11,
      printPlotWidth: 10,
      printDpi: 600,
      printMarginTop: 1,
      printMarginLeft: 0,
      showLegend: true,
      tickFontSize: 10,
      titleFontSize: 20,
      tooltipOffset: 10,
      tooltipPadding: 10,
      tooltipText: ["Label","X Value","Y Value"],
      xAxisScale: "log",
      yAxisScale: "log",
      xLabelPadding: 8,
      yLabelPadding: 10,
    };
    $.extend(_this.options,options);
    //--------------------------------------------------------------------------
   
    if (_this.options.colSizeDefault == "min")
      _this.colSize = _this.options.colSizeMin;
    else 
      _this.colSize = _this.options.colSizeMax; 
    
    //..................... Bootstrap Panel for the Plot .......................
    _containerD3 = d3.select(containerEl);
    
    _elD3 = _containerD3
        .append("div")
        .attr("class","D3View hidden "+_this.colSize)
        
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
          return _this.colSize == _this.options.colSizeMin
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
        .attr("class","btn-group btn-group-xs x-axis-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button")
        .html("<input type='radio' name='xaxis' value='linear'/> X: Linear");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-xs x-axis-btns btn-right")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button active")
        .html("<input type='radio' name='xaxis' value='log'/>X: Log");
    //--------------------------------------------------------------------------

      
    //...................... Plot/Data Option Buttons ..........................
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-xs plot-data-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button active")
        .html("<input type='radio' name='plot' value='plot'/> Plot");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-xs plot-data-btns btn-right")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button")
        .html("<input type='radio' name='plot' value='data'/> Data");
    //--------------------------------------------------------------------------


    //........................ Y Axis Buttons ..................................
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-xs y-axis-btns btn-left")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button")
        .html("<input type='radio' name='yaxis' value='linear'/> Y: Linear");
    
    _footerBtnsD3
        .append("div")
        .attr("class","btn-group btn-group-xs y-axis-btns btn-right")
        .attr("data-toggle","buttons")
        .append("label")
        .attr("class","btn btn-xs btn-default footer-button active")
        .html("<input type='radio' name='yaxis' value='log'/>Y: Log")
    //--------------------------------------------------------------------------
 
    let saveAsD3 = _footerBtnsD3.append("div")
        .attr("class","btn-group btn-group-xs btn-download")
        .style("text-align","center")
        .append("div")
        .attr("class","dropup");

    saveAsD3.append("div")
        .attr("class","glyphicon glyphicon-save footer-button dropdown-toggle")
        .attr("id","save-as-menu")
        .attr("data-toggle","dropdown")
        .attr("aria-hashpop","true")
        .attr("aria-expanded","true");
    
    let saveMenu = [
        ["Save Figure As:","dropdown-header","plot"],
        ["JPEG","jpeg","plot"],
        ["PDF/Print","pdf","plot"],
        ["PNG","png","plot"],
        ["SVG","svg","plot"],
        ["Save Data As:","dropdown-header","data"],
        ["CSV","csv","data"],
        ["TSV","tsv","data"]
    ];

    let saveListD3 = saveAsD3.append("ul")
        .attr("class","dropdown-menu dropdown-menu-right")
        .attr("aria-labelledby","save-as-menu")
        .style("min-width","auto");
    saveListD3.selectAll("li")
        .data(saveMenu)
        .enter()
        .append("li")
        .html(function(d,i){
          if (d[1] != "dropdown-header") 
            return "<a id="+d[1]+" class="+d[2]+">"+d[0]+"</a>";
          else return d[0];
        })
        .attr("class",function(d,i){return d[1]})
        .style("cursor","pointer");
        
     
    //..................... DOM Elements .......................................
    _this.el = _elD3.node(); 
    _this.containerEl = containerEl;
    _this.plotBodyEl = _this.el.querySelector(".panel-body");
    _this.plotFooterEl = _this.el.querySelector(".panel-footer");
    _this.plotHeaderEl = _this.el.querySelector(".panel-heading");
    _this.plotPanelEl = _this.el.querySelector(".panel");
    _this.plotResizeEl = _this.el.querySelector(".resize");
    _this.plotTitleEl = _this.el.querySelector(".plot-title");
    _this.saveAsMenuEl = saveListD3.node(); 
    //--------------------------------------------------------------------------
  

    //.......................... Mutation Observer ............................. 
    /* 
    _observerConfig = {                                                         
        attributes: true,                                                       
        childList: false,                                                        
        characterData: false                                                     
      };                                                                        
                                                                                
    _this.plotObserver = new MutationObserver(function(mutations){              
      console.log("Mutation");
      console.log(mutations);
      //D3View.checkPlots(_this,true);
    });  
    
    _this.plotObserver.observe(_this.el,_observerConfig);                           
    */
    //--------------------------------------------------------------------------
  
  
    //......................... On Resize ......................................
    d3.select(_this.plotResizeEl)
        .on("click",function(d,i){
          let nplots = d3.selectAll(".D3View") 
              .filter(function(d,i){return !d3.select(this).classed("hidden")}) 
              .size();
         
          let isMax = d3.select(_this.el).classed(_this.options.colSizeMax);
          
          d3.select(_this.el)
              .classed(_this.options.colSizeMax,false)
              .classed(_this.options.colSizeMin,false)
              .classed(_this.options.colSizeMinCenter,false)
          
          if (isMax){
            _this.colSize = nplots == 1 ? _this.options.colSizeMinCenter 
                : _this.options.colSizeMin;
            d3.select(_this.el)
                .classed(_this.options.colSizeMinCenter,false)
                .classed(_this.colSize,true);
            d3.select(_this.plotResizeEl)
                .attr("class",_this.resizeFull);
          }else{
            _this.colSize = _this.options.colSizeMax;
            d3.select(_this.el)
                .classed(_this.colSize,true);
            d3.select(_this.plotResizeEl)
                .attr("class",_this.resizeSmall);
          }
           
        });
    //--------------------------------------------------------------------------
     
  
    D3View.updateOptions(_this);
  
  }
  //---------------------- End: D3View Constructor ----------------------------


  
  //......................... Method: panelResize ..............................
  panelResize(colSize){
    let _this = this;
    d3.select(_this.el)
        .classed(_this.options.colSizeMax,false)
        .classed(_this.options.colSizeMin,false)
        .classed(_this.options.colSizeMinCenter,false)
    if (colSize == "min"){
      d3.select(_this.el)
          .classed(_this.options.colSizeMin,true);
      d3.select(_this.plotResizeEl)
          .classed(_this.resizeSmall,false)
          .classed(_this.resizeFull,true)
    }
    else{
      d3.select(_this.el)
        .classed(_this.options.colSizeMax,true);
      d3.select(_this.plotResizeEl)
          .classed(_this.resizeSmall,false)
          .classed(_this.resizeFull,true)
    }
  }
  //---------------------- End Method: panelResize -----------------------------


  
  //....................... Method: hide ....................................... 
  hide(toHide){
    let _this = this;
    d3.select(_this.el).classed("hidden",toHide);
  }
  //----------------------- End Method: hide -----------------------------------


  
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
