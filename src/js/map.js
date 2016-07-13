require("component-leaflet-map");

var mapElement = document.querySelector("#fspro");
var L = mapElement.leaflet;
var map = mapElement.map;

var xhr = require("./lib/xhr");
var $ = require("./lib/qsa");
var { rgb, palette } = require("./lib/colors");
var layers = window.layers = {};
var markers = window.markers = {};

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

var colors = {
  1: palette.stLightBlue,
  4: palette.stLightGreen,
  19: palette.stDarkGreen,
  39: palette.stLightOrange,
  59: palette.stDarkOrange,
  79: palette.stDarkRed,
  100: palette.stDarkRed,
};

var states = {
  fire: ["fire", "line"],
  initial: ["fire", "initial", "line"],
  revised: ["fire", "revised", "line"],
  continued: {
    shown: ["fire", "line", "repairs"],
    focus: ["repairs"]
  }
};

var segments = $(".fspro-map .segment");
var stack = ["fire", "initial", "revised", "line", "repairs"];

var fades = {
  fire: 1,
  line: 1,
  initial: .8,
  revised: .8,
  repairs: 1
}

var currentSegment = null;
var onScroll = function() {
  //don't do anything if the important layers aren't loaded
  if (!layers.line || !layers.fire || !layers.initial || !layers.revised) return;
  // pull the line to the top
  if (currentSegment == null && layers.line) {
    layers.line.bringToFront();
  }
  // default fitBounds set
  var visible = [layers.line, layers.fire];
  var foundSection = false;
  // find the current visible segment blurb
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var bounds = segment.getBoundingClientRect();
    if (bounds.top > 0 && bounds.top < window.innerHeight * .8) {
      //get the current segment visibility definition
      foundSection = true;
      var s = segment.getAttribute("data-segment");
      if (s == currentSegment) return;
      currentSegment = s;
      var state = states[s].shown ? states[s].shown : states[s];
      stack.forEach(function(key) {
        var layer = layers[key];
        var labels = markers[key];
        if (!layer) return;
        var shown = state.indexOf(key) > -1;
        if (shown) {
          layer.setStyle(() => ({ fillOpacity: fades[key] }));
          if (labels && !labels._map) labels.addTo(map);
        } else {
          layer.setStyle(() => ({ fillOpacity: 0 }));
          if (labels && labels._map) map.removeLayer(labels);
        }
      });
      if (states[s].focus) visible = states[s].focus.map(k => layers[k]);
      break;
    }
  }
  if (!foundSection) return;
  visible = visible.filter(l => l);
  if (!visible.length) return;
  var viewport = L.latLngBounds(visible.map(l => l.getBounds()));
  map.fitBounds(viewport);
};

window.addEventListener("resize", onScroll);
window.addEventListener("scroll", onScroll);
onScroll();

var styleFSPro = function(feature) {
  return {
    stroke: false,
    fillColor: colors[feature.properties.max] || "transparent",
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
  var labels = markers.initial = L.featureGroup();
  var geo = layers.initial = L.geoJson(data, {
    className: "initial fire-layer",
    style: styleFSPro
  }).addTo(map);
  var one = L.marker({ lat: 47.77809779004784, lng: -120.81390380859375 }, {
    icon: L.divIcon({
      html: "1-4%",
      className: "no-background"
    })
  });
  var two = L.marker({ lat: 47.9329065912321, lng: -120.29891967773438 }, {
    icon: L.divIcon({
      html: "1-4%",
      className: "no-background"
    })
  });
  var five = L.marker({ lat: 47.82237604116143, lng: -120.53237915039062 }, {
    icon: L.divIcon({
      html: "5-19%",
      className: "no-background"
    })
  });
  var twenty = L.marker({ lat: 47.90713721964109, lng: -120.68893432617188 }, {
    icon: L.divIcon({
      html: "20-39%",
      className: "no-background"
    })
  });
  one.addTo(labels);
  two.addTo(labels);
  five.addTo(labels);
  twenty.addTo(labels);
  onScroll();
});

xhr("./assets/fspro-0905.geojson", function(err, data) {
  layers.revised = L.geoJson(data, {
    className: "revised fire-layer",
    style: styleFSPro
  }).addTo(map);
  onScroll();
  var labels = L.layerGroup();
  var tiny = L.marker({ lat: 47.88780176702122, lng: -120.66146850585936 }, {
    icon: L.divIcon({
      html: "<1%",
      className: "no-background"
    })
  });
  var minor = L.marker({ lat: 47.94670633179335, lng: -120.65597534179688 }, {
    icon: L.divIcon({
      html: "1-4%",
      className: "no-background"
    })
  });
  tiny.addTo(labels);
  minor.addTo(labels);
  markers.revised = labels;
  layers.revised.on("click", (e) => console.log(e.latlng));
});

xhr("./assets/perimeter-0905.geojson", function(err, data) {
  layers.fire = L.geoJson(data, {
    className: "perimeter fire-layer",
    style: () => ({ stroke: false, fillColor: rgb(202, 105, 81), fillOpacity: 1 })
  }).addTo(map);
  onScroll();
});

xhr("./assets/repairs.geojson", function(err, data) {
  var group = layers.repairs = L.featureGroup();
  data.features.forEach(function(f) {
    var props = f.properties;
    var label = props.Label;
    var status = props.STATUS;
    var [lng, lat] = f.geometry.coordinates;
    var marker = L.marker([lat, lng], {
      icon: L.divIcon({
        iconSize: [10,10],
        className: "repair-point"
      })
    });
    marker.addTo(group);
  });
  group.setStyle = function(s) {
    group.eachLayer(l => l.setOpacity(s().fillOpacity));
  }
  group.addTo(map);
  onScroll();
});