const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { execSync } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git')
        .setDescription('View the latest Git commits and changes')
        .addStringOption(option =>
            option.setName('repo')
                .setDescription('GitHub repository (owner/repo) - defaults to this bot')
                .setRequired(false)
        ),
    devOnly: true,
    async execute(interaction, client) {
        try {
            const repo = interaction.options.getString('repo');
            let commits;

            if (repo) {
                // Fetch from GitHub API for any public repo
                const [owner, repoName] = repo.split('/');
                if (!owner || !repoName) {
                    return await interaction.reply({ 
                        content: 'Invalid repository format. Use: owner/repo (e.g., microsoft/vscode)', 
                        ephemeral: true 
                    });
                }

                const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=10`);
                
                if (!response.ok) {
                    return await interaction.reply({ 
                        content: 'Failed to fetch commits from GitHub. Make sure the repository is public and exists.', 
                        ephemeral: true 
                    });
                }

                const githubCommits = await response.json();
                commits = githubCommits.map((commit, index) => {
                    const date = new Date(commit.commit.author.date);
                    const relativeTime = getRelativeTime(date);
                    return {
                        id: index.toString(),
                        hash: commit.sha,
                        shortHash: commit.sha.substring(0, 7),
                        author: commit.commit.author.name,
                        date: relativeTime,
                        message: commit.commit.message.split('\n')[0] // First line only
                    };
                });

            } else {
                // Use local git repository
                const gitLog = execSync('git log -10 --pretty=format:"%H|%h|%an|%ar|%s"', { encoding: 'utf-8' });
                
                if (!gitLog.trim()) {
                    return await interaction.reply({ content: 'No commits found.', ephemeral: true });
                }

                const commitLines = gitLog.trim().split('\n');
                commits = commitLines.map((line, index) => {
                    const [hash, shortHash, author, date, message] = line.split('|');
                    return { id: index.toString(), hash, shortHash, author, date, message };
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(repo ? `Latest Commits - ${repo}` : 'Latest Git Commits')
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
                .setCustomId(repo ? `git-commit-select-${repo}` : 'git-commit-select')
                .setPlaceholder('Select a commit to view changes')
                .addOptions(
                    commits.map(commit => ({
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

// Helper function to get relative time
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
