import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { loadModule } from "../helpers/loadModule";

const folderColors: Record<string, (text: string) => string> = {
  guildMember: chalk.cyan,
  message: chalk.green,
  interaction: chalk.magenta,
  voice: chalk.yellow,
  channel: chalk.blue,
  role: chalk.red,
  default: chalk.white
};

function getFolderColor(folder: string): (text: string) => string {
  return folderColors[folder] || folderColors.default;
}

export default async function handleEvents(client: Client, eventsPath: string) {
  const eventEntries = fs.readdirSync(eventsPath);

  for (const entry of eventEntries) {
    const entryPath = path.join(eventsPath, entry);
    const stats = fs.statSync(entryPath);
    
    if (stats.isDirectory()) {
      const eventFiles = fs.readdirSync(entryPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
      const color = getFolderColor(entry);
      
      for (const file of eventFiles) {
        const filePath = path.join(entryPath, file);
        const event = await loadModule(filePath);
        const evt = event.default || event;

        const icon = evt.once ? chalk.yellow("⚡") : chalk.green("🔄");
        const type = evt.once ? chalk.yellow("once") : chalk.green("on");
        
        console.log(
          `${icon} ${chalk.bold("Event:")} ${color(evt.name)} ${chalk.dim("│")} ` +
          `${chalk.dim("Type:")} ${type} ${chalk.dim("│")} ` +
          `${chalk.dim("Path:")} ${color(`${entry}/${file}`)}`
        );

        if (evt.once) {
          client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
        } else {
          client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
        }
      }
    } else if (entry.endsWith(".ts") || entry.endsWith(".js")) {
      const event = await loadModule(entryPath);
      const evt = event.default || event;

      const icon = evt.once ? chalk.yellow("⚡") : chalk.green("🔄");
      const type = evt.once ? chalk.yellow("once") : chalk.green("on");
      
      console.log(
        `${icon} ${chalk.bold("Event:")} ${chalk.white(evt.name)} ${chalk.dim("│")} ` +
        `${chalk.dim("Type:")} ${type} ${chalk.dim("│")} ` +
        `${chalk.dim("Path:")} ${chalk.white(entry)}`
      );

      if (evt.once) {
        client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
      } else {
        client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
      }
    }
  }
}
