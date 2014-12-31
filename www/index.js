// Licensed under the Apache License. See footer for details.

var Map

$(onLoad)

//------------------------------------------------------------------------------
function onLoad() {
  Map = L.map("map")

  var layer = L.esri.basemapLayer("Topographic")
  layer.addTo(Map)

  var bounds = L.latLngBounds(MyTracks.tracks)
  Map.fitBounds(bounds, {padding:[20,20]})

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

  MyFlickr = MyFlickr.slice(0, 20)
  MyFlickr.forEach(function(photo){
    var icon = L.icon({
      iconUrl:  photo.img,
      iconSize: scaledIcon(photo)
    })

    var marker = L.marker(photo, {icon: icon})
    marker.addTo(Map)

    marker.on("click", function() {
      window.open(photo.url, "flickr_image")
    })
  })

  Map.on("zoomlevelschange", zoomLevelChange)
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
function zoomLevelChange() {
  var zoom = Map.getZoom()

  if (zoom < 14) {

  }
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
