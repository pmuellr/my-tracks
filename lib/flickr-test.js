var async   = require("async")
var request = require("request")

var api_key = "mumble mumble"

var perPage     = 5
var maxPages    = 2

var perPage     = 500
var maxPages    = 2000

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
  if (gotError("gotUser", err, response, body)) return

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
      per_page:       perPage,
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
  if (gotError("gotPix", err, response, body)) return

  body = JSON.parse(body)
  // console.log("gotPix: " + JSON.stringify(body, null, 2))
  // console.log("")

  var currNo = body.photos.page * body.photos.perpage
  console.error("processing " + currNo + " / " + body.photos.total + "; (apiCalls: " + apiCalls + ")")

  body.photos.photo.forEach(function(photo){
    if (!photo.latitude) return

    var photo = {
      id:  photo.id,
      url: "https://www.flickr.com/photos/pmuellr/" + photo.id + "/",
      lat: photo.latitude,
      lon: photo.latitude,
      img: null,
    }

    photos.push(photo)
  })

  if (pageNo == maxPages) {
    getPhotosInfo()
    return
  }

  if (body.photos.page == body.photos.pages) {
    getPhotosInfo()
    return
  }

  getPix(userID, pageNo + 1)
}

//------------------------------------------------------------------------------
function getPhotosInfo() {
  async.map(photos, getSizes, function(err, photos) {
    console.error("collected " + photos.length + " photos")
    console.log(JSON.stringify(photos, null, 2))
  })
}

//------------------------------------------------------------------------------
function getSizes(photo, cb) {
  var opts = {
    uri:              "https://api.flickr.com/services/rest/",
    qs: {
      api_key:        api_key,
      format:         "json",
      nojsoncallback: 1,
      method:         "flickr.photos.getSizes",
      photo_id:       photo.id,
    }
  }

  apiCalls++
  request(opts, function(err, response, body) {
    gotSizes(err, response, body, photo, cb)
  })
}

//------------------------------------------------------------------------------
function gotSizes(err, response, body, photo, cb) {
  completed++

  message = gotError("gotSizes", err, response, body)
  if (message) {
    return cb(Error(message))
  }

  body = JSON.parse(body)

  // args = photoID + ", " + lat + ", " + lon
  // console.log("gotSizes(" +  args + "): " + JSON.stringify(body, null, 2))
  // console.log("")

  body.sizes.size.forEach(function(size){
    if (size.label == "Large") {
      photo.img = size.source
    }
  })

  if (!photo.img) {
    photo.img = body.sizes.size[body.sizes.size.length - 1].source
  }

  delete photo.id
  cb(null, photo)
}

//------------------------------------------------------------------------------
function gotError(label, err, response, body) {
  var message = null

  try {
    body = JSON.parse(body)
  }
  catch (e) {
    message = label + ": error parsing JSON body: " + e
  }

  if (err) {
    message = label + ": error: " + err
  }

  else if (response.statusCode != 200) {
    message = label + ": http status: " + response.statusCode
  }

  else if (body.stat == "fail") {
    message = label + ": api error:" + body.code + ":" + body.message
  }

  if (!message) return

  console.error(message)
  return message
}
