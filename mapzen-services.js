var wof_data_url = 'https://whosonfirst.mapzen.com/data/';
var mapzen_search_url = 'https://search.mapzen.com/v1/';
var search_api_key = '&api_key=search-hQHkoy8';

/**
 * Reverse geocode to lookup the address or venue at a given point.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {object}
 */
function reverseGeocode(lat, lng) {
  var url = mapzen_search_url + 'reverse?size=1&point.lat=' + lat + '&point.lon=' + lng + search_api_key;
  return httpGetSync(url);
}

/**
 * Lookup place details given a Mapzen Search gid string.
 * Important to note that these gids should be coming directly from
 * Mapzen Search results, and should never be constructed manually.
 *
 * @param {string} gid
 * @returns {object}
 */
function getPlaceDetails(gid) {
  var url = mapzen_search_url + 'place?ids=' + gid + search_api_key;
  return httpGetSync(url).features[0];
}

/**
 * Retrieve full WOF record given the WOF id.
 *
 * @param {string} wofId
 * @return {object}
 */
function getWOFRecord(wofId) {
  var url = wof_data_url + wofId.substr(0, 3) + '/' +
    wofId.substr(3, 3) + '/' + wofId.substr(6) + '/' + wofId + '.geojson';
  return httpGetSync(url);
}

/**
 * Perform a GET request to given url and return
 * the results as a JSON object.
 *
 * @param {string} url
 * @return {object}
 */
function httpGetSync(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.send();
  return JSON.parse(xhttp.responseText);
}
