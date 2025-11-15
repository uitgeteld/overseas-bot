const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('options')
        .setDescription('Replies with a list of options for the bot owner.'),
    devOnly: true,
    async execute(interaction, client) {

        const embed = new EmbedBuilder()
            .setColor('#C9C2B2')
            .setTitle('⚙️ Start Options')
            .setFields(
                { name: '🐈‍⬛ Git Pull', value: client.startOptions?.gitPull ? 'Enabled' : 'Disabled', inline: true },
                { name: '📚 Npm Install', value: client.startOptions?.npmInstall ? 'Enabled' : ' Disabled', inline: true });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('options_toggle_npm_install')
                    .setLabel('Toggle Npm Install')
                    .setStyle(client.startOptions?.npmInstall ? 'Danger' : 'Success'),

                new ButtonBuilder()
                    .setCustomId('options_toggle_git_pull')
                    .setLabel('Toggle Git Pull')
                    .setStyle(client.startOptions?.gitPull ? 'Danger' : 'Success')
            );
        return await interaction.reply({
            embeds: [embed], components: [row], ephemeral: true
        })

    },
};