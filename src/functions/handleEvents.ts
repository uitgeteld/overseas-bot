import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default async function handleEvents(client: Client, eventsPath: string) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
  for (const file of eventFiles) {
    console.log(`Loading event file: ${file}`);
    import(path.join(eventsPath, file)).then(event => {
      const evt = event.default || event;
      if (evt.once) {
        console.log(`Registering one-time event: ${evt.name}`);
        client.once(evt.name, (...args: any[]) => evt.execute(...args, client));
      } else {
        console.log(`Registering recurring event: ${evt.name}`);
        client.on(evt.name, (...args: any[]) => evt.execute(...args, client));
      }
    });
  }
}
