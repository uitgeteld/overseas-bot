import { ChatInputCommandInteraction, SlashCommandBuilder, Client, MessageFlags, GuildMember, EmbedBuilder, } from "discord.js";
import { getVoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, joinVoiceChannel, entersState, VoiceConnectionStatus, } from "@discordjs/voice";
import { errorMessages } from "../../helpers/errorMessages";
import { Util } from "../../utils/util";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play an uploaded audio file")
        .addAttachmentOption((opt) =>
            opt
                .setName("file")
                .setDescription("The audio file to play (mp3, wav, etc.)")
                .setRequired(true)
        ),
    guild: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const guildId = interaction.guildId!;
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;

        if (!channel) {
            return interaction.reply({
                content: errorMessages.messages.voice.USER_NOT_IN_VOICE_CHANNEL,
                flags: MessageFlags.Ephemeral,
            });
        }

        const attachment = interaction.options.getAttachment("file", true);
        const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"];
        if (attachment.contentType && !validTypes.some((t) => attachment.contentType!.startsWith(t))) {
            return interaction.reply({ content: `${errorMessages.messages.voice.UNSUPPORTED_FILE_TYPE}`, flags: MessageFlags.Ephemeral, });
        }

        await interaction.deferReply();

        let connection = getVoiceConnection(guildId);

        if (connection && connection.joinConfig.channelId !== channel.id) {
            return interaction.editReply({
                content: errorMessages.messages.voice.BOT_ALREADY_IN_VOICE_CHANNEL,
            });
        }

        if (!connection) {
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
            });

            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            } catch (error) {
                connection.destroy();
                return interaction.editReply({
                    content: errorMessages.messages.voice.VOICE_CONNECTION_FAILED,
                });
            }
        }

        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
        });

        const resource = createAudioResource(attachment.url, {
            inputType: StreamType.Arbitrary,
        });

        connection.subscribe(player);
        player.play(resource);

        player.on("error", (error) => {
            console.error("Audio player error:", error);
        });


        const embed = new EmbedBuilder()
            .setColor("#C9C2B2")
            .setTitle(`${Util.removeExtension(attachment.name || "Unknown File")}`)
            .addFields(
                { name: "Duration", value: `${Util.formatMinutesSeconds(attachment.duration)}`, inline: true },
                { name: "Uploader", value: `${interaction.user.username}`, inline: true }
            );

        console.log(attachment)
        await interaction.editReply({ embeds: [embed] });
    },
};