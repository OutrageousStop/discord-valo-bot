const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

module.exports = class ValotodayCommand extends BaseCommand {
  constructor() {
    super('valotoday', 'valo', []);
  }

  sendMessage(response, message, color='#24f00a') {
    const playersEmbed = new Discord.MessageEmbed()
     .setTitle(`Players today`)
     .setDescription(response)
     .setColor(color);
    message.channel.send(playersEmbed);
  }
  

  run(client, message, args) {
    if (!fs.existsSync('valo.txt')) {
      return this.sendMessage('No one is playing valo today :(', message, '#ff0000');
    }
    const buffer = fs.readFileSync('valo.txt');
    const players = JSON.parse(buffer.toString());
    var response = ``;
    if (players.length == 0) {
      response = 'No one is playing valo today :(';
      return this.sendMessage(response, message, '#ff0000');
    }
    players.forEach((player) => {
      response += `${player.username}\t${player.time}\n`;
    })
    this.sendMessage(response, message);
  }
}