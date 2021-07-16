const { MessageButton } = require('discord-buttons');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const questions = require('./questions.json');
const { spygameData } = require('./spygameVar');
const sleep = require('util').promisify(setTimeout)
module.exports = class SpygameCommand extends BaseCommand {
  constructor() {
    super('spygame', 'game', []);
  }

  async run(client, message, args) {
    const data = spygameData.get(message.guild.id);
    if (data) spygameData.delete(message.guild.id);
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

    // if (playerNum < 4) return message.channel.send('Player number need to be above 4 and all players should be in the same voice channel.');
    // if (spyNum < 1 || spyNum > playerNum / 3 || (spyNum + whiteboardNum) > playerNum / 3) return message.channel.send('Number of spy plus whiteboard must be between 1 and one third of the total players.')
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
      .setDescription('請按照順序描述你的詞彙');

    var firstIndex = Math.floor(Math.random() * dataContruct.roles.size) + 1;
    var serialNum = 0;
    var serialMembers = [];
    var VoteButtons = [];
    voiceChannelMember.forEach((item, index) => {
      serialNum += 1;
      var newIndex = serialNum - firstIndex;
      if (newIndex >= 0) {
        serialMembers[newIndex] = { name: newIndex + 1, value: item.user };
        VoteButtons[newIndex] = createPlayerBtn(item.user);
      } else {
        serialMembers[dataContruct.roles.size - firstIndex + Math.abs(newIndex)] = { name: dataContruct.roles.size - firstIndex + Math.abs(newIndex) + 1, value: item.user };
        VoteButtons[dataContruct.roles.size - firstIndex + Math.abs(newIndex)] = createPlayerBtn(item.user);
      }
    });
    serialEmbeded.addFields(serialMembers);
    dataContruct.serialEmbeded = serialEmbeded;
    const voteEmbeded = new MessageEmbed()
      .setColor('#000000')
      .setTitle('請按下你要投票的對象，每人只會計算一次，請謹慎選擇');

    dataContruct.voteMsg.buttons = VoteButtons;
    dataContruct.voteMsg.embed = voteEmbeded;

    spygameData.set(message.guild.id, dataContruct);
    await message.channel.send(serialEmbeded);
    await message.channel.send(dataContruct.voteMsg);
    voteClick(client, message);
  }

}

function createPlayerBtn(user) {
  const voteBtn = new MessageButton()
    .setStyle('green')
    .setLabel(`${user.username}`)
    .setID(user.id);
  return voteBtn;
}

async function voteClick(client, message) {
  var voteClickHandler = async (button) => {
    const data = spygameData.get(message.guild.id);
    const clickedMember = data.roles.get(button.clicker.user.id);
    if (!clickedMember.alive) return button.reply.send(`${clickedMember.user}死人還敢投票阿！！`);
    if (clickedMember.vote) return button.reply.send(`${button.clicker.user} 你在此回已經投過票了！`);
    // 被投票的玩家
    const votedMember = data.roles.get(button.id);
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

    await button.reply.send(`${button.clicker.user} 投給了 ${votedMember.user}`);
    if (voteCount == data.roles.size) {
      if (secMax == max.num) {
        message.channel.send(`有兩個人得到一樣的票數，請開始新的一輪敘述`);
        resetVote(data.roles);
        return newRound(message);
      }
      const deadMember = data.roles.get(max.id);
      if (deadMember.role == 'spy') data.spyNumber -= 1;
      if (deadMember.role == 'loyal') data.loyalNumber -= 1;
      if (deadMember.role == 'whiteboard') data.whiteboardNumber -= 1;
      deadMember.alive = false;
      message.channel.send(`${deadMember.user} 死掉了，他的角色是 ${deadMember.role}`);
      data.voteMsg.buttons.forEach((item)=>{
        if (item.custom_id==deadMember.user.id) {          
          item.setDisabled(true);
          item.setStyle('red');
        }
      });

      if (data.spyNumber == 0) return endGame(message, true, voteClickHandler, client);
      if (data.loyalNumber == 0) return endGame(message, false, voteClickHandler, client);


      resetVote(data.roles);
      newRound(message);
    }
  }
  client.on('clickButton', voteClickHandler);
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
  message.channel.send(`---------------------------下一輪開始--------------------`);
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
    .setDescription(`平民是 ${data.answer[0]}，臥底是 ${data.answer[1]}`);
  const gameStatusEmbeded = new MessageEmbed()
    .setTitle('各個玩家的角色分別為')
    .setColor('#000000');
  if (loyalWin) {
    gameEndEmbeded.setTitle(`平民獲勝`);
  } else {
    gameEndEmbeded.setTitle(`臥底獲勝`);
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
  client.removeListener('clickButton', clickEventHandler)
}