var info;
var marker;
var highlight;
var map;
var geocoder;

// get things started
setup();

/**
 * Main setup function.
 */
function setup() {
  initMap();
  addClickHandler();
  addInfoBox();
  updateInfo();
}

/**
 * Initialize map with Tangram tiles and proper attribution.
 */
function initMap() {
  map = L.Mapzen.map('map', {
    center: [47.6091, -122.3177],
    zoom: 12
  });

  map.attributionControl.addAttribution('<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | <a href="http://www.openstreetmap.org/about" target="_blank">&copy; OSM contributors | Mapzen data &copy; <a href="https://mapzen.com">Mapzen</a>');

  geocoder = L.Mapzen.geocoder('search-hQHkoy8').addTo(map);
}


/**
 * Add click event handling to perform the reverse geocoding and draw the results on the map.
 */
function addClickHandler() {
  map.on('click', function (e) {
    var reverseResults = reverseGeocode(e.latlng.lat, e.latlng.lng);
    var place = reverseResults.features[0].properties;

    dropMarker(reverseResults);

    // determine the gid of the lower available parent in the hierarchy
    // TODO: maybe we can find a simpler way to do this
    var lowestParentGid = place.neighbourhood_gid || place.locality_gid || place.localadmin_gid || place.region_id;

    // use the gid to lookup full details of the parent in Mapzen Search
    var parent = getPlaceDetails(lowestParentGid);

    // use the source_id of the full parent object to lookup the full WOF record full of geometry goodness
    var parentWOF = getWOFRecord(parent.properties.source_id);

    // draw the parent polygon on the map
    addGeojson(parentWOF);

    // update the info box with what was selected
    updateInfo(place.label, parentWOF.properties['wof:placetype'], parentWOF.properties['wof:name']);
  });
}

/**
 * Draw the POI marker (just geojson with points, no polygons)
 *
 * @param {object} place GeoJSON object
 */
function dropMarker(place) {
  // if previous marker existed, remove it
  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.geoJson(place, {
    onEachFeature: function (feature, layer) {
      // show label when marker is clicked
      layer.bindPopup(feature.properties.label);
    }
  }).addTo(map);
}

/**
 * Update the info box with given data.
 * Call with no parameters to reset the info box text.
 *
 * @param {string} [label]
 * @param {string} [parentType]
 * @param {string} [parentName]
 */
function updateInfo(label, parentType, parentName) {
  info.update(label, parentType, parentName);
}

/**
 * Draw the polygon(s) in the given geojson on the map.
 *
 * @param {object} geojson
 */
function addGeojson(geojson) {
  // if previous highlight was drawn, remove it
  if (highlight) {
    map.removeLayer(highlight);
  }

  highlight = L.geoJson(geojson, {
    style: function (feature) {
      return {
        weight: 1,
        color: 'green',
        opacity: '0.7'
      };
    },
    onEachFeature: function (feature, layer) {
      // need to override the click event with nothing to allow user
      // to click inside the area to geocode a new point
      layer.on('click');
    }
  }).addTo(map);
}

/**
 * Control in the upper right corner of the map
 *
 * NOTE: the info box might be too much for this demo. could
 * remove it and add parent info to the POI marker label.
 */
function addInfoBox() {
  // control that shows state info on hover
  info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (name, parentType, parentName) {
    if (!name) {
      this._div.innerHTML = '<h3>Go ahead and click anywhere on the map...</h3>';
      return;
    }

    this._div.innerHTML =
      '<h3>Oh, that\'s in the ' + parentName + ' ' + parentType + '</h3>' +
      '<h4>' + name + '</h4>';
  };

  info.addTo(map);
}
