
import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const start = Date.now();
        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(`Latency: **${Date.now() - start}ms**\nAPI: **${client.ws.ping}ms**`)
            .setColor('#C9C2B2');

        await interaction.editReply({ embeds: [embed] });
    }
};