'use strict';



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
    _this.plotPanel;
    _this.plotTitle;
    _this.plotBody;
    _this.plotFooter;
    //--------------------------------------------------------------------------

       
    //..................... Bootstrap Panel for the Plot .......................
    _elD3     = d3.select(el);
    _colSize  = D3View.checkPlots();
    
    // Create bootstrap panel
    _plotPanelD3 = _d3.select(el)
        .attr("class","D3View " + _colSize)
        .append("div")
        .attr("class","panel panel-default");
    
    // Create bootstrap panel header for plot title
    _plotTitleD3 = _plotPanelD3
        .append("div")
        .attr("class","panel-heading");

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
        .attr("class","form-group form-group-sm");
    
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
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='xaxis' value='log'/> Log");
    //--------------------------------------------------------------------------

      
    //........................ Y Axis Buttons ..................................
    _yAxisFormD3 = _footerBtnsD3
        .append("div")
        .attr("class","form-group form-group-sm");
    
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
        .attr("class","btn btn-sm btn-default")
        .html("<input type='radio' name='yaxis' value='log'/> Log");
    //--------------------------------------------------------------------------
  
    _this.el = el; 
    _this.plotBody   = el.querySelector(".panel-body");
    _this.plotFooter = el.querySelector(".panel-footer");
    _this.plotPanel  = el.querySelector(".panel");
    _this.plotTitle  = el.querySelector(".panel-heading"); 
  
  }
  //---------------------- End: D3View Constructor ----------------------------


  
  //....................... Check How Many Plots Are There .....................
  static checkPlots(){
    let  nplots,
        colSize,
        colSize6,
        colSize12;

    colSize6  = "col-lg-6";
    colSize12 = "col-lg-12";

    // Check if there are other plots
    nplots = d3.selectAll(".D3View") 
        .size();

    // If there are already plots, make them all bootstrap 6 column    
    if (nplots > 0){
      colSize = colSize6;
      d3.selectAll(".D3View")
          .each(function(d,i){
            d3.select(this).classed(colSize12,false);
            d3.select(this).classed(colSize6,true);
          });
    }else{
      colSize = colSize12;  
    }
      
    return colSize;
  }
  //----------------- End: Check How May Plots Are There -----------------------



  //...................... Set Plot Title Method ...............................
  setTitle(title){
    let _this = this;
    d3.select(_this.plotTitle)
        .text(title); 
  }
  //-------------------- End: Set Plot Title Method ----------------------------
 
  

  //................. Add Data File Button Method ..............................
  addDataBtn(){
    let _this = this;
    _this.addDataBtn = _this.footerBtns
        .append("form")
        .attr("class","form-group form-group-sm")
        .style("float","right");
       
    _this.addDataBtn
        .append("label")
        .attr("for","add-data-file")
        .text("Add data");

    _this.addDataBtn
        .append("input")
        .attr("type","file")
        .attr("name","add-data-file")
        .attr("id","add-data-file");
     
    _this.addDataBtn
        .append("button")
        .attr("class","btn btn-xs btn-default")
        .attr("type","button")
        .attr("id","add-data-btn")
        .text("Submit"); 
  }
  //----------------- End: Add Data File Button Method -------------------------

}





