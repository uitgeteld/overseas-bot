import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Times out a member from the server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Select the member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the timeout in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timing out the member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const duration = interaction.options.getInteger('duration') || 0;
        const member = interaction.guild?.members.cache.get(target!.id);

        try {
            if (!member) {
                return await interaction.editReply({ content: 'Member not found in the server.' });
            }
            if (!member.moderatable) {
                return await interaction.editReply({ content: 'I cannot timeout this member. They might have higher permissions than me.' });
            }
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setDescription(`⏱️ | **Timed out ${target?.username} for ${duration} minutes. Reason: ${reason}**`)
                .setColor("#C9C2B2");
            return await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setDescription(`❌ | **Failed to timeout ${target?.username}.**`)
                .setColor("#C9C2B2");
            return await interaction.editReply({ embeds: [embed] });
        }
    }
};