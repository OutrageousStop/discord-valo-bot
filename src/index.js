
const { Client } = require('discord.js');
const { registerCommands, registerEvents } = require('./utils/registry');
const config = require('../slappey.json');
const schedule = require('node-schedule');
const fs = require('fs');
const client = new Client();

const scheduleClear = () => {
  const job = schedule.scheduleJob('clear', '0 0 * * *', () => {
    fs.writeFileSync('valo.txt', '[]')
  })
}

(async () => {
  client.commands = new Map();
  client.events = new Map();
  client.prefix = config.prefix;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.DJS_TOKEN);
  scheduleClear();
})();

