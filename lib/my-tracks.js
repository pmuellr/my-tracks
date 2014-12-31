// Licensed under the Apache License. See footer for details.

var fs   = require("fs")
var path = require("path")

var async    = require("async")
var jsdom    = require("jsdom")
var shelljs  = require("shelljs")

var utils   = require("./utils")
var geoJSON = require("./geoJSON")

exports.main = main

//------------------------------------------------------------------------------
function main(iDir, oDir, opts) {

  // read gpx files
  gpxFiles = getGpxFiles(iDir)
  if (opts.max) gpxFiles = gpxFiles.slice(0, opts.max)

  if (gpxFiles.length == 0) {
    utils.logError("no GPX files found in input directory: `" + iDir + "`")
  }

  // copy base files
  var wwwDir = path.join(__dirname, "..", "www", "*")
  utils.logv("copying base files to `" + oDir + "`")
  shelljs.cp("-fR", wwwDir, oDir)

  // process gpx files
  var geoDir = path.join(oDir, "geo")

  var tracks = []
  gpxFiles.forEach(function(gpxFile){
    var gjFile = path.basename(gpxFile)
    gjFile = gjFile.split(".")[0]
    gjFile = gjFile + ".geo.json"

    utils.logv("reading: " + gpxFile)
    var gj = geoJSON.fromGPX(gpxFile)

    tracks.push({
      file:    gjFile,
      name:    gj.features[0].properties.name,
      lat:     gj.features[0].geometry.coordinates[0][1],
      lon:     gj.features[0].geometry.coordinates[0][0],
      geojson: gj,
    })

    gj     = JSON.stringify(gj)
    gjFile = path.join(geoDir, gjFile)

    utils.logv("writing: " + gjFile)
    fs.writeFileSync(gjFile, gj)
  })

  // write list of geoJSON files
  tracks = {tracks: tracks}
  tracks = "MyTracks = " + JSON.stringify(tracks)

  fs.writeFileSync(path.join(geoDir, "index.js"), tracks)
}

//------------------------------------------------------------------------------
function getGpxFiles(iDir) {
  var files = fs.readdirSync(iDir)

  files = files.filter(function(file){
    return file.match(/\.gpx$/i)
  })

  files = files.map(function(file){
    return path.join(iDir, file)
  })

  return files
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
