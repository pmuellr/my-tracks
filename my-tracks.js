// Licensed under the Apache License. See footer for details.

var utils    = require("./lib/utils")
var getOpts  = require("./lib/getOpts")
var myTracks = require("./lib/my-tracks")

exports.main = main

//------------------------------------------------------------------------------
function main(args) {

  // parse/validate arguments
  var argsOpts = getOpts.parse(args)
  var args     = argsOpts.args
  var opts     = argsOpts.opts

  if (args.length < 2) getOpts.printHelp()

  var iDir = args[0]
  var oDir = args[1]

  if (!isDir(iDir)) {
    utils.logError("input directory argument is not a directory: `" + iDir + "`")
  }

  if (!isDir(oDir)) {
    utils.logError("output directory argument is not a directory: `" + oDir + "`")
  }

  myTracks.main(iDir, oDir, opts)
}

//------------------------------------------------------------------------------
function isDir(dir) {
  try {
    return fs.statSync(dir).isDirectory()
  }
  catch (e) {
    return false
  }
}

//------------------------------------------------------------------------------
if (require.main == module) main(process.argv.slice(2))

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
