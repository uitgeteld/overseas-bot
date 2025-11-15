const { Client, GatewayIntentBits, Collection } = require(`discord.js`);
const fs = require('node:fs');
const path = require('node:path');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const optionsPath = path.join(__dirname, '../startOptions.json');
try {
    const optionsData = fs.readFileSync(optionsPath, 'utf-8');
    client.startOptions = JSON.parse(optionsData);
} catch (error) {
    console.log('No startOptions.json found, using defaults');
    client.startOptions = {
        gitPull: true,
        npmInstall: true
    };
}

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.TOKEN)
})();
