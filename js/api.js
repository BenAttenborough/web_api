/**
 * Created by ben on 07/11/2016.
 *
 * App tested on MAC: Chromes, Firefox and Safari
 */

console.log("working");

/**
 * Creates HTML a dropdown filter for selected api
 * @returns {*|jQuery|HTMLElement}
 */
function createSearchFilter() {
    var api = $('select#api').val();
    var options = "";
    //create a dropdown menu with relevant search items
    if (api === "spotify") {
        options = "<option value='track'>Singles</option>";
        options += "<option value='album'>Albums</option>";
        options += "<option value='artist'>Artists</option>";
    } else if (api === "library") {
        options = "<option value='titles'>Titles</option>";
        options += "<option value='authors'>Authors</option>";
    }
    $searchFilter = $(
        "<div id='filter-content'>" +
        "<label for='search-filter'>Search filter: </label>" +
        "<select id='search-filter' name='filter'>" +
        options +
        "</select>" +
        "</div>"
    );
    return $searchFilter;
}

/**
 * Removes existing search filter (if any) and replaces it with a new one
 * @param searchFilter
 */
function addSearchFilter(searchFilter) {
    var $filterContainer = $('#filter-container');
    if ($('#filter-content')) {
        $('#filter-content').remove();
    }
    $filterContainer.append(createSearchFilter);
    watchUserFilter();
}
addSearchFilter(createSearchFilter);

/**
 * Watches to see if api selection changes and creates new menu as appropriate
 */
function watchFilter() {
    $('select#api').change(function () {
        var filter = addSearchFilter(createSearchFilter);
        //console.log("Menu changed");
        var searchString = $(".search__form__input").val();
        var userSearch = getUserSearch(searchString);
        runSearch(userSearch);
    });
}
watchFilter();

function watchUserFilter() {
    $('#search-filter').change(function () {
        //console.log("Menu changed");
        var searchString = $(".search__form__input").val();
        var userSearch = getUserSearch(searchString);
        runSearch(userSearch);
    });
}

function getUserSearch(searchString) {
    var searchType = getSearchType();
    var searchFilter = getSearchFilter();
    search = {
        value: searchString,
        type: searchType,
        filter: searchFilter
    };
    return search;
}

/**
 * Detects keypress on search form and activate search for entered string
 */
function watchKeypress() {
    var search = "";
    $(".search__form__input").keyup(function () {
        search = getUserSearch($(this).val());
        runSearch(search);
    });
}
watchKeypress();

function preventSubmission() {
    $(".search__form").submit(function (event) {
        event.preventDefault();
    });
}
preventSubmission();

/**
 * Returns search type from menu
 */
function getSearchType() {
    //console.log("getSearchType: " + $('#search-value').text());
    //console.log($('select#api').val())
    return $('select#api').val();
    //return $('#search-value').text();
}

function getSearchFilter() {
    //console.log($('#search-filter').val());
    return $('#search-filter').val();
}

/**
 * Runs search
 *
 * @param search
 */
function runSearch(search) {
    //console.log(search);
    if (search.type === "spotify") {
        getAJAXdata("https://api.spotify.com/v1/search", search);
    }
    else if (search.type === "library") {
        getAJAXdata("https://openlibrary.org/search.json", search);
    }
}

/**
 * Gets AJAX data and assign callback to run when data is ready
 * Called from runSearch
 * @param api
 * @param search
 */
function getAJAXdata(api, search) {
    var args = {};
    if (search.type === 'library') {
        args = {
            limit: 12
        };
        if (search.filter === 'authors') {
            args.author = search.value;
        } else {
            args.title = search.value;
        }
    } else {
        if (search.type === 'spotify') {
            args = {
                type: search.filter,
                q: search.value,
                limit: 12
            };
        }
    }

    var callback = function (data) {
        console.log(data);
        displayDataCallback(data, search);
    };
    //console.log("Api: " + api + " Args: " + args);
    $.getJSON(api, args, callback);
}

/**
 * Controls display of data once ajax call is complete
 * @param data
 * @param search
 */
function displayDataCallback(data, search) {
    //console.log(data);
    //var items = getItems(data, search);
    var items = getAllItems(data, search);
    displayPictures(items, search.value);
    assignClickFunctions(items);
}

function getAllItems(data, search) {
    switch (search.type) {
        case "spotify":
            //console.log("Get spotify");
            return getSpotifyData(data, search);
            break;
        case "library":
            //console.log("Get library");
            return getLibraryData(data, search);
            break;
        default:
            console.log("Error: api " + search.type + " Not recognised")
    }
}

