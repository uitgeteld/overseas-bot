import { ChatInputCommandInteraction, SlashCommandBuilder, Client, MessageFlags, GuildMember } from "discord.js";
import { getVoiceConnection } from '@discordjs/voice';
import { errorMessages } from "../../helpers/errorMessages";

export default {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription('Let the bot leave your voice channel'),
    guild: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;
        const guildId = member.guild.id;

        if (!channel) {
            return await interaction.reply({ content: `${errorMessages.messages.voice.USER_NOT_IN_VOICE_CHANNEL}`, flags: MessageFlags.Ephemeral })
        }

        const connection = getVoiceConnection(guildId);

        if (!connection) {
            return await interaction.reply({ content: `${errorMessages.messages.voice.BOT_NOT_IN_VOICE_CHANNEL}`, flags: MessageFlags.Ephemeral });
        }

        try {
            connection.destroy();
            await interaction.reply("Left the voice channel!");
        } catch (error) {
            await interaction.reply({
                content: `${errorMessages.messages.voice.VOICE_CONNECTION_FAILED}`,
                flags: MessageFlags.Ephemeral,
            });
        }
    }
};