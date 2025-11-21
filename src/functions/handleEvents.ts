import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";

export function handleEvents(client: Client, eventsPath: string) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts"));
  for (const file of eventFiles) {
    import(pathToFileURL(path.join(eventsPath, file)).href).then(event => {
      if (event.once) {
        client.once(event.name, (...args: any[]) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args: any[]) => event.execute(...args, client));
      }
    });
  }
}
