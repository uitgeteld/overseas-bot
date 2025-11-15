const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const optionsPath = path.join(__dirname, '../../startOptions.json');

function saveOptions(client) {
    fs.writeFileSync(optionsPath, JSON.stringify(client.startOptions, null, 2));
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'options_toggle_npm_install') {
            client.startOptions.npmInstall = !client.startOptions.npmInstall;
            saveOptions(client);

            const embed = new EmbedBuilder()
                .setColor('#C9C2B2')
                .setTitle('⚙️ Start Options')
                .setDescription(`Npm Install toggled to **${client.startOptions.npmInstall ? 'Enabled' : 'Disabled'}**`)
                .setFields(
                { name: '🐈‍⬛ Git Pull', value: client.startOptions?.gitPull ? 'Enabled' : 'Disabled', inline: true },
                { name: '📚 Npm Install', value: client.startOptions?.npmInstall ? 'Enabled' : ' Disabled', inline: true });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('options_toggle_npm_install')
                        .setLabel('Toggle Npm Install')
                        .setStyle(client.startOptions.npmInstall ? 'Danger' : 'Success'),

                    new ButtonBuilder()
                        .setCustomId('options_toggle_git_pull')
                        .setLabel('Toggle Git Pull')
                        .setStyle(client.startOptions.gitPull ? 'Danger' : 'Success')
                );

            return await interaction.update({ embeds: [embed], components: [row] });
        }

        if (interaction.customId === 'options_toggle_git_pull') {
            client.startOptions.gitPull = !client.startOptions.gitPull;
            saveOptions(client);

            const embed = new EmbedBuilder()
                .setColor('#C9C2B2')
                .setTitle('⚙️ Bot Options')
                .setDescription(`Git Pull toggled to **${client.startOptions.gitPull ? 'Enabled' : 'Disabled'}**`)
                .setFields(
                { name: '🐈‍⬛ Git Pull', value: client.startOptions?.gitPull ? 'Enabled' : 'Disabled', inline: true },
                { name: '📚 Npm Install', value: client.startOptions?.npmInstall ? 'Enabled' : ' Disabled', inline: true });
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('options_toggle_npm_install')
                        .setLabel('Toggle Npm Install')
                        .setStyle(client.startOptions.npmInstall ? 'Danger' : 'Success'),

                    new ButtonBuilder()
                        .setCustomId('options_toggle_git_pull')
                        .setLabel('Toggle Git Pull')
                        .setStyle(client.startOptions.gitPull ? 'Danger' : 'Success')
                );

            return await interaction.update({ embeds: [embed], components: [row] });
        }
    },
};
