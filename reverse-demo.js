var info;
var marker;
var highlight;
var map;
var lang;

// Get things started
setup();

// Main setup to build the map
function setup() {
  initMap();
  addClickHandler();
  addInfoBox();
  updateInfo();
  addLangSelector();
}

// Use Mapzen.js to build the map!
function initMap() {

  L.Mapzen.apiKey = 'search-hQHkoy8';
  map = L.Mapzen.map('map');
  map.setView([37.539619, 127.009676], 12);

  L.Mapzen.geocoder().addTo(map);
}


// Add click event handling to perform the reverse geocoding and draw the results on the map.
function addClickHandler() {
  map.on('click', function (e) {
    // between lines 36 - 52, get that into mapzen.js? and possibly line 55?
    var reverseResults = reverseGeocode(e.latlng.lat, e.latlng.lng, lang._container.children["0"].value);
    var place = reverseResults.features[0].properties;

    dropMarker(reverseResults);

    // determine the gid of the lower available parent in the hierarchy
    // TODO: maybe we can find a simpler way to do this
    var lowestParentGid = place.neighbourhood_gid
      || place.locality_gid
      || place.localadmin_gid
      || place.county_id
      || place.region_gid;

    if (!lowestParentGid) {
      console.error('no parent id found', place);
      return;
    }

    // use the gid to lookup full details of the parent in Mapzen Search
    var parent = getPlaceDetails(lowestParentGid, lang._container.children["0"].value);

    if (!parent) {
      console.error('parent record not found');
      return;
    }

    // use the source_id of the full parent object to lookup the full WOF record full of geometry goodness
    var parentWOF = getWOFRecord(parent.properties.source_id);

    // draw the parent polygon on the map
    addGeojson(parentWOF);

    // update the info box with what was selected
    updateInfo(place.label, parentWOF.properties['wof:placetype'], parentWOF.properties['wof:name']);

  });
}

// Draw the POI marker (just geojson with points, no polygons)
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

//Update the info box with given data
function updateInfo(label, parentType, parentName) {
  info.update(label, parentType, parentName);
}

// Draw the polygon(s) in the given geojson on the map.
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
    }
  }).addTo(map);
}

// Control in the upper right corner of the map
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
      this._div.innerHTML = '<h3>Click on a place on the map! </h3>';
      return;
    }

    this._div.innerHTML =
      '<h3>That\'s the ' + parentName + ' ' + parentType + '</h3>' +
      '<h4>' + name + '</h4>';
  };

  info.addTo(map);
}

// Control in the upper right corner of the map
function addLangSelector() {
  lang = L.control({position: 'topleft'});
  lang.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'lang');
    div.classList = 'leaflet-pelias-control leaflet-bar no-overflow';
    div.innerHTML =
      `<select class="leaflet-pelias-control lang">` +
        `<option>ko</option>` +
        `<option>en</option>` +
      `</select>`;

    L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);

    L.DomEvent.on(div, 'change', function (ev) {
      console.log('selected', lang, ev.target.selectedIndex);
    });

    return div;
  };

  lang.addTo(map);
}
