/**
 * Created by ben on 07/11/2016.
 */

console.log("App js working");

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
    )
    ;
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
}
addSearchFilter(createSearchFilter);

/**
 * Watches to see if api selection changes and creates new menu as appropriate
 */
function watchFilter() {
    $('select#api').change(function () {
        addSearchFilter(createSearchFilter);
    });
}
watchFilter();


/**
 * Detects keypress on search form and activate search for entered string
 */
function watchKeypress() {
    var search = "";
    $(".search__form__input").keyup(function () {
        var searchString = $(this).val();
        var searchType = getSearchType();
        var searchFilter = getSearchFilter();
        search = {
            value: searchString,
            type: searchType,
            filter: searchFilter
        };
        //console.log(search);
        runSearch(search);
    });
}
watchKeypress();

function preventSubmission() {
    $( ".search__form" ).submit(function( event ) {
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
    console.log($('#search-filter').val());
    return $('#search-filter').val();
}

/**
 * Runs search
 *
 * @param search
 */
function runSearch(search) {
    console.log(search);
    if (search.type === "spotify") {
        getAJAXdata("https://api.spotify.com/v1/search", search);
    }
    else if (search.type === "library") {
        getAJAXdata("http://openlibrary.org/search.json", search);
    }
}

/**
 * Gets AJAX data and assign callback to run when data is ready
 * Called from runSearch
 * @param api
 * @param search
 */
function getAJAXdata(api, search) {
    console.log("TYPE: " + search.type);
    if (search.type === 'library') {
        var args = {
            limit: 12
        };
        if (search.filter === 'authors') {
            args.author = search.value;
        } else {
            args.title = search.value;
        }
    } else {
        if (search.type === 'spotify') {
            var args = {
                type: search.filter,
                q: search.value,
                limit: 12
            }
        }
    }

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
    var itemsHolder = [];
    var items;
    if (search.type === "spotify") {
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
        for (var i = 0; i < items.length; i++) {
            var picture = null;
            if (search.filter === 'track') {
                if (items[i].album.images[0]) {
                    //console.log(artists[i].images[0].url);
                    picture = items[i].album.images[0].url;
                } else {
                    picture = "img/SpotifyDefault.jpg"
                }
            } else {
                if (items[i].images[0]) {
                    //console.log(artists[i].images[0].url);
                    picture = items[i].images[0].url;
                } else {
                    picture = "img/SpotifyDefault.jpg"
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
                item.meta = {
                    followers: followers
                }
            }

            if (search.filter === 'track') {
                var preview = items[i].preview_url;
                item.preview = preview;
            }

            itemsHolder.push(item);
        }
    }
    else if (search.type === "library") {
        var titles = data.docs;
        //console.log(titles);
        //if (search.type === "titles") {
        for (var i = 0; i < titles.length; i++) {
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

/*
 * 	Unbinds keydown event from document
 * 	@PARAM none
 *	@RETURN none
 */

function unbindKeyNav() {
    $(document).unbind( "keydown" );
}

/*
 * 	Binds keydown to the document to provide keyboard direction control via cursor keys,
 *  plus escape from lightbox via escape or q keys
 * 	@PARAM none
 *	@RETURN none
 */

function bindKeyNav(items, index) {
    $(document).bind( "keydown", function(event) {
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

function assignClickFunctions(items) {
    $(".pictures a").click(function () {
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
        overlayClickFunctions(items, index);
    });
}

function overlayClickFunctions(items, index) {
    console.log("Items:" + items);
    $("#overlay").click(function () {
        // Unbind keynav when overlay closed
        console.log("Overlay clicked");
        //unbindKeyNav();
        //$(this).hide();
    });

     //Unbind click functions to stop rebinding of buttons
    $(".col-next a").unbind("click");
    $(".col-prev a").unbind("click");

    $(".col-next a").click(function (event) {
        event.stopPropagation();
        changeImage('fowards', items, index);
    });

    $(".col-prev a").click(function (event) {
        event.stopPropagation();
        console.log("Items:" + items);
        changeImage('backwards', items, index);
    });
}

function getMeta(item) {
    var metaString = "";
    var propTitle = "";
    if (item.meta) {
        console.log(item.meta);
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
    var $previousBtn = $("<div class='col-prev clearfix'><a href='#'><img src='img/previousBtn.png' class='nav-btn'></a></div>");
    var $contentDiv = $("<div class='col-main clearfix'></div>");
    var $nextBtn = $("<div class='col-next clearfix'><a href='#'><img src='img/nextBtn.png' class='nav-btn'></a></div>");
    var $instructions = $("<p>Use arrow keys or buttons to cycle items</p>");
    var $mediaContainer = $("<div class='media-container'><img src='" + item.picture + "'></div>");
    var $caption = $("<p>" + item.title + "</p>" + "" + "<p><a href='" + item.link + "'>Find out more</a></p>");
    var $meta = $(meta);
    var $preview = $(preview);
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
    //$contentDiv.append($preview);
    $overlay.append($previousBtn);
    $overlay.append($contentDiv);
    $overlay.append($nextBtn);
    $("body").prepend($overlay);
    console.log("Height: " + $("body").height());
    fullHeight = $("body").height();
    $overlay.height(fullHeight);
}

/*
 * 	Fetches the next bit of media based on direction arrow clicked
 * 	@PARAM direction {string} the direction of the next media to fetch
 *	@RETURN none
 */

function changeImage(direction, items, index) {
    event.preventDefault();
    console.log('changing item');
    console.log("Change:" + items);
    if (direction === 'backwards') {
        if (index>0) {
            index--;
        } else {
            index = items.length -1;
        }
    } else {
        if (index < items.length -1) {
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