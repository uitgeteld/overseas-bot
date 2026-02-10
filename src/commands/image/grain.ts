import { SlashCommandBuilder, ChatInputCommandInteraction, Client, MessageFlags, EmbedBuilder } from "discord.js";
import { grain, grainular } from "../../functions/image/index";
import Canvas from "@napi-rs/canvas";

export default {
    data: new SlashCommandBuilder()
        .setName('grain')
        .setDescription('Apply a grain effect to an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to apply the grain effect to')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount of grain to apply (default: 20)')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const attachment = interaction.options.getAttachment('image', true);
        const amount = interaction.options.getNumber('amount') ?? 20;
        const colored = interaction.options.getBoolean('colored') ?? false;

        if (!attachment.contentType?.startsWith('image/')) {
            return interaction.editReply({ content: 'Please provide a valid image attachment.' });
        }

        try {
            const image = await Canvas.loadImage(attachment.url);
            const canvas = Canvas.createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (colored) {
                imageData = grainular(imageData, amount);
            } else {
                imageData = grain(imageData, amount);
            }
            ctx.putImageData(imageData, 0, 0);
            const buffer = await canvas.toBuffer('image/png');

            const embed = new EmbedBuilder()
                .setTitle(attachment.title)
                .setImage('attachment://grain.png')
                .setColor('#C9C2B2')

            await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: 'grain.png' }] });

        } catch (error) {
            return interaction.editReply({ content: 'An error occurred while processing the image.' });
        }

    }
}