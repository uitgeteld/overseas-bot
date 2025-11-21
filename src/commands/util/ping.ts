import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, Client } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction: ChatInputCommandInteraction, client: Client) {
    const start = Date.now();
    await interaction.reply({ content: 'Pinging... 🏓', withResponse: true });
    await interaction.editReply(`Pong! 🏓 Latency: ${Date.now() - start}ms. API: ${client.ws.ping}ms`);
}