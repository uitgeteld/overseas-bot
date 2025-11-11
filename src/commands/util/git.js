const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git')
        .setDescription('View the latest Git commits and changes'),
    devOnly: true,
    async execute(interaction, client) {
        try {
            const commits = execSync('git log -10 --pretty=format:"%H|%h|%an|%ar|%s"', { encoding: 'utf-8' });
            
            if (!commits.trim()) {
                return await interaction.reply({ content: 'No commits found.', ephemeral: true });
            }

            const commitLines = commits.trim().split('\n');
            const commitData = [];

            commitLines.forEach((line, index) => {
                const [hash, shortHash, author, date, message] = line.split('|');
                commitData.push({
                    id: index.toString(),
                    hash,
                    shortHash,
                    author,
                    date,
                    message
                });
            });

            const jsonPath = path.join(__dirname, '../../..', 'git-commits.json');
            fs.writeFileSync(jsonPath, JSON.stringify(commitData, null, 2));

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Latest Git Commits')
                .setDescription('Select a commit from the dropdown to view details')
                .setTimestamp();

            commitData.forEach(commit => {
                embed.addFields({
                    name: `\`${commit.shortHash}\` - ${commit.message}`,
                    value: `by ${commit.author} • ${commit.date}`,
                    inline: false
                });
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('git-commit-select')
                .setPlaceholder('Select a commit to view changes')
                .addOptions(
                    commitData.map(commit => ({
                        label: commit.message.substring(0, 100), // Discord limit
                        description: `${commit.shortHash} by ${commit.author}`,
                        value: commit.id
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch Git commits.', ephemeral: true });
        }
    },
};
