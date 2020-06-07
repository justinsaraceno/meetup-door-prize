// Initialize Meetup API
api = mu.Api({
    clientId: "jd6cpjbd8v063nkgn52dpst4g1"
    , onMember: function (member, token) {
        localStorage["token"] = token;
        meetupService.setToken(token);
        $(".connect").hide(); $("#disconnect").show();
        $("#loggedout").hide(); $("#loggedin").removeClass("hidden");
        $.getJSON("https://api.meetup.com/self/calendar?sign=true&photo-host=public&access_token=" + token +
            "&page=10&callback=?", function (evts) {
                var el = $("#events"), buff = [];
                $.map(evts.data, function (e) {
                    buff.push('<li class="eventid" data-value=' + e.id + ' data-urlname=' + e.group.urlname + ' data-dismiss="modal">' + e.name.link('#') + '</li>');
                });
                el.append(buff.join(''));
                //console.log('adding events');
                addEventClick();
            });
        $("#member").html("<a href='#' id='disconnect'>Logout " + member.name + "</a>");
        $("#choose-meeting").modal('show');
    }
});

(function ($) {
    $(function () {
        $("#year").text(new Date().getFullYear());
        
        $(".connect").on('click', function (e) {
            e.preventDefault();
            //console.log('in login');
            api.login();
            return false;
        });

        $("#member").on('click', '#disconnect', function (e) {
            e.preventDefault();
            //console.log('in logout');
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

        // get 'yes' rsvp's
        meetupService.getRsvps(eventId, 'yes', function (data) {
            if (data.results.length > 0) {
                var i = 0;
                var attendees = new Array();
                for (i = 0; i < data.results.length; i++) {
                    attendees[i] = [data.results[i].member.member_id];
                    //console.log("attendees array filled");
                }
                localStorage["attendees"] = JSON.stringify(attendees);
                //console.log("Initial attendee count: " + JSON.parse(localStorage["attendees"]).length);
                meetupService.getWinnerDetails(chooseWinnerId(), function (winner) {
                    //console.log("Winner chosen as: " + winner.name);
                });
            }
            // todo: handle no attendees
        });
    }));

    $("#select-winner").on('click', function (e) {
        meetupService.getWinnerDetails(chooseWinnerId(), function (winner) {
            //console.log("Winner chosen as: " + winner.name);
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
            $.getJSON(serviceBase + '/2/member/' + userId + '?callback=?', { access_token: token }, function (data) {
                callback(data);
            });
        },
        getRsvps = function (eventId, rsvp, callback) {
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
    //console.log('winner user id=' + userId);
    getWinnerDetails(userId);
    attendees = $.grep(attendees, function (value) {
        return value != userId;
    });
    //console.log("attendees length=" + attendees.length);
    localStorage["attendees"] = JSON.stringify(attendees);
    //console.log("Attendee count updated to: " + JSON.parse(localStorage["attendees"]).length);
    return userId;
}

// get winner details
function getWinnerDetails(userId) {
    //console.log("getting winner details...");
    meetupService.getWinnerDetails(userId, function (data) {
        if (data != null) {
            //console.log("Winner chosen..");
            if (data.photo != null) {
                //console.log("Photo found at: " + data.photo.photo_link);
                $("#winnerphoto").attr('src', data.photo.photo_link);
            } else {
                //console.log("No photo found..");
                $("#winnerphoto").attr('src', './images/nophoto.jpg');
            }
            $('#winnername').text(data.name);
            $('#winnerlocation').text(data.city + ', ' + data.state);
        }
    });
}