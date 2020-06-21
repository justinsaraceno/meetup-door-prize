// Initialize Meetup API
api = mu.Api({
    clientId: 'jd6cpjbd8v063nkgn52dpst4g1'
    , onMember: function (member, token) {
        localStorage['token'] = token;
        meetupService.setToken(token);
        $('.connect').hide(); $('#disconnect').show();
        $('#loggedout').hide(); $('#loggedin').removeClass('hidden');
        // retrieve logged-on user's events
        $.getJSON('https://api.meetup.com/self/calendar?sign=true&photo-host=public&access_token=' + token +
            '&page=10&callback=?', function (evts) {
                var errors = evts.data.errors;
                if(typeof(errors) !== 'undefined' && errors.length > 0)
                {
                    console.error('Meetup API error code=' + errors[0].code + ', message =' + errors[0].message);
                }

                var el = $('#events'), buff = [];
                $.map(evts.data, function (e) {
                    buff.push('<li class="eventid" data-value=' + e.id + ' data-urlname=' + e.group.urlname + ' data-dismiss="modal">' + e.name.link('#') + '</li>');
                });
                el.append(buff.join(''));
                addEventClick();
            });
        $('#member').html("<a href='#' id='disconnect'>Logout " + member.name + "</a>");
        $('#choose-meeting').modal('show');
    }
});

(function ($) {
    $(function () {
        // set site copyright year
        $('#year').text(new Date().getFullYear());
        
        // wire-up login click
        $('.connect').on('click', function (e) {
            e.preventDefault();
            api.login();
            return false;
        });

        // wire-up logout click
        $('#member').on('click', '#disconnect', function (e) {
            e.preventDefault();
            api.logout(function () {
                $('#disconnect').hide(); $('#connect').show();
                $('loggedin').hide();
                window.location.reload();
            });
            return false;
        });
    });
})(jQuery);


function addEventClick() {
    $('#events li').on('click', (function (e) {
        e.preventDefault();
        var eventId = $(this).attr('data-value');
        var urlname = $(this).attr('data-urlname');
        // retreive event details
        meetupService.getEvent(eventId, urlname, function (data) {
            $('#meeting-title')[0].lastChild.data = data.data.name;
        });

        // retrieve event's 'yes' rsvp's and attendees
        meetupService.getYesRsvps(eventId, urlname, function (data) {
            if(data.data.length > 0){
                localStorage.setItem('attendeeData', JSON.stringify(data.data));
                // select first winner
                chooseWinner();
            }
        });
    }));

    // wire-up select winner click event
    $('#select-winner').on('click', function (e) {
        chooseWinner();
        e.preventDefault();
        return false;
    });
}

// ajax calls
var meetupService = new function () {
    var token = localStorage['token'];
    var serviceBase = 'https://api.meetup.com',
        getEvent = function (eventId, urlname, callback) {
            $.getJSON(serviceBase + '/' + urlname + '/events/' + eventId + '?sign=true&photo-host=public&callback=?', { access_token: token }, function (data) {
                callback(data);
            });
        },
        getYesRsvps = function (eventId, urlname, callback) {
            $.getJSON(serviceBase + '/' + urlname + '/events/' + eventId + '/rsvps?sign=true&photo-host=public&response=yes&callback=?', { access_token: token, rsvp: 'yes', event_id: eventId }, function (data) {
                callback(data);
            });
        },
        setToken = function (apiToken) {
            token = apiToken;
        };

    return {
        getEvent: getEvent,
        getYesRsvps: getYesRsvps,
        setToken: setToken
    };
}();

function chooseWinner(){
    var attendeeData = localStorage.getItem('attendeeData');
    var attendees = JSON.parse(attendeeData);
    if(attendees.length > 0){
        var randomRsvp = Math.floor(Math.random() * attendees.length);
        var winner = attendees[randomRsvp];
        attendees = $.grep(attendees, function (value) {
            // remove winner from pool
            return value != winner;
        });
    
        displayWinnerDetails(winner);
        // place candidate pool in localstorage
        localStorage['attendees'] = JSON.stringify(attendees);
    }
}

function displayWinnerDetails(winner){
    $('#winnername').text(winner.member.name);
    if (winner.member.photo != null) {
        $('#winnerphoto').attr('src', winner.photo.photo_link);
    } else {
        // winner has no photo, use default image
        $('#winnerphoto').attr('src', './images/nophoto.jpg');
    }
}