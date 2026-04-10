import { Interaction } from "discord.js";
import { query } from "../../utils/database";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;

        const [customIdPrefix, userId] = interaction.customId.split('_');

        if (customIdPrefix !== "board" || userId !== interaction.user.id) return;

        const data = await query("SELECT * FROM boards WHERE user_id = ?", [interaction.user.id]);

        
        const selectedValue = interaction.values[0];
        const [selectedList] = selectedValue.split('_');

        switch (selectedList) {
            case "todo":
                await interaction.update({ content: 'Here is your To-Do list:' });
                break;
            case "doing":
                await interaction.update({ content: 'Here is your Doing list:' });
                break;
            case "review":
                await interaction.update({ content: 'Here is your Review list:' });
                break;
            case "done":
                await interaction.update({ content: 'Here is your Done list:' });
                break;
            default:
                break;
        }
    }
};