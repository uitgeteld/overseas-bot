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
                    .setColor('#C9C2B2')
                    .setTitle(`Latest Commits - ${repo}`)
                    .setURL(`https://github.com/${repo}`)
                    .setDescription('Select a commit from the dropdown to view details')

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

        if (interaction.customId.startsWith('git-commit-select')) {
            await handleCommitSelect(interaction);
            return;
        }

        if (interaction.customId.startsWith('git-file-select')) {
            await handleFileSelect(interaction);
            return;
        }
    },
};

async function handleCommitSelect(interaction) {
    try {
        const selectedId = interaction.values[0];
        let repo;

        if (interaction.customId.includes(':')) {
            repo = interaction.customId.substring('git-commit-select:'.length);
        }

        let hash, shortHash, author, date, message, allFiles;
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

                allFiles = commitDetails.files.map(file => {
                    if (!file.patch) return null;

                    const cleanPatch = file.patch
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

                    return { filename: file.filename, patch: cleanPatch };
                }).filter(f => f !== null);
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

            const diff = execSync(`git diff ${hash}~1 ${hash}`, { encoding: 'utf-8' });

            const fileDiffs = [];
            let currentFile = null;
            let currentPatch = [];

            diff.split('\n').forEach(line => {
                if (line.startsWith('diff --git')) {
                    if (currentFile && currentPatch.length > 0) {
                        fileDiffs.push({ filename: currentFile, patch: currentPatch.join('\n') });
                    }
                    const match = line.match(/diff --git a\/(.+) b\//);
                    currentFile = match ? match[1] : null;
                    currentPatch = [];
                } else if (!line.startsWith('index ') && !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@')) {
                    currentPatch.push(line);
                }
            });

            if (currentFile && currentPatch.length > 0) {
                fileDiffs.push({ filename: currentFile, patch: currentPatch.join('\n') });
            }

            allFiles = fileDiffs.map(file => {
                const cleanPatch = file.patch.trim();
                return { filename: file.filename, patch: cleanPatch };
            }).filter(f => f.patch);
        }

        const embed = new EmbedBuilder()
            .setColor('#C9C2B2')
            .setTitle(`Commit: ${shortHash}`)
            .setURL(repo ? `https://github.com/${repo}/commit/${hash}` : undefined)
            .setDescription(`**${message}**`)
            .addFields(
                { name: 'Author', value: author, inline: true },
                { name: 'Date', value: date, inline: true },
                { name: 'Hash', value: `\`${shortHash}\``, inline: true }
            )
            .setTimestamp();

        if (totalAdditions !== undefined && totalDeletions !== undefined) {
            const changesText = `\`\`\`diff\n+ ${totalAdditions} additions\n- ${totalDeletions} deletions\n\`\`\``;
            embed.addFields({
                name: '📊 Lines Changed',
                value: changesText,
                inline: false
            });
        }

        if (allFiles && allFiles.length > 0) {
            const fileList = allFiles
                .map(f => f.filename)
                .join('\n');

            embed.addFields({
                name: `📚 Files Changed (${allFiles.length})`,
                value: `\`\`\`\n${fileList}\n\`\`\``,
                inline: false
            });
        }

        if (allFiles && allFiles.length === 1) {
            const firstFile = allFiles[0];
            const ext = firstFile.filename.split('.').pop().toLowerCase();
            const langLabel = getLanguageLabel(ext);

            let patch = firstFile.patch;
            if (patch.length > 1000) {
                patch = patch.substring(0, 997) + '...';
            }

            embed.addFields({
                name: `📄 ${firstFile.filename} (${langLabel})`,
                value: `\`\`\`diff\n${patch}\n\`\`\``,
                inline: false
            });
        }

        const components = [];

        if (allFiles && allFiles.length > 1) {
            const fileSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`git-file-select:${repo || 'local'}:${hash}`)
                .setPlaceholder('Select a file to inspect')
                .addOptions(
                    allFiles.map((file, index) => ({
                        label: file.filename.substring(0, 100),
                        description: `View changes in this file`,
                        value: index.toString()
                    }))
                );

            const row = new ActionRowBuilder().addComponents(fileSelectMenu);
            components.push(row);
        }

        await interaction.reply({
            embeds: [embed],
            components: components,
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Failed to fetch commit details.', flags: MessageFlags.Ephemeral });
    }
}

async function handleFileSelect(interaction) {
    try {
        const selectedFileIndex = parseInt(interaction.values[0]);
        const customIdParts = interaction.customId.split(':');
        const repoOrLocal = customIdParts[1];
        const hash = customIdParts[2];

        const repo = repoOrLocal !== 'local' ? repoOrLocal : null;

        let allFiles;
        let message = '';

        if (repo) {
            const [owner, repoName] = repo.split('/');
            const commitResponse = await githubFetch(`https://api.github.com/repos/${owner}/${repoName}/commits/${hash}`);
            const commitDetails = await commitResponse.json();

            message = commitDetails.commit?.message?.split('\n')[0] || '';

            if (commitDetails.files && commitDetails.files.length > 0) {
                allFiles = commitDetails.files.map(file => {
                    if (!file.patch) return null;

                    const cleanPatch = file.patch
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

                    return { 
                        filename: file.filename, 
                        patch: cleanPatch,
                        additions: file.additions || 0,
                        deletions: file.deletions || 0
                    };
                }).filter(f => f !== null);
            }
        } else {
            const diff = execSync(`git diff ${hash}~1 ${hash}`, { encoding: 'utf-8' });
            const commitInfo = execSync(`git show ${hash} --format="%s" --no-patch`, { encoding: 'utf-8' });
            message = commitInfo.trim();

            const fileDiffs = [];
            let currentFile = null;
            let currentPatch = [];

            diff.split('\n').forEach(line => {
                if (line.startsWith('diff --git')) {
                    if (currentFile && currentPatch.length > 0) {
                        fileDiffs.push({ filename: currentFile, patch: currentPatch.join('\n') });
                    }
                    const match = line.match(/diff --git a\/(.+) b\//);
                    currentFile = match ? match[1] : null;
                    currentPatch = [];
                } else if (!line.startsWith('index ') && !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@')) {
                    currentPatch.push(line);
                }
            });

            if (currentFile && currentPatch.length > 0) {
                fileDiffs.push({ filename: currentFile, patch: currentPatch.join('\n') });
            }

            allFiles = fileDiffs.map(file => {
                const cleanPatch = file.patch.trim();
                const additions = (file.patch.match(/^\+/gm) || []).length - 1;
                const deletions = (file.patch.match(/^\-/gm) || []).length - 1;
                return { 
                    filename: file.filename, 
                    patch: cleanPatch,
                    additions: Math.max(0, additions),
                    deletions: Math.max(0, deletions)
                };
            }).filter(f => f.patch);
        }

        if (!allFiles || selectedFileIndex >= allFiles.length) {
            return await interaction.reply({ content: 'File not found.', flags: MessageFlags.Ephemeral });
        }

        const selectedFile = allFiles[selectedFileIndex];
        const ext = selectedFile.filename.split('.').pop().toLowerCase();
        const langLabel = getLanguageLabel(ext);

        let patch = selectedFile.patch;
        if (patch.length > 1000) {
            patch = patch.substring(0, 997) + '...';
        }

        const embed = new EmbedBuilder()
            .setColor('#C9C2B2')
            .setTitle(`📄 ${selectedFile.filename} (${langLabel})`)
            .setURL(repo ? `https://github.com/${repo}/commit/${hash}` : undefined)
            .setDescription(`**${message}**`)
            .addFields({
                name: '📊 Lines Changed',
                value: `\`\`\`diff\n+ ${selectedFile.additions} additions\n- ${selectedFile.deletions} deletions\n\`\`\``,
                inline: false
            })
            .addFields({
                name: 'Changes',
                value: `\`\`\`diff\n${patch}\n\`\`\``,
                inline: false
            })
            .setTimestamp();

        await interaction.update({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Failed to fetch file details.', flags: MessageFlags.Ephemeral });
    }
}

function getLanguageLabel(ext) {
    const langMap = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'cs': 'C#',
        'rb': 'Ruby',
        'go': 'Go',
        'rs': 'Rust',
        'php': 'PHP',
        'html': 'HTML',
        'css': 'CSS',
        'json': 'JSON',
        'xml': 'XML',
        'yml': 'YAML',
        'yaml': 'YAML',
        'md': 'Markdown',
        'sh': 'Bash',
        'sql': 'SQL'
    };
    return langMap[ext] || ext.toUpperCase();
}

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