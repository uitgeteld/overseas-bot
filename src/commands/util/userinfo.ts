import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Replies with user information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName("ephemeral")
                .setDescription("Whether the reply should be ephemeral")
                .setRequired(false)),
    aliases: ['ui'],
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
        await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });

        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);
        const fullUser = await client.users.fetch(user.id, { force: true });

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }) })
            .setTitle(user.displayName || user.username)
            .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
            .addFields(
                { name: 'Username', value: user.username, inline: true },
                { name: 'User ID', value: user.id, inline: true },
            )
        if (fullUser.primaryGuild && fullUser.primaryGuild.identityEnabled) {
            embed.addFields({ name: 'Badge', value: `${fullUser.primaryGuild.tag}`, inline: true });
        }
        embed.addFields(
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        )
            .setColor('#C9C2B2');

        if (member) {
            embed.addFields({ name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`, inline: false });
        }

        if (fullUser.banner) {
            embed.setImage(fullUser.bannerURL({ size: 1024 })!);
        }

        await interaction.editReply({ embeds: [embed] });
    }
};