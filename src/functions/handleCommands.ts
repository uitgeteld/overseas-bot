import { Client, Collection, REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";
import { config } from "../config";

export default async function handleCommands(client: Client, commandsPath: string) {
  client.commands = new Collection();
  const commandFolders = fs.readdirSync(commandsPath);
  const commandArray: any[] = [];

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".ts"));
    for (const file of commandFiles) {
      const commandModule = await import(pathToFileURL(path.join(folderPath, file)).href);
      const command = commandModule.default || commandModule;
      client.commands.set(command.data.name, command);
      commandArray.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: "10" }).setToken(config.TOKEN);
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: commandArray }
    );
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