function getSpotifyData(data, search) {
    var itemsHolder = [];
    var items;
    var preview;
    var artistURL;
    var artistName;
    var artistString;
    var picture;
    var i;
    var a;

    switch (search.filter) {
        case 'track':
            items = data.tracks.items;
            break;
        case 'album':
            items = data.albums.items;
            break;
        case 'artist':
            items = data.artists.items;
            break;
    }
    for (i = 0; i < items.length; i++) {
        picture = null;
        if (search.filter === 'track') {
            if (items[i].album.images[0]) {
                //console.log(artists[i].images[0].url);
                picture = items[i].album.images[0].url;
            } else {
                picture = "img/SpotifyDefault.jpg";
            }
        } else {
            if (items[i].images[0]) {
                //console.log(artists[i].images[0].url);
                picture = items[i].images[0].url;
            } else {
                picture = "img/SpotifyDefault.jpg";
            }
        }

        var item = {
            title: items[i].name,
            picture: picture,
            link: items[i].external_urls.spotify,
            meta: {
                //followers: followers
            }
        };

        if (search.filter === 'artist') {
            var followers = items[i].followers.total ? items[i].followers.total : "Unknown";
            var popularity = items[i].popularity ? items[i].popularity : "unknown";
            item.meta = {
                followers: followers,
                popularity: popularity
            };
        }

        if (search.filter === 'track') {
            preview = items[i].preview_url;
            artistString = "";

            if ("artists" in items[i] && items[i].artists.constructor === Array) {
                //console.log(items[i].artists.length);
                for (a = 0; a < items[i].artists.length; a++) {
                    //console.log("i: " + i + "a: " + a);
                    artistURL = items[i].artists[a].id;
                    artistName = items[i].artists[a].name;
                    if (a > 0) {
                        artistString += " and ";
                    }
                    artistString += "<a href='https://play.spotify.com/artist/" + artistURL + "'>" + artistName + "</a>";
                }
            } else {
                artistString = "Unknown";
            }
            var albumName = items[i].album.name;
            var albumHref = items[i].album.external_urls.spotify;
            var albumString = "<a href='" + albumHref + "' target='_blank'>" + albumName + "</a>";
            item.preview = preview;
            item.meta = {
                artist: artistString,
                album: albumString,
            };
        }

        if (search.filter === 'track' || search.filter === 'album') {
            preview = items[i].preview_url;
            artistString = "";

            if ("artists" in items[i] && items[i].artists.constructor === Array) {
                for (a = 0; a < items[i].artists.length; a++) {
                    artistURL = items[i].artists[a].id;
                    artistName = items[i].artists[a].name;
                    if (a > 0) {
                        artistString += " and ";
                    }
                    artistString += "<a href='https://play.spotify.com/artist/" + artistURL + "' target='_blank'>" + artistName + "</a>";
                }
            } else {
                artistString = "Unknown";
            }
            item.preview = preview;
            item.meta.artist = artistString;
        }

        if (search.filter === 'album') {
            var market;
            var marketString = "";
            if ("available_markets" in items[i] && items[i].available_markets.constructor === Array) {
                for (a = 0; a < items[i].available_markets.length; a++) {
                    market = items[i].available_markets[a];
                    if (a > 0) {
                        marketString += ", ";
                    }
                    marketString += market;
                }
            } else {
                marketString = "Unknown";
            }
            item.meta.Markets = marketString;
        }

        itemsHolder.push(item);
    }
    return itemsHolder;
}

