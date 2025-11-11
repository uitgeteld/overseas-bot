const { EmbedBuilder } = require("discord.js");
const { execSync } = require('child_process');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId === 'git-commit-select') {
            try {
                const selectedId = interaction.values[0];

                // Get commit data directly from git using the index
                const commits = execSync('git log -10 --pretty=format:"%H|%h|%an|%ar|%s"', { encoding: 'utf-8' });
                const commitLines = commits.trim().split('\n');
                const commitLine = commitLines[parseInt(selectedId)];

                if (!commitLine) {
                    return await interaction.reply({ content: 'Commit not found.', ephemeral: true });
                }

                const [hash, shortHash, author, date, message] = commitLine.split('|');

                const diffStat = execSync(`git show ${hash} --stat`, { encoding: 'utf-8' });
                const diffLines = diffStat.split('\n');

                const fileChanges = diffLines
                    .slice(5, -2)
                    .filter(line => line.trim() && line.includes('|'))
                    .slice(0, 10)
                    .join('\n');

                const diff = execSync(`git diff ${hash}~1 ${hash}`, { encoding: 'utf-8' });

                let codeChanges = diff
                    .split('\n')
                    .filter(line => {
                        return !line.startsWith('diff --git') &&
                            !line.startsWith('index ') &&
                            !line.startsWith('---') &&
                            !line.startsWith('+++') &&
                            !line.startsWith('@@');
                    })
                    .join('\n')
                    .trim();

                if (!codeChanges) {
                    codeChanges = 'No code changes found';
                }

                if (codeChanges.length > 1000) {
                    codeChanges = codeChanges.substring(0, 997) + '...';
                }

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`Commit: ${shortHash}`)
                    .setDescription(`**${message}**`)
                    .addFields(
                        { name: 'Author', value: author, inline: true },
                        { name: 'Date', value: date, inline: true },
                        { name: 'Hash', value: `\`${shortHash}\``, inline: true }
                    )
                    .setTimestamp();

                if (fileChanges) {
                    embed.addFields({
                        name: 'Files Changed',
                        value: `\`\`\`\n${fileChanges}\n\`\`\``,
                        inline: false
                    });
                }

                if (codeChanges && codeChanges !== 'No code changes found') {
                    embed.addFields({
                        name: 'Code Changes',
                        value: `\`\`\`diff\n${codeChanges}\n\`\`\``,
                        inline: false
                    });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Failed to fetch commit details.', ephemeral: true });
            }
        }
    },
};
