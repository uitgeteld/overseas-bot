import {
    ButtonInteraction,
    Client,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    TextChannel
} from "discord.js";
import fs from "node:fs";
import path from "node:path";

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
        if (interaction.customId !== "ticket_create") return;

        await interaction.deferReply({ ephemeral: true });

        const { guild, user } = interaction;
        const options = loadOptions();
        const cfg = options[guild.id]?.ticket ?? {};

        const existing = guild.channels.cache.find(
            c => c.name === `ticket-${user.username.toLowerCase()}` && c.type === ChannelType.GuildText
        );

        if (existing) {
            return interaction.editReply({ content: `❌ You already have an open ticket: <#${existing.id}>` });
        }

        const permissionOverwrites: any[] = [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ],
            },
        ];

        if (cfg.supportRoleId) {
            permissionOverwrites.push({
                id: cfg.supportRoleId,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.ManageMessages,
                ],
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: cfg.categoryId ?? undefined,
            permissionOverwrites,
            topic: `Ticket opened by ${user.tag} | User ID: ${user.id}`,
        }) as TextChannel;

        const embed = new EmbedBuilder()
            .setTitle("🎫 Ticket Opened")
            .setDescription(`Welcome ${user}, support will be with you shortly.\n\nDescribe your issue and we'll help you as soon as possible.`)
            .setColor("#C9C2B2")
            .setFooter({ text: `Ticket by ${user.tag}` })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${user}`, embeds: [embed], components: [row] });

        return interaction.editReply({ content: `✅ Your ticket has been created: <#${ticketChannel.id}>` });
    }
};
