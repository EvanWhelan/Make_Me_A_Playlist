loadRedditResults = (time) => {
    console.log("Connecting to reddit.");
    console.log(time);
    var url = "https://www.reddit.com/r/listentothis/top.json?t=year&limit=5000";
    fetch(url)
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        var listOfPosts = document.getElementById("posts");
        listOfPosts.innerHTML = "";
        var topPosts = json.data.children;
        console.log(topPosts);
        for(let i = 0; i < topPosts.length; i++){
            var currentPost = topPosts[i].data;
            var li = document.createElement("li");
            var flair = currentPost.link_flair_text;
            if (isValidPost(currentPost)) {
                generateInfoPanel(li, currentPost);
                listOfPosts.appendChild(li);
            }   
        }
    });
}

generateInfoPanel = (listItem, redditPost) => {

    var title = redditPost.title;
    var link = redditPost.url;
    
    var titleElement = document.createElement("h3");
    var titleText = document.createTextNode(title);

    titleElement.appendChild(titleText);

    var linkElement = document.createElement("a");
    var linkText = document.createTextNode(link);
    linkElement.appendChild(linkText);
    linkElement.title = titleText;
    linkElement.href = link;

    listItem.appendChild(titleElement); 
    listItem.appendChild(linkElement);

}

isValidPost = (post) => {
    var title = post.title.toLowerCase();
    var validTitle = !title.includes("discussion") && !title.includes("playlist");

    var validFlair = true;
    var flair = post.link_flair_text;

    if (flair != null && !flair.toLowerCase().includes("discussion")  && !flair.toLowerCase().includes("playlist")) {
        validFlair = true;
    }

    return validFlair && validTitle;

}