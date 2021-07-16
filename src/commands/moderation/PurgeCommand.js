const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');

module.exports = class PurgeCommand extends BaseCommand {
  constructor() {
    super('purge', 'moderation', []);
  }

  async run(client, message, args) {
    // message.channel.send('purge command works');
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You cannot use this command');
    if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) return message.channel.send('The bot did not have \`MANAGE_MESSAGES`\ permission ');
    if (!args[0]) return message.channel.send('You must state a number of message to purge. \`#purge number\`');
    // 10 on the second argument is for indicating the number is use in decimal
    const amountToDelete = Number(args[0],10);
    if (isNaN(amountToDelete)) return message.channel.send("Number stated is not a valid number.");
    if (!Number.isInteger(amountToDelete)) return message.channel.send("Number stated must be a positive integer.");
    if (!amountToDelete || amountToDelete<2 || amountToDelete >100) return message.channel.send("Number stated must be between 2 and 100.");
    const fetched = await message.channel.messages.fetch({
      limit: amountToDelete
    });

    try {
      await message.channel.bulkDelete(fetched);
    } catch(err) {
      console.log(err);
      message.channel.send("I was unable to delete the amount stated, make sure messages are in 14 days");
    }
  }
}