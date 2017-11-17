'use strict'





class Header{


  constructor(){
    
    let headerD3,
        headerMenuD3;

    headerD3 = d3.select("body")
        .append("div")
        .attr("id","header");
    
    headerD3.append("span")
        .attr("class","title")
        .attr("id","header-title");

    headerD3.append("div")
        .attr("class","dropdown-toggle")
        .attr("id","header-menu")
        .attr("data-toggle","dropdown")
        .append("span")
        .attr("class","glyphicon glyphicon-menu-hamburger");
    

    headerMenuD3 = headerD3.append("ul")
        .attr("class","dropdown-menu dropdown-menu-right")
        .attr("aria-labelledby","header-menu");

    headerMenuD3.append("li")
        .append("a")
        .attr("href","model-compare.html")
        .text("Model Compare");

  }
        	

/*
<div id="header">                                                               
  <span class="title" id="header-title"></span>                                 
  <div id="header-menu" class="dropdown-toggle"  data-toggle="dropdown">        
    <span id="header-icon" class="glyphicon glyphicon-menu-hamburger"></span>   
  </div>                                                                        
  <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="header-menu" > 
    <li><a href="model-compare.html" >Model Compare     </a> </li>              
    <li><a href="model-explorer.html">Model Explorer    </a> </li>              
    <li><a href="spectra-plot.html"  >Response Spectra  </a> </li>              
    <li><a href="location.html"      >Test Sites        </a> </li>              
  </ul>                                                                         
</div> 
*/





}
