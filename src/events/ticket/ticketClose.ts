import {
    ButtonInteraction,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    TextChannel
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { closeTimers } from "../../helpers/ticketTimers";

const OPTIONS_FILE = path.join(__dirname, "../../../options.json");

function loadOptions() {
    try {
        return JSON.parse(fs.readFileSync(OPTIONS_FILE, "utf-8"));
    } catch {
        return {};
    }
}

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.isButton()) return;
        if (!interaction.guild) return;
        if (interaction.customId !== "ticket_close") return;

        await interaction.deferReply();

        const { guild, user } = interaction;
        const channel = interaction.channel as TextChannel;
        const options = loadOptions();
        const cfg = options[guild.id]?.ticket ?? {};

        if (closeTimers.has(channel.id)) {
            clearTimeout(closeTimers.get(channel.id)!);
            closeTimers.delete(channel.id);
        }

        // await channel.permissionOverwrites.set([
        //     {
        //         id: guild.roles.everyone.id,
        //         deny: [PermissionsBitField.Flags.ViewChannel],
        //     },
        //     ...(cfg.supportRoleId ? [{
        //         id: cfg.supportRoleId,
        //         allow: [
        //             PermissionsBitField.Flags.ViewChannel,
        //             PermissionsBitField.Flags.SendMessages,
        //             PermissionsBitField.Flags.ReadMessageHistory,
        //             PermissionsBitField.Flags.ManageMessages,
        //         ],
        //     }] : []),
        // ]);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_reopen")
                .setLabel("Reopen")
                .setEmoji("🔓")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("ticket_delete")
                .setLabel("Delete Now")
                .setEmoji("🗑️")
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🔒 Ticket Closed")
                    .setDescription(`This ticket was closed by ${user}.\n\nThis channel will be **deleted in 30 minutes**.\nPress **Reopen** to cancel the deletion.`)
                    .setColor("#E74C3C")
                    .setTimestamp()
            ],
            components: [row]
        });

        const timer = setTimeout(async () => {
            closeTimers.delete(channel.id);
            await channel.delete("Ticket auto-deleted after 30 minutes").catch(() => null);
        }, 30 * 60 * 1000);

        closeTimers.set(channel.id, timer);
    }
};
