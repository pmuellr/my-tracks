// Licensed under the Apache License. See footer for details.

var path = require("path")

var jsdom       = require("jsdom")
var toGeoJSON   = require("togeojson")
var gpsDistance = require("gps-distance")

var KM2MILES = 0.621371

//------------------------------------------------------------------------------
exports.fromGPX = fromGPX

//------------------------------------------------------------------------------
function fromGPX(gpxFile) {
  var gpxContent = fs.readFileSync(gpxFile, "utf8")
  var gpxDom     = jsdom.jsdom(gpxContent)

  var geojson = toGeoJSON.gpx(gpxDom)

  fixGeoJSON(gpxFile, geojson)

  return geojson
}

//------------------------------------------------------------------------------
function fixGeoJSON(gpxFile, geoJSON) {
  var name = path.basename(gpxFile)
  name = name.split(".")[0]
  name = name.replace(/([a-zA-Z0-9])-([a-zA-Z])/g, "$1 $2")

  geoJSON.features.forEach(fixName)
  geoJSON.features.forEach(fixFeature)

  //-----------------------------------
  function fixName(feature){
    if (!feature.properties) return
    feature.properties.name = name
  }
}

//------------------------------------------------------------------------------
function fixFeature(feature) {
  if (!feature.properties) return
  if (!feature.properties.coordTimes) return
  if (!feature.geometry) return
  if (!feature.geometry.coordinates) return
  if (feature.geometry.type != "LineString") return

  var coordTimes  = feature.properties.coordTimes
  var coordinates = feature.geometry.coordinates

  var altUp   = 0
  var altDown = 0
  var prevAlt = null

  coordinates.forEach(function(coordinate) {
    if (!prevAlt) {
      prevAlt = coordinate[2]
      return
    }

    var alt = coordinate[2]
    var diff = alt - prevAlt

    if (diff > 0) altUp   +=  diff
    if (diff < 0) altDown += -diff

    prevAlt = alt
  })

  if (coordTimes.length != coordinates.length) return

  for (var i=0; i<coordinates.length; i++) {
    coordinates[i].splice(2,1)
  }

  // for (var i=0; i<coordTimes.length; i++) {
  //   coordinates[i].push(coordTimes[i])
  // }

  var dateStart = new Date(coordTimes[0])
  var dateStop  = new Date(coordTimes[coordTimes.length-1])
  var elapsed   = dateStop.getTime() - dateStart.getTime()

  var elapsedHr = Math.floor( elapsed/1000/60/60)
  var elapsedMn = Math.floor((elapsed - elapsedHr*1000*60*60) / 1000 / 60)

  var distance = Math.round(gpsDistance(coordinates) * KM2MILES * 10) / 10

  feature.properties.timeStart    = dateStart.toISOString().slice(0,19) + "Z"
  feature.properties.timeStop     = dateStop.toISOString().slice(0,19) + "Z"
  feature.properties.elapsedTime  = elapsed
  feature.properties.elapsedTimeS = elapsedHr + ":" + elapsedMn
  feature.properties.distance     = distance
  feature.properties.distanceS    = distance + "mi"
  feature.properties.altUp        = Math.round(altUp)
  feature.properties.altDown      = Math.round(altDown)

  delete feature.properties.coordTimes
  delete feature.properties.time
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
