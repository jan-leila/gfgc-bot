const { Tiltify, User } = require('tiltifyapi');
const Twitch = require('tmi.js');

const { tiltifyToken, twitchUsername, twitchToken, twitchChannels } = require('./auth');
let tiltify = new Tiltify(tiltifyToken);
let twitch = new Twitch.client({
  identity: {
    username: twitchUsername,
    password: twitchToken
  },
  channels: twitchChannels
});

twitch.connect();

User.getUser(tiltify, 'gamingforglobalchange')
.then((user) => {
  return user.getCampaigns(tiltify)
})
.then((campaigns) => {
  let activeCampain = campaigns[0];
  activeCampain.getDonationStream(tiltify, (donation) => {
    twitch.say('#gamingforglobalchange', `We have a $${donation.amount} donation from ${donation.name} ${donation.comment === null || donation.comment === ''?'':`with the comment "${donation.comment}"`}`);
    // TODO: update total, play sound, and show icon
  });
  return activeCampain.getSchedule(tiltify);
})
.then((schedule) => {
  schedule.map((event) => {
    let time = event.startsAt - Date.now();
    if(time > 0){
      setTimeout(() => {
        twitch.say('#gamingforglobalchange', `!game ${event.name}`)
      }, time);
    }
  });
})
.catch((err) => {
  console.log(err);
});
