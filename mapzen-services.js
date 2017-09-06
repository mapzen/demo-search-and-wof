// Move all of this in mapzen.js

var wof_data_url = 'https://whosonfirst.mapzen.com/data/';
var mapzen_search_url = 'https://search.mapzen.com/v1/';
var search_api_key = '&api_key=search-hQHkoy8';

//Reverse geocode to lookup the address or venue at a given point.
function reverseGeocode(lat, lng, language) {
  var url = mapzen_search_url + 'reverse?lang=' + language + '&size=1&point.lat=' + lat + '&point.lon=' + lng + search_api_key;
  return httpGetSync(url);
}

/* Lookup place details given a Mapzen Search gid string.
 * Important to note that these gids should be coming directly from
 * Mapzen Search results, and should never be constructed manually.
 */
function getPlaceDetails(gid, language) {
  var url = mapzen_search_url + 'place?lang=' + language + '&ids=' + gid + search_api_key;
  return httpGetSync(url).features[0];
}

//Retrieve full WOF record given the WOF id.
function getWOFRecord(wofId) {
  var url = wof_data_url + wofId.substr(0, 3) + '/' +
    wofId.substr(3, 3) + '/' + wofId.substr(6) + '/' + wofId + '.geojson';
  return httpGetSync(url);
}

//Perform a GET request to given url and return the results as a JSON object.
function httpGetSync(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.send();
  console.log(xhttp.status);
  if (xhttp.status === 200) {
    return JSON.parse(xhttp.responseText);
  }

  return false;
}
