import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('guilds')
        .setDescription('Replies with list of guilds the bot is in'),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        const guilds = client.guilds.cache.map(guild => guild.name).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Guilds')
            .setDescription(guilds || 'The bot is not in any guilds.')
            .setColor('#C9C2B2');

        await interaction.editReply({ embeds: [embed] });
    }
};