'use strict';


//import 'Tooltip.js';


class D3LinePlot extends D3View{


  constructor(el){
    let _this,
        _svgD3,
        _plotD3,
        _width,
        _height,
        _dataD3,
        _svgHeight,
        _svgWidth,
        _xD3,
        _yD3,
        _table;
         
    
    _this = super(el);

    _this.data;
    _this.labels;
    _this.xlabel; 
    _this.ylabel;
    _this.xscale;
    _this.yscale;
    _this.observer;
    _this.observerConfig;
    _this.table;
    
    
    // create an observer instance
    _this.observer = new MutationObserver(function(mutations) {
        D3LinePlot.plotResize(_this);
    });
     
    
    _table = d3.select(_this.plotBody)
        .append("div")
        .attr("class","data-table hidden")
        .append("table")
        .attr("class","table table-bordered table-condensed")
        .append("tbody")
        .attr("class","data-table-body");
    

    _svgD3 = d3.select(_this.plotBody)
        .append("svg")
        .attr("class","D3LinePlot");
        
        
    _plotD3 = _svgD3.append("g")
        .attr("class","plot");

    _dataD3 = _plotD3.append("g")
        .attr("class","all-data");

    _xD3 = _plotD3.append("g")
        .attr("class","x-axis");
    _xD3.append("g")
        .attr("class","x-tick");
    _xD3.append("text")
        .attr("class","x-label");
         
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


    
    
    
    _this.svg  = _this.el.querySelector(".D3LinePlot");
    _this.plot = _this.svg.querySelector(".plot");
    _this.allData = _this.svg.querySelector(".all-data");
    _this.xAxis = _this.svg.querySelector(".x-axis"); 
    _this.yAxis = _this.svg.querySelector(".y-axis"); 
    _this.legend = _this.svg.querySelector(".legend");
    _this.table = _this.plotBody.querySelector(".data-table");
    _this.tableBody = _this.plotBody.querySelector(".data-table-body");
    _this.tooltip = _this.svg.querySelector(".d3-tooltip");
  }
  
 
  //....................... Replace Y values with null ......................... 
  removeSmallValues(limit){
    this.data.forEach(function(d,id){        
      d.forEach(function(dp,idp){                
        if (dp[1] <= limit){                         
          dp[1] = null;
          dp[0] = null;
        }
      })
    });
  }
  //----------------------------------------------------------------------------
 
 
  //......................... Get Plot Height Function .........................
  static plotHeight(obj,isSvg){
    let _this,
        _bodyHeight,
        _titleHeight,
        _footerHeight,
        _options,
        _height,
        _panelMargin,
        _margin;

    _this = obj;
    _options = _this.options;

    _bodyHeight = _this.plotBody
        .getBoundingClientRect()
        .height;
    
    _footerHeight = _this.plotFooter
        .getBoundingClientRect()
        .height;
    
    _titleHeight = _this.plotTitle
        .getBoundingClientRect()
        .height;
   
    _margin = _options.marginTop + _options.marginBottom;
    
    _height = isSvg ?  _bodyHeight :
        _bodyHeight - _margin; 
    

    return _height;
  }
  //----------------------------------------------------------------------------


