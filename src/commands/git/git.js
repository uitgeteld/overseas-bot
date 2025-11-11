const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { execSync } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git')
        .setDescription('View the latest Git commits and changes')
        .addStringOption(option =>
            option.setName('repo')
                .setDescription('GitHub username or repository (username or owner/repo or URL)')
                .setRequired(false)
        ),
    async execute(interaction, client) {
        try {
            let repo = interaction.options.getString('repo');
            let commits;

            if (repo) {
                if (repo.includes('github.com') || repo.includes('git@github.com')) {
                    let match;
                    match = repo.match(/github\.com[\/:]([^\/]+)\/([^\/\s\.]+)/);
                    
                    if (!match) {
                        match = repo.match(/git@github\.com:([^\/]+)\/([^\/\s\.]+)/);
                    }
                    
                    if (match) {
                        repo = `${match[1]}/${match[2]}`;
                    } else {
                        return await interaction.reply({ 
                            content: 'Invalid GitHub URL format.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                }

                const [owner, repoName] = repo.split('/');
                
                if (!repoName) {
                    const userResponse = await fetch(`https://api.github.com/users/${owner}`);
                    
                    if (!userResponse.ok) {
                        return await interaction.reply({ 
                            content: 'Failed to fetch user from GitHub. Make sure the username exists.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }

                    const userData = await userResponse.json();

                    const reposResponse = await fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=25`);
                    const repos = await reposResponse.json();

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`👤 ${userData.name || userData.login}`)
                        .setURL(userData.html_url)
                        .setThumbnail(userData.avatar_url)
                        .setDescription(userData.bio || 'No bio available')
                        .addFields(
                            { name: '📊 Public Repos', value: userData.public_repos.toString(), inline: true },
                            { name: '👥 Followers', value: userData.followers.toString(), inline: true },
                            { name: '⭐ Following', value: userData.following.toString(), inline: true }
                        )
                        .setTimestamp();

                    if (userData.blog) {
                        embed.addFields({ name: '🔗 Website', value: userData.blog, inline: true });
                    }

                    if (repos.length > 0) {
                        const selectMenu = new StringSelectMenuBuilder()
                            .setCustomId(`git-user-repo-select:${owner}`)
                            .setPlaceholder('Select a repository to view commits')
                            .addOptions(
                                repos.slice(0, 25).map(r => ({
                                    label: r.name.substring(0, 100),
                                    description: (r.description || 'No description').substring(0, 100),
                                    value: r.name
                                }))
                            );

                        const row = new ActionRowBuilder().addComponents(selectMenu);
                        return await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
                    } else {
                        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    }
                }

                const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=10`);
                
                if (!response.ok) {
                    return await interaction.reply({ 
                        content: 'Failed to fetch commits from GitHub. Make sure the repository is public and exists.', 
                        flags: MessageFlags.Ephemeral 
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
                        message: commit.commit.message.split('\n')[0]
                    };
                });

            } else {
                const gitLog = execSync('git log -10 --pretty=format:"%H|%h|%an|%ar|%s"', { encoding: 'utf-8' });
                
                if (!gitLog.trim()) {
                    return await interaction.reply({ content: 'No commits found.', flags: MessageFlags.Ephemeral });
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
                .setURL(repo ? `https://github.com/${owner}/${repo}` : undefined)
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
                .setCustomId(repo ? `git-commit-select:${repo}` : 'git-commit-select')
                .setPlaceholder('Select a commit to view changes')
                .addOptions(
                    commits.map(commit => ({
                        label: commit.message.substring(0, 100),
                        description: `${commit.shortHash} by ${commit.author}`,
                        value: commit.id
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch Git commits.', flags: MessageFlags.Ephemeral });
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
