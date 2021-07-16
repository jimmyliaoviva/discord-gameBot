const BaseCommand = require('../../utils/structures/BaseCommand');
const { queue } = require('./musicVar.js');

module.exports = class VolumeCommand extends BaseCommand {
  constructor() {
    super('volume', 'music', []);
  }

  run(client, message, args) {
    // variables
    const serverQueue = queue.get(message.guild.id);
    if (!args[0]) return message.channel.send('You must state a number to change volume. \`#volume <number>\`');
    if (args[1]) return message.channel.send('You enter the wrong format. \`#volume <number>\`');
    if (isNaN(Number(args[0],10))) return message.channel.send('You need to state volume in a format of integer. \`#volume <number>\`');

    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to see the playing list!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song in the queue!");
    try {
      serverQueue.volume = args[0];
      serverQueue.connection.dispatcher.setVolume(args[0]/100);
      message.channel.send('Volume set to '+ args[0] + '.');
    } catch(error) {
      console.log(error);
    }

  }
}