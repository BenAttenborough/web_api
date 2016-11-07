/**
 * Created by ben on 07/11/2016.
 */

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
    if (search.type="Spotify albums") {
        getAJAXdata("https://api.spotify.com/v1/search", "artist", search.value);
    }
}

function getAJAXdata(api, type, query) {
    var args = {
        type : type,
        q : query
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
    for (var i=0; i<artists.length; i++){
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
}

function displayPictures(picturesHolder) {
    var html = "<ul>";
    for (var index in picturesHolder) {
        html += "<li style='display:none'>";
        html += "<div class='item-image' style='background-image: url(" + picturesHolder[index].picture +")'>";
        html += "	<a href='" + picturesHolder[index].picture + "'>";
        //html += "		<img src='" + picturesHolder[index].picture + "'";
        //html += "			 alt='" + picturesHolder[index].alttext + "'";
        //html += "		>";
        html += "	</a>";
        html += "</div>";
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
        .html( html );
    $(".pictures li").fadeIn("slow");
}