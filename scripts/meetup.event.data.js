var attendees = new Array();
var attendeeCount = 0;
var meetupService;
var prodOauthId = 'jd6cpjbd8v063nkgn52dpst4g1';
var testOauthId = 'bb1ecshn38h6crhq2pf0gm5po2';

// initialize api
api = mu.Api({
    clientId: testOauthId
  , onMember: function (member, token) {
      //$("#connect").hide();
      $("#disconnect").show();
      $.getJSON("https://api.meetup.com/2/events?access_token=" + token +
                "&member_id=self&fields=short_link&page=10&callback=?", function (evts) {
                    var el = $("#events"), buff = [];
                    $.map(evts.results, function (e) {
                        buff.push('<li>' + e.name.link(e.short_link) + '</li>');
                    });
                    el.append(buff.join(''));
                });
      $("#connect").html(
          "<a href='#' id='disconnect'>Logout " + member.name + "</a>");
      
      // ajax calls
      meetupService = new function () {
          var serviceBase = 'https://api.meetup.com',
              getEvent = function (eventId, callback) {
                  $.getJSON(serviceBase + '/2/event/' + eventId + '?callback=?', { access_token: token }, function (data) {
                      callback(data);
                  });
              },
              getWinnerDetails = function (userId, callback) {
                  $.getJSON(serviceBase + '/2/member/' + userId + '?callback=?', { access_token: token }, function (data) {
                      callback(data);
                  });
              },
              getRsvps = function (eventId, rsvp, callback) {
                  $.getJSON(serviceBase + '/2/rsvps?callback=?', { access_token: token, rsvp: 'yes', event_id: eventId }, function (data) {
                      callback(data);
                  });
              };

          return {
              getEvent: getEvent,
              getRsvps: getRsvps,
              getWinnerDetails: getWinnerDetails
          };
      }();
  }
});

(function ($) {
    $(function () {
        $("#connect").live('click', function (e) {
            e.preventDefault();
            api.login();
            return false;
        });
        $("#disconnect").live('click', function (e) {
            e.preventDefault();
            api.logout(function () {
                $("#disconnect").hide(); $("#connect").show();
                window.location.reload();
            });
            return false;
        });
    });
})(jQuery);

// doc ready
$(document).ready(function ($) {
    $("#chooseWinner").click(function (e) {
        e.preventDefault;
        chooseWinnerId();
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
        meetupService.getEvent(eventId, function(data) {
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
        meetupService.getRsvps(eventId, 'yes', function(data) {
            if (data.results.length > 0) {
                var i = 0;
                for (i = 0; i < data.results.length; i++) {
                    attendees[i] = [data.results[i].member.member_id];
                    //console.log("attendees array filled");
                }
            }
            attendeeCount = attendees.length;
        });
    }
}

// choose winner logic
function chooseWinnerId() {
    var randomRsvp = Math.floor(Math.random() * attendees.length);
    var userId = attendees[randomRsvp];
    //console.log('user id=' + userId);
    getWinnerDetails(userId);
    attendees = $.grep(attendees, function (value) {
        return value != userId;
    });
    //console.log("attendees length=" + attendees.length);
}

// get winner details
function getWinnerDetails(userId) {
    meetupService.getWinnerDetails(userId, function(data) {
        if (data != null) {
            $('#winnerInfo').show();
            // remove green alert background
            $('div').removeClass('alert-info');

            var winnerHTML = '<div class="span2 thumbnail alert alert-info" style="height:150px; text-align: center; position: relative;">';
            if (data.photo != null) {
                winnerHTML += '<div ><img src="' + data.photo.thumb_link + '" /></div>';
            } else {
                winnerHTML += '<div><img src="./images/nophoto.gif" /></div>';
            }
            winnerHTML += '<div><strong>' + data.name + '</strong></div>';
            winnerHTML += '<div>' + data.city + ', ' + data.state + '</div>';
            winnerHTML += '<span class="badge" style="position: absolute; bottom: 0;">' + (attendeeCount - attendees.length) + '</span>';
            winnerHTML += '</div>';
            $('#winnerInfo2').prepend(winnerHTML);
        }
    });
}