const { MessageMenuOption, MessageMenu } = require('discord-buttons');
const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('test', 'testing', []);
  }

  async run(client, message, args) {
    message.channel.send('Test command works');
    let option1 = new MessageMenuOption()
    .setLabel('option1')
    .setValue(1);

    let option2 = new MessageMenuOption()
    .setLabel('option2')
    .setValue(2);

    let option3 = new MessageMenuOption()
    .setLabel('option2')
    .setValue(3);

    let option4 = new MessageMenuOption()
    .setLabel('option2')
    .setValue(4);
    let option5 = new MessageMenuOption()
    .setLabel('option2')
    .setValue(5);
    let option6 = new MessageMenuOption()
    .setLabel('option2')
    .setValue(6);

    let menu = new MessageMenu()
    .setID('menu1')
    .addOptions([option1,option2,option3,option4,option5,option6]);

    menu.options.forEach(item => console.log(item.value));
    // menu.options = [option1];
    console.log(menu.options);
    message.channel.send('jimmy',menu);
  

    client.on('clickMenu', async menu => {
      // console.log(menu);
      menu.values.forEach(element => {
        // console.log(element);
        
      });

    })
  }
}