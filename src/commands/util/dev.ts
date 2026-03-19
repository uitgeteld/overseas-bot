import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { MusicCard } from "../../functions/image";

export default {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Development command for testing purposes'),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        const card = await new MusicCard()
        .setCover("https://i1.sndcdn.com/artworks-JuQBMQKuKlvbbcPh-qKVRTQ-t1080x1080.png")
        .build()
        const attachment = new AttachmentBuilder(card!, { name: 'musicCard.png' });
        interaction.editReply({
            files: [attachment]
        });
    }
};