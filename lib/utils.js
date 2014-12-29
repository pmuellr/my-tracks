// Licensed under the Apache License. See footer for details.

var pkg = require("../package.json")

//------------------------------------------------------------------------------
exports.PROGRAM     = pkg.name
exports.PACKAGE     = pkg.name
exports.VERSION     = pkg.version
exports.DESCRIPTION = pkg.description
exports.HOMEPAGE    = pkg.homepage

exports.log      = log
exports.logError = logError
exports.logv     = logv
exports.verbose  = verbose
exports.JS       = JS
exports.JL       = JL

var Verbose = false

//------------------------------------------------------------------------------
function verbose(value) {
  if (value != null) Verbose = !!value
  return Verbose
}

//------------------------------------------------------------------------------
function log(message) {
  console.log(exports.PROGRAM + ": " + message)
}

//------------------------------------------------------------------------------
function logError(message) {
  exports.log("error: " + message)
  process.exit(1)
}

//------------------------------------------------------------------------------
function logv(message) {
  if (!Verbose) return

  exports.log(message)
}

//------------------------------------------------------------------------------
function JS(object) { return JSON.stringify(object) }
function JL(object) { return JSON.stringify(object, null, 4) }

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
