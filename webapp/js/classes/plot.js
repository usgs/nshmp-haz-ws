




class Plot{


  constructor(divContId){
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

/*
<!-- ................. Hazard Curves Plot ........... -->
<div class="plot-panel hidden">
  <div id="hazard-plot-panel" class="panel panel-default">
    <!-- Plot Title -->
    <div class="panel-heading" id="hazard-plot-title">
      Hazard Curves
      <span id="hazard-plot-text"></span>
      <span class="plot-resize" id="hazard-plot-resize" ></span>
    </div>
    <!-- Plot Title -->

    <!-- Plot -->
    <div class="panel-content" id="hazard-curves-plot"></div>
    <!-- Plot -->

    <!-- Plot Buttons -->
    <div class="panel-footer"  id="hazard-axes-btns">
      <div class="form-inline axes-btns">
        <!-- X-axis Button -->
        <div class="form-group form-group-sm">
          <label  for="hazard-plot-xaxis" > X-axis </label>
          <div class="btn-group btn-group-sm" id="hazard-plot-xaxis" data-toggle="buttons">
            <label class="btn btn-sm btn-default">
              <input type="radio" name="xaxis" value="linear" >Linear
            </label>
            <label class="btn btn-sm btn-default">
              <input type="radio" name="xaxis" value="log" >Log
            </label>
          </div>
        </div>
        <!-- X-axis Button -->

        <!-- Y-axis Button -->
        <div class="form-group form-group-sm">
          <label  for="hazard-plot-yaxis" > Y-axis </label>
          <div class="btn-group btn-group-sm" id="hazard-plot-yaxis" data-toggle="buttons">
            <label class="btn btn-sm btn-default">
              <input type="radio" name="yaxis" value="linear" >Linear
            </label>
            <label class="btn btn-sm btn-default">
              <input type="radio" name="yaxis" value="log" >Log
            </label>
          </div>
        </div>
        <!-- Y-axis Button -->
      </div>
    </div>
    <!-- Plot Buttons -->
  </div>
</div>
<!-- ................. Hazard Curves Plot ........... -->
*/
