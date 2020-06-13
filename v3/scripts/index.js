// Initialize Meetup API
api = mu.Api({
    clientId: "jd6cpjbd8v063nkgn52dpst4g1"
    , onMember: function (member, token) {
        localStorage["token"] = token;
        meetupService.setToken(token);
        $(".connect").hide(); $("#disconnect").show();
        $("#loggedout").hide(); $("#loggedin").removeClass("hidden");
        // retrieve logged-on user's events
        $.getJSON("https://api.meetup.com/self/calendar?sign=true&photo-host=public&access_token=" + token +
            "&page=10&callback=?", function (evts) {
                var errors = evts.data.errors;
                if(typeof(errors) !== 'undefined' && errors.length > 0)
                {
                    console.error('Meetup API error code=' + errors[0].code + ', message =' + errors[0].message);
                }

                var el = $("#events"), buff = [];
                $.map(evts.data, function (e) {
                    buff.push('<li class="eventid" data-value=' + e.id + ' data-urlname=' + e.group.urlname + ' data-dismiss="modal">' + e.name.link('#') + '</li>');
                });
                el.append(buff.join(''));
                addEventClick();
            });
        $("#member").html("<a href='#' id='disconnect'>Logout " + member.name + "</a>");
        $("#choose-meeting").modal('show');
    }
});

(function ($) {
    $(function () {
        // set site copyright year
        $("#year").text(new Date().getFullYear());
        
        // wire-up login click
        $(".connect").on('click', function (e) {
            e.preventDefault();
            api.login();
            return false;
        });

        // wire-up logout click
        $("#member").on('click', '#disconnect', function (e) {
            e.preventDefault();
            api.logout(function () {
                $("#disconnect").hide(); $("#connect").show();
                $("loggedin").hide();
                window.location.reload();
            });
            return false;
        });
    });
})(jQuery);


function addEventClick() {
    $("#events li").on('click', (function (e) {
        e.preventDefault();
        var eventId = $(this).attr("data-value");
        var urlname = $(this).attr("data-urlname");
        meetupService.getEvent(eventId, urlname, function (data) {
            $('#meeting-title')[0].lastChild.data = data.data.name;
        });

        // get event's 'yes' rsvp's and attendees
        meetupService.getRsvps(eventId, urlname, function (data) {
            if (data.data.length > 0) {
                var i = 0;
                var attendees = new Array();
                for (i = 0; i < data.data.length; i++) {
                    attendees[i] = [data.data[i].member.id];
                }
                localStorage["attendees"] = JSON.stringify(attendees);

                // select initial random winner
                meetupService.getWinnerDetails(chooseWinnerId(), function (winner) {});
            }
            // todo: handle no attendees
        });
    }));

    // wire-up select winner click event
    $("#select-winner").on('click', function (e) {
        meetupService.getWinnerDetails(chooseWinnerId(), function (winner) {
            e.preventDefault();
            return false;
        });
    });
}

// ajax calls
var meetupService = new function () {
    var token = localStorage["token"];
    var serviceBase = 'https://api.meetup.com',
        getEvent = function (eventId, urlname, callback) {
            $.getJSON(serviceBase + '/' + urlname + '/events/' + eventId + '?sign=true&photo-host=public&callback=?', { access_token: token }, function (data) {
                callback(data);
            });
        },
        getWinnerDetails = function (userId, callback) {
            $.getJSON(serviceBase + '/members/' + userId + '?sign=true&photo-host=public&callback=?', { access_token: token }, function (data) {
                callback(data);
            });
        },
        getRsvps = function (eventId, urlname, callback) {
            $.getJSON(serviceBase + '/' + urlname + '/events/' + eventId + '/rsvps?sign=true&photo-host=public&response=yes&callback=?', { access_token: token, rsvp: 'yes', event_id: eventId }, function (data) {
                callback(data);
            });
        },
        setToken = function (apiToken) {
            token = apiToken;
        };

    return {
        getEvent: getEvent,
        getRsvps: getRsvps,
        getWinnerDetails: getWinnerDetails,
        setToken: setToken
    };
}();

// choose winner logic
function chooseWinnerId() {
    var attendees = JSON.parse(localStorage["attendees"]);
    // todo: address situation where all winners were chosen
    var randomRsvp = Math.floor(Math.random() * attendees.length);
    var userId = attendees[randomRsvp];
    getWinnerDetails(userId);
    attendees = $.grep(attendees, function (value) {
        // remove winner from pool
        return value != userId;
    });
    // update canididate pool with winner removed
    localStorage["attendees"] = JSON.stringify(attendees);
    return userId;
}

// get winner details
function getWinnerDetails(userId) {
    meetupService.getWinnerDetails(userId, function (data) {
        if (data != null) {
            if (data.data.photo != null) {
                $("#winnerphoto").attr('src', data.data.photo.photo_link);
            } else {
                // winner has no photo, use default image
                $("#winnerphoto").attr('src', './images/nophoto.jpg');
            }
            $('#winnername').text(data.data.name);
            $('#winnerlocation').text(data.data.city);
            if(data.data.state != null){
                $('#winnerlocation').append(', ' + data.data.state);
            }
        }
    });
}