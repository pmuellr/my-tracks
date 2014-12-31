# Licensed under the Apache License. See footer for details.

pkg = require("./package.json")

#-------------------------------------------------------------------------------
tasks = defineTasks exports,
  watch: "watch for source file changes, build"
  build: "run a build"
  bower: "get files from bower"

WatchSpec = "*.js lib lib/**/* www www/**/*"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
tasks.build = ->
  tasks.bower()
  # build_browser_version()
  exec "node my-tracks.js --verbose --max 10 ../gps-tracks/tracks tmp/out"

#-------------------------------------------------------------------------------
tasks.watch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watchFiles "jbuild.coffee" :->
    log "jbuild file changed; exiting"
    process.exit 0

#-------------------------------------------------------------------------------
tasks.bower = ->
  copyBowerFiles "www/bower"

#-------------------------------------------------------------------------------
build_browser_version = ->

  oFile = "www/agentMemo-browser.js"
  tFile = "tmp/agentMemo-browser.js"

  opts = """
    --standalone agentMemo
    --outfile    #{tFile}
    --entry      lib/agentMemo
    --exclude    "node_modules/websocket/**/*"
    --debug
  """

  opts = opts.trim().split(/\s+/).join(" ")

  browserify opts

  cat_source_map "--fixFileNames #{tFile} #{oFile}"

  log "generated #{oFile}"

#-------------------------------------------------------------------------------
copyBowerFiles = (dir) ->

  bowerConfig = require "./bower-config"

  cleanDir dir

  for name, {version, files} of bowerConfig
    unless test "-d", "bower_components/#{name}"
      log "installing from bower: #{name} (#{version})"
      exec "node node_modules/.bin/bower install #{name}##{version}"
      log ""

  for name, {version, files} of bowerConfig
    for src, dst of files
      src = "bower_components/#{name}/#{src}"

      if dst is "."
        dst = "#{dir}/#{name}"
      else
        dst = "#{dir}/#{name}/#{dst}"

      mkdir "-p", dst

      cp "-R", src, dst

#-------------------------------------------------------------------------------
watchIter = ->
  tasks.build()

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

#-------------------------------------------------------------------------------
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
