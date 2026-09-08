import { ChatInputCommandInteraction, SlashCommandBuilder, Client, MessageFlags, GuildMember } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, entersState, getVoiceConnection } from '@discordjs/voice';
import { errorMessages } from "../../helpers/errorMessages";

export default {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription('Let the bot join your voice channel'),
    guild: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;

        if (!channel) {
            return await interaction.reply({ content: `${errorMessages.messages.voice.USER_NOT_IN_VOICE_CHANNEL}`, flags: MessageFlags.Ephemeral })
        }

        const existingConnection = getVoiceConnection(channel.guild.id);

        if (existingConnection && existingConnection.joinConfig.channelId === channel.id) {
            await interaction.reply({ content: `${errorMessages.messages.voice.BOT_ALREADY_IN_VOICE_CHANNEL}`, ephemeral: true });
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            await interaction.reply(`Joined **${channel.name}**!`);
        } catch (error) {
            connection.destroy();
            await interaction.reply({
                content: `${errorMessages.messages.voice.VOICE_CONNECTION_FAILED}`,
                flags: MessageFlags.Ephemeral,
            });

        }
    }
};