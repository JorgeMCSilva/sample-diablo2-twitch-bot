const tmi = require('tmi.js');
const axios = require('axios');

// local files
const areas = require('./areas.js');
const fbr = require('./fbr.js');
const fcr = require('./fcr.js');
const fhr = require('./fhr.js');

// todo: convert to OOP
const BOT_NAME = '';
const BOT_TOKEN = '';

let players = ['indrek'];
const apiUrl = 'https://api-1.diablo.run/snapshots/users/';
const owner = 'holypt';
let channelAntiSpam = {};

const twitchOptions = {
  options: {
    debug: true,
  },
  identity: {
    username: BOT_NAME,
    password: BOT_TOKEN,
  },
  channels: [owner],
};
const client = new tmi.client(twitchOptions);
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);
client.connect();

/**
 * Simple method that sends a message to a channel
 * @param {string} channel #channel
 * @param {string} message the formatted message the bot is returning
 * @param {boolean} shouldAwait ensure the message is async or not
 */
async function sendMessageToChat(channel, message, shouldAwait) {
  if (shouldAwait) {
    await client.action(channel, message);
  } else {
    client.action(channel, message);
  }
}

/**
 * When the bot connects to twitch, run this command.
 * @param addr server address
 * @param port server port
 */
async function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

/**
 * Whenever a message is put in chat, the bot reads it through this handler
 * @param {string} channelOriginOfMessage Channel where the message was read from
 * @param {tmi.user} user User object
 * @param {string} msg The message
 * @param {??} self is the message from the bot itself
 * @returns
 */
async function onMessageHandler(channelOriginOfMessage, user, msg, self) {
  // Ignore messages from the bot itself
  if (self) {
    return;
  }

  // Ignore if it is not a command - save processing
  if (msg[0] !== '!') {
    return;
  }

  // Remove whitespace from chat message if present
  const normalizedMessage = msg.trim().toLowerCase();
  log('normalizedMessage', normalizedMessage);

  // If the command is known, let's execute it
  if (normalizedMessage === '!update') {
    // handle each channels timeout anti spam seperately
    if (!channelAntiSpam.hasOwnProperty(channelOriginOfMessage)) {
      channelAntiSpam[channelOriginOfMessage] = true;
    }

    if (channelAntiSpam[channelOriginOfMessage]) {
      // todo: create local cache?
      // anti-spam
      channelAntiSpam[channelOriginOfMessage] = false;
      setTimeout(() => {
        channelAntiSpam[channelOriginOfMessage] = true;
      }, 1000 * 60 * 1); // 1 min delay between commands per channel

      log('updating...');
      const outputs = await fetchStatsForPlayers();

      // todo: create a util method that will try to split the outputs correctly for twitch chat and make it more readable
      // String.padEnd(count, char)
      log('joined outputs', outputs.join(' || '));
      // update this to get the target from the message handler - fire and forget
      sendMessageToChat(channelOriginOfMessage, outputs.join(' || '));
    }

    return;
  }

  // todo: if resets etc are added per channel mod / admin / broadcaster then we will need to handle this on a per channel setup.
  if (user.username === owner) {
    if (normalizedMessage.startsWith('!add')) {
      const playersBeingAdded = normalizedMessage.substring(5).split(',');
      // in case the the input was 'p1, p2' rather than 'p1,p2' we should ensure we clean it to now mess up the api call
      playersBeingAdded.forEach((player) => players.push(player.trim()));

      // todo: move this to a set. DOH!
      players = players.filter(
        (value, idx, array) => array.indexOf(value) === idx
      ); // removes duplicates
      log('added', players);

      return;
    }

    if (parsedCommand.startsWith('!reset')) {
      players = [];
      channelAntiSpam = {};
      log('reset', players, channelAntiSpam);

      return;
    }

    if (normalizedMessage.startsWith('!join')) {
      //           '123456xxxxxxxxx'
      // why 6? => '!join <channel>' => returns <channel>
      const channelToJoin = normalizedMessage.substring(6);
      client.join(channelToJoin); // todo: await here
      log('joined', channelToJoin);

      return;
    }
  }

  // try to see if command is a static command
  if (splitCommand()) {
    return;
  }
}

