/// <reference path="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" />


var attendees = new Array();
//var winners = new Array();

$(document).ready(function ($) {
    $("#chooseWinner").click(function (e) {
        e.preventDefault;
        chooseWinnerId($.url(eventUrl.value).segment(2));
        return false;
    });

    $("#findEvent").click(function (e) {
        e.preventDefault;
        getEventDetails(eventUrl.value);
        return false;
    });
});

// event data logic
function getEventDetails(eventUrl) {
    var eventId = $.url(eventUrl).segment(2);
    attendees.length = 0;
    //winners.length = 0;
    if(eventId != null) {
        $('#main').show();
        $.getJSON('https://api.meetup.com/2/event/' + eventId + '?key=' + apiKey + '&signed=true&callback=?', function (data) {
            var list = $('#eventList');
            list.empty();

            if (data != null) {
                if (data.time > 0) {
                    var eventDate = new Date(data.time);
                    var eventTitle = '<h3>' + data.name + '</h3><p>' + $.format.date(eventDate, "MMM dd, yyyy h:mm a") + '</p>';
                    $('<p>')
                        .data('event', data)
                        .html(eventTitle)
                        .appendTo($('<li>').appendTo(list));
                }
            } else {
                list.html('<li>Sorry, the meeting could not be found.</li>');
            }
        });

        // get 'yes' rsvp's
        $.getJSON('https://api.meetup.com/2/rsvps?key=' + apiKey + '&sign=true&rsvp=yes&event_id=' + eventId + '&callback=?', function (data) {
            if (data.results.length > 0) {
                var i = 0;
                for (i = 0; i < data.results.length; i++) {
                    attendees[i] = [data.results[i].member.member_id];
                    console.log("attendees array filled");
                }
            }
        });
    }
}

// choose winner logic
function chooseWinnerId(eventId) {
    var randomRsvp = Math.floor(Math.random() * attendees.length);
    var userId = attendees[randomRsvp];
    console.log('user id=' + userId);
    getWinnerDetails(userId);
    //winners[winners.length] = userId;
    attendees = $.grep(attendees, function (value) {
        return value != userId;
    });
    console.log("attendees length=" + attendees.length);
    //console.log("winners length=" + winners.length);
    
}

function getWinnerDetails(userId) {
    $.getJSON('https://api.meetup.com/2/member/' + userId + '?key=' + apiKey + '&sign=true&callback=?', function (data) {
        if (data != null) {
            console.debug(data.name);
            $('#winnerInfo').show();
            //$('#winnerInfo').empty();
            //$('#winnerInfo').prepend("<hr>");
            //$('#winnerInfo').prepend('<p>' + data.city + ', ' + data.state + '</p>');
            //$('#winnerInfo').prepend('<p><strong>' + data.name + '</strong></p>');
            //if (data.photo != null) {
            //    $('#winnerInfo').prepend('<img src="' + data.photo.thumb_link + '" />');
            //}

            $('#winnerInfo').prepend('<p>' + data.city + ', ' + data.state + '</p>');
            $('#winnerInfo').prepend('<p><strong>' + data.name + '</strong></p>');
            if (data.photo != null) {
                $('#winnerInfo').prepend('<img src="' + data.photo.thumb_link + '" />');
            }
        }
    });
}