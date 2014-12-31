// Licensed under the Apache License. See footer for details.

var Map

$(onLoad)

//------------------------------------------------------------------------------
function onLoad() {
  Map = L.map("map")

  MyTracks.tracks.forEach(function(track){
    if (track.geojson.features[0].geometry.coordinates.length == 0) return

    var marker = L.marker(track, {title: track.name})
    marker.addTo(Map)

    marker.on("click", function() {
      trackClicked(track)
    })

    var props = track.geojson.features[0].properties
    var popup = "<b>" + props.name + "</b><br>"
    popup += props.distanceS + "; "
    popup += props.elapsedTimeS + "; "
    popup += props.altUp + "ft up"

    marker.bindPopup(popup).openPopup()

    var layer = L.geoJson(track.geojson, {style: function() {return {color:"red"}}})
    layer.addTo(Map)
  })

  // MyFlickr = MyFlickr.slice(0, 20)
  MyFlickr.forEach(function(photo){
    var icon = L.icon({
      iconUrl:   photo.img,
      iconSize:  scaledIcon(photo),
      className: "flickr-icon",
    })

    var marker = L.marker(photo, {icon: icon})

    photo.marker = marker
    // marker.addTo(Map)

    var popupSize = scaledIcon(photo)

    var popup = "<img src='" + photo.img + "'" +
      " width="  + (popupSize[0]*10) +
      " height=" + (popupSize[1]*10) +
      ">" +
      "<br>" +
      "<a target='flickr' href='" + photo.url + "'>see on flickr</a>"

    var options = {
      maxWidth: 640
    }

    marker.bindPopup(popup, options).openPopup()
  })

  var layer = L.esri.basemapLayer("Topographic")
  layer.addTo(Map)

  var bounds = L.latLngBounds(MyTracks.tracks)
  Map.fitBounds(bounds, {padding:[20,20]})

  // Map.on("dragend", onViewReset)
  Map.on("moveend", onViewReset)
  Map.on("zoomend", onViewReset)
}

//------------------------------------------------------------------------------
function onViewReset() {
  var zoom   = Map.getZoom()  // show pictures at >= 14
  var bounds = Map.getBounds()

  // bounds.contains(latLng)

  MyFlickr.forEach(function(photo){
    Map.removeLayer(photo.marker)
  })

  if (zoom >= 14) {
    MyFlickr.forEach(function(photo){
      if (bounds.contains([photo.lat, photo.lon])) {
        Map.addLayer(photo.marker)
      }
    })
  }
}

//------------------------------------------------------------------------------
function trackClicked(track) {
  var coords = track.geojson.features[0].geometry.coordinates
  coords = coords.map(function(coord){
    return [coord[1], coord[0]]
  })

  var bounds = L.latLngBounds(coords)
  Map.fitBounds(bounds, {padding:[10,10]})
}

//------------------------------------------------------------------------------
function scaledIcon(photo) {
  var w = photo.width
  var h = photo.height

  if (w > h)
    return [64, 64 * (h / w)]
  else
    return [64 * (w / h), 64]
}

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
