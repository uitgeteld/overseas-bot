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
        let presence =
            interaction.guild?.members.cache.get(user.id)?.presence ??
            client.guilds.cache
                .map(guild => guild.members.cache.get(user.id))
                .find(member => member?.presence != null)
                ?.presence;

        if (isPlayingSpotify(presence)) {
            const spotifyActivity = isPlayingSpotify(presence);
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
        } else {
            await interaction.editReply('This user is not currently in a server where I am present.');
        }
    }
};