/**
 * Created by ben on 07/11/2016.
 */

var $overlay = $("<div id='overlay' class='clearfix'></div>");
var $previousBtn = $("<div class='col-prev clearfix'><a href='#'><img src='img/previousBtn.png' class='nav-btn'></a></div>");
var $contentDiv = $("<div class='col-main clearfix'></div>");
var $nextBtn = $("<div class='col-next clearfix'><a href='#'><img src='img/nextBtn.png' class='nav-btn'></a></div>");
var $instructions = $("<p>Use arrow keys or buttons to cycle images</p>");
var $mediaContainer = $("<div class='media-container'>");
var $caption = $("<p></p>");
var $replacementImage;
var $replacementAltText;
var fullHeight;

addOverlay();

console.log("App js working");

/**
 * Detects keypress on search form and activate search for entered string
 */
function watchKeypress() {
    $(".search__form__input").keyup(function () {
        var searchString = $(this).val();
        var searchType = getSerachType();
        var search = {
            value: searchString,
            type: searchType
        };
        runSearch(search);

    });
}
watchKeypress();

/**
 * Returns search type from menu
 */
function getSerachType() {
    return $('#search-value').text();
}

/**
 * Runs search
 *
 * @param search
 */
function runSearch(search) {
    console.log(search);
    if (search.type = "Spotify albums") {
        getAJAXdata("https://api.spotify.com/v1/search", "artist", search.value);
    }
}

function getAJAXdata(api, type, query) {
    var args = {
        type: type,
        q: query
    };
    var callback = function (data) {
        //console.log(data);
        showItems(data);
    };
    $.getJSON(api, args, callback);
}

function showItems(data) {
    var artistsHolder = [];
    var artists = data.artists.items;
    for (var i = 0; i < artists.length; i++) {
        console.log("Name: " + artists[i].name);
        var picture = null;
        if (artists[i].images[0]) {
            //console.log(artists[i].images[0].url);
            picture = artists[i].images[0].url;
        } else {
            //console.log("Error images unavailable");
            picture = "img/SpotifyDefault.jpg"
        }
        var artist = {
            title: artists[i].name,
            picture: picture
        };
        artistsHolder.push(artist);
    }
    console.log("artists: " + artistsHolder);
    displayPictures(artistsHolder);
    addOverlay();
}

function displayPictures(picturesHolder) {
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
        html += "<h2>Sorry no images found for " + searchTerm + "</h2>";
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
    assignClickFunctions();
}

function assignClickFunctions() {
    $(".pictures a").click(function () {
        event.preventDefault();
        console.log("Item clicked");
        imageIndex = $(this).parent().index();
        $mediaContainer.html("<img src='img/SpotifyDefault.jpg'>");
        $("#overlay").show();
        $(document).scrollTop(0);
        //bindKeyNav();
        var captionText = "Blah";
        $caption.html(captionText);
    });

    $("#overlay").click(function () {
        // Unbind keynav when overlay closed
        unbindKeyNav();
        $(this).hide();
    });

    // Unbind click functions to stop rebinding of buttons
    $(".col-next a").unbind("click");
    $(".col-prev a").unbind("click");

    $(".col-next a").click(function (event) {
        event.stopPropagation();
        changeImage('fowards');
    });

    $(".col-prev a").click(function (event) {
        event.stopPropagation();
        changeImage('backwards');
    });
}

function addOverlay() {
    if ($('#overlay')) {
        $('#overlay').remove();
    }
    $contentDiv.append($instructions);
    $contentDiv.append($mediaContainer);
    $contentDiv.append($caption);
    $overlay.append($previousBtn);
    $overlay.append($contentDiv);
    $overlay.append($nextBtn);
    $("body").prepend($overlay);
    console.log("Height: " + $("body").height());
    fullHeight = $("body").height();
    $overlay.height(fullHeight);
}