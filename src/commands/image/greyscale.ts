import { SlashCommandBuilder, ChatInputCommandInteraction, Client, MessageFlags, EmbedBuilder } from "discord.js";
import { greyscale, monochrome } from "../../functions/image/index";
import Canvas from "@napi-rs/canvas";

export default {
    data: new SlashCommandBuilder()
        .setName('greyscale')
        .setDescription('Apply a greyscale effect to an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to apply the greyscale effect to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of greyscale effect to apply')
                .addChoices({ name: 'Greyscale', value: 'greyscale' }, { name: 'Monochrome', value: 'monochrome' })
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('treshold')
                .setDescription('The treshold for the monochrome effect (default: 128)')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const attachment = interaction.options.getAttachment('image', true);
        const type = interaction.options.getString('type', true);
        const treshold = interaction.options.getNumber('treshold') ?? 128;

        if (!attachment.contentType?.startsWith('image/')) {
            return interaction.editReply({ content: 'Please provide a valid image attachment.' });
        }

        try {
            const image = await Canvas.loadImage(attachment.url);
            const canvas = Canvas.createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            switch (type) {
                case 'greyscale':
                    imageData = greyscale(imageData);
                    break;
                case 'monochrome':
                    imageData = monochrome(imageData, treshold);
                    break;
            }

            ctx.putImageData(imageData, 0, 0);
            const buffer = await canvas.toBuffer('image/png');

            const embed = new EmbedBuilder()
                .setTitle(attachment.title)
                .setImage('attachment://greyscale.png')
                .setColor('#C9C2B2')

            await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: 'greyscale.png' }] });

        } catch (error) {
            return interaction.editReply({ content: 'An error occurred while processing the image.' });
        }

    }
}