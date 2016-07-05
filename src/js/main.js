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
var $ = require("./lib/qsa");
var layers = window.layers = {};

var { rgb } = require("./lib/colors");

// @st-light-red: rgb(229, 175, 155);
// @st-dark-red: rgb(202, 105, 81);
// @st-light-orange: rgb(255, 218, 162);
// @st-dark-orange: rgb(248, 158, 93);
// @st-light-green: rgb(181, 191, 169);
// @st-dark-green: rgb(121, 143, 113);
// @st-light-blue: rgb(213, 228, 240);
// @st-dark-blue: rgb(163, 193, 221);
// @st-light-purple: rgb(199, 187, 220);
// @st-dark-purple: rgb(123, 90, 166);

var palette = {
  1: rgb(213, 228, 240),
  4: rgb(181, 191, 169),
  19: rgb(121, 143, 113),
  39: rgb(255, 218, 162),
  59: rgb(248, 158, 93),
  79: rgb(202, 105, 81),
  100: rgb(202, 105, 81),
};

var states = {
  fire: ["fire", "line"],
  initial: ["fire", "initial", "line"],
  revised: ["fire", "revised", "line"],
  continued: ["fire", "line"]
};

var segments = $(".fspro-map .segment");
var stack = ["fire", "initial", "revised", "line"];

var fades = {
  fire: 1,
  line: 1,
  initial: .8,
  revised: .8
}

var currentSegment = null;
var onScroll = function() {
  if (!layers.line || !layers.fire || !layers.initial || !layers.revised) return;
  if (currentSegment == null && layers.line) {
    layers.line.bringToFront();
  }
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var bounds = segment.getBoundingClientRect();
    if (bounds.top > 0 && bounds.top < window.innerHeight * .8) {
      var s = segment.getAttribute("data-segment");
      if (s == currentSegment) return;
      currentSegment = s;
      var state = states[s];
      stack.forEach(function(key) {
        var layer = layers[key];
        if (!layer) return;
        var shown = state.indexOf(key) > -1;
        if (shown) {
          layer.setStyle(() => ({ fillOpacity: fades[key] }));
        } else {
          layer.setStyle(() => ({ fillOpacity: 0 }))
        }
      });
      break;
    }
  }
  var visible = [layers.line, layers.fire].filter(l => l);
  if (!visible.length) return;
  var viewport = L.latLngBounds(visible.map(l => l.getBounds()));
  map.fitBounds(viewport);
};

window.addEventListener("scroll", onScroll);
onScroll();

var styleFSPro = function(feature) {
  return {
    stroke: false,
    fillColor: palette[feature.properties.max] || "transparent",
    fillOpacity: 0
  };
};

xhr("./assets/fireline.geojson", function(err, data) {
  data.features.forEach(function(feature) {
    feature.geometry.coordinates = feature.geometry.coordinates[0];
    feature.geometry.type = "LineString";
  });
  layers.line = L.geoJson(data, {
    className: "fireline fire-layer",
    style: () => ({ stroke: 1, color: "black", opacity: 1 })
  }).addTo(map);
  onScroll();
});

xhr("./assets/fspro-0827.geojson", function(err, data) {
  layers.initial = L.geoJson(data, {
    className: "initial fire-layer",
    style: styleFSPro
  }).addTo(map);
  onScroll();
});

xhr("./assets/fspro-0905.geojson", function(err, data) {
  layers.revised = L.geoJson(data, {
    className: "revised fire-layer",
    style: styleFSPro
  }).addTo(map);
  onScroll();
});

xhr("./assets/perimeter-0905.geojson", function(err, data) {
  layers.fire = L.geoJson(data, {
    className: "perimeter fire-layer",
    style: () => ({ stroke: false, fillColor: rgb(202, 105, 81), fillOpacity: 1 })
  }).addTo(map);
  onScroll();
  map.fitBounds(layers.fire.getBounds());
});