import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('options')
    .setDescription('Replies with a list of options for the bot owner.');
export const devOnly = true;

export async function execute(interaction: ChatInputCommandInteraction, client: Client) {
    const embed = new EmbedBuilder()
        .setColor('#C9C2B2')
        .setTitle('⚙️ Start Options')
        .setFields(
            { name: '🐈‍⬛ Git Pull', value: client.startOptions?.gitPull ? 'Enabled' : 'Disabled', inline: true },
            { name: '📚 Npm Install', value: client.startOptions?.npmInstall ? 'Enabled' : ' Disabled', inline: true });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('options_toggle_git_pull')
                .setLabel('Toggle Git Pull')
                .setStyle(client.startOptions?.gitPull ? ButtonStyle.Danger : ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('options_toggle_npm_install')
                .setLabel('Toggle Npm Install')
                .setStyle(client.startOptions?.npmInstall ? ButtonStyle.Danger : ButtonStyle.Success)
        );
    return await interaction.reply({
        embeds: [embed], components: [row.toJSON()], flags: MessageFlags.Ephemeral
    })
}