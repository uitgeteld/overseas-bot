import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { isPlayingSpotify, darkenImageColorToHex } from '../../utils/spotifyPresence';
import { ImageColorExtractor, SpotifyCard } from '../../functions/image/index'

export default {
    data: new SlashCommandBuilder()
        .setName('spotify')
        .setDescription('Replies with a Spotify Card')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check Spotify status for')
                .setRequired(false)
        ),
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
            const color = await new ImageColorExtractor().getColorFromImage(`https://i.scdn.co/image/${spotifyActivity.assets.largeImage.slice(8)}`)
            const darkedColor = await darkenImageColorToHex(color)

            const spotifyCard = await new SpotifyCard()
                .setSong(spotifyActivity.details)
                .setArtist(spotifyActivity.state)
                .setAlbum(spotifyActivity.assets.largeText)
                .setCover(`https://i.scdn.co/image/${spotifyActivity.assets.largeImage.slice(8)}`)
                .setTime(elapsedTime, songDuration)
                .setColor("gradient", color, "#1c1c1c", 0.75)
                .setBar(darkedColor)
                .build()

            const attachment = new AttachmentBuilder(spotifyCard!, { name: 'spotifyCard.png' });
            const embed = new EmbedBuilder()
                .setColor('#C9C2B2')
                .setImage('attachment://spotifyCard.png')
                .setTimestamp()

            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });
        } else {
            await interaction.editReply('This user is currently not in a server where I am present.');
        }
    }
};