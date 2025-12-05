import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { loadModule } from "../helpers/loadModule";

export default async function handleEvents(client: Client, eventsPath: string) {
  const eventEntries = fs.readdirSync(eventsPath);

  for (const entry of eventEntries) {
    const entryPath = path.join(eventsPath, entry);
    const stats = fs.statSync(entryPath);
    
    if (stats.isDirectory()) {
      const eventFiles = fs.readdirSync(entryPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
      for (const file of eventFiles) {
        const filePath = path.join(entryPath, file);
        const event = await loadModule(filePath);
        const evt = event.default || event;

        if (evt.once) {
          console.log(`Registering one-time event: ${evt.name} | ${entry}/${file}`);
          client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
        } else {
          console.log(`Registering recurring event: ${evt.name} | ${entry}/${file}`);
          client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
        }
      }
    } else if (entry.endsWith(".ts") || entry.endsWith(".js")) {
      const event = await loadModule(entryPath);
      const evt = event.default || event;

      if (evt.once) {
        console.log(`Registering one-time event: ${evt.name} | ${entry}`);
        client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
      } else {
        console.log(`Registering recurring event: ${evt.name} | ${entry}`);
        client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
      }
    }
  }
}
