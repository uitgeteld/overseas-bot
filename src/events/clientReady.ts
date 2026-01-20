import { Client } from "discord.js";
import chalk from "chalk";

export default  {
    name: "clientReady",
    once: true,
    async execute(client: Client) {
        console.log(
            `\n${chalk.green("✓")} ${chalk.bold.green("Bot is ready!")} ` +
            `${chalk.dim("│")} ${chalk.bold("Logged in as")} ${chalk.cyan(client.user?.tag)}\n`
        );
    }
};