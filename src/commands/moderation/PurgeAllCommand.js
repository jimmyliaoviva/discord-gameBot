const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class PurgeAllCommand extends BaseCommand {
  constructor() {
    super('purgeAll', 'moderation', []);
  }

   async run(client, message, args) {
    //  permission checking
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You cannot use this command');
    if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) return message.channel.send('The bot did not have \`MANAGE_MESSAGES`\ permission ');

    // executing
    const fetched = await message.channel.messages.fetch({
      limit: 100
    });

    try {
      await message.channel.bulkDelete(fetched);
    } catch(err) {
      console.log(err);
      message.channel.send("I was unable to delete the messages, make sure messages are in 14 days");
    }
  }
}