var request = require("request")

var api_key = "mumble mumble"

var gotLastPage = false
var queued      = 0
var completed   = 0
var apiCalls    = 0

var photos = []

getUser("pmuellr")

//------------------------------------------------------------------------------
function getUser(userName) {
  var opts = {
    uri:              "https://api.flickr.com/services/rest/",
    qs: {
      api_key:        api_key,
      format:         "json",
      nojsoncallback: 1,
      method:         "flickr.people.findByUsername",
      username:       userName,
    }
  }

  apiCalls++
  request(opts, gotUser)
}


//------------------------------------------------------------------------------
function gotUser(err, response, body) {
  if (err) {
    console.log("gotUser: error: " + err)
    return
  }

  body = JSON.parse(body)
  // console.log("gotUser: " + JSON.stringify(body, null, 2))
  // console.log("")

  var userID = body.user.id

  getPix(userID, 1)
}

//------------------------------------------------------------------------------
function getPix(userID, pageNo) {
  var opts = {
    uri:              "https://api.flickr.com/services/rest/",
    qs: {
      api_key:        api_key,
      format:         "json",
      nojsoncallback: 1,
      method:         "flickr.people.getPublicPhotos",
      user_id:        userID,
      page:           pageNo,
      per_page:       500,
      extras:         "geo"
    }
  }

  apiCalls++
  request(opts, function(err, response, body) {
    gotPix(err, response, body, userID, pageNo)
  })
}

//------------------------------------------------------------------------------
function gotPix(err, response, body, userID, pageNo) {
  if (err) {
    console.log("gotPix: error: " + err)
    return
  }

  body = JSON.parse(body)
  // console.log("gotPix: " + JSON.stringify(body, null, 2))
  // console.log("")

  var currNo = body.photos.page * body.photos.perpage
  console.error("processing " + currNo + " / " + body.photos.total + "; (apiCalls: " + apiCalls + ")")

  body.photos.photo.forEach(function(photo){
    if (!photo.latitude) return

    getSizes(photo.id, photo.latitude, photo.longitude)
  })

  // if (pageNo == 2) {
  //   gotLastPage = true
  //   return
  // }

  if (body.photos.page == body.photos.pages) {
    gotLastPage = true
    return
  }

  getPix(userID, pageNo+1)
}

//------------------------------------------------------------------------------
function getSizes(photoID, lat, lon) {
  var opts = {
    uri:              "https://api.flickr.com/services/rest/",
    qs: {
      api_key:        api_key,
      format:         "json",
      nojsoncallback: 1,
      method:         "flickr.photos.getSizes",
      photo_id:       photoID,
    }
  }

  queued++

  apiCalls++
  request(opts, function(err, response, body) {
    gotSizes(err, response, body, photoID, lat, lon)
  })
}

//------------------------------------------------------------------------------
function gotSizes(err, response, body, photoID, lat, lon) {
  if (err) {
    console.log("gotSizes: error: " + err)
    return
  }

  body = JSON.parse(body)

  // args = photoID + ", " + lat + ", " + lon
  // console.log("gotSizes(" +  args + "): " + JSON.stringify(body, null, 2))
  // console.log("")

  var photo = {
    id:    photoID,
    lat:   lat,
    lon:   lon,
    sizes: {}
  }

  body.sizes.size.forEach(function(size){
    var key = size.width + "x" + size.height

    photo.sizes[key] = size.source
  })

  photos.push(photo)

  completed++

  if (gotLastPage && (queued == completed)) {
    console.log(JSON.stringify(photos, null, 2))
  }
}
