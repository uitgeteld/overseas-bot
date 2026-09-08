import { Client, Collection } from "discord.js";

export interface Command {
  data: any;
  execute: (...args: any[]) => any;
  aliases?: string[];
  guild?: boolean;
  dev?: boolean;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
