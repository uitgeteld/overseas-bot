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

                // If only username provided, get user's profile README
                if (!repoName) {
                    // Try to fetch user's profile README (username/username repository)
                    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${owner}/readme`, {
                        headers: {
                            'Accept': 'application/vnd.github.v3.raw'
                        }
                    });

                    let readmeContent = '';
                    if (readmeResponse.ok) {
                        const readme = await readmeResponse.text();
                        readmeContent = readme.length > 4000 ? readme.substring(0, 3997) + '...' : readme;
                    } else {
                        // If no profile README, fetch user info
                        const userResponse = await fetch(`https://api.github.com/users/${owner}`);
                        
                        if (!userResponse.ok) {
                            return await interaction.reply({
                                content: 'User not found and no profile README available.',
                                flags: MessageFlags.Ephemeral
                            });
                        }

                        const userData = await userResponse.json();
                        readmeContent = userData.bio || 'No bio or profile README available for this user.';
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`👤 ${owner}`)
                        .setURL(`https://github.com/${owner}`)
                        .setDescription(readmeContent)
                        .setTimestamp();

                    return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                }

                // Fetch repository README
                const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });

                let readmeContent = '';
                if (readmeResponse.ok) {
                    const readme = await readmeResponse.text();
                    readmeContent = readme.length > 4000 ? readme.substring(0, 3997) + '...' : readme;
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
                // Local repository
                let readmeContent = 'No README found in the repository.';
                try {
                    const fs = require('fs');
                    const path = require('path');

                    const readmeFiles = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];
                    for (const filename of readmeFiles) {
                        const readmePath = path.join(process.cwd(), filename);
                        if (fs.existsSync(readmePath)) {
                            const readme = fs.readFileSync(readmePath, 'utf-8');
                            readmeContent = readme.length > 4000 ? readme.substring(0, 3997) + '...' : readme;
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
