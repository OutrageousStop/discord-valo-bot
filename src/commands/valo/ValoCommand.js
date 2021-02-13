const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');
const fs = require('fs');
const { strict } = require('assert');
const moment = require('moment');

module.exports = class ValoCommand extends BaseCommand {
  constructor() {
    super('valo', '', []);
  }

  validate(time) {
    if (!time) {
      throw new Error('No time was given');
    }
    var date = moment(time, 'HH:mm', true);
    if (!date.isValid()) {
      throw new Error('If you had the time to type this You could have given a time in the HH:MM 24 hour format.');
    }
    var seconds = date.diff(moment(), 'seconds');
    if (seconds< 0) {
      throw new Error('Like living in the past much?');
    }
    return date.fromNow();
  }

  readPlayers() {
    if (!fs.existsSync('valo.txt')) {
     return false;
    }
    let buffer = fs.readFileSync('valo.txt');
    let players = JSON.parse(buffer.toString());
    return players;
  }

  writePlayers(players) {
    fs.writeFileSync('valo.txt', JSON.stringify(players));
  }

  sendMessage(response, message, color='#24f00a') {
    const messageEmbed = new Discord.MessageEmbed()
     .setTitle(`Boop`)
     .setDescription(`${response}`)
     .setColor(color);
     message.channel.send(messageEmbed)
  }

  run(client, message, args) {
    var time = args[0];
    var response = ``;
    try {
      if (time == 'cancel') {
        players = this.readPlayers();
        var index = players.findIndex((player) => player.id == message.member.id)
        if (index == -1) {
          response = `<@${message.member.id}> abe saale pehle time toh de`;
          return this.sendMessage(response, message, '#ff0000');
        } else {
          players = players.filter((player) => player.id !== message.member.id)
          response = `<@${message.member.id}> will not be playing valorant today.`;
          this.writePlayers(players);
          return this.sendMessage(response, message);
        }
      }
      if (time == 'help') {
        return this.sendMessage('Help is under progress', message);
      }
      var hours = this.validate(time);
      var newPlayer = {id: message.member.id, time};
      var players = this.readPlayers();
      if (!players) {
        players = []
        players.push(newPlayer);
        response = `<@${newPlayer.id}> will play Valorant at ${newPlayer.time} which is approx ${hours}`;
        this.writePlayers(players);
      } else {
        var updated = 0;
        players.forEach((player) => {
          if (player.id == newPlayer.id) {
            player.time = time;
            updated = 1;
            response = `<@${newPlayer.id}> changed their time to ${newPlayer.time} which is approx ${hours}`;
            return;
          }
        })
        if (updated == 0) {
          players.push(newPlayer);
          response = `<@${newPlayer.id}> will play Valorant at ${newPlayer.time} which is approx  ${hours}`;
        }
        this.writePlayers(players);
      }
      this.sendMessage(response, message);
    } catch (e) {
      this.sendMessage(e.message, message, '#ff0000');
    }
  }
}