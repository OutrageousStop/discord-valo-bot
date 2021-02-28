const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');
const fs = require('fs');
const { strict } = require('assert');
const moment = require('moment');
const schedule = require('node-schedule');

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
      throw new Error('If you had the time to type this You could have given a valid time of the day in the HH:MM 24 hour format.');
    }
    var seconds = date.diff(moment(), 'seconds');
    if (seconds< 0) {
      throw new Error('Like living in the past much?');
    }
    return [date.toDate(), date.fromNow()];
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

  sendMessage(response, message, color, thumbnail) {
    const messageEmbed = new Discord.MessageEmbed()
     .setTitle(`Boop`)
     .setDescription(response)
     .setThumbnail(thumbnail)
     .setColor(color)
     message.channel.send(messageEmbed)
  }

  scheduleNotification(player, message, date) {
    const job = schedule.scheduleJob(player.id, date, () => {
      message.channel.send(`${player.username} it is ${player.time}. Valo?`);
    });
  }

  cancelNotification(player) {
    var cancel = schedule.scheduledJobs[player.id];
    if (cancel) {
      cancel.cancel();
    }
  }

  cancelClear() {
    var cancel = schedule.scheduledJobs['clear'];
    if (cancel) {
      cancel.cancel();
    }
  }

  scheduleClear() {
    const job = schedule.scheduleJob('clear', '0 0 * * *', () => {
      fs.writeFileSync('valo.txt', '[]')
    })
  }

  run(client, message, args) {
    this.scheduleClear();
    var time = args[0];
    var response = ``;
    try {
      if (time == 'cancel') {
        players = this.readPlayers();
        var index = players.findIndex((player) => player.username == message.member.user.username)
        if (index == -1) {
          response = `${message.member.user.username} I noticed that you did not provide a time earlier. Nashedi or what?`;
          return this.sendMessage(response, message, '#ff0000', 'https://w7.pngwing.com/pngs/50/202/png-transparent-cannabis-smoking-drawing-cartoon-weed-leaf-plant-stem-grass-thumbnail.png');
        } else {
          players = players.filter((player) => player.id !== message.member.id)
          response = `${message.member.user.username} will not be playing valorant today.`;
          this.cancelNotification(message.member);
          this.writePlayers(players);
          return this.sendMessage(response, message, '#24f00a');
        }
      }
      if (time == 'help') {
        return this.sendMessage('Help is under progress', message);
      }
      var [date, hours] = this.validate(time);
      var newPlayer = { id: message.member.id, username: message.member.user.username, time };
      var players = this.readPlayers();
      if (!players) {
        players = []
        players.push(newPlayer);
        response = `${newPlayer.username} will play Valorant at ${newPlayer.time} which is approx ${hours}`;
        this.scheduleNotification(newPlayer, message, date);
        this.writePlayers(players);
      } else {
        var updated = 0;
        players.forEach((player) => {
          if (player.id == newPlayer.id) {
            player.time = time;
            updated = 1;
            response = `${newPlayer.username} changed their time to ${newPlayer.time} which is approx ${hours}`;
            this.cancelNotification(newPlayer);
            this.scheduleNotification(newPlayer, message, date);
            return;
          }
        })
        if (updated == 0) {
          players.push(newPlayer);
          response = `${newPlayer.username} will play Valorant at ${newPlayer.time} which is approx  ${hours}`;
          this.scheduleNotification(newPlayer, message, date);
        }
        this.writePlayers(players);
      }
      this.sendMessage(response, message, '#24f00a', `https://t3.ftcdn.net/jpg/03/12/44/34/360_F_312443477_5lxDV8QHzXyOwMH4FxLmU4Y93h12NZEJ.jpg`);
    } catch (e) {
      this.sendMessage(e.message, message, '#ff0000', `https://nyc3.digitaloceanspaces.com/memecreator-cdn/media/__processed__/ead/template-hide-the-pain-harold-938-0c6db91aec9c.jpeg`);
    }
  }
}