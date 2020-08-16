# Meetup Door Prize

## What is it?
Do you run a group on Meetup.com and give out door prizes?  Do you use raffle tickets, throw darts at the attendance sheet, or arm wrestle to determine the winners?
Don't you wish there were a better way?

There is!  With this open-source project you just enter in the URL of your meetup event and press some buttons!

Try it our at [http://www.meetupdoorprize.com/](http://www.meetupdoorprize.com/).

## How does it do that?
This uses Meetup's [public API](https://www.meetup.com/meetup_api/).  Users first authenticate via their Meetup credentials using [Meetup's own oAuth 2 provider](https://www.meetup.com/meetup_api/auth/#oauth2).  Next, calls to the Meetup API retreive the user's current and future events.

Once a Meetup event is selected, all 'Yes' RSVP's are retreived.  Attendees are randomly selected and displayed one at a time.  Subsiquent winners can be chosen, but an attendee will only be chosen once.

## Latest Functionality:
- Migrated from Meetup API v1 to v3
- Entire event RSVP list is obtained in one call and put in local storage to avoid multiple API calls which sometimes exceeded API throttling limits.
- Various bug fixes and other performance improvements.