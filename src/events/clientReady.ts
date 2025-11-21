import { Client } from "discord.js";

export default  {
    name: "clientReady",
    once: true,
    async execute(client: Client) {
        console.log(`Logged in as ${client.user?.tag}!`);
    }
};