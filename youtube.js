var isAuthorised = false;

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({
            scope: "https://www.googleapis.com/auth/youtube.readonly"
        })
        .then(function () {
                console.log("Sign-in successful");
                isAuthorised = true;
            },
            function (err) {
                console.error("Error signing in", err);
            });
}

function loadClient() {
    gapi.client.setApiKey("");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () {
                console.log("GAPI client loaded for API");
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}
// Make sure the client is loaded and sign-in is complete before calling this method.
function listUserPlaylists() {

    if(!isAuthorised) {
        return;
    }

    return gapi.client.youtube.playlists.list({
            "part": "snippet,contentDetails",
            "maxResults": 25,
            "mine": true
        })
        .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Playlists -> ", response.result);
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