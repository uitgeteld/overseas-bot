import { Client, Collection, REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { loadModule } from "../helpers/loadModule";

export default async function handleCommands(client: Client, commandsPath: string) {
  client.commands = new Collection();
  const commandFolders = fs.readdirSync(commandsPath);
  const commandArray: any[] = [];

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const commandModule = await loadModule(filePath);
      const command = commandModule.default || commandModule;
      
      client.commands.set(command.data.name, command);
      const commandJson = command.data.toJSON();
      commandJson.dm_permission = !command.guildOnly;
      
      if (command.guildOnly) {
        commandJson.integration_types = [0];
        commandJson.contexts = [0];
      } else {
        commandJson.integration_types = [0, 1];
        commandJson.contexts = [0, 1, 2];
      }
      commandArray.push(commandJson);
      
      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          const aliasData = new (command.data.constructor)()
            .setName(alias)
            .setDescription(`Alias for /${command.data.name}`);
          if (command.data.options) {
            command.data.options.forEach((option: any) => {
              aliasData.options.push(option);
            });
          }
          
          client.commands.set(alias, command);
          const aliasJson = aliasData.toJSON();
          aliasJson.dm_permission = !command.guildOnly;
          
          if (command.guildOnly) {
            aliasJson.integration_types = [0];
            aliasJson.contexts = [0];
          } else {
            aliasJson.integration_types = [0, 1];
            aliasJson.contexts = [0, 1, 2];
          }
          commandArray.push(aliasJson);
        }
      }
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
