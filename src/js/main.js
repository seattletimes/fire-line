// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var mapElement = document.querySelector("#fspro");
var L = mapElement.leaflet;
var map = mapElement.map;

var { rgb } = require("./lib/colors");

var xhr = require("./lib/xhr");
var layers = {};

var palette = {
  1: "blue",
  4: "green",
  19: "yellow",
  39: "orange",
  59: "red",
  79: "darkred"
}

var checkLayers = function() {
  if (!layers.prediction || !layers.perimeter) return;
  layers.prediction = L.geoJson(layers.prediction, {
    style: function(feature) {
      return {
        stroke: false,
        fillColor: palette[feature.properties.max],
        fillOpacity: .7
      }
    }
  });
  layers.prediction.addTo(map);
  layers.perimeter = L.geoJson(layers.perimeter, {
    style: () => ({ stroke: false, fillColor: "red", fillOpacity: 1 })
  });
  layers.perimeter.addTo(map);
  map.fitBounds(layers.perimeter.getBounds().extend(layers.prediction.getBounds()));


};

xhr("./assets/fspro-0905.geojson", function(err, data) {
  layers.prediction = data;
  checkLayers();
});

xhr("./assets/perimeter-0905.geojson", function(err, data) {
  layers.perimeter = data;
  checkLayers();
});