var _isAuthorised = false;
var _isLoaded = false;
var _playLists = [];

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({
            scope: "https://www.googleapis.com/auth/youtube.force-ssl"
        })
        .then(function () {
                console.log("Sign-in successful");
                _isAuthorised = true;
            },
            function (err) {
                console.error("Error signing in", err);
            });
}

function storePlaylists() {
    if (!_isAuthorised || !_isLoaded) {
        return;
    }

    return gapi.client.youtube.playlists.list({
            "part": "snippet.contentDetails",
            "maxResults": 25,
            "mine": true
        })
        .then(res => {
            console.log(res.result);
        })
}

function displayPlaylists() {
    _playLists.forEach(playlist => {
        console.log(playlist);
    })
}

function loadClient() {
    gapi.client.setApiKey("");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () {
                _isLoaded = true;
                console.log("GAPI client loaded for API");
                console.log("Loading user's playlists");
                fetchUsersPlaylists();
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}
// Make sure the client is loaded and sign-in is complete before calling this method.
function fetchUsersPlaylists() {

    if (!_isAuthorised || !_isLoaded) {
        initYoutubeAuth();
    }

    return gapi.client.youtube.playlists.list({
            "part": "snippet,contentDetails",
            "maxResults": 25,
            "mine": true
        })
        .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                generateListOfPlaylists(response.result);
            },
            function (err) {
                console.error("Execute error", err);
            });
}

function generateListOfPlaylists(playlistJson) {
    var playlists = playlistJson.items;
    _playLists = [];
    playlists.forEach(playlist => {
        var details = {
            title: playlist.snippet.title,
            id: playlist.id
        };
        _playLists.push(details);
    });
}

function addVideoToPlaylist(playlist, url) {
    if (!_isAuthorised || !_isLoaded) {
        initYoutubeAuth();
    }

    var urlSegments = url.split("watch?v=");
    var videoId = urlSegments[urlSegments.length - 1];

    return gapi.client.youtube.playlistItems.insert({
            "part": "snippet",
            "resource": {
                "snippet": {
                    "playlistId": playlist.id,
                    "position": 0,
                    "resourceId": {
                        "kind": "youtube#video",
                        "videoId": videoId
                    }
                }
            }
        })
        .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            });
}

function initYoutubeAuth() {   
    try {
        gapi.load("client:auth2", function () {
            gapi.auth2.init({
                client_id: ""
            });
        });

    } catch (error) {
        console.log(error)
    }
}