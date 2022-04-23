$(document).ready(function() {

    /*global io*/
    let socket = io();

    io.on('connection', socket => {
        console.log('A user has connected');
    });


    // Form submittion with new message in field with id 'm'
    $('form').submit(function() {
        var messageToSend = $('#m').val();

        $('#m').val('');
        return false; // prevent form submit from refreshing page
    });
});