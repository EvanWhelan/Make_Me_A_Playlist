var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var request = require("request");
var cors = require("cors");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var fs = require("fs");
var readline = require("readline");
var {google} = require("googleapis");
var Oauth2 = google.auth.OAuth2;

var _client_id = ''; // Your client id
var _client_secret = ''; // Your secret
var _redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var _stateKey = 'spotify_auth_state';
var _userDetails = {};

var app = express();



var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.use(bodyParser.urlencoded({
    extended: false
  }))
  .use(cors())
  .use(cookieParser());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(_stateKey, state);
  console.log("EXPRESS ROUTED TO /LOGIN");
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: _client_id,
      scope: scope,
      redirect_uri: _redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter
  console.log("EXPRESS ROUTED TO /callback");

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[_stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(_stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: _redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(_client_id + ':' + _client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          _userDetails = body;
          console.log("User has logged in");
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/user_details', (req, res) => {
    if (Object.entries(_userDetails).length === 0 && _userDetails.constructor === Object) {
      console.log("User hasn't logged in");
    }
    else {
      console.log(JSON.stringify(_userDetails));
      res.send(JSON.stringify(_userDetails));
    }
});

app.get('/refresh_token', function (req, res) {
  console.log("EXPRESS ROUTED TO /refresh token");

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(_client_id + ':' + _client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


app.listen(8888, () => {
  console.log("Listening on port 8888");
})