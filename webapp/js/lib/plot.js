




class Plot{


  constructor(divContId){
    
    this.data;
    this.labels;
    this.xlabel; 
    this.ylabel;
    this.xscale;
    this.yscale;
     
    
    this.divContId = divContId;

    this.content = d3.select("#"+divContId);
    
    this.plotPanel = this.content
      .append("div")
        .attr("class","plot-panel")
      .append("div")
        .attr("class","panel panel-default");
    
    this.plotHeading = this.plotPanel
      .append("div")
        .attr("class","panel-heading");

    this.plotPanel
      .append("div")
        .attr("class","panel-body");

    this.footerBtns = this.plotPanel
      .append("div")
        .attr("class","panel-footer")
      .append("div")
        .attr("class","form-inline axes-btns");

    //............. X Axis Buttons ...............
    this.xAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.xAxisForm
      .append("label")
        .attr("for","x-axis-btns")
        .text("X-axis");

    this.xAxisBtns = this.xAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","x-axis-btns")
        .attr("data-toggle","buttons");

    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='linear'/> Linear");
    
    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='log'/> Log");
    //--------------------------------------------
      
    //............. Y Axis Buttons ...............
    this.yAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.yAxisForm
      .append("label")
        .attr("for","y-axis-btns")
        .text("Y-axis");

    this.yAxisBtns = this.yAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","y-axis-btns")
        .attr("data-toggle","buttons");

    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='linear'/> Linear");
    
    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='log'/> Log");
    //--------------------------------------------

  }


  setTitle(title){
    this.plotHeading
      .text(title); 
  }



  


}

