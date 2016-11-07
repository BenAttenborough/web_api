/**
 * Created by ben on 07/11/2016.
 */

console.log("Nav working");

$('#mainmenu').click(function() {
    console.log('Menu clicked');
    $('#menu-dropdown').slideToggle();
});

$('#spotify').click(function() {
    $('#search-value').text($(this).text());
});
$('#starwars').click(function() {
    $('#search-value').text($(this).text());
});
$('#github').click(function() {
    $('#search-value').text($(this).text());
});