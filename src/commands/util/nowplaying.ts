import { SlashCommandBuilder, ChatInputCommandInteraction, Client, AttachmentBuilder } from "discord.js";
import { isPlayingSpotify } from '../../utils/spotifyPresence';
import { MusicCard } from '../../functions/image/index'

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Replies with a Music Card')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check music status for')
                .setRequired(false)),
    aliases: ['np', 'spotify'],
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user') || interaction.user;
        let presence =
            interaction.guild?.members.cache.get(user.id)?.presence ??
            client.guilds.cache
                .map(guild => guild.members.cache.get(user.id))
                .find(member => member?.presence != null)
                ?.presence;

        if (!presence) return await interaction.reply('This user is currently not in a server where I am present.');

        if (isPlayingSpotify(presence)) {
            const spotifyActivity = isPlayingSpotify(presence);

            if (spotifyActivity.state == null) return await interaction.reply('This user is currently not listening to music.');

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

            interaction.reply({ files: [attachment] });
        } else {
            await interaction.reply('This user is currently not listening to music.');
        }
    }
};