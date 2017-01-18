
$(function() {
  $('[data-toggle="tooltip"]').tooltip(); 

  /* Fetch parameter data. */
  $.ajax({
    url: "http://localhost:8080/nshmp-haz-ws/spectra",
    success: buildInputs
  });
});

/* process usage response */
function buildInputs(usage) {
  var params = usage.parameters;

  /* Alphabetical GMMs. */
  var gmmAlphaOptions = $();
  params.gmm.values.forEach(function (gmm) {
    gmmAlphaOptions = gmmAlphaOptions.add($('<option>')
      .attr('value', gmm.id)
      .text(gmm.label));

  });

  /* Grouped GMMs. */
  var gmmGroupOptions = $();
  params.group.values.forEach(function (group) {
    var members = group.data;
    var optGroup = $('<optgroup>').attr('label', group.label);
    gmmGroupOptions = gmmGroupOptions.add(optGroup);
    optGroup.append(gmmAlphaOptions
      .filter(function (index, gmmOption) {
        return members.includes(gmmOption.getAttribute("value")); })
      .clone());
  });

  /* Bind option views to sort buttons */
  $("#gmmsorter input").change(function() {
    var options = this.value === "alpha" ? gmmAlphaOptions : gmmGroupOptions;
    $("#gmms").empty().append(options);
    $("#gmms").scrollTop(0);
  });

  /* Set initial view to groups */
  $("#gmms").empty().append(gmmGroupOptions);

  /* Populate fields with defaults. */
  Object.keys(params)
    .filter(function (key) {
      if (key === "gmms") return false;
      if (key === "groups") return false;
      return true; })
    .forEach(function (key, index) {
      $("input[name='" + key + "']").val(params[key].value); });
}
