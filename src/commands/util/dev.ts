import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { MusicCard } from "../../functions/image";
import { isPlayingSpotify } from "../../utils/spotifyPresence";

export default {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Development command for testing purposes'),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);

        if (isPlayingSpotify(member?.presence)) {
            const spotifyActivity = isPlayingSpotify(member?.presence);
            if (spotifyActivity.state == null) return await interaction.editReply('This user is not listening to music on Spotify.');
            const songStartTime = spotifyActivity.timestamps?.start;
            const songEndTime = spotifyActivity.timestamps?.end;
            const songDuration = (songEndTime - songStartTime) / 1000;
            const elapsedTime = ((Date.now() - songStartTime) / 1000) < 0 ? 0 : (Date.now() - songStartTime) / 1000;

            const card = await new MusicCard()
                .setSong(spotifyActivity.details)
                .setArtist(spotifyActivity.state)
                .setAlbum(spotifyActivity.assets.largeText)
                .setCover(`https://i.scdn.co/image/${spotifyActivity.assets.largeImage.slice(8)}`)
                .setTime(elapsedTime, songDuration)
                .build()

            const attachment = new AttachmentBuilder(card!, { name: 'musicCard.png' });
            interaction.editReply({
                files: [attachment]
            });
        }
    }
};