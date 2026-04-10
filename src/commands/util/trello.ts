import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { status, query } from '../../utils/database';
export default {
    data: new SlashCommandBuilder()
        .setName('trello')
        .setDescription('Interact with your own board'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await status().then(async (dbStatus) => {
                if (!dbStatus.connected) {
                    await interaction.editReply({ content: 'Database is not connected. Please try again later.' });
                    return;
                }

                const data = await query('SELECT * FROM boards WHERE user_id = ?', [interaction.user.id]);

                if (data.length === 0) {
                    const actionRow = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`createBoard_${interaction.user.id}`)
                                .setLabel("✔")
                                .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                                .setCustomId(`trelloCancel_${interaction.user.id}`)
                                .setLabel("✖")
                                .setStyle(ButtonStyle.Danger))

                    return await interaction.editReply({ content: 'No board found with your user ID. Would you like to create one?', components: [actionRow] });
                }

                const embed = new EmbedBuilder()
                    .setTitle('Trello Integration')
                    .setDescription('Click the button below to view your Trello board.')
                    .setColor("#C9C2B2");

                const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`board_${interaction.user.id}`)
                            .setPlaceholder("Select page")
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("To-Do")
                                    .setDescription("View your todo list")
                                    .setValue(`todo_board`)
                                    .setDefault(true),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Doing")
                                    .setDescription("View your doing list")
                                    .setValue(`doing_board`),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Review")
                                    .setDescription("View your review list")
                                    .setValue(`review_board`),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Done")
                                    .setDescription("View your done list")
                                    .setValue(`done_board`)
                            )
                    )

                return await interaction.editReply({ embeds: [embed], components: [selectRow] });

            }).catch(async (error) => {
                console.error('Error checking database status:', error);
                await interaction.editReply({ content: 'An error occurred while checking database status. Please try again later.' });
                return;
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }
};