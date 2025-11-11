const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { execSync } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');

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

            // Save to JSON file in root directory
            const jsonPath = path.join(process.cwd(), 'git-commits.json');
            try {
                fs.writeFileSync(jsonPath, JSON.stringify(commitData, null, 2));
                console.log(`Git commits saved to: ${jsonPath}`);
            } catch (writeError) {
                console.error('Failed to write git-commits.json:', writeError);
            }

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
