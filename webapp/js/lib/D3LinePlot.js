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
* @property observer {Object}
*        mutation observer to update the plots when a new plot is created
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
    _this.ids;
    _this.legendEl;
    _this.observer;
    _this.plotEl;
    _this.svgEl; 
    _this.tableEl;
    _this.tableBodyEl;
    _this.tooltipEl;
    _this.xAxisEl;
    _this.xLabel;
    _this.yAxisEl;
    _this.yLabel;
    
    // create an observer instance to resize
    // plot when other plots are added to the DOM
    _this.observer = new MutationObserver(function(mutations) {
        D3LinePlot.plotRedraw(_this);
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

    _this.observer.disconnect();
    _this.plotObserver.disconnect();

    d3.select(_this.el)
        .remove();

    for(_obj in _this){
      _this[_obj] = null;
    }
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
    _legendGeom = linePlot.legendEl 
        .getBoundingClientRect();
    _legendWidth  = _legendGeom.width;
    _legendHeight = _legendGeom.height;
  
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

    
    // Get color scheme
    _ndata = this.data.length;           
    _this.color = _ndata < 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    
    
    // Make visible
    d3.select(_this.el)
        .classed("hidden",false); 
    
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
        .attr("id",function(d,i){return _this.ids[i]})
        .style("cursor","pointer");
    
    // Plot lines
    _seriesEnter.append("path")
        .attr("class","line")
        .attr("d",_this.line)
        .attr("id",function(d,i){return _this.ids[i]})
        .attr("stroke",function(d,i){return _this.color[i]} )
        .attr("stroke-width",_this.options.linewidth)
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
        .style("font-size","1em")
        .style("font-weight","500")
        .attr("x", _plotWidth/2) 
        .attr("y", _plotHeight+_this.options.marginBottom/2+10)
        .text(_this.xLabel);
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
        .style("font-size","1em")
        .style("font-weight","500")
        .attr("x",0- _plotHeight/2)
        .attr("y",0- _this.options.marginLeft/2-10)
        .text(_this.yLabel);
    //--------------------------------------------------------------------------

    
    // Create legend 
    if (_this.options.showLegend) D3LinePlot.setLegend(_this);


    //................... Resize Plot on Window Resize ......................... 
    $(window).resize(function(){
      D3LinePlot.plotRedraw(_this);
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
          
          D3LinePlot.plotRedraw(_this,true);
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
          
          D3LinePlot.plotRedraw(_this,true);
        }); 
    //--------------------------------------------------------------------------
  
  
    //.................. Highlight Line when Selected on Plot ..................
    d3.select(_this.allDataEl)
        .selectAll(".data")
        .on("click",function(d,i){ 
          _selectedId = d3.select(this).attr("id");
          D3LinePlot.plotSelection(_this,_selectedId);        
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
            D3LinePlot.plotRedraw(_this);
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


 
  //....................... Method: Plot Height ................................
  /**
  * @method plotHeight
  *
  * @description Calculate the plot height based on the Bootstrap panel
  * header, body, and footer.
  *
  * If isSvg is true it will calculate the height of the svg element,
  * else will calculate the height for the plot based
  * on the options.marginTop and options.marginBottom.
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @argument isSvg {Boolean}
  *     whether to calculate for SVG element or plot 
  *
  * @return {Number}
  *         number in pixels of the height 
  */
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
  //--------------------- End Method: Plot Height ------------------------------



  //..................... Method: Plot Redraw ..................................
  /**
  * @method plotRedraw
  *
  * @description Redraw the plot
  *
  * If doTransition is true will transition at 0.5 seconds,
  * good for when changing the X/Y scale back and forth and 
  * not good when just resizing the plot.
  * <br>
  * Updates the following:
  *   - SVG height and width
  *   - X bounds
  *   - Y bounds
  *   - Y bounds
  *   - X axis
  *   - Y axis
  *   - Lines
  *   - Circles
  *   - Legend
  *   - Data table
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @argument doTransition {Boolean}
  *     wheather to transition when redrawing plot
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
  static plotRedraw(linePlot,doTransition){
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

    // Update svg height and width
    _svgD3 = d3.select(linePlot.svgEl);     
    _svgD3.attr("width", _svgWidth) 
        .attr("height",_svgHeight)

    // Update X bounds
    linePlot.xBounds = D3LinePlot.getXScale(linePlot);
    linePlot.xBounds
        .range([0,_plotWidth])
        .domain(D3LinePlot.getXExtremes(linePlot))
        .nice();

    // Update Y bounds
    linePlot.yBounds = D3LinePlot.getYScale(linePlot);
    linePlot.yBounds
        .range([_plotHeight,0])
        .domain(D3LinePlot.getYExtremes(linePlot))
        .nice()
    
    // Update X axis
    _svgD3.select(".x-tick")  
        .attr("transform","translate(0,"+ _plotHeight +")")
        .call(d3.axisBottom(linePlot.xBounds));
    _svgD3.select(".x-label")             
        .attr("x", _plotWidth/2.0)           
        .attr("y", _plotHeight+_options.marginBottom/2+10);                 

    // Update Y axis
    _svgD3.select(".y-tick")                                   
        .call(d3.axisLeft( linePlot.yBounds));
    _svgD3.select(".y-label")  
        .attr("x",0-_plotHeight/2)
        .attr("y",0-_options.marginLeft/2-10);
    
    // Update legend
    _legendTranslate = D3LinePlot
        .legendLocation(linePlot,_plotHeight,_plotWidth);
    _legendD3 = d3.select(linePlot.legendEl);

    _svgLineD3 = _svgD3.selectAll(".line");
    _svgDotD3  = _svgD3.selectAll(".dot");
   
    
    // Update lines, circles, and legend
    if (doTransition){
      _svgLineD3.transition()
          .duration(500)
          .attr("d",linePlot.line);
      _svgDotD3.transition()
          .duration(500)
          .attr("cx",linePlot.line.x())
          .attr("cy",linePlot.line.y());
          
    }else{
      _svgLineD3.attr("d",linePlot.line);
      _svgDotD3.attr("cx",linePlot.line.x())  
          .attr("cy",linePlot.line.y());     
      _legendD3.attr("transform",_legendTranslate);
    }

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






  //..................... Method: Plot Width ...................................
  /**
  * @method plotWidth
  *
  * @description Calculate the plot width based on the Bootstrap panel
  * body.
  *
  * If isSvg is true it will calculate the width of the svg element,
  * else will calculate the width for the plot based
  * on the options.marginLeft and options.marginLeft.
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  * @argument isSvg {Boolean}
  *     whether to calculate for SVG element or plot 
  *
  * @return {Number}
  *         number in pixels of the width 
  */
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
  //------------------- End Method: Plot Width ---------------------------------



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
  /**
  * @method setLegend
  *
  * @description Create the legend using the labels
  *
  * @argument linePlot {Object}
  *     D3LinePlot object
  *
  */
  static setLegend(linePlot){
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

    _options = linePlot.options;
    _nleg = linePlot.labels.length-1; 
    _plotHeight = D3LinePlot.plotHeight(linePlot);
    _plotWidth = D3LinePlot.plotWidth(linePlot);
    
    d3.select(linePlot.legendEl)
      .selectAll("*")
      .remove();
      
    _legendD3 = d3.select(linePlot.legendEl)
        .selectAll("g")
        .data(linePlot.labels)
        .enter()  
        .append("g") 
        .attr("class","legend-entry")
        .attr("id",function(d,i){return linePlot.ids[i]})
        .style("cursor","pointer")
        .attr("transform","translate("+(_options.legendPadding)
            +","+(16)+")");
    
    // Legend Text
    _legendD3.append("text")
        .attr("class","legend-text")
        .attr("font-size","12px")
        .attr("x",30)
        .attr("y", function(d,i){return 16*i})
        .attr("alignment-baseline","central")
        .text(function(d,i){return linePlot.labels[i]});
     
    // Legend Line Indicator
    _legendD3.append("line")
        .attr("class","legend-line")
        .attr("x2",24)
        .attr("y1", function(d,i){return 16*i})
        .attr("y2", function(d,i){return 16*i})
        .attr("stroke-width",3)
        .attr("stroke",function(d,i){return linePlot.color[i]})
        .attr("fill","none");  
      
    // Legend Circle on the Line
    _legendD3.append("circle") 
        .attr("class","legend-circle")
        .attr("cx",12)
        .attr("cy",function(d,i){return 16*i}) 
        .attr("r",5)
        .attr("fill",function(d,i){return linePlot.color[i]} );

    // Legend geometry 
    _legendGeom = linePlot.legendEl
        .getBoundingClientRect(); 
    _legendWidth = parseFloat(_legendGeom.width 
        + 2*linePlot.options.legendPadding);
    _legendHeight = parseFloat(_legendGeom.height 
        + 2*linePlot.options.legendPadding);
    
    // Legend outline
    d3.select(linePlot.legendEl)
        .append("rect")
        .attr("class","legend-outline")
        .attr("height",_legendHeight)
        .attr("width",_legendWidth)
        .attr("stroke","#999")
        .attr("fill","white")
        .style("cursor","move");

    _legendD3.raise();
    
    // Set translation 
    _translate = D3LinePlot.legendLocation(linePlot,_plotHeight,_plotWidth);
    d3.select(linePlot.legendEl).attr("transform",_translate)  
    
    //.............. Highlight Line when Legend Entry Selected .................
    d3.select(linePlot.legendEl)
        .selectAll(".legend-entry")
        .on("click",function(d,i){ 
          _selectedId = d3.select(this).attr("id"); 
          D3LinePlot.plotSelection(linePlot,_selectedId);
        });
    //--------------------------------------------------------------------------
    
   
    //........................ Drag Legend ..................................... 
    d3.select(linePlot.legendEl)
        .call(d3.drag()
          .on("drag",function(){
            _plotHeight = D3LinePlot.plotHeight(linePlot);
            _plotWidth = D3LinePlot.plotWidth(linePlot);
            _xDrag = d3.event.x;
            _xDrag = _xDrag < 0 ? 0 : _xDrag > _plotWidth-_legendWidth 
                ? _plotWidth-_legendWidth : _xDrag; 
            _yDrag = d3.event.y;
            _yDrag = _yDrag < 0 ? 0 : _yDrag > _plotHeight - _legendHeight 
                ? _plotHeight-_legendHeight : _yDrag; 
            d3.select(this)
                .attr("transform","translate("+_xDrag+","+_yDrag+")");
          }));
    //-------------------------------------------------------------------------- 
  
  } 
  //--------------- End Method: Create Legend ----------------------------------




  saveFigure(parText){
    let _this = this;
    
    let win = window.open();
    let bodyEl = win.document.body;

    let svgHtml = d3.select(plot.svgEl).node().outerHTML;
                                                                                
    d3.select(bodyEl)
          .append("div")
          .attr("class","svg-normal")
          .html(svgHtml);
              
    let svgD3 = d3.select(bodyEl)
        .select("svg")
          .attr("version",1.1)
          .attr("xmlns","http://www.w3.org/2000/svg")
          .style("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif");
    
    D3LinePlot.saveFigurePlotResize(_this,svgD3.node());
    
    let width = 725;
    d3.select(bodyEl)
        .select("svg")
        .select("g")
        .attr("transform","translate(60,60)")
        .append("text")
        .style("font-size","1.2em")
        .attr("x",width/2)
        .attr("y",-20)
        .attr("text-anchor","middle")
        .text(plot.plotTitleEl.textContent)
    
    svgD3.attr("height","8.5in")
        .attr("width","11in");
    
    let textD3 = d3.select(bodyEl)
        .select("svg")
        .select("g")
        .append("g")
        .attr("class","parameters")
        .attr("transform","translate(0,500)");
      
    textD3.selectAll("text")
        .data(parText)
        .enter()
        .append("text")
        .text(function(d,i){return d})
        .attr("y",function(d,i){return 18*i});
  
    svgHtml = svgD3.outerHTMl;
    let svgImgSrc = "data:image/svg+xml;base64,"+ btoa(svgHtml);                 
    let svgImg = "<img src='"+svgImgSrc+"'>"; 
    
    let canvasD3 = d3.select(bodyEl)
          .append("div")
          .attr("class","svg-to-canvas")
          .append("canvas")
          .attr("height","8.5in")
          .attr("width","11in");
      let canvas = canvasD3.node();
      let context = canvas.getContext("2d");
      canvasD3.remove();
  
  
  }



  static saveFigurePlotResize(linePlot,svgEl){
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

    
    _svgHeight = 500; 
    _svgWidth = 800;
    
    _plotHeight =  400;
    _plotWidth = 725;

    // Update svg height and width
    _svgD3 = d3.select(svgEl);     
    _svgD3.attr("width", _svgWidth) 
        .attr("height",_svgHeight)
         
    // Update X bounds
    linePlot.xBounds = D3LinePlot.getXScale(linePlot);
    linePlot.xBounds
        .range([0,_plotWidth])
        .domain(D3LinePlot.getXExtremes(linePlot))
        .nice();

    // Update Y bounds
    linePlot.yBounds = D3LinePlot.getYScale(linePlot);
    linePlot.yBounds
        .range([_plotHeight,0])
        .domain(D3LinePlot.getYExtremes(linePlot))
        .nice()
    
    // Update X axis
    _svgD3.select(".x-tick")  
        .attr("transform","translate(0,"+ _plotHeight +")")
        .call(d3.axisBottom(linePlot.xBounds));
    _svgD3.select(".x-label")             
        .attr("x", _plotWidth/2.0)           
        .attr("y", _plotHeight+_options.marginBottom/2+10);                 

    // Update Y axis
    _svgD3.select(".y-tick")                                   
        .call(d3.axisLeft( linePlot.yBounds));
    _svgD3.select(".y-label")  
        .attr("x",0-_plotHeight/2)
        .attr("y",0-_options.marginLeft/2-10);
    
    // Update legend
    _legendTranslate = D3LinePlot
        .legendLocation(linePlot,_plotHeight,_plotWidth);
    
    _legendD3 = d3.select(svgEl)
        .select(".legend");
    _legendD3.attr("transform",_legendTranslate);

    
    // Remove any data
    d3.select(svgEl)
        .selectAll(".data")
        .remove();
    
    // Create data groups
    let seriesEnter = d3.select(svgEl)
        .select(".all-data")
        .selectAll("g")
        .data(linePlot.data)
        .enter()
        .append("g")
        .attr("class","data")
        .attr("id",function(d,i){return linePlot.ids[i]})
        .style("cursor","pointer");
    
    // Plot lines
    seriesEnter.append("path")
        .attr("class","line")
        .attr("d",linePlot.line)
        .attr("id",function(d,i){return linePlot.ids[i]})
        .attr("stroke",function(d,i){return linePlot.color[i]} )
        .attr("stroke-width",linePlot.options.linewidth)
        .style("shape-rendering","geometricPrecision")
        .attr("fill","none");
    
    // Plot cirles
    seriesEnter.selectAll("circle")
        .data(function(d,i){return d})
        .enter()
        .filter(function(d,i){return d[1] != null})
        .append("circle")
        .attr("class","dot")
        .attr("id",function(d,i){
          return d3.select(this.parentNode.firstChild).attr("id");
        })
        .attr("cx",linePlot.line.x())
        .attr("cy",linePlot.line.y())
        .attr("r",linePlot.options.pointRadius)
        .attr("fill",function(d,i){
          return d3.select(this.parentNode.firstChild).style("stroke");
        });

  }

}



//-------------------- End D3LinePlot Class ------------------------------------
