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
    var marker = L.marker(track, {title: track.name})
    marker.addTo(Map)
  })
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
