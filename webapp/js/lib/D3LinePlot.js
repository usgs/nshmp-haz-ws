'use strict';



/**
* D3 line plot extend D3View
*
* Creates the SVG elements inside the D3View
* panel body
*/




class D3LinePlot extends D3View{

  //..................... D3LinePlot Constructor ...............................
  constructor(containerEl){


    //............................ Variables ...................................
    let _this,
        // Variables
        _dataD3,
        _plotD3,
        _svgD3,
        _table,
        _xD3,
        _yD3;
         
    _this = super(containerEl);
    _this.allDataEl; 
    _this.data;
    _this.labels;
    _this.legendEl;
    _this.observer;
    _this.observerConfig;
    _this.plotEl;
    _this.svgEl; 
    _this.tableEl;
    _this.tableBodyEl;
    _this.tooltipEl;
    _this.xAxisEl;
    _this.yAxisEl;
    
    // create an observer instance to resize
    // plot when other plots are added to the DOM
    _this.observer = new MutationObserver(function(mutations) {
        D3LinePlot.plotResize(_this);
    });
    //--------------------------------------------------------------------------
    
   
    //........................ Data Table ...................................... 
    _table = d3.select(_this.plotBodyEl)
        .append("div")
        .attr("class","data-table hidden")
        .append("table")
        .attr("class","table table-bordered table-condensed")
        .append("tbody")
        .attr("class","data-table-body");
    //--------------------------------------------------------------------------


    //......................... SVG Outline for Plot ...........................
    _svgD3 = d3.select(_this.plotBodyEl)
        .append("svg")
        .attr("class","D3LinePlot");
        
    _plotD3 = _svgD3.append("g")
        .attr("class","plot");

    _dataD3 = _plotD3.append("g")
        .attr("class","all-data");

    // X-axis
    _xD3 = _plotD3.append("g")
        .attr("class","x-axis");
    _xD3.append("g")
        .attr("class","x-tick");
    _xD3.append("text")
        .attr("class","x-label");
         
    // Y-axis
    _yD3 = _plotD3.append("g")
        .attr("class","y-axis");
    _yD3.append("g")
        .attr("class","y-tick");
    _yD3.append("text")
        .attr("class","y-label");

    _plotD3.append("g")
        .attr("class","legend"); 

    _plotD3.append("g")
        .attr("class","d3-tooltip"); 
    //--------------------------------------------------------------------------

     
    //....................... DOM Elements ..................................... 
    _this.allDataEl = _this.el.querySelector(".all-data");
    _this.legendEl = _this.el.querySelector(".legend");
    _this.plotEl = _this.el.querySelector(".plot");
    _this.svgEl = _this.el.querySelector(".D3LinePlot");
    _this.tableBodyEl = _this.plotBodyEl.querySelector(".data-table-body");
    _this.tableEl = _this.plotBodyEl.querySelector(".data-table");
    _this.tooltipEl = _this.el.querySelector(".d3-tooltip");
    _this.xAxisEl = _this.el.querySelector(".x-axis"); 
    _this.yAxisEl = _this.el.querySelector(".y-axis"); 
    //--------------------------------------------------------------------------
  
  
  }
  //--------------------- End: D3LinePlot Constructor --------------------------
  
  

  //................... Method: Create Data Table .............................. 
  static dataTable(linePlot){
    let _this,
        // Variables
        _svgHeight,
        _svgWidth,
        _tableRowX,
        _tableRowY;

    _this = linePlot;
    _svgHeight = D3LinePlot.plotHeight(_this,true);
    _svgWidth = D3LinePlot.plotWidth(_this,true);

    // Update table height and width
    d3.select(_this.tableEl)
        .style("height",_svgHeight+"px")
        .style("width",_svgWidth+"px");
         
    // Remove table rows
    d3.select(_this.tableBodyEl)
        .selectAll("tr")
        .remove(); 
    
    // Create table
    _this.data.forEach(function(dataSet,ids){
      d3.select(_this.tableBodyEl)
          .append("tr")
          .append("th")
          .text(_this.labels[ids]);

      _tableRowX = d3.select(_this.tableBodyEl).append("tr");
      _tableRowX.append("td")
        .text(_this.options.tooltipText[1]);
      
      _tableRowY = d3.select(_this.tableBodyEl).append("tr");
      _tableRowY.append("td")
        .text(_this.options.tooltipText[2]);
      
      dataSet.forEach(function(dataPair,idp){
        _tableRowX.append("td")
            .text(dataPair[0]);
        _tableRowY.append("td")
            .text(dataPair[1]);
        
      })
     
    });
  }
  //----------------- End Method: Create Data Table ----------------------------



