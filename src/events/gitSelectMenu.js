const { EmbedBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { execSync } = require('child_process');
const githubFetch = require('../helpers/githubFetchHelper');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId.startsWith('git-user-repo-select')) {
            try {
                const customIdParts = interaction.customId.split(':');
                const username = customIdParts[1];
                const repoName = interaction.values[0];
                const repo = `${username}/${repoName}`;

                const response = await githubFetch(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=10`);

                if (!response.ok) {
                    return await interaction.reply({
                        content: 'Failed to fetch commits from this repository.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                const githubCommits = await response.json();
                const commits = githubCommits.map((commit, index) => {
                    const date = new Date(commit.commit.author.date);
                    const relativeTime = getRelativeTime(date);
                    return {
                        id: index.toString(),
                        hash: commit.sha,
                        shortHash: commit.sha.substring(0, 7),
                        author: commit.commit.author.name,
                        date: relativeTime,
                        message: commit.commit.message.split('\n')[0]
                    };
                });

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Latest Commits - ${repo}`)
                    .setURL(`https://github.com/${repo}`)
                    .setDescription('Select a commit from the dropdown to view details')
                    .setTimestamp();

                commits.forEach(commit => {
                    embed.addFields({
                        name: `\`${commit.shortHash}\` - ${commit.message}`,
                        value: `by ${commit.author} • ${commit.date}`,
                        inline: false
                    });
                });

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`git-commit-select:${repo}`)
                    .setPlaceholder('Select a commit to view changes')
                    .addOptions(
                        commits.map(commit => ({
                            label: commit.message.substring(0, 100),
                            description: `${commit.shortHash} by ${commit.author}`,
                            value: commit.id
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);
                await interaction.update({ embeds: [embed], components: [row] });

            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Failed to fetch repository commits.',
                    flags: MessageFlags.Ephemeral
                });
            }
            return;
        }

        if (!interaction.customId.startsWith('git-commit-select')) return;

        try {
            const selectedId = interaction.values[0];
            let repo;

            if (interaction.customId.includes(':')) {
                repo = interaction.customId.substring('git-commit-select:'.length);
            }

            console.log(`Commit details - customId: ${interaction.customId}, repo:`, repo);

            let hash, shortHash, author, date, message, fileChanges, codeChanges;
            let totalAdditions = 0;
            let totalDeletions = 0;

            if (repo) {
                const [owner, repoName] = repo.split('/');
                const response = await githubFetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=10`);

                if (!response.ok) {
                    return await interaction.reply({ content: 'Failed to fetch commit from GitHub.', flags: MessageFlags.Ephemeral });
                }

                const commits = await response.json();
                const commit = commits[parseInt(selectedId)];

                if (!commit) {
                    return await interaction.reply({ content: 'Commit not found.', flags: MessageFlags.Ephemeral });
                }

                hash = commit.sha;
                shortHash = commit.sha.substring(0, 7);
                author = commit.commit.author.name;
                const commitDate = new Date(commit.commit.author.date);
                date = getRelativeTime(commitDate);
                message = commit.commit.message.split('\n')[0];

                const commitResponse = await githubFetch(`https://api.github.com/repos/${owner}/${repoName}/commits/${hash}`);
                const commitDetails = await commitResponse.json();

                if (commitDetails.files && commitDetails.files.length > 0) {
                    commitDetails.files.forEach(file => {
                        totalAdditions += file.additions || 0;
                        totalDeletions += file.deletions || 0;
                    });

                    fileChanges = commitDetails.files
                        .slice(0, 10)
                        .map(file => {
                            const additions = '+'.repeat(Math.min(file.additions, 20));
                            const deletions = '-'.repeat(Math.min(file.deletions, 20));
                            return `${file.filename} | ${additions}${deletions}`;
                        })
                        .join('\n');
                }

                if (commitDetails.files && commitDetails.files.length > 0) {
                    codeChanges = commitDetails.files
                        .slice(0, 3)
                        .map(file => file.patch || '')
                        .join('\n')
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

                    if (codeChanges.length > 1000) {
                        codeChanges = codeChanges.substring(0, 997) + '...';
                    }
                }

            } else {
                const commits = execSync('git log -10 --pretty=format:"%H|%h|%an|%ar|%s"', { encoding: 'utf-8' });
                const commitLines = commits.trim().split('\n');
                const commitLine = commitLines[parseInt(selectedId)];

                if (!commitLine) {
                    return await interaction.reply({ content: 'Commit not found.', flags: MessageFlags.Ephemeral });
                }

                [hash, shortHash, author, date, message] = commitLine.split('|');

                const numstat = execSync(`git show ${hash} --numstat --format=""`, { encoding: 'utf-8' });

                numstat.trim().split('\n').forEach(line => {
                    if (line.trim()) {
                        const parts = line.split('\t');
                        totalAdditions += parseInt(parts[0]) || 0;
                        totalDeletions += parseInt(parts[1]) || 0;
                    }
                });

                const diffStat = execSync(`git show ${hash} --stat`, { encoding: 'utf-8' });
                const diffLines = diffStat.split('\n');

                fileChanges = diffLines
                    .slice(5, -2)
                    .filter(line => line.trim() && line.includes('|'))
                    .slice(0, 10)
                    .join('\n');

                const diff = execSync(`git diff ${hash}~1 ${hash}`, { encoding: 'utf-8' });

                codeChanges = diff
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

                if (codeChanges.length > 1000) {
                    codeChanges = codeChanges.substring(0, 997) + '...';
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Commit: ${shortHash}`)
                .setURL(repo ? `https://github.com/${repo}/commit/${hash}` : undefined)
                .setDescription(`**${message}**`)
                .addFields(
                    { name: 'Author', value: author, inline: true },
                    { name: 'Date', value: date, inline: true },
                    { name: 'Hash', value: `\`${shortHash}\``, inline: true }
                )
                .setTimestamp();

            console.log(`Embed URL: ${repo ? `https://github.com/${repo}/commit/${hash}` : 'undefined'}`);

            if (totalAdditions !== undefined && totalDeletions !== undefined) {
                const changesText = `\`\`\`diff\n+ ${totalAdditions} additions\n- ${totalDeletions} deletions\n\`\`\``;
                embed.addFields({
                    name: '📊 Lines Changed',
                    value: changesText,
                    inline: false
                });
            }

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

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch commit details.', flags: MessageFlags.Ephemeral });
        }
    },
};

function getRelativeTime(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}