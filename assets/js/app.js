var map, featureList, boroughSearch = [], polisearch = [], hospitalearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

// $("#about-btn").click(function() {
//   $("#aboutModal").modal("show");
//   $(".navbar-collapse.in").collapse("hide");
//   return false;
// });

$("#full-extent-btn").click(function() {
  map.fitBounds(boroughs.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through polis layer and add only features which are in the map bounds */
  polis.eachLayer(function (layer) {
    if (map.hasLayer(polisLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/polis.png"></td><td class="feature-name">' + layer.feature.properties.Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through hospital layer and add only features which are in the map bounds */
  // hospital.eachLayer(function (layer) {
  //   if (map.hasLayer(hospitalLayer)) {
  //     if (map.getBounds().contains(layer.getLatLng())) {
  //       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/hospital.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
  //     }
  //   }
  // });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; BryanMcBride , &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
// var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x11}", {
//   maxZoom: 30,
// }), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
//   minZoom: 16,
//   maxZoom: 30,
//   layers: "0",
//   format: 'image/jpeg',
//   transparent: true,
//   attribution: "Aerial Imagery courtesy USGS"
// })]);

var usgsImagery = L.layerGroup([L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  // attribution: "OSM"
})]);


/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove polis to markerClusters layer */
var polisLayer = L.geoJson(null);
var polis = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/polis.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Name + "</td></tr>"  + "<tr><th>Go to location</th><td><a class='url-break' href='" + feature.properties.GoogleMap + "' target='_blank'>" + feature.properties.GoogleMap + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/polis.png"></td><td class="feature-name">' + layer.feature.properties.Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      polisearch.push({
        name: layer.feature.properties.Name,
        address: layer.feature.properties.ADDRESS1,
        source: "polis",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
// $.getJSON("data/Point/polis.geojson", function (data) {
$.getJSON("data/Data Balai Polis (KIK Jupem)/Balai Polis/GeoJson/Balai Polis JBS_2.geojson", function (data) {
  polis.addData(data);
  map.addLayer(polisLayer);
});

// /* Empty layer placeholder to add to layer control for listening when to add/remove hospital to markerClusters layer */
// var hospitalLayer = L.geoJson(null);
// var hospital = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.marker(latlng, {
//       icon: L.icon({
//         iconUrl: "assets/img/hospital.png",
//         iconSize: [24, 28],
//         iconAnchor: [12, 28],
//         popupAnchor: [0, -25]
//       }),
//       title: feature.properties.NAME,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       // var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>"+"<tr><th>Go to location</th><td><a class='url-break' href='" + feature.properties.GoogleMap + "' target='_blank'>" + feature.properties.GoogleMap + "</a></td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.NAME);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/hospital.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
//       hospitalearch.push({
//         name: layer.feature.properties.NAME,
//         address: layer.feature.properties.ADRESS1,
//         source: "hospital",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/Point/OSM_hospital1.geojson", function (data) {
//   hospital.addData(data);
// });


///LAYER BIL PENDUDUK 

var subwayColors = {"JOHOR":"#ccf879ff"};
var BilPenduduk = L.geoJson(null, {
  style: function (feature) {
      return {
        color: subwayColors[feature.properties.State],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Daerah</th><td>" + feature.properties.Parliament + "</td></tr>" + "<tr><th>Bil. Penduduk</th><td>" + feature.properties.Population + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        BilPenduduk.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Polygon/GEOJSON/Johor_PopulationbyDUN.geojson", function (data) {
  BilPenduduk.addData(data);
});

/// SEMPADAN POLIS
var PolisColors = {"1":"#ff3135"};
var SempadanPolis = L.geoJson(null, {
  style: function (feature) {
      return {
        color: PolisColors[feature.properties.KOD_NEGERI],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>No. Pelan Warta</th><td>" + feature.properties.NOPW + "</td></tr>" + "<tr><th>Keterangan</th><td>" + feature.properties.KETERANGAN + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        SempadanPolis.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Polygon/GEOJSON/POLIS_JBS_220725.geojson", function (data) {
  SempadanPolis.addData(data);
});

///// SEMPADAN POLIS JBS

var PolisColorsJBS = {"1":"#79f895ff"};
var SempadanPolisJBS = L.geoJson(null, {
  style: function (feature) {
      return {
        color: PolisColorsJBS[feature.properties.Kod_Negeri],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Nama Balai Polis</th><td>" + feature.properties.Name  + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        SempadanPolisJBS.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Data Balai Polis (KIK Jupem)/Sempadan Balai Polis/GeoJson/Sempadan Balai Polis JBS.geojson", function (data) {
  SempadanPolisJBS.addData(data);
});

///// SEMPADAN DAERAH

var DAERAHCOLORS = {"01":"#9079f8ff"};
var DAERAH = L.geoJson(null, {
  style: function (feature) {
      return {
        color: DAERAHCOLORS[feature.properties.KODNEGERI],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Nama Daerah</th><td>" + feature.properties.KETERANGAN  + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        DAERAH.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Polygon/GEOJSON/DAERAH/T_DAERAH.geojson", function (data) {
  DAERAH.addData(data);
});

/////

///// SEMPADAN MUKIM

var MUKIMCOLORS = {"01":"#79f8d6ff"};
var MUKIM = L.geoJson(null, {
  style: function (feature) {
      return {
        color: MUKIMCOLORS[feature.properties.KODNEGERI],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Nama MUKIM</th><td>" + feature.properties.KETERANGAN  + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        MUKIM.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Polygon/GEOJSON/MUKIM/T_MUKIM.geojson", function (data) {
  MUKIM.addData(data);
});


map = L.map("map", {
  zoom: 10,
  center: [1.662135592846289, 104.02336120605469],
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === polisLayer) {
    markerClusters.addLayer(polis);
    syncSidebar();
  }
  // if (e.layer === hospitalLayer) {
  //   markerClusters.addLayer(hospital);
  //   syncSidebar();
  // }
});

map.on("overlayremove", function(e) {
  if (e.layer === polisLayer) {
    markerClusters.removeLayer(polis);
    syncSidebar();
  }
  if (e.layer === hospitalLayer) {
    markerClusters.removeLayer(hospital);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://www.jupem.gov.my'>JUPEM Johor - Prestij</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Base Map": cartoLight,
  "Street Map": usgsImagery
};

var groupedOverlays = {
  "Perkhidmatan Kecemasan": {
    "<img src='assets/img/polis.png' width='24' height='28'>&nbsp;Balai Polis": polisLayer,
    // "<img src='assets/img/hospital.png' width='24' height='28'>&nbsp;Hospital": hospitalLayer,
    
  },
  "Pelan Warta": {
    "Sempadan Polis Johor Bahru": SempadanPolis,
    "Sempadan Polis Johor Bahru Selatan": SempadanPolisJBS,
    "Bil. Penduduk": BilPenduduk,
    // "Sempadan Daerah":DAERAH,
    // "Sempadan Mukum": MUKIM    
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});



// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
