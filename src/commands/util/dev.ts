import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Development command for testing purposes'),
    dev: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
    }
};