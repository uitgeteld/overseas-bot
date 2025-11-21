import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";

export default async function handleEvents(client: Client, eventsPath: string) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts"));
  for (const file of eventFiles) {
    console.log(`Loading event file: ${file}`);
    import(pathToFileURL(path.join(eventsPath, file)).href).then(event => {
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
