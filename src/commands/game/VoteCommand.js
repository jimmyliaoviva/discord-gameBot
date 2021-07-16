const BaseCommand = require('../../utils/structures/BaseCommand');
const { spygameData } = require('./spygameVar');

module.exports = class VoteCommand extends BaseCommand {
  constructor() {
    super('vote', 'game', []);
  }

  run(client, message, args) {
    const data = spygameData.get(message.guild.id);
    const member = data.roles.get(args[0].substring(3,21 ));
    message.channel.send(`他是 ${ member.role }`);
    // data.roles.forEach((item, index) => {
    //   if (args[0].substring(3,21 )==item.user.id) {
    //     message.channel.send(`他是 ${ item.id }`);

    //   }
    // });
    // console.log(item.user.id);
    // console.log(args[0]);
    // message.channel.send(args);
    // console.log(data);
  }
}