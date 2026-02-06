import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
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

function saveOptions(options: any) {
    fs.writeFileSync(OPTIONS_FILE, JSON.stringify(options, null, 2));
}

export default {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Ticket system management")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName("setup")
                .setDescription("Configure the ticket system")
                .addChannelOption(opt =>
                    opt.setName("log_channel")
                        .setDescription("Channel where transcripts are sent silently")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addRoleOption(opt =>
                    opt.setName("support_role")
                        .setDescription("Role that can see all tickets")
                        .setRequired(false))
                .addChannelOption(opt =>
                    opt.setName("category")
                        .setDescription("Category where ticket channels are created")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName("panel")
                .setDescription("Send the ticket panel in a channel")
                .addChannelOption(opt =>
                    opt.setName("channel")
                        .setDescription("Channel to send the panel in")
                        .setRequired(true))
        ),
    guildOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild!.id;
        const options = loadOptions();
        if (!options[guildId]) options[guildId] = {};

        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case "setup": {
                const supportRole = interaction.options.getRole("support_role");
                const category = interaction.options.getChannel("category");

                const existing = options[guildId].ticket ?? {};

                options[guildId].ticket = {
                    ...existing,
                    ...(supportRole !== null && { supportRoleId: supportRole.id }),
                    ...(category !== null && { categoryId: category.id }),
                };

                saveOptions(options);

                const saved = options[guildId].ticket;

                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle("✅ Ticket system configured")
                        .addFields(
                            { name: "Log Channel", value: saved.logChannelId ? `<#${saved.logChannelId}>` : "None", inline: true },
                            { name: "Support Role", value: saved.supportRoleId ? `<@&${saved.supportRoleId}>` : "None", inline: true },
                            { name: "Category", value: saved.categoryId ? `<#${saved.categoryId}>` : "None", inline: true },
                        )
                        .setColor("#C9C2B2")
                        .setTimestamp()
                ]});
            }

            case "panel": {
                const channel = interaction.options.getChannel("channel", true) as TextChannel;

                const embed = new EmbedBuilder()
                    .setTitle("🎫 Support Tickets")
                    .setDescription("Click the button below to open a support ticket.\nOur team will assist you as soon as possible.")
                    .setColor("#C9C2B2")
                    .setTimestamp();

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket_create")
                        .setLabel("Open Ticket")
                        .setEmoji("🎫")
                        .setStyle(ButtonStyle.Primary)
                );

                await channel.send({ embeds: [embed], components: [row] });

                return interaction.editReply({ content: `✅ Ticket panel sent in <#${channel.id}>` });
            }
        }
    }
};
