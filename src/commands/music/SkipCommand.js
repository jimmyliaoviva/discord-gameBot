const BaseCommand = require('../../utils/structures/BaseCommand');
const { queue } = require('./musicVar.js');

module.exports = class SkipCommand extends BaseCommand {
  constructor() {
    super('skip', 'music', []);
  }

  run(client, message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
}