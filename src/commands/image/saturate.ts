import { SlashCommandBuilder, ChatInputCommandInteraction, Client, MessageFlags, EmbedBuilder } from "discord.js";
import { saturate } from "../../functions/image/index";
import Canvas from "@napi-rs/canvas";

export default {
    data: new SlashCommandBuilder()
        .setName('saturate')
        .setDescription('Apply a saturation effect to an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to apply the saturation effect to')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount of saturation to apply (default: 20)')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const attachment = interaction.options.getAttachment('image', true);
        const amount = interaction.options.getNumber('amount') ?? 20;

        if (!attachment.contentType?.startsWith('image/')) {
            return interaction.editReply({ content: 'Please provide a valid image attachment.' });
        }

        try {
            const image = await Canvas.loadImage(attachment.url);
            const canvas = Canvas.createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            imageData = saturate(imageData, amount);
            ctx.putImageData(imageData, 0, 0);
            const buffer = await canvas.toBuffer('image/png');

            const embed = new EmbedBuilder()
                .setTitle(attachment.title)
                .setImage('attachment://saturate.png')
                .setColor('#C9C2B2')

            await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: 'saturate.png' }] });

        } catch (error) {
            return interaction.editReply({ content: 'An error occurred while processing the image.' });
        }

    }
}