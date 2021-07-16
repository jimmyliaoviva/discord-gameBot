const BaseCommand = require('../../utils/structures/BaseCommand');
const { queue } = require('./musicVar.js');
const { MessageEmbed } = require('discord.js');

module.exports = class QueueCommand extends BaseCommand {
  constructor() {
    super('queue', 'music', []);
  }

  run(client, message, args) {
    // variables
    const serverQueue = queue.get(message.guild.id);
    const musicListEmbeded = new MessageEmbed()
      .setTitle('Music playing list');

    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to see the playing list!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song in the queue!");
    serverQueue.songs.forEach((item, index, array) => {
      musicListEmbeded.addField(item.title, item.url);
    });
    message.channel.send(musicListEmbeded);
  }
}