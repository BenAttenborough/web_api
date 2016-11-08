/**
 * Created by ben on 07/11/2016.
 */

console.log("App js working");

/**
 * Detects keypress on search form and activate search for entered string
 */
function watchKeypress() {
    var search = "";
    $(".search__form__input").keyup(function () {
        var searchString = $(this).val();
        var searchType = getSearchType();
        search = {
            value: searchString,
            type: searchType
        };
        console.log(search);
        runSearch(search);
    });
}
watchKeypress();

/**
 * Returns search type from menu
 */
function getSearchType() {
    console.log("getSearchType: " + $('#search-value').text());
    return $('#search-value').text();
}

/**
 * Runs search
 *
 * @param search
 */
function runSearch(search) {
    console.log(search);
    if (search.type === "Spotify albums") {
        getAJAXdata("https://api.spotify.com/v1/search", "artist", search);
    }
    else if (search.type === "Open library") {
        getAJAXdata("http://openlibrary.org/search.json", "title", search);
    }
}

/**
 * Gets AJAX data and assign callback to run when data is ready
 * Called from runSearch
 * @param api
 * @param type
 * @param query
 */
function getAJAXdata(api, type, search) {
    var args = {
        type: type,
        q: search.value,
        limit: 12
    };
    var callback = function (data) {
        console.log(data);
        displayDataCallback(data, search);
    };
    $.getJSON(api, args, callback);
}

/**
 * Controls display of data once ajax call is complete
 * @param data
 * @param search
 */
function displayDataCallback(data, search) {
    console.log(data);
    var items = getItems(data, search);
    displayPictures(items, search.value);
    assignClickFunctions(items);
}

/**
 * Takes raw ajax data and converts it into usable array
 * @param data
 * @returns {Array}
 */
function getItems(data, search) {
    console.log("Search: " + search);
    var itemsHolder = [];
    if (search.type === "Spotify albums") {
        var artists = data.artists.items;
        console.log(artists);
        for (var i = 0; i < artists.length; i++) {
            //console.log("Name: " + artists[i].name);
            var picture = null;
            if (artists[i].images[0]) {
                //console.log(artists[i].images[0].url);
                picture = artists[i].images[0].url;
            } else {
                //console.log("Error images unavailable");
                picture = "img/SpotifyDefault.jpg"
            }
            var followers = artists[i].followers.total ? artists[i].followers.total : "Unknown";
            var artist = {
                title: artists[i].name,
                picture: picture,
                link: artists[i].external_urls.spotify,
                meta: {
                    followers: followers
                }
            };
            itemsHolder.push(artist);
        }
    }
    else if (search.type === "Open library") {
        var titles = data.docs;
        console.log(titles);
        for (var i = 0; i < titles.length; i++){
            var title = titles[i].title;
            var coverID = titles[i].cover_i;
            if (coverID) {
                var picture = "http://covers.openlibrary.org/b/ID/" + coverID + "-L.jpg";
            } else {
                var picture = "img/SpotifyDefault.jpg";
            }
            var link = "https://openlibrary.org" + titles[i].key;
            var author = Array.isArray(titles[i].author_name) ? titles[i].author_name[0] : "Unknown";
            var published = titles[i].first_publish_year ? titles[i].first_publish_year : "Unknown";
            var book = {
                title: title,
                picture: picture,
                link: link,
                meta: {
                    author: author,
                    published: published
                }
            };
            itemsHolder.push(book);
        }
    }
    return itemsHolder;
    //console.log("artists: " + artistsHolder);
}

/**
 * Displays item images
 * @param picturesHolder
 */
function displayPictures(picturesHolder, query) {
    var html = "<ul>";
    for (var index in picturesHolder) {
        html += "<li style='display:none'>";
        html += "<a href='" + picturesHolder[index].picture + "'>";
        html += "   <div class='item-image' style='background-image: url(" + picturesHolder[index].picture + ")'>";
        html += "   </div>";
        html += "</a>";
        html += "<div class='item-title'>";
        html += "   <h3>" + picturesHolder[index].title + "</h3>";
        html += "</div>";
        html += "</li>";
    }

    if (picturesHolder.length === 0) {
        html += "<h2>Sorry no images found for " + query + "</h2>";
    }
    if (picturesHolder.length === 1) {
        //$($instructions).hide();
        $(".col-prev a").hide();
        $(".col-next a").hide();
    } else {
        //$($instructions).show();
        $(".col-prev a").show();
        $(".col-next a").show();
    }

    html += "</ul>";
    $(".pictures")
        .html(html);
    $(".pictures li").fadeIn("slow");
}

function assignClickFunctions(items) {
    $(".pictures a").click(function () {
        event.preventDefault();
        console.log("Item clicked");
        index = $(this).parent().index();
        //console.log("Index: " + imageIndex);
        //$mediaContainer.html("<img src='img/SpotifyDefault.jpg'>");
        $(document).scrollTop(0);
        //bindKeyNav();
        var captionText = "Blah";
        //$caption.html(captionText);
        addOverlay(items[index]);
        overlayClickFunctions();
        //Perhaps don't need to hide in first place?
        $("#overlay").show();
    });


}

function overlayClickFunctions() {
    $("#overlay").click(function () {
        // Unbind keynav when overlay closed
        console.log("Overlay clicked");
        //unbindKeyNav();
        $(this).hide();
    });

    // Unbind click functions to stop rebinding of buttons
    //$(".col-next a").unbind("click");
    //$(".col-prev a").unbind("click");
    //
    //$(".col-next a").click(function (event) {
    //    event.stopPropagation();
    //    changeImage('fowards');
    //});
    //
    //$(".col-prev a").click(function (event) {
    //    event.stopPropagation();
    //    changeImage('backwards');
    //});
}

function getMeta(item) {
    var metaString = "";
    var propTitle = "";
    if (item.meta) {
        console.log (item.meta);
        for (var property in item.meta) {
            if (item.meta.hasOwnProperty(property)) {
                console.log(property);
                console.log(item.meta[property]);
                propTitle = property.charAt(0).toUpperCase() + property.slice(1);
                metaString += "<p>" + propTitle + ": " + item.meta[property] + "</p>";
            }
        }
    }
    return metaString;
}

function addOverlay(item) {
    var meta = getMeta(item);

    var $overlay = $("<div id='overlay' class='clearfix'></div>");
    var $previousBtn = $("<div class='col-prev clearfix'><a href='#'><img src='img/previousBtn.png' class='nav-btn'></a></div>");
    var $contentDiv = $("<div class='col-main clearfix'></div>");
    var $nextBtn = $("<div class='col-next clearfix'><a href='#'><img src='img/nextBtn.png' class='nav-btn'></a></div>");
    var $instructions = $("<p>Use arrow keys or buttons to cycle images</p>");
    var $mediaContainer = $("<div class='media-container'><img src='" + item.picture + "'></div>");
    var $caption = $("<p>" + item.title + "</p>" + "" + "<p><a href='" + item.link + "'>Find out more</a></p>");
    var $meta = $(meta);
    var $replacementImage;
    var $replacementAltText;
    var fullHeight;

    //if ($('#overlay')) {
    //    $('#overlay').remove();
    //}
    $contentDiv.append($instructions);
    $contentDiv.append($mediaContainer);
    $contentDiv.append($caption);
    $contentDiv.append($meta);
    $overlay.append($previousBtn);
    $overlay.append($contentDiv);
    $overlay.append($nextBtn);
    $("body").prepend($overlay);
    console.log("Height: " + $("body").height());
    fullHeight = $("body").height();
    $overlay.height(fullHeight);
}