  //................... Method: Get X Extreme Values ...........................
  static getXExtremes(linePlot){
    let _tmp,
        _xMax,
        _xMin;
  
    // Find X max
    _xMax = d3.max(linePlot.data,function(ds,is){
      _tmp = d3.max(ds,function(dp,ip){
        return dp[0];
      });
      return _tmp;
    });
    
    // Find X min
    _xMin = d3.min(linePlot.data,function(ds,is){
      _tmp = d3.min(ds,function(dp,ip){
        return dp[0];
      });
      return _tmp;
    });

    return [_xMin,_xMax];   
  }
  //------------------ End Method: Get X Extreme Values ------------------------
  
  
  
  //...................... Method: Get X Scale .................................
  static getXScale(linePlot){
    let _options,
        _xBounds;

    _options = linePlot.options;
    _xBounds = _options.xAxisScale == "linear" 
        ? d3.scaleLinear() : d3.scaleLog();
    
    return _xBounds;
  }
  //-------------------- End Method: Get X Scale ------------------------------- 


  
  //................... Method: Get Y Extreme Values ...........................
  static getYExtremes(linePlot){
    let _tmp,
        _yMax,
        _yMin;
  
    // Find Y max
    _yMax = d3.max(linePlot.data,function(ds,is){
      _tmp = d3.max(ds,function(dp,ip){
        return dp[1];
      });
      return _tmp;
    });
    
    // Find Y min
    _yMin = d3.min(linePlot.data,function(ds,is){
      _tmp = d3.min(ds,function(dp,ip){
        return dp[1];
      });
      return _tmp;
    });

    return [_yMin,_yMax];   
  }
  //------------------ End Method: Get Y Extreme Values ------------------------
  
  
  
  //................... Method: Get Y Scale ....................................
  static getYScale(linePlot){
    let _options,
        _yBounds;

    _options = linePlot.options;
    _yBounds = _options.yAxisScale == "linear" 
        ? d3.scaleLinear() : d3.scaleLog();
    
    return _yBounds;
  }
  //-------------------- End Method: Get Y Scale ------------------------------- 

 
 
  //............... Method: Calculate Legend Location Translate ................
  static legendLocation(linePlot,plotHeight,plotWidth){
    let _legendGeom,
        _legendWidth,
        _legendHeight,
        _options,
        _translate;

    _options = linePlot.options;
    _legendGeom = linePlot.legendEl 
        .getBoundingClientRect();
    _legendWidth  = _legendGeom.width;
    _legendHeight = _legendGeom.height;
    
    if (_options.xAxisScale == "linear" || _options.yAxisScale == "linear"){
      _translate = "translate("+(plotWidth-_legendWidth)+
          ","+ _legendHeight+")";
    }else{
      _translate = "translate(10,"+(plotHeight*(1-0.05))+")";
    }

    return _translate; 
  } 
  //----------------- End Method: Legend Translate -----------------------------



  //................. Method: Highlight a Selected Line ........................
  static makeSelection(linePlot,selectedId){
    let _legendD3,  
        _legendExists,
        _linewidthCheck,
        _selectedD3;
        
    _selectedD3 = d3.select(linePlot.allDataEl)
        .select("#"+selectedId);
    _linewidthCheck = _selectedD3.select(".line")
        .attr("stroke-width");
    
    D3LinePlot.plotSelectionReset(linePlot);
    
    // If line is already selected, return
    if (_linewidthCheck == linePlot.options.linewidthSelection){
      return;
    }
    
    //......... Increase Line Width and Dot size of Selected Plot ..............
    _selectedD3.select(".line")                    
        .attr("stroke-width",linePlot.options.linewidthSelection);
    _selectedD3.selectAll(".dot")                 
        .attr("r",linePlot.options.pointRadiusSelection);             
    _selectedD3.raise();                          
    //--------------------------------------------------------------------------
    
        
    //............. Increase Line Width and Circle Size on Legend ..............
    _legendExists = !d3.select(linePlot.legendEl)
        .select(".legend-entry")
        .empty();
    
    if (_legendExists){
      _legendD3 = d3.select(linePlot.legendEl)
          .select("#"+selectedId);                   
      _legendD3.select(".legend-line")                    
          .attr("stroke-width",linePlot.options.linewidthSelection);
      _legendD3.select(".legend-circle")                  
          .attr("r",linePlot.options.pointRadiusSelection);     
      _legendD3.select(".legend-text")                    
          .style("font-weight","bold");               
    }
    //--------------------------------------------------------------------------
  
  }
  //---------------- End Method: Highlight a Selected Line ----------------------

 
  
