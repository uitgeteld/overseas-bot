import { Client, Collection } from "discord.js";

export interface Command {
  data: any;
  execute: (...args: any[]) => any;
  devOnly?: boolean;
  guildOnly?: boolean;
  aliases?: string[];
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    startOptions: {
        gitPull: boolean;
        npmInstall: boolean;
    }
  }
}
