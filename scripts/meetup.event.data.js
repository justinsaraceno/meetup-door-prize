// event data logic
function getEventDetails(eventUrl) {
    var eventId = $.url(eventUrl).segment(2);
    if(eventId != null) {
        $('#main').show();
        $.getJSON('https://api.meetup.com/2/event/' + eventId + '?key=' + apiKey + '&signed=true&callback=?', function (data) {
            var list = $('#main').find('#list');
            list.empty();

            if (data != null) {
                if (data.time > 0) {
                    var eventDate = new Date(data.time);
                    var eventTitle = '<h2>' + data.name + '</h2><p>' + $.format.date(eventDate, "MMM dd, yyyy h:mm a") + '</p>';
                    $('<p>')
                        .data('event', data)
                        .html(eventTitle)
                        .appendTo($('<li>').appendTo(list));
                }
            } else {
                list.html('<li>Sorry, the meeting could not be found.</li>');
            }
        });
    }
}

// choose winner logic
function chooseWinnerId(eventId) {
    // get 'yes' rsvp's
    $.getJSON('https://api.meetup.com/2/rsvps?key=' + apiKey + '&sign=true&rsvp=yes&event_id=' + eventId + '&callback=?', function (data) {
        if (data.results.length > 0) {
            var randomRsvp = Math.floor(Math.random() * data.results.length);
            var userId = data.results[randomRsvp].member.member_id;
            console.debug('user id=' + userId);
            getWinnerDetails(userId);
        }
    });
}

function getWinnerDetails(userId) {
    $.getJSON('https://api.meetup.com/2/member/' + userId + '?key=' + apiKey + '&sign=true&callback=?', function (data) {
        if (data != null) {
            console.debug(data.name);
            $('#winnerInfo').empty();
            $('#winnerInfo').append('<p>' + data.name + '</p>');
            $('#winnerInfo').append('<p>' + data.city + ', ' + data.state + '</p>');
            if (data.photo != null) {
                $('#winnerInfo').append('<img src="' + data.photo.photo_link + '" />');
            }
        }
    });
}