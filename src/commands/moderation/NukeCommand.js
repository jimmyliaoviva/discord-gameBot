const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class NukeCommand extends BaseCommand {
  constructor() {
    super('nuke', 'moderation', []);
  }

  async run(client, message, args) {
    // permission checking
    if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send('You cannot use this command');
    if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return message.channel.send('The bot did not have \`MANAGE_CHANNELS`\ permission ');
    
    // variables
    const nukeChannel = message.channel;
    
    // input checking
    if (!nukeChannel.deletable) return  message.channel.send('This channel is not deletable!');

    // executing
    await nukeChannel.clone().catch(err => console.log(err));
    await nukeChannel.delete().catch(err => console.log(err));
  }
}