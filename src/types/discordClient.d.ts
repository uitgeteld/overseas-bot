import { Client, Collection } from "discord.js";

export interface Command {
  data: any;
  execute: (...args: any[]) => any;
  dev?: boolean;
  guild?: boolean;
  aliases?: string[];
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
