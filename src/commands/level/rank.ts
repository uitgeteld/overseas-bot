import { SlashCommandBuilder, ChatInputCommandInteraction, Client, AttachmentBuilder } from "discord.js";
import { RankCard } from "../../functions/canvas/canvas";

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Display your rank card (Developer Testing)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to show rank card for')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('level')
                .setDescription('Test level (default: 5)')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('rank')
                .setDescription('Test rank (default: 42)')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('current-xp')
                .setDescription('Test current XP (default: 3500)')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('required-xp')
                .setDescription('Test required XP (default: 5000)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('theme')
                .setDescription('Card theme')
                .addChoices(
                    { name: 'Default', value: 'default' },
                    { name: 'Light', value: 'light' },
                    { name: 'AMOLED', value: 'amoled' }
                )
                .setRequired(false)),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const level = interaction.options.getNumber('level') ?? 5;
        const rank = interaction.options.getNumber('rank') ?? 42;
        const currentXP = interaction.options.getNumber('current-xp') ?? 3500;
        const requiredXP = interaction.options.getNumber('required-xp') ?? 5000;
        const theme = interaction.options.getString('theme') as "light" | "amoled" | null;

        try {
            const rankCard = new RankCard()
                .setUsername(user.username)
                .setAvatar(user.displayAvatarURL({ extension: 'png', size: 256 }))
                .setLevel(level)
                .setRank(rank)
                .setCurrentXP(currentXP)
                .setMinXP(0)
                .setRequiredXP(requiredXP);

            if (theme === 'light' || theme === 'amoled') {
                rankCard.theme(theme);
            }

            const buffer = await rankCard.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });

            await interaction.editReply({
                files: [attachment]
            });
        } catch (error) {
            console.error('Error generating rank card:', error);
            await interaction.editReply({
                content: '❌ An error occurred while generating the rank card.'
            });
        }
    }
};