function getLibraryData(data, search) {
    var itemsHolder = [];
    var picture;
    var i;
    var titles = data.docs;
    //console.log(titles);
    //if (search.type === "titles") {
    for (i = 0; i < titles.length; i++) {
        var title = titles[i].title;
        var coverID = titles[i].cover_i;
        if (coverID) {
            picture = "http://covers.openlibrary.org/b/ID/" + coverID + "-L.jpg";
        } else {
            picture = "img/SpotifyDefault.jpg";
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
    return itemsHolder;
}

/**
 * Displays item images
 * @param picturesHolder
 */
function displayPictures(picturesHolder, query) {
    var html = "<ul>";

    for (var index = 0; index < picturesHolder.length; index++) {
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

/*
 * 	Unbinds keydown event from document
 * 	@PARAM none
 *	@RETURN none
 */

function unbindKeyNav() {
    $(document).unbind("keydown");
}

/*
 * 	Binds keydown to the document to provide keyboard direction control via cursor keys,
 *  plus escape from lightbox via escape or q keys
 * 	@PARAM none
 *	@RETURN none
 */

function bindKeyNav(items, index) {
    $(document).bind("keydown", function (event) {
        switch (event.which) {
            case 37:
                changeImage('backwards', items, index);
                break;
            case 39:
                changeImage('fowards', items, index);
                break;
            case 27:
            case 81:
                unbindKeyNav();
                $("#overlay").hide();
                break;
        }
    });
}

function unbindCloseNavBttn() {
    $('#closeBtn').unbind("click");
}

function bindCloseNavBttn() {
    $('#closeBtn').click(function (event) {
        $("#overlay").hide();
        unbindCloseNavBttn();
    });
}

function assignClickFunctions(items) {
    $(".pictures a").click(function (event) {
        event.preventDefault();
        console.log("Item clicked");
        var index = $(this).parent().index();
        //console.log("Index: " + imageIndex);
        //$mediaContainer.html("<img src='img/SpotifyDefault.jpg'>");
        $(document).scrollTop(0);

        var captionText = "Blah";
        //$caption.html(captionText);
        addOverlay(items, index);
        bindKeyNav(items, index);
        bindCloseNavBttn();
        overlayClickFunctions(items, index);
    });
}

function overlayClickFunctions(items, index) {
    //console.log("Items:" + items);
    $("#overlay").click(function (event) {
        // Unbind keynav when overlay closed
        //console.log("Overlay clicked");
        //unbindKeyNav();
        //$(this).hide();
    });

    //Unbind click functions to stop rebinding of buttons
    $(".col-next a").unbind("click");
    $(".col-prev a").unbind("click");

    $(".col-next a").click(function (event) {
        event.stopPropagation();
        changeImage(event, 'forwards', items, index);
    });

    $(".col-prev a").click(function (event) {
        event.stopPropagation();
        //console.log("Items:" + items);
        changeImage(event, 'backwards', items, index);
    });
    unbindCloseNavBttn();
    bindCloseNavBttn();
}

function getMeta(item) {
    var metaString = "";
    var propTitle = "";
    if (item.meta) {
        //console.log(item.meta);
        for (var property in item.meta) {
            if (item.meta.hasOwnProperty(property)) {
                //console.log(property);
                //console.log(item.meta[property]);
                propTitle = property.charAt(0).toUpperCase() + property.slice(1);
                metaString += "<p>" + propTitle + ": " + item.meta[property] + "</p>";
            }
        }
    }
    return metaString;
}

function getPreview(item) {
    var previewString = "";
    if (item.preview) {
        previewString = '<iframe id="song-preview" src="' + item.preview + '" width="100%" height="100" frameborder="0" allowtransparency="true"></iframe>';
    }
    return previewString;
}

function addOverlay(items, index) {
    var item = items[index];
    var meta = getMeta(item);
    var preview = getPreview(item);

    var $overlay = $("<div id='overlay' class='clearfix'></div>");
    var $previousBtn = $("<div class='col-prev clearfix'><a href='#'><img src='img/PreviousBtn.png' class='nav-btn'></a></div>");
    var $contentDiv = $("<div class='col-main clearfix'></div>");
    var $nextBtn = $("<div class='col-next clearfix'><a href='#'><img src='img/nextBtn.png' class='nav-btn'></a></div>");
    var $instructions = $("<p>Use arrow keys or buttons to cycle items, press escape or click the X to exit</p>");
    var $closeButton = $("<div id='closeBtn'>X</div>");
    var $mediaContainer = $("<div class='media-container' style='background: url(" + item.picture + ") no-repeat top; background-size:contain'></div>");
    var $caption = $("<p>" + item.title + "</p>" + "" + "<p><a href='" + item.link + "' target='_blank'>Find out more</a></p>");
    var $meta = $(meta);
    var $preview = $(preview);
    var $replacementImage;
    var $replacementAltText;
    var fullHeight;

    $contentDiv.append($instructions);
    $mediaContainer.append($closeButton);
    $contentDiv.append($mediaContainer);
    $contentDiv.append($caption);
    $contentDiv.append($meta);
    //$contentDiv.append($preview);
    $overlay.append($previousBtn);
    $overlay.append($contentDiv);
    $overlay.append($nextBtn);
    $("body").prepend($overlay);
    fullHeight = $("body").height();
    $overlay.height(fullHeight);
}

/*
 * 	Fetches the next bit of media based on direction arrow clicked
 * 	@PARAM direction {string} the direction of the next media to fetch
 *	@RETURN none
 */

function changeImage(event, direction, items, index) {
    event.preventDefault();
    //console.log('changing item');
    //console.log("Change:" + items);
    if (direction === 'backwards') {
        if (index > 0) {
            index--;
        } else {
            index = items.length - 1;
        }
    } else {
        if (index < items.length - 1) {
            index++;
        } else {
            index = 0;
        }
    }
    $('#overlay').remove();
    addOverlay(items, index);
    unbindKeyNav();
    bindKeyNav(items, index);
    overlayClickFunctions(items, index);
}