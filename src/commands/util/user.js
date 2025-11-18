const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Replies with user information')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get information about')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target') || interaction.user;
        const fullUser = await client.users.fetch(user.id, { force: true });

        let rolesText = 'None';
        if (interaction.guild) {
            const member = interaction.guild.members.cache.get(fullUser.id);
            if (member) {
                const roles = member.roles.cache
                    .filter(r => r.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position)
                    .toJSON()
                    .slice(0, 5)
                    .map(r => `<@&${r.id}>`)
                    .join(' ');

                if (member.roles.cache.size > 6) {
                    rolesText = `${roles} +${member.roles.cache.size - 6} more`;
                } else {
                    rolesText = roles || 'None';
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor(fullUser.accentColor || '#C9C2B2')
            .setTitle(fullUser.username)
            .setThumbnail(fullUser.displayAvatarURL({ size: 1_024 }))
            .addFields(
                { name: 'Username', value: `${fullUser.username}`, inline: true },
                { name: "ID", value: `${fullUser.id}`, inline: true },
                { name: 'Created At', value: `<t:${Math.floor(fullUser.createdTimestamp / 1000)}:F>`, inline: false },
                { name: `Roles (${rolesText === 'None' ? 0 : interaction.guild ? interaction.guild.members.cache.get(fullUser.id)?.roles.cache.size - 1 : 0})`, value: rolesText, inline: false }
            );

        if (fullUser.banner) {
            embed.setImage(fullUser.bannerURL({ size: 1_024 }));
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};