import { Interaction } from "discord.js";
import { query } from "../../utils/database/database";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isButton()) return;

        const [customId, userId] = interaction.customId.split('_');
        const customIds = [`createBoard`, "trelloCancel"];
        
        if (!customIds.includes(customId) || userId !== interaction.user.id) return;

        switch (customId) {
            case "createBoard":
                await query("INSERT INTO boards (user_id) VALUES (?)", [interaction.user.id]);
                await interaction.update({ content: 'Board created successfully!', components: [] });
                break;

            case "trelloCancel":
                await interaction.update({ content: 'Action cancelled.', components: [] });
                break;

            default:
                break;
        }
    }
};