import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Interaction, Client, ButtonStyle } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: Interaction, client: Client) {
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
                        .setCustomId('options_toggle_git_pull')
                        .setLabel('Toggle Git Pull')
                        .setStyle(client.startOptions.gitPull ? ButtonStyle.Danger : ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId('options_toggle_npm_install')
                        .setLabel('Toggle Npm Install')
                        .setStyle(client.startOptions.npmInstall ? ButtonStyle.Danger : ButtonStyle.Success)
                );
            return await interaction.update({ embeds: [embed], components: [row.toJSON()] });
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
                        .setCustomId('options_toggle_git_pull')
                        .setLabel('Toggle Git Pull')
                        .setStyle(client.startOptions.gitPull ? ButtonStyle.Danger : ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId('options_toggle_npm_install')
                        .setLabel('Toggle Npm Install')
                        .setStyle(client.startOptions.npmInstall ? ButtonStyle.Danger : ButtonStyle.Success)
                );
            return await interaction.update({ embeds: [embed], components: [row.toJSON()] });
        }
    }
};

function saveOptions(client: Client) {
    const optionsPath = path.join(__dirname, "../../startOptions.json");
    fs.writeFileSync(optionsPath, JSON.stringify(client.startOptions, null, 2));
}