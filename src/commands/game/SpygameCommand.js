const { MessageButton, MessageMenuOption, MessageMenu } = require('discord-buttons');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const questions = require('./questions.json');
const { spygameData } = require('./spygameVar');
const sleep = require('util').promisify(setTimeout);

module.exports = class SpygameCommand extends BaseCommand {
  constructor() {
    super('spygame', 'game', []);
  }

  async run(client, message, args) {
    const data = spygameData.get(message.guild.id);
    if (data) {
      client.removeListener('clickMenu', data.clickHandler)
      spygameData.delete(message.guild.id);
    }
    // get question
    const question = questions[Math.floor(Math.random() * questions.length)];
    const loyalans = question.loyal;
    const spyans = question.spy;
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send("You need to be in a voice channel to play spy game!");
    const voiceChannelMember = voiceChannel.members.filter(member => !member.user.bot);
    const playerNum = voiceChannelMember.size
    var whiteboardNum = 0;
    var spyNum = Math.floor(playerNum / 3);

    // input check
    if (args[0]) spyNum = Number(args[0], 10);
    if (args[1] === 1) whiteboardNum = 1;
    if (isNaN(spyNum) || !Number.isInteger(spyNum)) return message.channel.send('You enter the wrong format. number of spy must be an integer\`#spygame <[option] number of spys > <[option] enable whiteboard, 0 for disable 1 for enable.>\`');
    if (isNaN(whiteboardNum)) return message.channel.send('You enter the wrong format. number of whiteboard must be an integer\`#spygame <[option] number of spy > <[option] enable whiteboard, 0 for disable 1 for enable.>\`');

    if (playerNum < 4) return message.channel.send('Player number need to be above 4 and all players should be in the same voice channel.');
    if (spyNum < 1 || spyNum > playerNum / 3 || (spyNum + whiteboardNum) > playerNum / 3) return message.channel.send('Number of spy plus whiteboard must be between 1 and one third of the total players.')
    const dataContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      playerNumber: playerNum,
      spyNumber: spyNum,
      loyalNumber: playerNum - spyNum - whiteboardNum,
      whiteboardNumber: whiteboardNum,
      roles: new Map(),
      answer: [loyalans, spyans],
      serialEmbeded: [],
      voteMsg: {},
    };

    const spyMembers = voiceChannelMember.random(spyNum);
    const [spyMember, notSpyMember] = voiceChannelMember.partition(member => { return spyMembers.includes(member); });
    var loyalMember = notSpyMember;
    if (whiteboardNum === 1) {
      [whiteboardMember, loyalMember] = notSpyMember.partition(member => { return notSpyMember.random(1).includes(member); });
      whiteboardMember.forEach((item, index) => {
        dataContruct.roles.push({ 'user': item.user, 'id': 'whiteboard' });
        item.user.send(`You got nothing, you are whiteboard! Congratulations!`);
      });
    }

    spyMember.forEach((item, index) => {
      dataContruct.roles.set(item.user.id, { 'user': item.user, 'role': 'spy', 'votedNum': 0, 'vote': false, 'alive': true });
      item.user.send(`You got ${spyans}`);
    });
    loyalMember.forEach((item, index) => {
      dataContruct.roles.set(item.user.id, { 'user': item.user, 'role': 'loyal', 'votedNum': 0, 'vote': false, 'alive': true });
      item.user.send(`You got ${loyalans}`);
    });

    let serialEmbeded = new MessageEmbed()
      .setColor('#000000')
      .setDescription('?????????????????????????????????');

    var firstIndex = Math.floor(Math.random() * dataContruct.roles.size) + 1;
    var serialNum = 0;
    var serialMembers = [];
    var voteOptions = [];
    var voteMenu = new MessageMenu()
      .setID('spygameVote');
    // .setPlaceholder()
    voiceChannelMember.forEach((item, index) => {
      serialNum += 1;
      var newIndex = serialNum - firstIndex;
      if (newIndex >= 0) {
        serialMembers[newIndex] = { name: newIndex + 1, value: item.user };
        voteMenu.addOption(createPlayerOption(item.user));

      } else {
        serialMembers[dataContruct.roles.size - firstIndex + Math.abs(newIndex)] = { name: dataContruct.roles.size - firstIndex + Math.abs(newIndex) + 1, value: item.user };
        voteMenu.addOption(createPlayerOption(item.user));
      }
    });
    serialEmbeded.addFields(serialMembers);
    dataContruct.serialEmbeded = serialEmbeded;
    const voteEmbeded = new MessageEmbed()
      .setColor('#000000')
      .setTitle('???????????????????????????????????????????????????????????????????????????');

    dataContruct.voteMsg.menus = voteMenu;
    dataContruct.voteMsg.embed = voteEmbeded;

    spygameData.set(message.guild.id, dataContruct);
    await message.channel.send(serialEmbeded);
    await message.channel.send(dataContruct.voteMsg);
    voteClick(client, message);
  }

}

