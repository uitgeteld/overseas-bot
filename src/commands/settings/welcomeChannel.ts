import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const OPTIONS_FILE = path.join(__dirname, '../../..', 'options.json');

function loadOptions() {
    try {
        const data = fs.readFileSync(OPTIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveOptions(options: any) {
    fs.writeFileSync(OPTIONS_FILE, JSON.stringify(options, null, 2));
}

export default {
    data: new SlashCommandBuilder()
        .setName('welcomechannel')
        .setDescription('Set the welcome channel for the server')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the welcome channel')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    aliases: ['wc'],
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            return interaction.editReply('This command can only be used in a server.');
        }

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        const options = loadOptions();

        if (!options[guildId]) {
            options[guildId] = {};
        }

        options[guildId].welcomeChannel = channel?.id;

        saveOptions(options);

        const embed = new EmbedBuilder()
            .setTitle('Welcome Channel Set')
            .setDescription(`Welcome channel has been set to ${channel}`)
            .setColor('#C9C2B2')
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};