import { Client, GatewayIntentBits } from "discord.js";
import { config, loadStartOptions } from "./config";
import path from "path";
import { handleCommands } from "./functions/handleCommands";
import { handleEvents } from "./functions/handleEvents";
import { execSync } from "child_process";
import { gitPull, npmInstall } from "../startOptions.json";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
}) as Client;

loadStartOptions(client);

const commandsPath = path.join(__dirname, "./commands");
const eventsPath = path.join(__dirname, "./events");

const startTime = Date.now();

try {
    console.log('Checking for updates...');
    execSync('git fetch origin main', { stdio: 'pipe' });

    const changes = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' });

    if (changes.trim()) {
        console.log('\nNew commits found:');
        console.log(changes);

        const diffStat = execSync('git diff --stat HEAD..origin/main', { encoding: 'utf-8' });
        console.log('Files changed:');
        console.log(diffStat);

        if (gitPull) {
            try {
                console.log('Pulling latest changes from GitHub...');
                execSync('git pull origin main', { stdio: 'inherit' });
                console.log('Successfully updated from GitHub!\n');
            } catch (error) {
                console.log(`Could not pull from GitHub ${error}\n`);
                console.log('Continuing with existing files...\n');
            }
        }
    } else {
        console.log('No updates available.\n');
    }
} catch (error) {
    console.log(`Could not check for updates ${error}\n`);
}


if (npmInstall) {
    try {
        console.log('Installing dependencies...');
        execSync('npm install --omit=dev', { stdio: 'inherit' });
        // execSync('npm install -D tsx', { stdio: 'inherit' });
        console.log('Dependencies installed!\n');
    } catch (error) {
        console.log(`Error installing dependencies ${error}\n`);
    }
}

const setupTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Setup completed in ${setupTime}s\n\n`);

(async () => {
    await handleCommands(client, commandsPath);
    handleEvents(client, eventsPath);
    client.login(config.TOKEN);
})();