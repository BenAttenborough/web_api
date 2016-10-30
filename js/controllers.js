/*
 *	Code to control of the program
 */

 /*
 *	---GALLERY---
 */

/*
 * 	Fetches pictures from pictures.js based on searchTerm, if searchTerm is empty or undefined it returns all pictures
 * 	@PARAM searchTerm {string} Text to check each picture's alt-text againt 
 *	@RETURN pictureHolder {array} An array of pictures which match the search term
 */

function getPictures(searchTerm) {
	picturesHolder = [];
	if ( searchTerm === undefined ) {
		searchTerm = "";
	}
	searchTerm = searchTerm.toLowerCase();
	for (i=0; i<pictures.length; i++) {
		picture = pictures[i];
		pictureAltText = pictures[i].alttext.toLowerCase();
		if ( pictureAltText.indexOf( searchTerm ) > 0 || searchTerm === "" ) {
			picturesHolder.push(picture);
		}
	}
	return picturesHolder;
}

/*
 * 	Binds keyup function to searchbar. When user presses key the resultant string is
 *  passed to getPictures() which returns relevant pictures which are then displayed by
 *  displayPictures(). Click events are then bound to each picture with assignClickFunctions()
 * 	@PARAM none
 *	@RETURN none
 */

function createSearch() {
	$(".search__form__input").keyup( function() {
		searchTerm = $(".search__form__input").val();
		displayPictures( getPictures(searchTerm) );
		assignClickFunctions();
	});
}

/*
 *	---LIGHTBOX---
 */

/*
 * 	Takes a media object and returns correctly formatted html for the media type
 * 	@PARAM media {object} The picture object, which should have a .media attribute
 *	@RETURN html {string} Correctly formatted html for the media type
 */

function getMedia(media) {
	html = "";
	switch (media.type) {
		case "picture":
			html = "<img src='img/" + media.fileurl + "'>";
			break;
		case "youtube":
			html  = "<iframe width='100%' height='100%'";
			html += "src='" + media.embed + "'>";
			html += "</iframe>";
			break;
		case "mixcloud":
			html  = "<iframe width='100%' height='100%'";
			html += "src='" + media.embed + "'>";
			html += "</iframe>";
			break;
		default:
			html = "<p>Filetype: " + media.type + " is not recognised</p>";
			break;
	}
	return html;
}

/*
 * 	Fetches the next bit of media based on direction arrow clicked
 * 	@PARAM direction {string} the direction of the next media to fetch
 *	@RETURN none
 */

function changeImage(direction) {
	event.preventDefault();
	if (direction === 'backwards') {
		if (imageIndex>0) {
		imageIndex--;
		} else {
		imageIndex = picturesHolder.length -1;
		}
	} else {
		if (imageIndex < picturesHolder.length -1) {
		imageIndex++;
		} else {
		imageIndex = 0;
		}
	}
	$mediaContainer.html( getMedia(picturesHolder[imageIndex]) );
	$caption.html( '<p>' + picturesHolder[imageIndex].alttext + '</p>' );
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

function bindKeyNav() {
	$(document).bind( "keydown", function(event) {
		switch (event.which) {
			case 37:
				changeImage('backwards');
				break;
			case 39:
				changeImage('fowards');
				break;
			case 27:
			case 81:
				unbindKeyNav();
				$("#overlay").hide();
				break;
		}
	}); 
}

/*
 * 	Assigns click events to the various elemnts
 * 	@PARAM none
 *	@RETURN none
 */

function assignClickFunctions() {
	$(".pictures a").click( function(){
		event.preventDefault();
		imageIndex = $(this).parent().index();
		$mediaContainer.html( getMedia(picturesHolder[imageIndex]) );
		$("#overlay").show();
		$(document).scrollTop( 0 );
		bindKeyNav();
		var captionText = picturesHolder[imageIndex].alttext;
		$caption.html(captionText);
	});

	$("#overlay").click( function(){
		// Unbind keynav when overlay closed
		unbindKeyNav();
		$(this).hide();
	});

	// Unbind click functions to stop rebinding of buttons
	$(".col-next a").unbind ("click");
	$(".col-prev a").unbind ("click");

	$(".col-next a").click( function(event){
		event.stopPropagation();
		changeImage('fowards');
	});

	$(".col-prev a").click( function(event){
		event.stopPropagation();
		changeImage('backwards');
	});

}