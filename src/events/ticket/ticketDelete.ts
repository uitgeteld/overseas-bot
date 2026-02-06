import {
    ButtonInteraction,
    Client,
    TextChannel
} from "discord.js";
import { closeTimers } from "../../helpers/ticketTimers";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.isButton()) return;
        if (!interaction.guild) return;
        if (interaction.customId !== "ticket_delete") return;

        await interaction.deferReply();

        const channel = interaction.channel as TextChannel;

        if (closeTimers.has(channel.id)) {
            clearTimeout(closeTimers.get(channel.id)!);
            closeTimers.delete(channel.id);
        }

        await interaction.editReply({ content: "🗑️ Deleting ticket..." });
        setTimeout(() => channel.delete("Ticket manually deleted").catch(() => null), 3000);
    }
};
