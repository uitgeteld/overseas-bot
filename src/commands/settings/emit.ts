import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('emit')
        .setDescription('Emit a client event for testing purposes')
        .addStringOption(option =>
            option.setName('event')
                .setDescription('The name of the event to emit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('param1')
                .setDescription('Optional parameter 1 for the event'))
        .addStringOption(option =>
            option.setName('param2')
                .setDescription('Optional parameter 2 for the event')),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();
        const eventName = interaction.options.getString('event')!;
        const param1 = interaction.options.getString('param1') || undefined;
        const param2 = interaction.options.getString('param2') || undefined;

        try {
            client.emit(eventName, param1, param2);

            return await interaction.editReply(`✅ Successfully emitted event: **${eventName}**`);
        } catch (error) {
            console.error(`Error emitting event ${eventName}:`, error);
            
            return await interaction.editReply(`❌ Failed to emit event: **${eventName}** ${error}`);
        }
    }
};