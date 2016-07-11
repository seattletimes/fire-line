var chartist = require("chartist");

var owlData = {
  labels: ["Before", "After"],
  series: [
    // Before: all suitability in cut areas (highly suitable, marginal, suitable, unsuitable)
    [74.86283844, 21.06170266, 57.09534176, 27.99388487],
    // After
    [0, 0, 0, 181.0137677],
    // Before: suitability in own circles
    [0.919061858, 0.286575332, 4.123612051, 0.839319714],
    // After
    [0, 0, 0, 6.168568955]
  ]
};

var options = {
  horizontalBars: true
}

var chart = new chartist.Bar(".habitat-graph .chart", owlData, options);