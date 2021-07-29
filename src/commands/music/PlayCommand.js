const BaseCommand = require('../../utils/structures/BaseCommand');
const ytdl = require("ytdl-core");
const ytpl = require('ytpl');
const { queue } = require('./musicVar.js');

module.exports = class PlayCommand extends BaseCommand {
  constructor() {
    super('play', 'music', []);
  }

  async run(client, message, args) {
    const serverQueue = queue.get(message.guild.id);

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    if (!args[0]) return message.channel.send('You need to specified the youtube url after the command. \`#play <youtube url>\`');
    const url = args[0];
    var newSongs = []
    if (ytdl.validateURL(url)) {
      newSongs = await parseYtUrl(url, message);
      if (!newSongs ) return;
    } else {
      message.channel.send('Sorry! The current supported website is youtube. Please enter youtube url.')
    }
    // var songInfo;
    // try {
    //   songInfo = await ytdl.getInfo(args[0]);

    // } catch (err) {
    //   return message.channel.send(`${err}`);
    // }
    // const song = {
    //   title: songInfo.videoDetails.title,
    //   url: songInfo.videoDetails.video_url,
    // };


    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 20,
        playing: true
      };

      queue.set(message.guild.id, queueContruct);
      queueContruct.songs = queueContruct.songs.concat(newSongs);
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs = serverQueue.songs.concat(newSongs);
      return message.channel.send(`${newSongs[0].title} has been added to the queue!`);
    }
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .on('disconnect', () => {
      queue.delete(guild.id);
    })
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(1);
  dispatcher.setVolume(serverQueue.volume / 100);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


// parse different stream url
async function parseYtUrl(url, message) {
  var songs = [];
  var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  var plid;

  if (match) {
    try {
      plid = await ytpl.getPlaylistID(url);
    } catch (err) {
      message.channel.send(`${err}`)
      return ;
    }
    const playlist = await ytpl(plid);

    playlist.items.forEach(songInfo => {
      var song = {
        title: songInfo.title,
        url: songInfo.url,
      };
      songs.push(song);
    });
  } else {
    songInfo = await ytdl.getInfo(url);
    var song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
    songs.push(song);
  }
  return songs
}