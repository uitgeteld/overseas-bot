import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { loadModule } from "../helpers/loadModule";

export default async function handleEvents(client: Client, eventsPath: string) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await loadModule(filePath);
    const evt = event.default || event;

    if (evt.once) {
      console.log(`Registering one-time event: ${evt.name} | ${file}`);
      client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
    } else {
      console.log(`Registering recurring event: ${evt.name} | ${file}`);
      client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
    }
  }
}