  //...................... Method: Plot Data ...................................
  plotData(){


    //.......................... Variables .....................................
    let _this,
        // Variables
        _dotsEnter,
        _linesEnter,
        _ndata,
        _observerConfig,
        _plotHeight,
        _plotWidth,
        _selectedId,
        _seriesEnter,
        _selectedValue,
        _tooltip;
    
    _this = this;
    _this.color;
    _this.labelIds;
    _this.line;
    _this.xBounds;
    _this.xExtremes;
    _this.yBounds;
    _this.yExtremes;
    //--------------------------------------------------------------------------

    
    //.......................... Mutation Observer ............................. 
    _observerConfig = { 
        attributes: true, 
        childList: true, 
        characterData: true 
      };
    
    _this.observer.observe(_this.el,_observerConfig);
    //--------------------------------------------------------------------------

    
    // Create label ids based on labels
    _this.labelIds = _this.labels.map(function(d,i){
      return d.replace(" ","_"); 
    });
    
    // Get color scheme
    _ndata = this.data.length;           
    _this.color = _ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
     
    
    //................. D3 Function: Line Function .............................
    _this.line = d3.line()                            
      .defined(function(d,i) {return d[1] != null})  
      .x(function(d,i) {return _this.xBounds(d[0])})        
      .y(function(d,i) {return _this.yBounds(d[1])});      
    //-------------------------------------------------------------------------- 
  

    //........................ Get Values ......................................
    _plotHeight = D3LinePlot.plotHeight(_this);
    _plotWidth = D3LinePlot.plotWidth(_this);
    
    _this.xBounds = D3LinePlot.getXScale(_this);
    _this.xExtremes = D3LinePlot.getXExtremes(_this);
    _this.xBounds.range([0,_plotWidth])
        .domain(_this.xExtremes)
        .nice();

    _this.yBounds = D3LinePlot.getYScale(_this);
    _this.yExtremes = D3LinePlot.getYExtremes(_this);
    _this.yBounds.range([_plotHeight,0])
        .domain(_this.yExtremes)
        .nice();
    //-------------------------------------------------------------------------- 
  

    //...................... Update SVG Size and Translate ..................... 
    d3.select(_this.svgEl)
        .attr("width",D3LinePlot.plotWidth(_this,true))
        .attr("height",D3LinePlot.plotHeight(_this,true));
      
    d3.select(_this.svgEl)
        .select(".plot")
        .attr("transform","translate("+
            _this.options.marginLeft+","+ _this.options.marginTop+")")  
    //--------------------------------------------------------------------------
        
    
    //............................ Plot Data ................................... 
    // Remove any data
    d3.select(_this.allDataEl)
        .selectAll(".data")
        .remove();
    
    // Create data groups
    _seriesEnter = d3.select(_this.allDataEl)
        .selectAll("g")
        .data(_this.data)
        .enter()
        .append("g")
        .attr("class","data")
        .attr("id",function(d,i){return _this.labelIds[i]})
        .style("cursor","pointer");
    
    // Plot lines
    _seriesEnter.append("path")
        .attr("class","line")
        .attr("d",_this.line)
        .attr("stroke",function(d,i){return _this.color[i]} )
        .attr("stroke-width",_this.options.linewidth)
        .attr("fill","none");
   
    // Plot cirles
    _seriesEnter.selectAll("circle")
        .data(function(d,i){return d})
        .enter()
        .filter(function(d,i){return d[1] != null})
        .append("circle")
        .attr("class","dot")
        .attr("cx",_this.line.x())
        .attr("cy",_this.line.y())
        .attr("r",_this.options.pointRadius)
        .attr("fill",function(d,i){
          return d3.select(this.parentNode.firstChild).style("stroke");
        });
    //--------------------------------------------------------------------------
    
    
    //......................... Setup the X Axis ...............................
    // X Tick Marks     
    d3.select(_this.xAxisEl)
        .select(".x-tick")
        .attr("transform","translate(0,"+_plotHeight+")") 
        .style("font-size","10px")
        .call(d3.axisBottom(_this.xBounds));
   
    // X Label
    d3.select(_this.xAxisEl)
        .select(".x-label")
        .attr("text-anchor","middle") 
        .attr("alignment-baseline","middle")
        .style("font-size","12px")
        .attr("x", _plotWidth/2) 
        .attr("y", _plotHeight+_this.options.marginBottom/2+10)
        .text(this.xlabel);
    //--------------------------------------------------------------------------


    //....................... Setup the Y Axis .................................
    // Y Tick marks
    d3.select(_this.yAxisEl)
        .select(".y-tick")
        .style("font-size","10px")
        .call(d3.axisLeft(_this.yBounds));

    // Y Label
    d3.select(_this.yAxisEl)
        .select(".y-label")
        .attr("transform","rotate(-90)")
        .attr("text-anchor","middle")
        .style("font-size","12px")
        .attr("x",0- _plotHeight/2)
        .attr("y",0- _this.options.marginLeft/2-10)
        .text(_this.ylabel);
    //--------------------------------------------------------------------------

    
    // Create legend 
    if (_this.options.showLegend) D3LinePlot.setLegend(_this);


    //................... Resize Plot on Window Resize ......................... 
    $(window).resize(function(){
      D3LinePlot.plotResize(_this);
    });
    //--------------------------------------------------------------------------
    
  
    //........... Rescale (log/linear) the X Axis on Button Click ..............
    d3.select(_this.plotFooterEl)
        .selectAll(".x-axis-btns")
        .on("click",function(){
          d3.select(_this.plotFooterEl)                                                         
              .selectAll(".x-axis-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          _this.options.xAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          
          D3LinePlot.plotResize(_this,true);
        }); 
    //--------------------------------------------------------------------------


    //......... Rescale (log/linear) the Y Axis on Button Click ................
    d3.select(_this.plotFooterEl)
        .selectAll(".y-axis-btns")
        .on("click",function(){
          d3.select(_this.plotFooterEl)                                                         
              .selectAll(".y-axis-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          _this.options.yAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          
          D3LinePlot.plotResize(_this,true);
        }); 
    //--------------------------------------------------------------------------
  
  
    //.................. Highlight Line when Selected on Plot ..................
    d3.select(_this.allDataEl)
        .selectAll(".data")
        .on("click",function(d,i){ 
          _selectedId = d3.select(this).attr("id");
          D3LinePlot.makeSelection(_this,_selectedId);        
        });
    //--------------------------------------------------------------------------


    //.......................... Tooltip .......................................
    d3.select(_this.allDataEl)
        .selectAll(".data")
        .selectAll(".dot")
        .on("mouseover",function(d,i){
          _tooltip =  new Tooltip(_this,this); 
          _tooltip.increaseRadius(_this);
        })
        .on("mouseout",function(d,i){
            _tooltip.decreaseRadius(_this);
            _tooltip.destroy(_this);
        });
    //--------------------------------------------------------------------------

    
    //................ Switch Between Plot and Data on Click ................... 
    D3LinePlot.dataTable(_this); 
    
    d3.select(_this.plotFooterEl)
        .selectAll(".plot-data-btns")
        .on("click",function(d,i){
          _selectedValue = d3.select(this)
              .select("input")
              .attr("value");
          
          d3.select(_this.plotFooterEl)                                                         
              .selectAll(".plot-data-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          if (_selectedValue == "plot"){
            d3.select(_this.tableEl)
                .classed("hidden",true);
            d3.select(_this.svgEl)
                .classed("hidden",false);
            D3LinePlot.plotResize(_this);
          }else{
            d3.select(_this.tableEl)
                .classed("hidden",false);
            d3.select(_this.svgEl)
                .classed("hidden",true);
            D3LinePlot.dataTable(_this);
          }
        });
    //--------------------------------------------------------------------------
    
    
  }
  //---------------- End Method: Plot Data -------------------------------------


 
  //......................... Get Plot Height Function .........................
  static plotHeight(linePlot,isSvg){
    let _bodyHeight,
        _footerHeight,
        _height,
        _margin,
        _options,
        _panelMargin,
        _titleHeight;

    _options = linePlot.options;
    
    _bodyHeight = linePlot.plotBodyEl
        .getBoundingClientRect()
        .height;
    _footerHeight = linePlot.plotFooterEl
        .getBoundingClientRect()
        .height;
    _titleHeight = linePlot.plotTitleEl
        .getBoundingClientRect()
        .height;
    _margin = _options.marginTop + _options.marginBottom;
    
    _height = isSvg ? _bodyHeight :
        _bodyHeight - _margin; 
    
    return _height;
  }
  //----------------------------------------------------------------------------



  //.................. Remove Highlight from Selected Line .....................
  static plotSelectionReset(linePlot){
    let _legendD3,
        _svgD3;

    _svgD3 = d3.select(linePlot.svgEl);
    
    //.................. Resize All Lines and Dots in Plot .....................
    _svgD3.selectAll(".line")   
        .attr("stroke-width",linePlot.options.linewidth); 
    _svgD3.selectAll(".dot")            
        .attr("r",linePlot.options.pointRadius);       
    //--------------------------------------------------------------------------


    //.................... Resize Lines and Dots in the Legend .................
    if (linePlot.options.showLegend){
      _legendD3 = _svgD3.select(".legend")
          .selectAll(".legend-entry");
      _legendD3.select(".legend-text") 
          .style("font-weight","initial");
      _legendD3.select(".legend-line")     
          .attr("stroke-width",linePlot.options.linewidth);
      _legendD3.select(".legend-circle")   
          .attr("r",linePlot.options.pointRadius);   
    }
    //--------------------------------------------------------------------------
  
  }
  //------------ End Method: Remove Highlight from Selected Line ---------------



  //...................... Plot Resize Function ................................
  static plotResize(linePlot,do_transition){
    let _legendD3,
        _legendTranslate,
        _options,
        _plotHeight,
        _plotWidth,
        _svgD3,
        _svgDotD3,
        _svgHeight,
        _svgLineD3,
        _svgWidth;
    
    _options = linePlot.options;

    D3LinePlot.dataTable(linePlot);

    _plotHeight = D3LinePlot.plotHeight(linePlot);
    _plotWidth = D3LinePlot.plotWidth(linePlot); 
    
    _svgHeight = D3LinePlot.plotHeight(linePlot,true);
    _svgWidth = D3LinePlot.plotWidth(linePlot,true);

    _svgD3 = d3.select(linePlot.svgEl);     
    _svgD3.attr("width", _svgWidth) 
        .attr("height",_svgHeight)

    linePlot.xBounds = D3LinePlot.getXScale(linePlot);
    linePlot.xBounds
        .range([0,_plotWidth])
        .domain(linePlot.xExtremes)
        .nice();

    linePlot.yBounds = D3LinePlot.getYScale(linePlot);
    linePlot.yBounds
        .range([_plotHeight,0])
        .domain(linePlot.yExtremes)
        .nice()

    _svgD3.select(".x-tick")  
        .attr("transform","translate(0,"+ _plotHeight +")")
        .call(d3.axisBottom(linePlot.xBounds));
    _svgD3.select(".x-label")             
        .attr("x", _plotWidth/2.0)           
        .attr("y", _plotHeight+_options.marginBottom/2+10);                 

    _svgD3.select(".y-tick")                                   
        .call(d3.axisLeft( linePlot.yBounds));
    _svgD3.select(".y-label")  
        .attr("x",0-_plotHeight/2)
        .attr("y",0-_options.marginLeft/2-10);
    
    _legendTranslate = D3LinePlot
        .legendLocation(linePlot,_plotHeight,_plotWidth);
    _legendD3 = d3.select(linePlot.legendEl)
        .selectAll(".legend-entry");

    _svgLineD3 = _svgD3.selectAll(".line");
    _svgDotD3  = _svgD3.selectAll(".dot");
    
    if (do_transition){
      _svgLineD3.transition()
          .duration(500)
          .attr("d",linePlot.line);
      _svgDotD3.transition()
          .duration(500)
          .attr("cx",linePlot.line.x())
          .attr("cy",linePlot.line.y());
      _legendD3.transition()
          .duration(500)
          .attr("transform",_legendTranslate);
    }else{
      _svgLineD3.attr("d",linePlot.line);
      _svgDotD3.attr("cx",linePlot.line.x())  
          .attr("cy",linePlot.line.y());     
      _legendD3.attr("transform",_legendTranslate);
    }

    if (linePlot.options.showLegend) D3LinePlot.setLegend(linePlot);
  }
  //-------------------------------------------------------------------------------



  //......................... Get Plot Height Function .........................
  static plotWidth(linePlot,isSvg){
    let _bodyWidth,
        _margin,
        _options,
        _selectedId,
        _width;

    _options = linePlot.options;

    _bodyWidth = linePlot.plotBodyEl
        .getBoundingClientRect()
        .width;
    _margin = _options.marginLeft + _options.marginRight;
    
    _width = isSvg ? _bodyWidth :
        _bodyWidth - _margin; 
    
    return _width;
  }
  //----------------------------------------------------------------------------



  //................... Method: Replace Y values with null .....................
  removeSmallValues(limit){
    let _this;
    _this = this;
    
    _this.data.forEach(function(d,id){        
      d.forEach(function(dp,idp){                
        if (dp[1] <= limit){                         
          dp[1] = null;
          dp[0] = null;
        }
      })
    });
  }
  //----------------- End Method: Replace Y values -----------------------------



  //................. Method: Create the Legend ................................
  static setLegend(linePlot){
    let _legendD3,
        _nleg,
        _plotHeight,
        _plotWidth,
        _translate;

    _nleg = linePlot.labels.length-1; 
    _plotHeight = D3LinePlot.plotHeight(linePlot);
    _plotWidth = D3LinePlot.plotWidth(linePlot);
    
    d3.select(linePlot.legendEl)
      .selectAll(".legend-entry")
      .remove();
      
    _legendD3 = d3.select(linePlot.legendEl)
        .selectAll("g")
        .data(linePlot.labels)
        .enter()  
        .append("g") 
        .attr("class","legend-entry")
        .attr("id",function(d,i){return linePlot.labelIds[_nleg-i]})
        .style("cursor","pointer");
    
    // Legend Text
    _legendD3.append("text")
        .attr("class","legend-text")
        .attr("font-size","12px")
        .attr("x",30)
        .attr("y", function(d,i){return 16*-i})
        .attr("alignment-baseline","central")
        .text(function(d,i){return linePlot.labels[_nleg-i]});
     
    // Legend Line Indicator
    _legendD3.append("line")
        .attr("class","legend-line")
        .attr("x2",24)
        .attr("y1", function(d,i){return 16*-i})
        .attr("y2", function(d,i){return 16*-i})
        .attr("stroke-width",3)
        .attr("stroke",function(d,i){return linePlot.color[_nleg-i]})
        .attr("fill","none");  
      
    // Legend Circle on the Line
    _legendD3.append("circle") 
        .attr("class","legend-circle")
        .attr("cx",12)
        .attr("cy",function(d,i){return 16*-i}) 
        .attr("r",5)
        .attr("fill",function(d,i){return linePlot.color[_nleg-i]} );
    
    // Set translation 
    _translate = D3LinePlot.legendLocation(linePlot,_height,_width);
    _legendD3.attr("transform",_translate)  
  
  
    //.............. Highlight Line when Legend Entry Selected .................
    d3.select(linePlot.legendEl)
        .selectAll(".legend-entry")
        .on("click",function(d,i){ 
          _selectedId = d3.select(this).attr("id"); 
          D3LinePlot.makeSelection(linePlot,_selectedId);
        });
    //--------------------------------------------------------------------------
    
  
  } 
  //--------------- End Method: Create Legend ----------------------------------



}



//-------------------- End D3LinePlot Class ------------------------------------
