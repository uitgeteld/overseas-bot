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
        if (interaction.customId !== "ticket_reopen") return;

        await interaction.deferReply();

        const { guild, user } = interaction;
        const channel = interaction.channel as TextChannel;
        const options = loadOptions();
        const cfg = options[guild.id]?.ticket ?? {};

        if (closeTimers.has(channel.id)) {
            clearTimeout(closeTimers.get(channel.id)!);
            closeTimers.delete(channel.id);
        }

        const topicMatch = channel.topic?.match(/User ID: (\d+)/);
        const ownerId = topicMatch?.[1];

        const overwrites: any[] = [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
        ];

        if (ownerId) {
            overwrites.push({
                id: ownerId,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ],
            });
        }

        if (cfg.supportRoleId) {
            overwrites.push({
                id: cfg.supportRoleId,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.ManageMessages,
                ],
            });
        }

        await channel.permissionOverwrites.set(overwrites);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🔓 Ticket Reopened")
                    .setDescription(`Ticket reopened by ${user}. Deletion timer has been cancelled.`)
                    .setColor("#2ECC71")
                    .setTimestamp()
            ],
            components: [row]
        });
    }
};
