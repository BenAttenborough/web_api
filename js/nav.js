/**
 * Created by ben on 07/11/2016.
 */

console.log("Nav working");

$('#mainmenu').click(function() {
    console.log('Menu clicked');
    $('#menu-dropdown').slideToggle();
});