'use strict';




/**
* @class D3LinePlot
*
* @extends D3View 
*
* @classdesc Creates the SVG elements inside the D3View panel body
*
* @argument containerEL {Element}
*     DOM selection of container element for plots
*
*
* @property allDataEl {Element}
*        DOM selection of the SVG all-data class
*
* @property data {Array<Array<Number>>}
*        default [] <br>
*        array of array of x,y coordinates:  <br>  
*        [ [x1,y1], [x2,y2], ... ]
*
* @property labels {Array<String>}
*        default [] <br>
*        array of strings cooresponding to each data set in data: <br>
*        ["Line 1","Line 2", ... ]
*
* @property legendEl {Element}
*        DOM selection of the SVG legend class 
*
* @property plotEl {Element}
*        DOM selection of the SVG plot class 
*
* @property svgEl {Element}
*        DOM selection of the main SVG element, class D3LinePlot
*
* @property tableEl {Element}
*        DOM selection of the data table, class data-table 
*
* @property tableBodyEl {Element}
*        DOM selection of the data table body, class data-table-body
*
* @property tooltipEl {Element}
*        DOM selection of the SVG d3-tooltip class
*
* @property xAxisEl {Element}
*        DOM selection of the SVG x-axis class
* 
* @property xLabel {String}
*        string for x-label
*
* @property yAxisEl {Element}
*        DOM selection of the SVG y-axis class 
*
* @property yLabel {String}
*        string for y-label
*
* @author Brandon Clayton
*/
class D3LinePlot extends D3View{
  
  
  //..................... D3LinePlot Constructor ...............................
  constructor(containerEl,
      options,
      plotOptionsUpper,
      plotOptionsLower){


    //............................ Variables ...................................
    let _this,
        // Variables
        _dataD3,
        _plotD3,
        _svgD3,
        _table,
        _xD3,
        _yD3;
         
    _this = super(containerEl,
        options,
        plotOptionsUpper,
        plotOptionsLower);

    _this.allDataEl; 
    _this.legendEl;
    _this.plotEl;
    _this.svgEl; 
    _this.tableEl;
    _this.tableBodyEl;
    _this.tooltipEl;
    _this.xAxisEl;
    _this.yAxisEl;
   
    // properties that must be set before 
    // calling plotData 
    _this.metadata;
    _this.plotFileName;
    _this.title;
    
    _this.lowerPanel.data;
    _this.lowerPanel.dataTableTitle;
    _this.lowerPanel.labels;
    _this.lowerPanel.ids;
    _this.lowerPanel.xLabel;
    _this.lowerPanel.yLabel;
    
    _this.upperPanel.data;
    _this.upperPanel.dataTableTitle;
    _this.upperPanel.labels;
    _this.upperPanel.ids;
    _this.upperPanel.xLabel;
    _this.upperPanel.yLabel;
    //--------------------------------------------------------------------------
   
   
    //........................ Data Table ...................................... 
    _table = d3.select(_this.plotBodyEl)
        .append("div")
        .attr("class","data-table hidden");
    //--------------------------------------------------------------------------


    //......................... SVG Outline for Plot ...........................
    let lpOptions = _this.lowerPanel.options;
    _this.lowerPanel.svgHeight = lpOptions.plotHeight;
    _this.lowerPanel.svgWidth = lpOptions.plotWidth; 
    _this.lowerPanel.plotHeight = _this.lowerPanel.svgHeight-
        lpOptions.marginTop - lpOptions.marginBottom;
    _this.lowerPanel.plotWidth = _this.lowerPanel.svgWidth-
        lpOptions.marginLeft - lpOptions.marginRight;
    
    let upOptions = _this.upperPanel.options;
    _this.upperPanel.svgHeight = upOptions.plotHeight;
    _this.upperPanel.svgWidth = upOptions.plotWidth; 
    _this.upperPanel.plotHeight = _this.upperPanel.svgHeight-
        upOptions.marginTop - upOptions.marginBottom;
    _this.upperPanel.plotWidth = _this.upperPanel.svgWidth-
        upOptions.marginLeft - upOptions.marginRight;
    
    _svgD3 = d3.select(_this.plotBodyEl)
        .selectAll(".panel-body")
        .append("svg")
        .attr("class","D3LinePlot")
        .attr("version",1.1)                                                      
        .attr("xmlns","http://www.w3.org/2000/svg")                               
        .attr("preserveAspectRatio","xMinYMin meet");
    
    d3.select(_this.upperPanel.plotBodyEl)
        .select(".D3LinePlot")
        .attr("viewBox","0 0 "+_this.upperPanel.svgWidth
            +" " + _this.upperPanel.svgHeight);

    if(_this.options.plotLowerPanel){
      d3.select(_this.lowerPanel.plotBodyEl)
          .select(".D3LinePlot")
          .attr("viewBox","0 0 "+_this.lowerPanel.svgWidth
              +" " + _this.lowerPanel.svgHeight);
    }else{
      d3.select(_this.lowerPanel.plotBodyEl)
          .remove();
    }

    _plotD3 = _svgD3.append("g")
        .attr("class","plot");

    _dataD3 = _plotD3.append("g")
        .attr("class","all-data");

    // X-axis
    _xD3 = _plotD3.append("g")
        .attr("class","x-axis");
    _xD3.append("g")
        .attr("class","x-tick")
        .append("text")
        .attr("class","x-label")
        .attr("fill","black");
         
    // Y-axis
    _yD3 = _plotD3.append("g")
        .attr("class","y-axis");
    _yD3.append("g")
        .attr("class","y-tick")
        .append("text")
        .attr("class","y-label")
        .attr("fill","black");

    _plotD3.append("g")
        .attr("class","legend"); 

    _plotD3.append("g")
        .attr("class","d3-tooltip"); 
    //--------------------------------------------------------------------------


    //........... Rescale (log/linear) the X Axis on Button Click ..............
    d3.select(_this.plotFooterEl)
        .selectAll(".x-axis-btns")
        .on("click",function(){
          d3.select(_this.plotFooterEl)
              .selectAll(".x-axis-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          let options = _this.options.syncXAxis ? _this.options :
              _this.upperPanel.options;
               
          options.xAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          
          if (_this.options.plotLowerPanel && _this.options.syncXAxis)
            D3LinePlot.plotRedraw(_this, _this.lowerPanel);
          
          D3LinePlot.plotRedraw(_this, _this.upperPanel);
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
          
          let options = _this.options.syncYAxis ? _this.options :
              _this.upperPanel.options;
          
          options.yAxisScale = d3.select(this)
              .select("input")
              .attr("value");
          
          if (_this.options.plotLowerPanel && _this.options.syncYAxis)
            D3LinePlot.plotRedraw(_this, _this.lowerPanel);
          
          D3LinePlot.plotRedraw(_this, _this.upperPanel);
        }); 
    //--------------------------------------------------------------------------

     
    //................ Switch Between Plot and Data on Click ................... 
    d3.select(_this.plotFooterEl)
        .selectAll(".plot-data-btns")
        .on("click",function(d,i){
          let _selectedValue = d3.select(this)
              .select("input")
              .attr("value");
          
          d3.select(_this.plotFooterEl)
              .selectAll(".plot-data-btns")                                        
              .select("label")                                                  
              .classed("active",false);
          
          if (_selectedValue == "plot"){
            d3.select(_this.tableEl)
                .classed("hidden",true);
            d3.select(_this.upperPanel.plotBodyEl)
                .classed("hidden",false);
            
            if (_this.options.plotLowerPanel) 
              d3.select(_this.lowerPanel.plotBodyEl)
                  .classed("hidden",false);
          }else{
            d3.select(_this.tableEl)
                .selectAll("table")
                .remove();
            D3LinePlot.dataTable(_this, _this.upperPanel);
            if (_this.options.plotLowerPanel){ 
              D3LinePlot.dataTable(_this, _this.lowerPanel);
              
              d3.select(_this.lowerPanel.plotBodyEl)
                  .classed("hidden",true);
            }
            d3.select(_this.tableEl)
                .classed("hidden",false);
            d3.select(_this.upperPanel.plotBodyEl)
                .classed("hidden",true);
          }
        });
    //--------------------------------------------------------------------------
    
    
    //.......................... Save Figure ...................................
    d3.select(_this.saveAsMenuEl)
        .selectAll("a")
        .on("click",function(){
          if (this.className == "data") {
            d3.select(_this.tableEl)
                .selectAll("table")
                .remove();
            D3LinePlot.dataTable(_this, _this.upperPanel);
            if (_this.options.plotLowerPanel)
              D3LinePlot.dataTable(_this, _this.lowerPanel);
            D3LinePlot.saveData(_this, this.id);
          }
          else {
            D3LinePlot.saveFigure(_this, _this.upperPanel, this.id);
            if (_this.options.plotLowerPanel && 
                  _this.options.printLowerPanel){
              D3LinePlot.saveFigure(_this, _this.lowerPanel, this.id);
            }
          }
        });
    //--------------------------------------------------------------------------
   
   
    

    //....................... DOM Elements ..................................... 
    let svgUpperEl = _this.upperPanel
        .plotBodyEl.querySelector(".D3LinePlot"); 
    let svgLowerEl = _this.lowerPanel
        .plotBodyEl.querySelector(".D3LinePlot"); 
    _this.tableEl = _this.plotBodyEl.querySelector(".data-table");

    _this.lowerPanel.allDataEl = svgLowerEl.querySelector(".all-data");
    _this.lowerPanel.legendEl = svgLowerEl.querySelector(".legend");
    _this.lowerPanel.plotEl = svgLowerEl.querySelector(".plot");
    _this.lowerPanel.svgEl = svgLowerEl;
    _this.lowerPanel.tooltipEl = svgLowerEl.querySelector(".d3-tooltip");
    _this.lowerPanel.xAxisEl = svgLowerEl.querySelector(".x-axis");
    _this.lowerPanel.yAxisEl = svgLowerEl.querySelector(".y-axis");
    
    _this.upperPanel.allDataEl = svgUpperEl.querySelector(".all-data");
    _this.upperPanel.legendEl = svgUpperEl.querySelector(".legend");
    _this.upperPanel.plotEl = svgUpperEl.querySelector(".plot");
    _this.upperPanel.svgEl = svgUpperEl;
    _this.upperPanel.tooltipEl = svgUpperEl.querySelector(".d3-tooltip");
    _this.upperPanel.xAxisEl = svgUpperEl.querySelector(".x-axis");
    _this.upperPanel.yAxisEl = svgUpperEl.querySelector(".y-axis");
    //--------------------------------------------------------------------------
  
  
  }
  //--------------------- End: D3LinePlot Constructor --------------------------
  
  

  //................... Method: Create Data Table .............................. 
  /**
  * @method dataTable
  *
  * @description Create a table of the data to show
  * in place of the plot when the data 
  * button is pressed
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  */
  static dataTable(linePlot, panel){
    let _this,
        // Variables
        _svgHeight,
        _svgWidth,
        _tableRowX,
        _tableRowY;

    _this = linePlot;
  
    if (!panel.options.showData) return; 
   
    let rect = _this.plotBodyEl.getBoundingClientRect();
    _this.plotRatio = rect.width / rect.height;
    
    // Update table height and width
    d3.select(_this.tableEl)
        .style("height", rect.height+"px")
        .style("width", rect.width+"px");
    
    // Remove table rows
    d3.select(_this.tableBodyEl)
        .selectAll("tr")
        .remove(); 
  
    // Create table
    
    panel.data.forEach(function(dataSet,ids){
    let tableBodyD3 = d3.select(_this.tableEl)
          .append("table")
          .attr("class","table table-bordered table-condensed")
          .append("tbody")
          .attr("class","data-table-body")
    
    if(ids == 0){
      tableBodyD3.append("tr")
            .append("th")
            .attr("class", "data-table-title")
            .attr("colspan",dataSet.length+1)
            .text(panel.dataTableTitle);
    }
    
    tableBodyD3.append("tr")
          .append("th")
          .attr("colspan",dataSet.length+1)
          .text(panel.labels[ids]);

      _tableRowX = tableBodyD3.append("tr");
      _tableRowX.append("td")
          .attr("nowrap","true")
          .text(panel.options.tooltipText[1]);
      
      _tableRowY = tableBodyD3.append("tr");
      _tableRowY.append("td")
          .attr("nowrap","true")
          .text(panel.options.tooltipText[2]);
     
           
      dataSet.forEach(function(dataPair,idp){
        _tableRowX.append("td")
            .text(dataPair[0]);
        _tableRowY.append("td")
            .text(dataPair[1]);
        
      })
     
    });
    
  }
  //----------------- End Method: Create Data Table ----------------------------



  //...................... Method: Remove Plot and Variables ...................
  /**
  * @method destroy
  *
  * @description Remove the plot from the DOM, 
  * set all variables in the D3LinePlot
  * object to null, and disconnect any
  * observers.
  */
  destroy(){
    let _this,
        _obj; 
        
    _this = this;
    _this.plotObserver.disconnect();
    d3.select(_this.el)
        .remove();
    _this = null;
  }
  //--------------- End Method: Remove Plot and Variable -----------------------



  //................... Method: Get X Extreme Values ...........................
  /**
  * @method getXExtremes
  *
  * @description Find the maximum and minimum
  * X values.
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @return {Array<Number>}
  *     pair of X extreme values: <br>
  *     [X min,X max]
  */
  static getXExtremes(data){
    let _tmp,
        _xMax,
        _xMin;
  
    // Find X max
    _xMax = d3.max(data,function(ds,is){
      _tmp = d3.max(ds,function(dp,ip){
        return dp[0];
      });
      return _tmp;
    });
    
    // Find X min
    _xMin = d3.min(data,function(ds,is){
      _tmp = d3.min(ds,function(dp,ip){
        return dp[0];
      });
      return _tmp;
    });

    if (_xMin == _xMax && _xMin != 0 && _xMin != 0){
      [_xMin,_xMax] = [_xMin/1.1,_xMax*1.1]; 
    }else if (_xMin == _xMax && _xMin == 0 && _xMax == 0){
      [_xMin,_xMax] = [-1.0,1.0] 
    }

    return [_xMin,_xMax];   
  }
  //------------------ End Method: Get X Extreme Values ------------------------
  
  
  
  //...................... Method: Get X Scale .................................
  /**
  * @method getXScale
  *
  * @description Find which X scale to use log/linear
  * based on options.xAxisScale
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @return {Object}
  *     D3 scale object <br>
  *     d3.scaleLinear or d3.scaleLog for X axis
  */
  static getXScale(_this, panel){
    let _xBounds,
        options;

    if (_this.options.syncXAxis){
      options = _this.options;
    }else{
      options = panel.options;
    }

    _xBounds = options.xAxisScale == "linear" 
        ? d3.scaleLinear() : d3.scaleLog();
    
    return _xBounds;
  }
  //-------------------- End Method: Get X Scale ------------------------------- 


  
  //................... Method: Get Y Extreme Values ...........................
  /**
  * @method getYExtremes
  *
  * @description Find the maximum and minimum
  * Y values.
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @return {Array<Number>}
  *     pair of Y extreme values: <br>
  *     [Y min,Y max]
  */
  static getYExtremes(data){
    let _tmp,
        _yMax,
        _yMin;
  
    // Find Y max
    _yMax = d3.max(data,function(ds,is){
      _tmp = d3.max(ds,function(dp,ip){
        return dp[1];
      });
      return _tmp;
    });
    
    // Find Y min
    _yMin = d3.min(data,function(ds,is){
      _tmp = d3.min(ds,function(dp,ip){
        return dp[1];
      });
      return _tmp;
    });
    
    [_yMin,_yMax] = _yMin == _yMax ? [_yMin/1.1,_yMax*1.1] : [_yMin,_yMax];
    return [_yMin,_yMax];   
  }
  //------------------ End Method: Get Y Extreme Values ------------------------
  
  
  
  //................... Method: Get Y Scale ....................................
  /**
  * @method getYScale
  *
  * @description Find which Y scale to use log/linear
  * based on options.yAxisScale
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @return {Object}
  *     D3 scale object <br>
  *     d3.scaleLinear or d3.scaleLog for Y axis
  */
  static getYScale(_this, panel){
    let _yBounds,
        options;
    
    if (_this.options.syncYAxis){
      options = _this.options;
    }else{
      options = panel.options;
    }

    _yBounds = options.yAxisScale == "linear" 
        ? d3.scaleLinear() : d3.scaleLog();
    
    return _yBounds;
  }
  //-------------------- End Method: Get Y Scale ------------------------------- 

 
 
  //............... Method: Calculate Legend Location Translate ................
  /**
  * @method legendLocation
  *
  * @description Calculate the translation needed for
  * the legend location
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @argument plotHeight {Number}
  *     plot height in pixels
  *
  * @argument plotWidth {Number}
  *     plot width in pixels
  *
  * @return {String}
  *         string of translation:
  *         "translate(X,Y)"
  */
  static legendLocation(linePlot,plotHeight,plotWidth){
    let _legendGeom,
        _legendWidth,
        _legendHeight,
        _options,
        _translate,
        _xTranslate,
        _yTranslate;

    _options = linePlot.options;
    let scale = linePlot.scale;
    _legendGeom = linePlot.legendEl 
        .getBoundingClientRect();
    _legendWidth  = _legendGeom.width*scale;
    _legendHeight = _legendGeom.height*scale;
  
    if (_options.legendLocation == "topright"){
      _xTranslate = (plotWidth-_legendWidth-_options.legendOffset);
      _yTranslate = _options.legendOffset;
    }else if(_options.legendLocation == "topleft"){
      _xTranslate = _options.legendOffset;
      _yTranslate =_options.legendOffset;
    }else if(_options.legendLocation == "bottomleft"){
      _xTranslate = _options.legendOffset;
      _yTranslate = (plotHeight-_legendHeight-_options.legendOffset);
    }else if(_options.legendLocation == "bottomright"){
      _xTranslate = (plotWidth-_legendWidth-_options.legendOffset);
      _yTranslate = (plotHeight-_legendHeight-_options.legendOffset);
    }
  
    _translate = "translate("+_xTranslate+","+_yTranslate+")";

    return _translate; 
  } 
  //----------------- End Method: Legend Translate -----------------------------



  //...................... Method: Plot Data ...................................
  /**
  * @method plotData
  *
  * @description Plot the data
  *
  * @property color {Array<String>}
  *     array of hex strings representing colors, uses d3 schemes <br>
  *     uses d3.schemeCategory10 or 20 based on data sets
  *
  * @property labels {Array<String>}
  *     array of strings based on the labels parameters <br>
  *     labels parameters white spaces are replaced with underscores 
  *                
  * @property line {Function}
  *     d3 function for the line 
  *
  * @property xBounds {Object}
  *     D3 scale object <br>
  *     uses the d3 scale returned by getXScale method
  *
  * @property xExtremes {Array<Number>}
  *     array of X extreme values returned by getXExtremes method
  *
  * @property yBounds {Object}
  *     D3 scale object  <br>
  *     uses the d3 scale returned by getYScale method
  *
  * @property yExtremes {Array<Number>}
  *     array of X extreme values returned by getYExtremes method
  *
  */
  plotData(panel, xDomain, yDomain){


    //.......................... Variables .....................................
    let _this,
        // Variables
        _dotsEnter,
        _linesEnter,
        _ndata,
        _plotHeight,
        _plotWidth,
        _selectedId,
        _seriesEnter,
        _selectedValue,
        _tooltip,
        options;
    
    _this = this;
    _this.color;
    _this.line;
    _this.xBounds;
    _this.xExtremes;
    _this.yBounds;
    _this.yExtremes;
    
    _this.plotTitleEl.textContent = _this.title;
    
    options = panel.options;
    
    // Get color scheme
    _ndata = panel.data.length;           
    panel.color = _ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    //--------------------------------------------------------------------------

    
    //...................... Make Visible ......................................
    d3.select(_this.el)
        .classed("hidden",false);
         
    d3.select(_this.tableEl)
        .classed("hidden",true);
    
    d3.select(panel.plotBodyEl)
        .classed("hidden",false);
    
    d3.select(_this.plotFooterEl)
        .selectAll(".plot-data-btns")                                        
        .select("label")                                                  
        .classed("active",function(d,i){
          if (d3.select(this).select("input").attr("value") == "plot")
            return true;
          else
            return false;  
        });
    
    //--------------------------------------------------------------------------


    //................. D3 Function: Line Function .............................
    panel.line = d3.line()                            
      .defined(function(d,i) {return d[1] != null})  
      .x(function(d,i) {return panel.xBounds(d[0])})        
      .y(function(d,i) {return panel.yBounds(d[1])});      
    //-------------------------------------------------------------------------- 
  

    //........................ Get Values ......................................
    panel.xBounds = D3LinePlot.getXScale(_this, panel);
    panel.xExtremes = xDomain || D3LinePlot.getXExtremes(panel.data);
    panel.xBounds.range([0, panel.plotWidth])
        .domain(panel.xExtremes)
        .nice();

    panel.yBounds = D3LinePlot.getYScale(_this, panel);
    panel.yExtremes = yDomain || D3LinePlot.getYExtremes(panel.data);
    panel.yBounds.range([panel.plotHeight, 0])
        .domain(panel.yExtremes)
        .nice();
    //-------------------------------------------------------------------------- 
  

    //...................... Update SVG Size and Translate ..................... 
    d3.select(panel.svgEl)
        .select(".plot")
        .attr("transform","translate("+
            options.marginLeft+","+ options.marginTop+")")  
    //--------------------------------------------------------------------------
        
    
    //............................ Plot Data ................................... 
    // Remove any data
    d3.select(panel.allDataEl)
        .selectAll(".data")
        .remove();
    
    // Create data groups
    _seriesEnter = d3.select(panel.allDataEl)
        .selectAll("g")
        .data(panel.data)
        .enter()
        .append("g")
        .attr("class","data")
        .attr("id",function(d,i){return panel.ids[i]})
        .style("cursor","pointer");
    
    // Plot lines
    _seriesEnter.append("path")
        .attr("class","line")
        .attr("d", panel.line)
        .attr("id",function(d,i){return panel.ids[i]})
        .attr("stroke",function(d,i){return panel.color[i]} )
        .attr("stroke-width",options.linewidth)
        .style("shape-rendering","geometricPrecision")
        .attr("fill","none");
   
    // Plot cirles
    _seriesEnter.selectAll("circle")
        .data(function(d,i){return d})
        .enter()
        .filter(function(d,i){return d[1] != null})
        .append("circle")
        .attr("class","dot")
        .attr("id",function(d,i){
          return d3.select(this.parentNode.firstChild).attr("id");
        })
        .attr("cx", panel.line.x())
        .attr("cy", panel.line.y())
        .attr("r", options.pointRadius)
        .attr("fill", function(d,i){
          return d3.select(this.parentNode.firstChild).style("stroke");
        });
    
    
    
    D3LinePlot.getScale(panel);
    //--------------------------------------------------------------------------
    
    
    //......................... Set the Tick Marks .............................
    // X Tick Marks     
    let xAxisTranslate = panel.options.xAxisLocation == "top" ? 
        0 : panel.plotHeight;
    d3.select(panel.xAxisEl)
        .select(".x-tick")
        .attr("transform", "translate(0, " + xAxisTranslate + ")" ) 
        .style("font-size", options.tickFontSize)
        .call(D3LinePlot.getXAxisLocation(panel));
    
    // Y Tick marks
    d3.select(panel.yAxisEl)
        .select(".y-tick")
        .style("font-size", options.tickFontSize)
        .call(D3LinePlot.getYAxisLocation(panel));
    
    // Set tick mark format
    D3LinePlot.setTicks(_this, panel, "x"); 
    D3LinePlot.setTicks(_this, panel, "y"); 
    //--------------------------------------------------------------------------
    

    //............................ Set the Labels .............................. 
    // X Label
    panel.xAxisHeight = d3.select(panel.xAxisEl)
        .selectAll(".tick")
        .node()
        .getBoundingClientRect()
        .height;
    panel.xAxisHeight = panel.xAxisHeight * panel.scale;  
    let xLabelLoc = panel.options.xAxisLocation == "bottom" ?
        options.marginBottom - (options.marginBottom - panel.xAxisHeight)/2 :
        - (panel.xAxisHeight + options.marginTop)/2; 
    
    d3.select(panel.xAxisEl)
        .select(".x-label")
        .attr("text-anchor","middle")
        .attr("alignment-baseline","middle")
        .style("font-size", options.labelFontSize)
        .style("font-weight","500")
        .attr("x", panel.plotWidth/2) 
        .attr("y", xLabelLoc)
        .text(panel.xLabel);
    
    // Y Label
    panel.yAxisWidth = d3.select(panel.yAxisEl)
        .selectAll(".tick")
        .node()
        .getBoundingClientRect()
        .width;  
    panel.yAxisWidth = panel.yAxisWidth * panel.scale;  
   
     
    d3.select(panel.yAxisEl)
        .select(".y-label")
        .attr("transform","rotate(-90)")
        .attr("alignment-baseline","middle")
        .attr("text-anchor","middle")
        .style("font-size", options.labelFontSize)
        .style("font-weight","500")
        .attr("x",0- panel.plotHeight/2)
        .attr("y",-1*(options.marginLeft-
            (options.marginLeft-panel.yAxisWidth)/2))
        .text(panel.yLabel);
    //--------------------------------------------------------------------------

    
    // Create legend 
    if (options.showLegend) D3LinePlot.setLegend(_this, panel);
  
  
    //.................. Highlight Line when Selected on Plot ..................
    if (!_this.options.syncSelections){ 
      d3.select(panel.allDataEl)
          .selectAll(".data")
          .on("click",function(d,i){ 
            _selectedId = d3.select(this).attr("id");
            D3LinePlot.plotSelection(panel, _selectedId);        
          });
    }
    //--------------------------------------------------------------------------


    //.......................... Tooltip .......................................
    d3.select(panel.allDataEl)
        .selectAll(".data")
        .selectAll(".dot")
        .on("mouseover",function(d,i){
          D3LinePlot.getScale(panel);
          _tooltip =  new Tooltip(panel, this); 
          _tooltip.increaseRadius(panel);
        })
        .on("mouseout",function(d,i){
            _tooltip.decreaseRadius(panel);
            _tooltip.destroy(panel);
        });
    //--------------------------------------------------------------------------

    
    
  
    //........................ On resize ....................................... 
    $(window).resize(function(){
      D3LinePlot.getScale(panel);
      let width = _this.plotBodyEl.getBoundingClientRect().width;
      let height = width/_this.plotRatio; 
      // Update table height and width
      d3.select(_this.tableEl)
          .style("height",height+"px")
          .style("width",width+"px");
    });
    //--------------------------------------------------------------------------
 
  
  }
  //---------------- End Method: Plot Data -------------------------------------


 
  //..................... Method: Plot Redraw ..................................
  /**
  * @method plotRedraw
  *
  * @description Redraw the plot
  *
  * Updates the following:
  *   - X bounds
  *   - Y bounds
  *   - Y bounds
  *   - X axis
  *   - Y axis
  *   - Lines
  *   - Circles
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @property xBounds {Object}
  *     D3 scale object <br>
  *     udpates the xBounds <br>
  *     uses the d3 scale returned by getXScale method
  *
  * @property yBounds {Object}
  *     D3 scale object <br>
  *     udpates the yBounds <br>
  *     uses the d3 scale returned by getYScale method
  */
  static plotRedraw(_this, panel){
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
    
    
    _options = panel.options;
    D3LinePlot.dataTable(_this, panel);
    _svgD3 = d3.select(panel.svgEl);
    
    // Update X bounds
    panel.xBounds = D3LinePlot.getXScale(_this, panel);
    panel.xBounds
        .range([0, panel.plotWidth])
        .domain(panel.xExtremes)
        .nice();
    
    // Update Y bounds
    panel.yBounds = D3LinePlot.getYScale(_this, panel);
    panel.yBounds
        .range([panel.plotHeight, 0])
        .domain(panel.yExtremes)
        .nice()
    
    // Update X axis
    _svgD3.select(".x-tick")  
        .call(D3LinePlot.getXAxisLocation(panel))
    
     
    // Update Y axis
    _svgD3.select(".y-tick")                                   
        .call(D3LinePlot.getYAxisLocation(panel));
    
    // Set tick mark format
    D3LinePlot.setTicks(_this, panel, "x"); 
    D3LinePlot.setTicks(_this, panel, "y"); 
    
    // Update lines 
    _svgD3.selectAll(".line")
        .transition()
        .duration(_options.transitionDuration)
        .attr("d",panel.line);
    
    // Update circles 
    _svgD3.selectAll(".dot")
        .transition()
        .duration(_options.transitionDuration)
        .attr("cx", panel.line.x())
        .attr("cy", panel.line.y());

  }
  //---------------- End Method: Plot Redraw -----------------------------------



  //................. Method: Highlight a Selected Line ........................
  /**
  * @method plotSelection
  *
  * @description Increases the linewidth and circle radius 
  * of a selected line or legend element based 
  * on options.linewidthSelection and options.pointRadiusSelection
  * 
  * If legend exists, will also increase line and circle
  *
  * If the line is already selected it will be reset 
  * to normal linewidth and circle radius based on 
  * options.linewidth and options.pointRadius
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @argument selectedId {String}
  *     string of the ID of the selected data 
  */
  static plotSelection(linePlot,selectedId){
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
  //---------------- End Method: Highlight a Selected Line ---------------------



  //........... Method: Remove Highlight from Selected Line ....................
  /**
  * @method plotSelectionReset
  *
  * @description Resets all the lines and circles in the plot
  * to original linewidth and radius based on 
  * options.linewidth and options.pointRadius.
  *
  * If the legend exsists, will reset the linewidth and 
  * circle radius as well.
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  */
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



  //................... Method: Replace Y values with null .....................
  /**
  * @method removeSmallValues
  *
  * @description Set values of the data under a specifed limit 
  * to null so they will not be graphed.
  * 
  * @argument limit {Number}
  *     any number at or below limit will be null 
  *
  */
  removeSmallValues(panel, limit){
    let _this;
    _this = this;
    
    panel.data.forEach(function(d,id){        
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
  /**
  * @method setLegend
  *
  * @description Create the legend using the labels
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  */
  static setLegend(_this, panel){
    let _xDrag,
        _yDrag,
        _legendD3,
        _legendGeom,
        _legendHeight,
        _legendWidth,
        _options,
        _nleg,
        _plotHeight,
        _plotWidth,
        _selectedId,
        _translate;

    _options = panel.options;
    _nleg = panel.labels.length-1; 
    _plotHeight = panel.plotHeight; 
    _plotWidth = panel.plotWidth;
    
    d3.select(panel.legendEl)
      .selectAll("*")
      .remove();
      
    let scale = panel.scale;

    _legendD3 = d3.select(panel.legendEl)
        .append("g")
        .attr("class", "legend-entries")
        .selectAll("g")
        .data(panel.labels)
        .enter()  
        .append("g") 
        .attr("class", "legend-entry")
        .attr("id", function(d,i){return panel.ids[i]})
        .style("cursor", "pointer")
        .style("font-size", _options.legendFontSize)
        .attr("transform", "translate("+(_options.legendPaddingX)
            +","+(_options.legendFontSize/2+_options.legendPaddingY)+")");
    
    // Legend Text
    _legendD3.append("text")
        .attr("class", "legend-text")
        .attr("x", 30)
        .attr("y", function(d,i){return _options.legendLineBreak*i})
        .attr("alignment-baseline", "central")
        .text(function(d,i){return panel.labels[i]});
     
    // Legend Line Indicator
    _legendD3.append("line")
        .attr("class","legend-line")
        .attr("x2",20)
        .attr("y1", function(d,i){return _options.legendLineBreak*i})
        .attr("y2", function(d,i){return _options.legendLineBreak*i})
        .attr("stroke-width",_options.linewidth)
        .attr("stroke",function(d,i){return panel.color[i]})
        .attr("fill","none");  
      
    // Legend Circle on the Line
    _legendD3.append("circle") 
        .attr("class","legend-circle")
        .attr("cx",10)
        .attr("cy",function(d,i){return _options.legendLineBreak*i}) 
        .attr("r",_options.pointRadius)
        .attr("fill",function(d,i){return panel.color[i]} );

    // Legend geometry 
    _legendGeom = panel.legendEl
        .getBoundingClientRect(); 
    _legendWidth = parseFloat(_legendGeom.width*scale 
        + 2 * _options.legendPaddingX);
    _legendHeight = parseFloat(_legendGeom.height*scale
        + 2 * _options.legendPaddingY);
    
    
    // Legend outline
    d3.select(panel.legendEl)
        .append("g")
        .attr("class","outlines")
        .append("rect")
        .attr("class","outer")
        .attr("height",_legendHeight)
        .attr("width",_legendWidth)
        .attr("stroke","#999")
        .attr("fill","white");
    
    d3.select(panel.legendEl)
        .select(".outlines")
        .append("rect")
        .attr("class","inner")
        .attr("height",_legendHeight-2 * _options.legendPaddingY)
        .attr("width",_legendWidth-2 * _options.legendPaddingX)
        .attr("x", _options.legendPaddingX)
        .attr("y", _options.legendPaddingY)
        .attr("fill","white")

    d3.select(panel.legendEl)
        .select(".outlines")
        .append("text")
        .attr("class","glyphicon drag")
        .attr("alignment-baseline","text-before-edge")
        .attr("fill","#999")
        .style("cursor","move")
        .text("\ue068")

    d3.select(panel.legendEl).raise();
    d3.select(panel.legendEl).select(".legend-entries").raise(); 

    // Set translation 
    _translate = D3LinePlot.legendLocation(
        panel, panel.plotHeight, panel.plotWidth);
    d3.select(panel.legendEl)
        .select(".legend-entries")
        .attr("transform",_translate); 
    d3.select(panel.legendEl)
        .select(".outlines")
        .selectAll("*")
        .attr("transform",_translate); 
    
    
    

    //.............. Highlight Line when Legend Entry Selected .................
    if(!_this.options.syncSelections){
      d3.select(panel.legendEl)
          .selectAll(".legend-entry")
          .on("click",function(d,i){ 
            _selectedId = d3.select(this).attr("id"); 
            D3LinePlot.plotSelection(panel, _selectedId);
          });
    }
    //--------------------------------------------------------------------------
    
   
    //........................ Drag Legend ..................................... 
    d3.select(panel.legendEl)
        .select(".drag")
        .call(d3.drag()
          .on("drag",function(){
            _plotHeight = panel.plotHeight; 
            _plotWidth = panel.plotWidth;
            _xDrag = d3.event.x;
            _xDrag = _xDrag < _options.legendOffset ? _options.legendOffset 
                : _xDrag > _plotWidth-_legendWidth-_options.legendOffset 
                ? _plotWidth-_legendWidth-_options.legendOffset : _xDrag; 
            _yDrag = d3.event.y;
            _yDrag = _yDrag < _options.legendOffset ? _options.legendOffset 
                : _yDrag > _plotHeight - _legendHeight-_options.legendOffset 
                ? _plotHeight-_legendHeight-_options.legendOffset : _yDrag; 
            
            d3.select(panel.legendEl)
                .select(".outlines")
                .selectAll("*")
                .attr("transform","translate("+_xDrag+","+_yDrag+")");
            
            d3.select(panel.legendEl)
                .select(".legend-entries")
                .attr("transform","translate("+_xDrag+","+_yDrag+")");
          }));
    //-------------------------------------------------------------------------- 
  
  } 
  //--------------- End Method: Create Legend ----------------------------------



  //........................ Method: saveFigure ................................
  static saveFigure(_this, panel, plotFormat){
    
    //......................... Variables ......................................
    let options,
        printDpi,
        plotWidth,
        plotHeight,
        svgHeight,
        svgWidth,
        marginTop,
        marginLeft,
        svgHtml,
        scalePlot,
        scaleDpi,
        plotTransform,
        plotTitle,
        footerText,
        nlines,
        svgD3,
        svgDivD3,
        canvasDivD3,
        canvasD3,
        canvasEl,
        canvasContext,
        svgImg,
        svgImgSrc,
        imgSrc,
        win,
        bodyEl,
        aEl,
        filename;
    
    aEl = document.createElement("a");
    filename = panel.plotFilename == null 
        ? "figure" : panel.plotFilename;
    aEl.download = filename; 
    options = panel.options;
    printDpi = plotFormat == "pdf" || plotFormat == "svg" 
        ? 96 : options.printDpi;
    plotWidth = options.printPlotWidth*printDpi;
    plotHeight = plotWidth/options.plotRatio;
    marginTop = options.printMarginTop*printDpi; 
    svgHeight = options.printFooter ? options.printHeight*printDpi :
        (plotHeight+marginTop);
    svgWidth = options.printWidth*printDpi;
    marginLeft = (svgWidth-plotWidth) + (options.printMarginLeft*printDpi);
    svgHtml = d3.select(panel.svgEl).node().outerHTML;
    scalePlot = plotWidth/panel.svgWidth;
    scaleDpi = printDpi/96;
    plotTransform = "translate("+marginLeft+","+marginTop+")"+
        " scale("+scalePlot+")";
    plotTitle = options.printTitle ? _this.plotTitleEl.textContent : "";
   
    
    //--------------------------------------------------------------------------

   
    //....................... SVG Printer Version .............................. 
    // Create copy of plot
    svgDivD3 = d3.select("body")
        .append("div")
        .attr("class","print-plot-svg hidden")
        .html(svgHtml);
    
    // Update svg height and width
    svgD3 = svgDivD3.select("svg")
        .attr("class","plot")
        .attr("preserveAspectRatio",null)
        .attr("viewBox",null)
        .style("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
        .attr("height",svgHeight)
        .attr("width",svgWidth)
    
    // Add plot title 
    svgD3.select(".plot")
        .attr("transform",plotTransform)
        .append("text")
        .attr("class","plot-title")
        .attr("x", panel.plotWidth/2)
        .attr("y",-40)
        .attr("text-anchor","middle")
        .attr("alignment-baseline","text-after-edge")
        .style("font-size",options.titleFontSize)
        .text(plotTitle);
  
    // Remove legend drag symbol
    svgD3.select(".drag")
      .remove(); 

    // Add print footer
    if (options.printFooter){
      let urlMaxChar = 120;
      let nbreaks = Math.ceil(panel.metadata.url.length/urlMaxChar);
      
      footerText = [];
      //footerText.push(
      //    "Created with: nshmp-haz version "+linePlot.metadata.version);
      
      for (let jc = 0; jc<nbreaks;jc++){
        footerText.push(
            panel.metadata.url.slice(urlMaxChar*jc,urlMaxChar*(jc+1)));
      }
      footerText.push(panel.metadata.time);
      
      nlines = footerText.length;
      
      svgD3.append("g")
          .attr("class","print-footer")
          .style("font-size",options.printFooterFontSize*scaleDpi)
          .attr("transform","translate("+
              (options.printFooterPadding*scaleDpi)+","+
              (svgHeight-options.printFooterPadding*scaleDpi)+")")
          .selectAll("text")
          .data(footerText)
          .enter()
          .append("text")
          .text(function(d,i){return footerText[nlines-i-1]})
          .attr("y",function(d,i){
              return -options.printFooterLineBreak*i*scaleDpi
          });
    }
    //-------------------------------------------------------------------------- 
   
    
    //........................ Canvas Container ................................ 
    let printHeight = options.printFooter ? options.printHeight :
        (plotHeight/printDpi+options.printMarginTop);
    
    canvasDivD3 = d3.select("body")
        .append("div")
        .attr("class","svg-to-canvas hidden");
    canvasD3 = canvasDivD3.append("canvas")
        .attr("height",svgHeight)
        .attr("width",svgWidth)
        .style("height",printHeight+"in")
        .style("width",options.printWidth+"in");

    canvasEl = canvasD3.node();
    canvasContext = canvasEl.getContext("2d");
    //-------------------------------------------------------------------------

    
    //.......................... Print SVG .....................................
    // Create an image from SVG 
    svgHtml = svgD3.node().outerHTML;
    svgImgSrc = "data:image/svg+xml;base64,"+ btoa(svgHtml);                 
    svgImg = new Image();
    svgImg.src = svgImgSrc; 
    // Make SVG into desired format
    svgImg.onload = function(){
      svgDivD3.remove();
      canvasDivD3.remove();
      canvasContext.fillStyle = "white";
      canvasContext.fillRect(0,0,svgWidth,svgHeight);
      canvasContext.drawImage(svgImg,0,0);
      
      switch (plotFormat){
        // SVG
        case "svg":
          imgSrc = svgImgSrc 
          aEl.href = imgSrc;
          aEl.click();
          break;
        // JPEG or PNG
        case "png":
        case "jpeg":
          imgSrc = canvasEl.toDataURL("image/"+plotFormat,1.0);
          aEl.href = imgSrc;
          aEl.click();
          break;
        // PDF
        case "pdf":
          win = window.open();
          bodyEl = win.document.body;
          bodyEl.style.margin = 0;
          win.document.head.innerHTML = "<style>@Page{margin:0;}</style>";
          win.document.title = filename;
          d3.select(bodyEl)
              .append("div")
              .attr("class","svg-img")
              .html(svgImg.outerHTML);
          win.print();
          win.close();
      }
    }  
    //--------------------------------------------------------------------------
      
  }
  //--------------------- End Method: saveFigure -------------------------------

  
  
  //......................... Method: saveData .................................
  static saveData(linePlot,fileType){

    //............................. Variables ..................................
    let aEl,
        delimiter,
        file,
        filename,
        tableRows,
        tableRowsEl;
    
    delimiter = fileType == "tsv" ? "\t" : ",";
    file = []; 
    filename = linePlot.plotFilename == null 
        ? "data" : linePlot.plotFilename;
    tableRowsEl = linePlot.tableEl.querySelectorAll("tr");
    //--------------------------------------------------------------------------
    
    //......................... Create File ....................................
    tableRowsEl.forEach(function(row,ir){
      tableRows = [];
      row.querySelectorAll("th,td").forEach(function(dp,idp){
        tableRows.push(dp.innerText);
      })
      file.push(tableRows.join(delimiter));
    });
    
    file = new Blob([file.join("\n")],{type:"text/"+fileType});
    //--------------------------------------------------------------------------

    //...................... Download File .....................................
    aEl = document.createElement("a");
    aEl.download = filename+"."+fileType;
    aEl.href = URL.createObjectURL(file);
    aEl.click();
    //--------------------------------------------------------------------------
    
  }
  //--------------------- End Method: saveData ---------------------------------




  //........................ Method: setTicsk ..................................
  static setTicks(_this, panel, axis){
    
    let options = _this.options["sync" + axis.toUpperCase() + "Axis"] 
        ? _this.options : panel.options;
         
    if (options[axis+"AxisScale"] == "log"){
      d3.select(panel.svgEl)
          .select("."+axis+"-axis")
          .selectAll(".tick text")
          .text(null)
          .filter(function(d){return Number.isInteger(Math.log10(d))} )
          .text(10)
          .append("tspan")
          .text(function(d) { return Math.round(Math.log10(d)); })
          .style("baseline-shift","super")
          .attr("font-size", panel.options.tickExponentFontSize);
    }
  }
  //-------------------- End Method: setTicks ----------------------------------



  //...................... Method: syncSelections ..............................
  syncSelections(_this){

    d3.select(_this.plotBodyEl)
        .selectAll(".data")
        .on("click",function(){
          let selectedId = d3.select(this).attr("id");
          D3LinePlot.plotSelection(_this.upperPanel, selectedId);
          D3LinePlot.plotSelection(_this.lowerPanel, selectedId);
        });
     
    d3.select(_this.plotBodyEl)
        .selectAll(".legend-entry")
        .on("click",function(d,i){
          let selectedId = d3.select(this).attr("id");
          if (_this.upperPanel.options.showLegend)
            D3LinePlot.plotSelection(_this.upperPanel, selectedId);
          
          if (_this.lowerPanel.options.showLegend)
            D3LinePlot.plotSelection(_this.lowerPanel, selectedId);
        });
  
  }
  //-------------------- End Method: syncSelections ---------------------------- 


  static getScale(panel){
    let svgGeom = panel.svgEl.getBoundingClientRect();
    let width = svgGeom.width;
    panel.scale = panel.svgWidth/width;
  }

  
  static getXAxisLocation(panel){
    return panel.options.xAxisLocation == "top" ? 
        d3.axisTop(panel.xBounds) : d3.axisBottom(panel.xBounds);
  }
  
  static getYAxisLocation(panel){
    return panel.options.yAxisLocation == "right" ? 
        d3.axisRight(panel.yBounds) : d3.axisLeft(panel.yBounds);
  }



}
//-------------------- End D3LinePlot Class ------------------------------------
