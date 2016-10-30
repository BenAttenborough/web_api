/*
 *	Code to handle visual elements only
 */

/*
 *	---GALLERY---
 */

/*
 *	Takes an array of pictures, builds html to display them and displays them on screen.
 *	If no images are passed then displays message
 *	@PARAM picturesHolder {array} An array of picture objects to display
 */

function displayPictures(picturesHolder) {
	var html = "<ul>";
	for (var index in picturesHolder) {
		html += "<li style='display:none'>";
		html += "	<a href='img/" + picturesHolder[index].fileurl + "'>";
		html += "		<img src='img/Thumbnails/" + picturesHolder[index].fileurl + "'";
		html += "			 alt='" + picturesHolder[index].alttext + "'";
		html += "		>";
		html += "	</a>";
		html += "</li>";
	}

	if (picturesHolder.length === 0) {
		html += "<h2>Sorry no images found for " + searchTerm + "</h2>";
	} 
	if (picturesHolder.length === 1) {
		$($instructions).hide();
		$(".col-prev a").hide();
		$(".col-next a").hide();
	} else {
		$($instructions).show();
		$(".col-prev a").show();
		$(".col-next a").show();
	}
	
	html += "</ul>";
	$(".pictures")
		.html( html );
	$(".pictures li").fadeIn("slow");
}

/*
 *	---LIGHTBOX---
 */

var $overlay = $("<div id='overlay' class='clearfix'></div>");
var $previousBtn = $("<div class='col-prev clearfix'><a href='#'><img src='img/previousBtn.png' class='nav-btn'></a></div>");
var $contentDiv = $("<div class='col-main clearfix'></div>");
var $nextBtn = $("<div class='col-next clearfix'><a href='#'><img src='img/nextBtn.png' class='nav-btn'></a></div>");
var $instructions =$("<p>Use arrow keys or buttons to cycle images</p>");
var $mediaContainer = $("<div class='media-container'>");
var $caption = $("<p></p>");
var $replacementImage;
var $replacementAltText;
var fullHeight;

/*
 *	Appends an overlay to the screen, this is initial hidden in CSS
 *	@PARAM none
 *  @RETURN none
 */
function addOverlay(){
	$contentDiv.append($instructions);
	$contentDiv.append($mediaContainer);
	$contentDiv.append($caption);
	$overlay.append($previousBtn);
	$overlay.append($contentDiv);
	$overlay.append($nextBtn);
	$("body").prepend($overlay);
	fullHeight = $( "body" ).height();
	$overlay.height( fullHeight );
}