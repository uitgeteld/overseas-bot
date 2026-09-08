import { Client, GatewayIntentBits } from "discord.js";
import path from "node:path";
import { config } from "./config";
import handleCommands from "./functions/handleCommands";
import handleEvents from "./functions/handleEvents";
import { instance as initializeDatabase } from "./database/main";
import { errorMessages } from "./helpers/errorMessages";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
}) as Client;

const commandsPath = path.join(__dirname, "./commands");
const eventsPath = path.join(__dirname, "./events");

(async () => {
    await handleCommands(client, commandsPath);
    await handleEvents(client, eventsPath);
    try {
        await initializeDatabase();
    } catch {
        console.log(errorMessages.console.DATABASE_CONNECTION);
    }
    client.login(config.TOKEN);
})();