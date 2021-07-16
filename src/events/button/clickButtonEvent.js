const BaseEvent = require('../../utils/structures/BaseEvent');
const { MessageButton } = require('discord-buttons');

module.exports = class clickButtonEvent extends BaseEvent {
    constructor() {
        super('clickButton');
    }
    async run(client, button) {
        const sleep = require('util').promisify(setTimeout)

        // disabled button
        let endButton = new MessageButton()
            .setStyle('blurple')
            .setEmoji('🛑')
            .setID('endButton')
            .setDisabled();
        let btnMessage = button.message.content;

        switch (button.id) {
            case 'quickgame_button':
                await button.reply.send(`${button.clicker.user} 搶到了!`);
                button.message.edit(btnMessage, endButton);
                break;
            case 'quickrank_button':
                await button.reply.send(`${button.clicker.user} 按下按鈕`);
                sleep(5000);
                button.message.edit(btnMessage, endButton);
                break;
                
        }


    }
}