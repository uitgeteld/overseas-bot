const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repo')
        .setDescription('View GitHub repository or user README')
        .addStringOption(option =>
            option.setName('repo')
                .setDescription('GitHub user or repository (username or owner/repo or URL)')
                .setRequired(false)
        ),
    async execute(interaction, client) {
        try {
            let repo = interaction.options.getString('repo');

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
                            content: 'User not found.',
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const userData = await userResponse.json();

                    const reposResponse = await fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=30`);
                    const repos = await reposResponse.json();

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`👤 ${userData.name || userData.login}`)
                        .setURL(`https://github.com/${owner}`)
                        .setThumbnail(userData.avatar_url)
                        .setDescription(userData.bio || 'No bio available');

                    const fields = [];
                    if (userData.location) fields.push({ name: '📍 Location', value: userData.location, inline: true });
                    if (userData.company) fields.push({ name: '🏢 Company', value: userData.company, inline: true });
                    if (userData.blog) fields.push({ name: '🔗 Website', value: userData.blog, inline: true });
                    fields.push({ name: '📊 Repos', value: userData.public_repos.toString(), inline: true });
                    fields.push({ name: '👥 Followers', value: userData.followers.toString(), inline: true });
                    fields.push({ name: '⭐ Following', value: userData.following.toString(), inline: true });

                    if (fields.length > 0) {
                        embed.addFields(fields);
                    }

                    if (repos.length > 0) {
                        const topRepos = repos
                            .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
                            .slice(0, 5)
                            .map(r => {
                                const stars = r.stargazers_count > 0 ? ` ⭐${r.stargazers_count}` : '';
                                const desc = r.description ? ` - ${r.description.substring(0, 80)}` : '';
                                return `[${r.name}](${r.html_url})${stars}${desc}`;
                            })
                            .join('\n');

                        embed.addFields({
                            name: '� Top Repositories',
                            value: topRepos || 'No repositories',
                            inline: false
                        });
                    }

                    embed.setTimestamp();
                    return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }

                const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });

                let readmeContent = '';
                if (readmeResponse.ok) {
                    const readme = await readmeResponse.text();
                    readmeContent = formatMarkdownForDiscord(readme);
                    readmeContent = readmeContent.length > 4000 ? readmeContent.substring(0, 3997) + '...' : readmeContent;
                } else {
                    readmeContent = 'No README found for this repository.';
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`📦 ${repo}`)
                    .setURL(`https://github.com/${owner}/${repoName}`)
                    .setDescription(readmeContent)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

            } else {
                let readmeContent = 'No README found in the repository.';
                try {
                    const fs = require('fs');
                    const path = require('path');

                    const readmeFiles = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];
                    for (const filename of readmeFiles) {
                        const readmePath = path.join(process.cwd(), filename);
                        if (fs.existsSync(readmePath)) {
                            const readme = fs.readFileSync(readmePath, 'utf-8');
                            readmeContent = formatMarkdownForDiscord(readme);
                            readmeContent = readmeContent.length > 4000 ? readmeContent.substring(0, 3997) + '...' : readmeContent;
                            break;
                        }
                    }
                } catch (error) {
                    readmeContent = 'Could not read README file.';
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('📦 Local Repository')
                    .setDescription(readmeContent)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch README.', flags: MessageFlags.Ephemeral });
        }
    },
};

function formatMarkdownForDiscord(markdown) {
    return markdown
        .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
        .replace(/^### (.*?)$/gm, '**• $1**')
        .replace(/^## (.*?)$/gm, '**$1**')
        .replace(/^# (.*?)$/gm, '**$1**')
        .replace(/\*\*(.*?)\*\*/g, '**$1**')
        .replace(/__(.+?)__/g, '**$1**')
        .replace(/\*(.*?)\*/g, '_$1_')
        .replace(/_(.+?)_/g, '_$1_')
        .replace(/\[(.*?)\]\((.*?)\)/g, '[$1]($2)')
        .replace(/<[^>]*>/g, '')
        .replace(/```[\s\S]*?```/g, '`code block`')
        .replace(/^- (.*?)$/gm, '• $1')
        .replace(/^\* (.*?)$/gm, '• $1')
        .replace(/^\d+\. (.*?)$/gm, '→ $1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