// todo: move these methods to their own file(s) to make things cleaner here
/**
 * this is the method that will take care of all the calls and return the fancy output string to be output in the chat
 */
async function fetchStatsForPlayers(){
  const outputs = [];
  // make player's calls async but wait on all of them before building the output
  await Promise.all(
    // this doesn't guarantee order - if this is required, the players array should be changed to contain order prop
    players.map(async (playerName) => {
      const apiOutput = await fetchDataFromApi(playerName);
      log('apiOutput', apiOutput);
      
      outputs.push(await formatApiOutput(apiOutput, playerName));
    })
  );

  return outputs;
};

/**
 * fetches data from the diablo.run api for the given user
 * @param {string} username the user to use on the fetch of the api
 * @returns a formatted string of the user details
 */
async function fetchDataFromApi(username){
  const result = await axios.get(`${apiUrl}${username}`);

  return result.data.character;
};

/**
 * this method will just format the output of a character data to be used during races across multiple players
 * @param {Character} apiCharacterData The character data from the api
 * @param {string} playerName the username
 * @returns formatted string - Example: User L-24 - Blood Moor - NM - P8 - 12k
 */
async function formatApiOutput(apiCharacterData, playerName){
  // format difficulty so it is smaller to output
  let diff = apiCharacterData.difficulty.replace('normal', 'N');
  diff = diff.replace('nightmare', 'NM');
  diff = diff.replace('hell', 'H');

  let gold = apiCharacterData.gold + apiCharacterData.gold_stash;
  gold = Math.ceil(gold / 1000);

  return `${playerName} L-${apiCharacterData.level} - ${areas[apiCharacterData.area]?.name} - ${diff} P${apiCharacterData.players} - ${gold}k`;
}

/**
 * This method will handle commands that will query static data
 * @param {string} normalizedMessage the normalized message
 * @returns if it found the command or not
 */
async function splitCommand (normalizedMessage) {
  log('splitCommand...');

  // from here onwards, more complex commands with multiple inputs
  const parsedCommand = normalizedMessage.substring(1, normalizedMessage.indexOf(' '));
  let jsonToUse;
  switch (parsedCommand) {
    case 'fbr':
      jsonToUse = fbr;
      break;
    case 'fcr':
      jsonToUse = fcr;
      break;
    case 'fhr':
      jsonToUse = fhr;
      break;
  }

  if (jsonToUse) {
    // substring(1) -> removes ! from the message
    const outcome = traverseJson(normalizedMessage.substring(1), jsonToUse);
    if (outcome) {
      sendMessageToChat(channelOriginOfMessage, outcome);

      return true;
    }
  }

  return false;
}

/**
 * Handles the message break into the json hierarchy
 * @param {string} message - the message to be parsed
 * @param {JSON} jsonToProcess - the json to traverse for message
 */
async function traverseJson(message, jsonToProcess) {
  const words = message.split(' ');
  log('split command', words);

  // if we only have a command, return the 'default', how to use message
  if (words.length === 1) {
    return jsonToProcess[words[0]].default;
  }

  let hierarchy = jsonToProcess;

  // find the correct search on the hierarchy of options
  for (let index = 0; index < words.length; index++) {
    if (hierarchy[words[index]]) {
      hierarchy = hierarchy[words[index]];
    } else {
      return null; // falsy
    }
  }


  if (hierarchy.default) {
    return hierarchy.default;
  }

  return hierarchy;
}

/**
 * Used for debug logging
 */
async function log() {
  if (twitchOptions.options.debug) {
    console.log(...arguments);
  }
}
