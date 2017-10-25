



$(function(){  
  var url = "/nshmp-haz-ws/util/testsites";
  $.getJSON(url,function(jsonReturn){
    testSites = jsonReturn.features; 
    console.log(testSites);
    setRegions();
  });
});




function setRegions(){
 
  testSites.forEach(function(site){ 
    var regionId      = site.properties.regionId;
    var regionDisplay = site.properties.regionDisplay;
    $("#region").append(
      $("<label>").addClass("btn btn-default").append(
        $("<input/>")
          .attr("name","region")
          .attr("value",regionId)
          .attr("type","radio")
      ).append(regionDisplay)
    )
  });

  $("#region [value*=WUS]")
    .parent()
    .addClass("active");
  
  getRegion();
}




$("#region").on("change",getRegion);
function getRegion(){
  
  var regionSelect = $("#region [class*=active] input").val();
  console.log("\n\n");
  testSites.forEach(function(featureCollection){
    var regionId = featureCollection.properties.regionId;
    if (regionId == regionSelect){
      featureCollection.features.forEach(function(feature){
        console.log(feature);
      })
    }
  });
}