  //......................... Get Plot Height Function .........................
  static plotWidth(obj,isSvg){
    let _this,
        _bodyWidth,
        _options,
        _width,
        _margin;

    _this = obj;
    _options = _this.options;

    _bodyWidth = _this.plotBody
        .getBoundingClientRect()
        .width;

    _margin = _options.marginLeft + _options.marginRight;
    
    _width = isSvg ?  _bodyWidth :
        _bodyWidth - _margin; 
    
    return _width;
  }
  //----------------------------------------------------------------------------

  
  //...................... Method: Plot Data ...................................
  plotData(){
    let _this,
        _ndata,
        _height,
        _width,
        _linesEnter,
        _observerConfig,
        _dotsEnter,
        _seriesEnter;
    
    
    _this = this;
    _this.line;
    _this.color;
    _this.yExtremes;
    _this.xExtremes;
    _this.xBounds;
    _this.yBounds;
    _this.labelIds;

  
    _observerConfig = { 
        attributes: true, 
        childList: true, 
        characterData: true 
      };
    
    _this.observer.observe(_this.el,_observerConfig);
    
    
    _this.labelIds = _this.labels.map(function(d,i){
      return d.replace(" ","_"); 
    });
    
    //..................... Get Color Scheme ...................................
    _ndata = this.data.length;           
    _this.color = _ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    //--------------------------------------------------------------------------
     
    //........................ Line Function ...................................
    _this.line = d3.line()                            
      .defined(function(d,i) {return d[1] != null})  
      .x(function(d,i) {return _this.xBounds(d[0])})        
      .y(function(d,i) {return _this.yBounds(d[1])});      
    //-------------------------------------------------------------------------- 
  

    //........................ Get Values ......................................
    _this.yExtremes = D3LinePlot.getYextremes(_this);
    _this.xExtremes = D3LinePlot.getXextremes(_this);
    
    _height = D3LinePlot.plotHeight(_this);
    _width  = D3LinePlot.plotWidth(_this);
    
    _this.xBounds = D3LinePlot.getXscale(_this);
    _this.xBounds.range([0,_width])
        .domain(_this.xExtremes)
        .nice();

    _this.yBounds = D3LinePlot.getYscale(this);
    _this.yBounds.range([_height,0])
        .domain(_this.yExtremes)
        .nice();
    //-------------------------------------------------------------------------- 
  

    //...................... Update SVG Size and Translate ..................... 
    d3.select(_this.svg)
        .attr("width",D3LinePlot.plotWidth(_this,true))
        .attr("height",D3LinePlot.plotHeight(_this,true));
      
    d3.select(_this.svg)
        .select(".plot")
        .attr("transform","translate("+
            _this.options.marginLeft+","+ _this.options.marginTop+")")  
    //--------------------------------------------------------------------------
        
    
    //............................ Plot Data ................................... 
    // Remove any data
    d3.select(_this.allData)
        .selectAll(".data")
        .remove();
    
    // Create data groups
    _seriesEnter = d3.select(_this.allData)
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
    d3.select(_this.xAxis)
        .select(".x-tick")
        .attr("transform","translate(0,"+_height+")") 
        .style("font-size","10px")
        .call(d3.axisBottom(_this.xBounds));
   
    
    // X Label
    d3.select(_this.xAxis)
        .select(".x-label")
        .attr("text-anchor","middle") 
        .attr("alignment-baseline","middle")
        .style("font-size","12px")
        .attr("x", _width/2) 
        .attr("y", _height+_this.options.marginBottom/2+10)
        .text(this.xlabel);
    //--------------------------------------------------------------------------



    //....................... Setup the Y Axis .................................
    // Y Tick marks
    d3.select(_this.yAxis)
        .select(".y-tick")
        .style("font-size","10px")
        .call(d3.axisLeft(_this.yBounds));

    // Y Label
    d3.select(_this.yAxis)
        .select(".y-label")
        .attr("transform","rotate(-90)")
        .attr("text-anchor","middle")
        .style("font-size","12px")
        .attr("x",0- _height/2)
        .attr("y",0- _this.options.marginLeft/2-10)
        .text(_this.ylabel);
    //--------------------------------------------------------------------------


    // Resize plot on window resize 
    $(window).resize(function(){
      D3LinePlot.plotResize(_this);
    });
    
  
    // Rescale (log/linear) the X axis on button click
    d3.select(_this.plotFooter)
        .selectAll(".x-axis-btns")
        .on("click",function(){
          
          d3.select(_this.plotFooter)                                                         
              .selectAll(".x-axis-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          _this.options.xAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          D3LinePlot.plotResize(_this,true);
        }); 
    
    // Rescale (log/linear) the Y axis on button click
    d3.select(_this.plotFooter)
        .selectAll(".y-axis-btns")
        .on("click",function(){
          
          d3.select(_this.plotFooter)                                                         
              .selectAll(".y-axis-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          _this.options.yAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          
          D3LinePlot.plotResize(_this,true);
        }); 
  
  
  
    //.................. Highlight Line when Selected on Plot ..................
    d3.select(_this.allData)
        .selectAll(".data")
        .on("click",function(d,i){ 
          var selectedId = d3.select(this).attr("id");
          D3LinePlot.makeSelection(_this,selectedId);        
        });
    //--------------------------------------------------------------------------


    let tooltip;
    // Tooltip
    d3.select(_this.allData)
        .selectAll(".data")
        .selectAll(".dot")
        .on("mouseover",function(d,i){
          tooltip =  new Tooltip(_this,this); 
          tooltip.increaseRadius(_this);
        })
        .on("mouseout",function(d,i){
            tooltip.decreaseRadius(_this);
            tooltip.destroy(_this);
        });


    
     
     
    d3.select(_this.plotFooter)
        .selectAll(".plot-data-btns")
        .on("click",function(d,i){
          let selected = d3.select(this)
              .select("input")
              .attr("value");
          
          d3.select(_this.plotFooter)                                                         
              .selectAll(".plot-data-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          

          if (selected == "plot"){
            d3.select(_this.table)
                .classed("hidden",true);
            d3.select(_this.svg)
                .classed("hidden",false);
            D3LinePlot.plotResize(_this);
          }else{
            d3.select(_this.table)
                .classed("hidden",false);
            d3.select(_this.svg)
                .classed("hidden",true);
            D3LinePlot.dataTable(_this);
          }
          
        });
    
  
    if (_this.options.showLegend) D3LinePlot.setLegend(_this);
    
    D3LinePlot.dataTable(_this); 
  }
  //---------------- End: Method Plot Data -------------------------------------

  static dataTable(_this){
    console.log("Ahh"); 
    let _svgHeight = D3LinePlot.plotHeight(_this,true);
    let _svgWidth = D3LinePlot.plotWidth(_this,true);

    d3.select(_this.table)
        .style("height",_svgHeight+"px")
        .style("width",_svgWidth+"px");
         
    d3.select(_this.tableBody)
        .selectAll("tr")
        .remove(); 
    
    _this.data.forEach(function(dataSet,ids){
      d3.select(_this.tableBody)
          .append("tr")
          .append("th")
          .text(_this.labels[ids]);

      let tableRowX = d3.select(_this.tableBody).append("tr");
      let tableRowY = d3.select(_this.tableBody).append("tr");
     
      tableRowX.append("td")
        .text(_this.options.tooltipText[1]);
     
      tableRowY.append("td")
        .text(_this.options.tooltipText[2]);
      
      dataSet.forEach(function(dataPair,idp){
        tableRowX.append("td")
            .text(dataPair[0]);
        tableRowY.append("td")
            .text(dataPair[1]);
        
      })
     
    });
  }

  //...................... Plot Resize Function ................................
  plotUpdate(){
    D3LinePlot.plotResize(this);
  }
  static plotResize(obj,do_transition){
    let _this,
        _height,
        _width,
        _svgHeight,
        _svgWidth,
        _svgDot,
        _svg,
        _svgLine,
        _options,
        _legend,
        _legendTranslate; 
    
    
    _this = obj;
    _options = _this.options;

    D3LinePlot.dataTable(_this);

    _height = D3LinePlot.plotHeight(_this);
    _width = D3LinePlot.plotWidth(_this); 
    
    _svgHeight = D3LinePlot.plotHeight(_this,true);
    _svgWidth = D3LinePlot.plotWidth(_this,true);

    _svg = d3.select(_this.svg);     
        
    _svg.attr("width", _svgWidth) 
        .attr("height",_svgHeight)

    _this.xBounds = D3LinePlot.getXscale(_this);
    _this.xBounds
        .range([0,_width])
        .domain(_this.xExtremes)
        .nice();

    _this.yBounds = D3LinePlot.getYscale(_this);
    _this.yBounds
        .range([_height,0])
        .domain(_this.yExtremes)
        .nice()

    _svg.select(".x-tick")  
        .attr("transform","translate(0,"+ _height +")")
        .call(d3.axisBottom(_this.xBounds));

    _svg.select(".x-label")             
        .attr("x", _width/2.0)           
        .attr("y", _height+ _options.marginBottom/2+10);                 

    _svg.select(".y-tick")                                   
        .call(d3.axisLeft( _this.yBounds));
    
    _svg.select(".y-label")  
        .attr("x",0- _height/2)
        .attr("y",0- _options.marginLeft/2-10);
    
    _legendTranslate = D3LinePlot.legendLocation(_this,_height,_width);
    _legend = d3.select(_this.legend)
        .selectAll(".legend-entry");

    _svgLine = _svg.selectAll(".line");
    _svgDot  = _svg.selectAll(".dot");
    
    if (do_transition){
      _svgLine.transition()
        .duration(500)
        .attr("d",_this.line);
      
      _svgDot.transition()
        .duration(500)
        .attr("cx",_this.line.x())
        .attr("cy",_this.line.y());
      
      _legend.transition()
        .duration(500)
        .attr("transform",_legendTranslate);
      
    }else{
      _svgLine.attr("d",_this.line);
      _svgDot.attr("cx",_this.line.x())  
        .attr("cy",_this.line.y());     
      _legend.attr("transform",_legendTranslate);
    }

    if (_this.options.showLegend) D3LinePlot.setLegend(_this);
  }
  //-------------------------------------------------------------------------------



  //................. Set the Legend .......................
  static setLegend(_this){
    let _nleg,
        _height,
        _width,
        _legend,
        _translate;

    _nleg = _this.labels.length-1; 
    _height = D3LinePlot.plotHeight(_this);
    _width = D3LinePlot.plotWidth(_this);
    
    d3.select(_this.legend)
      .selectAll(".legend-entry")
      .remove();
      
       
    _legend = d3.select(_this.legend)
      .selectAll("g")
        .data(_this.labels)
        .enter()  
      .append("g") 
        .attr("class","legend-entry")
        .attr("id",function(d,i){return _this.labelIds[_nleg-i]})
        .style("cursor","pointer");
    
    
    // Legend Text
    _legend.append("text")
      .attr("class","legend-text")
      .attr("font-size","12px")
      .attr("x",30)
      .attr("y", function(d,i){return 16*-i})
      .attr("alignment-baseline","central")
      .text(function(d,i){return _this.labels[_nleg-i]});
     
    // Legend Line Indicator
    _legend.append("line")
      .attr("class","legend-line")
      .attr("x2",24)
      .attr("y1", function(d,i){return 16*-i})
      .attr("y2", function(d,i){return 16*-i})
      .attr("stroke-width",3)
      .attr("stroke",function(d,i){return _this.color[_nleg-i]})
      .attr("fill","none");  
      
    // Legend Circle on the Line
    _legend.append("circle") 
      .attr("class","legend-circle")
      .attr("cx",12)
      .attr("cy",function(d,i){return 16*-i}) 
      .attr("r",5)
      .attr("fill",function(d,i){return _this.color[_nleg-i]} );
    
    // Set translation 
    _translate = D3LinePlot.legendLocation(_this,_height,_width);
    _legend.attr("transform",_translate)  
  
  
    //.............. Highlight Line when Legend Entry Selected .................
    d3.select(_this.legend)
        .selectAll(".legend-entry")
        .on("click",function(d,i){ 
          var selectedId = d3.select(this).attr("id"); 
          D3LinePlot.makeSelection(_this,selectedId);
        });
    //--------------------------------------------------------------------------
    
  
  
  } 
  //--------------------------------------------------------


  //........................ Set Legend Location Function ......................
  static legendLocation(_this,_height,_width){
    let _legendGeom,
        _legendWidth,
        _legendHeight,
        _translate,
        options;

    options = _this.options;

    _legendGeom = _this.legend 
      .getBoundingClientRect();
    
    _legendWidth  = _legendGeom.width;
    _legendHeight = _legendGeom.height;
    
    if (options.xAxisScale == "linear" || options.yAxisScale == "linear"){
      _translate = "translate("+(_width-_legendWidth)+","+ _legendHeight+")";
    }else{
      _translate = "translate(10,"+(_height*(1-0.05))+")";
    }
    return _translate; 
  } 
  //----------------------------------------------------------------------------


  //........................ Get X Scale Function ................................
  static getXscale(_this){
    let options = _this.options;

    if (options.xAxisScale == "log"){
      var xBounds = d3.scaleLog();       
    }else if (options.xAxisScale == "linear"){
      var xBounds = d3.scaleLinear();
    }
    return xBounds;
  }
  //------------------------------------------------------------------------------ 




  //........................ Get X Scale Function ................................
  static getYscale(_this){
    let options = _this.options;

    if (options.yAxisScale == "log"){
      var yBounds = d3.scaleLog();       
    }else if (options.yAxisScale == "linear"){
      var yBounds = d3.scaleLinear();
    }
    return yBounds;
  }
  //------------------------------------------------------------------------------ 


  //..................... Get X Min and Max Values Functions ......................
  static getXextremes(_this){

    var x_max = d3.max(_this.data,function(ds,is){
      var tmp = d3.max(ds,function(dp,ip){
        return dp[0];
      });
      return tmp;
    });
    
    var x_min = d3.min(_this.data,function(ds,is){
      var tmp = d3.min(ds,function(dp,ip){
        return dp[0];
      });
      return tmp;
    });

    return [x_min,x_max];               // Return an array of the min and max values
  }
  //-------------------------------------------------------------------------------


  //.................... Get Y Min and Max Values  Functions ......................
  static getYextremes(_this){
    var y_max = d3.max(_this.data,function(ds,is){
      var tmp = d3.max(ds,function(dp,ip){
        return dp[1];
      });
      return tmp;
    });
    
    var y_min = d3.min(_this.data,function(ds,is){
      var tmp = d3.min(ds,function(dp,ip){
        return dp[1];
      });
      return tmp;
    });

    return [y_min,y_max];               // Return an array of the min and max values
  }
  //-------------------------------------------------------------------------------




  //...................... Highlight a Selected Line ...........................
  static makeSelection(_this,selectedId){
    
    var selected = d3.select(_this.allData)
        .select("#"+selectedId);
   
    let linewidthCheck = selected.select(".line")
        .attr("stroke-width");
    
    
    D3LinePlot.plotSelectionReset(_this);
    
    if (linewidthCheck == _this.options.linewidthSelection){
      return;
    }
    
     
    //......... Increase Line Width and Dot size of Selected Plot ..............

     selected.select(".line")                    
      .attr("stroke-width",_this.options.linewidthSelection);

      selected.selectAll(".dot")                 
      .attr("r",_this.options.pointRadiusSelection);             

      selected.raise();                          
    //--------------------------------------------------------------------------
    
    
    var legendExists = !d3.select(_this.legend).select(".legend-entry").empty();
    
    //............. Increase Line Width and Circle Size on Legend ..............
    if (legendExists){
      var leg = d3.select(_this.legend)
          .select("#"+selectedId);                   

      leg.select(".legend-line")                    
        .attr("stroke-width",_this.options.linewidthSelection);

      leg.select(".legend-circle")                  
        .attr("r",_this.options.pointRadiusSelection);     
      
      leg.select(".legend-text")                    
        .style("font-weight","bold");               
    }
    //--------------------------------------------------------------------------
  }
  //---------------------- End: Highlight a Selected Line ----------------------




  //.................. Remove Highlight from Selected Line .....................
  static plotSelectionReset(_this){

    var svg = d3.select(_this.svg);
    
    //.................. Resize All Lines and Dots in Plot .....................
    svg.selectAll(".line")   
      .attr("stroke-width",_this.options.linewidth); 
   
    svg.selectAll(".dot")            
      .attr("r",_this.options.pointRadius);       
    //--------------------------------------------------------------------------

    //.................... Resize Lines and Dots in the Legend .................
    var legendExists = !d3.select(_this.legend).select(".legend-entry").empty();
    if (legendExists){
      var leg = svg.select(".legend")
        .selectAll(".legend-entry");
      
        leg.select(".legend-text") 
        .style("font-weight","initial");

        leg.select(".legend-line")     
        .attr("stroke-width",_this.options.linewidth);

        leg.select(".legend-circle")   
        .attr("r",_this.options.pointRadius);   
    }
    //--------------------------------------------------------------------------
  }
  //------------------ End: Remove Highlight from Selected Line ----------------




}



