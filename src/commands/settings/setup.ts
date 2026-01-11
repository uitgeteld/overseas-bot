import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup settings for the server')
        .addChannelOption(option =>
            option.setName('welcomechannel')
                .setDescription('The channel to set as the weclome channel'))
        .addChannelOption(option =>
            option.setName('goodbyechannel')
                .setDescription('The channel to set as the goodbye channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    guildOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ ephemeral: true });

        const welcomeChannel = interaction.options.getChannel('weclomechannel');
        const goodbyeChannel = interaction.options.getChannel('goodbyechannel');
        const guildId = interaction.guild?.id;
        const options = loadOptions();

        if (!options[guildId!]) options[guildId!] = {};

        if (welcomeChannel) {

            options[guildId!].welcomeChannel = welcomeChannel?.id;

            saveOptions(options);

            const embed = new EmbedBuilder()
                .setTitle('Goodbye Channel Set')
                .setDescription(`Goodbye channel has been set to ${welcomeChannel}`)
                .setColor('#C9C2B2')
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        } else if (goodbyeChannel) {

            options[guildId!].goodbyeChannel = goodbyeChannel?.id;

            saveOptions(options);

            const embed = new EmbedBuilder()
                .setTitle('Goodbye Channel Set')
                .setDescription(`Goodbye channel has been set to ${goodbyeChannel}`)
                .setColor('#C9C2B2')
                .setTimestamp();
        } else {
            const embed = new EmbedBuilder()
                .setDescription("❌ | **Setup canceled**")
                .setColor('#C9C2B2')
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
    }
};

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