loadRedditResults = (selectedTime) => {
    var timeSpan = selectedTime.innerText;
    var time = "";
    switch (timeSpan) {
        case "Today":
            time = "hour";
            break;
        case "Last 24 Hours":
            time="day";
            break;
        case "Last Week":
            time="week";
        break;
        case "Last Month":
            time="month";
        break;
        case "Last Year":
            time="year";
        break;            
        case "All Time":
            time="all";
        break; 
        default:
            time="all";
            break;
    }

    var url = "https://www.reddit.com/r/listentothis/top.json?t=" + time + "&limit=5000";
    document.getElementById("dt").innerText = timeSpan;
    fetch(url)
    .then((response) => {
        return response.json();
    })
    .then(function(json){
        var wrapper = document.getElementById("results-data");
        wrapper.innerHTML = "";
        var topPosts = json.data.children;
        console.log(topPosts);
        for(let i = 0; i < topPosts.length; i++){
            var currentPost = topPosts[i];
            if(currentPost.kind != "t3") {
                continue;
            }
            currentPost = currentPost.data;
            if (isValidPost(currentPost)) {
                generateInfoPanel(wrapper, currentPost);
            }
        }
    });
}

setStreamingServiceColumn = (dropdownElement, index) => {
    var selectedColumn = document.getElementById("column" + index);
    var stylingRulesName = applyStyling(dropdownElement.innerText);
    selectedColumn.classList.add(stylingRulesName);
}

generateStylingRules = (serviceName) => {
    switch (serviceName.toLowerCase()) {
        case "youtube":
            return "youtubeStyle";
        case "spotify":
            return "spotifyStyle";
        case "soundCloud":
            return "soundcloudStyle";
        default:
            return "";
    }
}

generateInfoPanel = (parentWrapper, redditPost) => {
    var gridRow = document.createElement("div");
    gridRow.className = "row data-row";
    
    var youtubePanel = generateYoutubePanel(redditPost);
    var redditPanel = generateRedditPanel(redditPost);
    var spotifyPanel = generateSpotifyPanel();  

    gridRow.appendChild(youtubePanel);
    gridRow.appendChild(redditPanel);
    gridRow.appendChild(spotifyPanel);

    parentWrapper.appendChild(gridRow);

}

isValidPost = (post) => {
    var title = post.title.toLowerCase();
    var validTitle = !title.includes("discussion") && !title.includes("playlist");

    if(!post.url.toLowerCase().includes("youtube.com")) {
        return false;
    }

    var validFlair = isValidFlair(post.link_flair_text);
    var validArchive = post.archived == true;

    return validFlair && validTitle && validArchive;
}

isValidFlair = (flair) => {
    if (flair == null) {
        return false;
    } else {
        var flairText = flair.toLowerCase();
        return !flairText.includes("discussion") && 
        !flairText.includes("playlist");
    }
}

cleanRedditTitle = (redditTitle) => {
    return redditTitle.replace(/\(.*?\)|\[.*?\]/g, "").replace("--", "-");
}

generateRedditPanel = (redditPost) => {
    var colDiv = document.createElement("div");
    colDiv.className = "col-sm-4";

    var youtubeUrl = redditPost.url;

    var title = cleanRedditTitle(redditPost.title);
    var titleElement = document.createElement("h4");
    var titleText = document.createTextNode(title);
    titleElement.appendChild(titleText); 

    var addToPlaylistButton = document.createElement("button");
    addToPlaylistButton.innerText = "Add To Playlist";
    addToPlaylistButton.onclick = addToYoutubePlaylist(youtubeUrl);

    colDiv.appendChild(titleElement);

    return colDiv;
}

addToYoutubePlaylist = (url) => {
    displayPlaylistsModal();
}

displayPlaylistsModal = () => {
    listUserPlaylists();
}

generateYoutubePanel = (redditPost) => {
    var colDiv = document.createElement("div");
    colDiv.className = "col-sm-4";

    var iFrameElement = document.createElement("iframe");
   
    var youtubeSrc = redditPost.url.replace("watch?v=" , "embed/");
    iFrameElement.setAttribute("src", youtubeSrc);
    iFrameElement.style.height = "100%";
    iFrameElement.style.width = "75%";

    colDiv.appendChild(iFrameElement);
    
    return colDiv;
}

generateSpotifyPanel = () => {
    var colDiv = document.createElement("div");
    colDiv.className = "col-sm-4";

    var titleElement = document.createElement("h4");
    var titleText = document.createTextNode("SPOTIFY HERE");
    titleElement.appendChild(titleText); 

    colDiv.appendChild(titleElement);
    
    return colDiv;
}