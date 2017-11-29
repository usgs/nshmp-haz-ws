


//###########################################################
//
//................ Remove Buttons from Footer ................
$("#footer").ready(function(){
  var plot_btn = document.getElementById("update-plot");
  var raw_btn  = document.getElementById("raw-data");

  plot_btn.style.display = "none";
  raw_btn.style.display  = "none";

});
//-----------------------------------------------------------
//
//###########################################################



$(function(){
  var urlPrefix = window.location.protocol + "//" + window.location.host + "/nshmp-haz-ws";
 	
  $(".serviceLink").each(function() {
    var serviceUrl = urlPrefix + $(this).text();
    $(this).empty().append($("<a>")
      .attr("href", serviceUrl)
      .text(serviceUrl));
  });
 
  
  $(".formatUrl").each(function(){
    var serviceUrl = urlPrefix + $(this).text();
    $(this).empty().text(serviceUrl);
  });
});
