const BaseCommand = require('../../utils/structures/BaseCommand');
const discord = require('discord.js');



module.exports = class SayCommand extends BaseCommand {
  constructor() {
    super('say', 'fun', []);
  }

  async run(client, message, args) {
    // message.channel.send('say command works');
    const messageToSay = args.join(" ");
    const sayEmbeded = new discord.MessageEmbed()
      .setTitle(`${ message.author.tag } 說: ${ messageToSay }`)
      .setFooter(message.author.tag ,message.author.displayAvatarURL())
      .setColor('#d5e7d7')
      .setTimestamp();
    try {
      await message.channel.send(sayEmbeded);
      
    } catch(err) {
      console.log(err);
      message.author.send("I am not able to say that message");
    }
    message.delete();
  }
}