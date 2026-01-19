import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

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

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: avatarUrl })
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarUrl)
            .setColor('#C9C2B2')
            .setTimestamp();

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
            .setLabel('PNG')
            .setStyle(ButtonStyle.Link)
            .setURL(`${avatarUrl}?size=1024`),
            
            new ButtonBuilder()
            .setLabel('JPG')
            .setStyle(ButtonStyle.Link)
            .setURL(`${avatarUrl.replace('.webp', '.jpg')}?size=1024`),
        );

        await interaction.reply({ embeds: [embed], components: [buttons] });
    }
};