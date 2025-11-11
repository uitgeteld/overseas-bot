const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { execSync } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('git')
        .setDescription('View the latest Git commits and changes')
        .addStringOption(option =>
            option.setName('repo')
                .setDescription('GitHub user or repository (username or owner/repo or URL)')
                .setRequired(false)
        ),
    // devOnly: true,
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

                    const reposResponse = await fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=10`);
                    const repos = await reposResponse.json();

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`👤 ${userData.name || userData.login}`)
                        .setURL(userData.html_url)
                        .setThumbnail(userData.avatar_url)
                        .setDescription(userData.bio || 'No bio available')
                        .addFields(
                            { name: '📍 Location', value: userData.location || 'Not specified', inline: true },
                            { name: '📊 Public Repos', value: userData.public_repos.toString(), inline: true },
                            { name: '👥 Followers', value: userData.followers.toString(), inline: true },
                            { name: '📧 Email', value: userData.email || 'Not public', inline: true },
                            { name: '🏢 Company', value: userData.company || 'Not specified', inline: true },
                            { name: '🔗 Blog', value: userData.blog || 'None', inline: true }
                        )
                        .setTimestamp();

                    if (repos.length > 0) {
                        const repoList = repos
                            .slice(0, 5)
                            .map(r => `[${r.name}](${r.html_url}) - ${r.description || 'No description'}`)
                            .join('\n');
                        
                        embed.addFields({
                            name: '📦 Recent Repositories',
                            value: repoList,
                            inline: false
                        });
                    }

                    return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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

                const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                
                let readmeContent = '';
                if (readmeResponse.ok) {
                    const readme = await readmeResponse.text();
                    readmeContent = readme.length > 2000 ? readme.substring(0, 1997) + '...' : readme;
                } else {
                    readmeContent = 'No README found for this repository.';
                }

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

                let readmeContent = '';
                try {
                    const fs = require('fs');
                    const path = require('path');
                    
                    const readmeFiles = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];
                    for (const filename of readmeFiles) {
                        const readmePath = path.join(process.cwd(), filename);
                        if (fs.existsSync(readmePath)) {
                            const readme = fs.readFileSync(readmePath, 'utf-8');
                            readmeContent = readme.length > 2000 ? readme.substring(0, 1997) + '...' : readme;
                            break;
                        }
                    }
                    if (!readmeContent) {
                        readmeContent = 'No README found in the repository.';
                    }
                } catch (error) {
                    readmeContent = 'Could not read README file.';
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(repo ? `📦 ${repo}` : '📦 Repository Info')
                .setDescription(readmeContent || 'Select a commit from the dropdown to view details')
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
