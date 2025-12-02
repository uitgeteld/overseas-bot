import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Select the member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking the member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild?.members.cache.get(target!.id);

        try {
            if (!member) {
                return await interaction.editReply({ content: 'Member not found in the server.' });
            }
            if (!member.kickable) {
                return await interaction.editReply({ content: 'I cannot kick this member. They might have higher permissions than me.' });
            }
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setDescription(`👞 | **Kicked ${target?.username} for ${reason}**`)
                .setColor("#C9C2B2");
        } catch (error) {
            const embed = new EmbedBuilder()
                .setDescription(`❌ | **Failed to kick ${target?.username}.**`)
                .setColor("#C9C2B2");
            return await interaction.editReply({ embeds: [embed] });
        }
    }
};
