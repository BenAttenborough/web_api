/**
 * Created by ben on 07/11/2016.
 */

console.log("Nav working");

$('#mainmenu').click(function() {
    $('#menu-dropdown').slideToggle();
});

$('#spotify').click(function() {
    $('#search-value').text($(this).text());
    $('#menu-dropdown').slideToggle();
});
$('#starwars').click(function() {
    $('#search-value').text($(this).text());
    $('#menu-dropdown').slideToggle();
});
$('#github').click(function() {
    $('#search-value').text($(this).text());
    $('#menu-dropdown').slideToggle();
});