function createPlayerOption(user) {
  const voteOption = new MessageMenuOption()
    .setLabel(`${user.username}`)
    .setValue(user.id);
  return voteOption;
}

async function voteClick(client, message) {
  const data = spygameData.get(message.guild.id);
  var voteClickHandler = async (menu) => {
    const data = spygameData.get(message.guild.id);
    const clickedMember = data.roles.get(menu.clicker.user.id);
    if (!clickedMember.alive) return menu.reply.send(`${clickedMember.user}???????????????????????????`);
    if (clickedMember.vote) return menu.reply.send(`${menu.clicker.user} ?????????????????????????????????`);
    // ??????????????????
    const votedMember = data.roles.get(menu.values[0]);

    votedMember.votedNum += 1;
    clickedMember.vote = true;
    var voteCount = 0;
    var max = {};
    max.num = 0;
    var secMax = 0;
    data.roles.forEach((item, index) => {
      if (item.votedNum > max.num) {
        max.num = item.votedNum;
        max.id = item.user.id;
      } else if (item.vote == max.num) {
        secMax = item.vote;
      }
      if (item.vote) voteCount += 1;
    });

    await menu.reply.send(`${menu.clicker.user} ????????? ${votedMember.user}`);
    if (voteCount == data.roles.size) {
      if (secMax == max.num) {
        message.channel.send(`???????????????????????????????????????????????????????????????`);
        resetVote(data.roles);
        return newRound(message);
      }
      const deadMember = data.roles.get(max.id);
      if (deadMember.role == 'spy') data.spyNumber -= 1;
      if (deadMember.role == 'loyal') data.loyalNumber -= 1;
      if (deadMember.role == 'whiteboard') data.whiteboardNumber -= 1;
      deadMember.alive = false;
      message.channel.send(`${deadMember.user} ??????????????????????????? ${deadMember.role}`);
      var newOptions = [];
      data.voteMsg.menus.options.forEach((item) => {
        if (item.value != deadMember.user.id) {
          newOptions.push(item);
        }
      });
      data.voteMsg.menus.options = newOptions;
      console.log(newOptions)
      if (data.spyNumber == 0) return endGame(message, true, voteClickHandler, client);
      if (data.loyalNumber == 0) return endGame(message, false, voteClickHandler, client);
      
      resetVote(data.roles);
      newRound(message);
    }
  }
  data.clickHandler = voteClickHandler;
  client.on('clickMenu', voteClickHandler);
}

function resetVote(members) {
  members.forEach((item, index) => {
    if (item.alive) {
      item.vote = false;
    }
    item.votedNum = 0;
  })
}

function newRound(message) {
  message.channel.send(`---------------------------???????????????--------------------`);
  const data = spygameData.get(message.guild.id);
  sleep(1000);
  message.channel.send(data.serialEmbeded);
  sleep(1000);
  message.channel.send(data.voteMsg);
}

function endGame(message, loyalWin, clickEventHandler, client) {
  const data = spygameData.get(message.guild.id);
  const gameEndEmbeded = new MessageEmbed()
    .setColor('#000000')
    .setDescription(`????????? ${data.answer[0]}???????????? ${data.answer[1]}`);
  const gameStatusEmbeded = new MessageEmbed()
    .setTitle('??????????????????????????????')
    .setColor('#000000');
  if (loyalWin) {
    gameEndEmbeded.setTitle(`????????????`);
  } else {
    gameEndEmbeded.setTitle(`????????????`);
  }
  var count = 0
  data.roles.forEach((item, index) => {
    count += 1;
    if (count % 2 == 0) {
      gameStatusEmbeded.addField(item.role, item.user);
    } else {
      gameStatusEmbeded.addField(item.role, item.user), true;
    }
  })
  message.channel.send(gameEndEmbeded);
  message.channel.send(gameStatusEmbeded);
  client.removeListener('clickMenu', clickEventHandler)
}