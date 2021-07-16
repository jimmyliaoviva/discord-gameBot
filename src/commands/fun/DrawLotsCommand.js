const { MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class DrawLotsCommand extends BaseCommand {
  constructor() {
    super('drawLots', 'fun', []);
  }

  async run(client, message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!args[0]) return message.channel.send('You must state a number of members to draw lots. \`#drawLots <number>\`');
    if (args[1]) return message.channel.send('You enter the wrong format. \`#drawLots <number>\`');
    var numToChoose = Number(args[0], 10);
    if (isNaN(numToChoose)) return message.channel.send('You need to state a member number in a format of integer. \`#drawLots <number>\`');
    if (numToChoose > voiceChannel.members.size || numToChoose < 1) return message.channel.send('Number of member to draw lots must between 1 and the members in the voice channel. BOTS are not included. \`#drawLots <number>\`');
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to draw lots!"
      );
    // console.log(voiceChannel.members);
    const voiceChannelMember = voiceChannel.members.filter(member => !member.user.bot);
    const choosedMember = voiceChannelMember.random(numToChoose);
    const drawlotsEmbeded = new MessageEmbed()
      .setColor('#d5e7d7')
      .setDescription(`You got ${numToChoose} members chosen.`);
    choosedMember.forEach((item, index, array) => {
      drawlotsEmbeded.addField(index + 1, `${item.user}`);
    });
    try {
      message.channel.send(drawlotsEmbeded);
      console.log(voiceChannel.members.size);
    } catch (err) {
      console.log(err);
    }
  }
}