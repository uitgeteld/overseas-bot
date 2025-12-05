import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Select the member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning the member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        guildOnly: true,
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild?.members.cache.get(target!.id);

        try {
            if (!member) {
                return await interaction.editReply({ content: 'Member not found in the server.' });
            }
            if (!member.bannable) {
                return await interaction.editReply({ content: 'I cannot kick this member. They might have higher permissions than me.' });
            }
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setDescription(`👞 | **Banned ${target?.username} for ${reason}**`)
                .setColor("#C9C2B2");
            return await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setDescription(`❌ | **Failed to ban ${target?.username}.**`)
                .setColor("#C9C2B2");
            return await interaction.editReply({ embeds: [embed] });
        }
    }
};
