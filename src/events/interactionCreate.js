const { Interaction, EmbedBuilder } = require("discord.js");
const { execSync } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.devOnly) {
                const devIds = process.env.devIds ? process.env.devIds.split(',') : [];
                
                if (!devIds.includes(interaction.user.id)) {
                    return await interaction.reply({ 
                        content: 'This command is only available to developers.', 
                        ephemeral: true 
                    });
                }
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.log(error);
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'git-commit-select') {
                try {
                    const selectedId = interaction.values[0];

                    const jsonPath = path.join(process.cwd(), 'git-commits.json');
                    const commitData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                    const commit = commitData.find(c => c.id === selectedId);

                    if (!commit) {
                        return await interaction.reply({ content: 'Commit not found.', ephemeral: true });
                    }

                    const diffStat = execSync(`git show ${commit.hash} --stat`, { encoding: 'utf-8' });
                    const diffLines = diffStat.split('\n');

                    const fileChanges = diffLines
                        .slice(5, -2) 
                        .filter(line => line.trim() && line.includes('|'))
                        .slice(0, 10)
                        .join('\n');

                    const diff = execSync(`git show ${commit.hash} --no-color`, { encoding: 'utf-8' });
                    
                    const diffMatch = diff.match(/diff --git[\s\S]+/);
                    let codeChanges = diffMatch ? diffMatch[0] : 'No code changes found';
                    
                    if (codeChanges.length > 1000) {
                        codeChanges = codeChanges.substring(0, 997) + '...';
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle(`Commit: ${commit.shortHash}`)
                        .setDescription(`**${commit.message}**`)
                        .addFields(
                            { name: 'Author', value: commit.author, inline: true },
                            { name: 'Date', value: commit.date, inline: true },
                            { name: 'Hash', value: `\`${commit.shortHash}\``, inline: true }
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
        }
    },
};