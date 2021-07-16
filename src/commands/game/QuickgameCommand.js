const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageButton } = require('discord-buttons');

module.exports = class QuickgameCommand extends BaseCommand {
  constructor() {
    super('quickgame', 'game', []);
  }

  async run(client, message, args) {
    // variables
    const sleep = require('util').promisify(setTimeout)
    let msgButton = new MessageButton()
      .setStyle("blurple")
      .setEmoji("🚨")
      .setID("quickgame_button");
    var countDown = 3;
    var ranked = false;
    if (args[0]) {
      countDown = Number(args[0],10);
    } else if(args[1]) {
      ranked = true;
    } 
    

    // input checking
    if (isNaN(countDown)) return message.channel.send("countdown need to be Number. \`#quickgame <countdown> <rank> \`");
    if (countDown < 1 || countDown > 10) return message.channel.send("count down need to be between 1 and 10.");

    // executing
    switch (countDown) {
      case 10:
        message.channel.send('🔟');
        await sleep(1000);
      case 9:
        message.channel.send('9⃣');
        await sleep(1000);
      case 8:
        message.channel.send('8⃣');
        await sleep(1000);
      case 7:
        message.channel.send('7⃣');
        await sleep(1000);
      case 6:
        message.channel.send('6⃣');
        await sleep(1000);
      case 5:
        message.channel.send('5⃣');
        await sleep(1000);
      case 4:
        message.channel.send('4⃣');
        await sleep(1000);
      case 3:
        message.channel.send('3⃣');
        await sleep(1000);
      case 2:
        message.channel.send('2⃣');
        await sleep(1000);
      case 1:
        message.channel.send('1⃣');
        await sleep(1000);
    } 
    if (ranked) {
      msgButton.setID('quickrank_button');
    }
    message.channel.send('搶答', msgButton);
  }
}


