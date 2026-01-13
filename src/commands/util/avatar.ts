import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View a user\'s avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view avatar for')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);

        const avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 1024 });
        const serverAvatarUrl = member?.displayAvatarURL({ forceStatic: false, size: 1024 });

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }) })
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarUrl)
            .setColor('#C9C2B2')
            .setTimestamp();

        const links = [
            `[PNG](${avatarUrl}?size=1024)`,
            `[JPG](${avatarUrl.replace('.webp', '.jpg')}?size=1024)`
        ];

        if (serverAvatarUrl) {
            embed.addFields({
                name: 'Server Avatar',
                value: `[View](${serverAvatarUrl}?size=1024)`,
                inline: false
            });
        }

        embed.setFooter({ text: `Download: ${links.join(' • ')}` });

        await interaction.reply({ embeds: [embed] });
    }
};