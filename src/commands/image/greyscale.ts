import { SlashCommandBuilder, ChatInputCommandInteraction, Client, AttachmentBuilder } from "discord.js";
import Canvas from '@napi-rs/canvas';
import greyscale from "../../functions/image/greyscale.re/greyscale";
import grain from "../../functions/image/greyscale.re/grain";
import monochrome from "../../functions/image/greyscale.re/monochrome";

export default {
    data: new SlashCommandBuilder()
        .setName('greyscale')
        .setDescription('Apply greyscale effects to an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to process')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User whose avatar to process')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Effect mode (default: greyscale)')
                .addChoices(
                    { name: 'Greyscale', value: 'greyscale' },
                    { name: 'Monochrome (Black & White)', value: 'monochrome' }
                )
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('grain')
                .setDescription('Grain amount (0-255, default: 0)')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('threshold')
                .setDescription('Monochrome threshold (0-255, default: 128)')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        try {
            const attachment = interaction.options.getAttachment('image');
            const user = interaction.options.getUser('user') || interaction.user;
            
            let imageUrl: string;
            if (attachment) {
                if (!attachment.contentType?.startsWith('image/')) {
                    return await interaction.editReply({ content: '❌ Please provide a valid image file.' });
                }
                imageUrl = attachment.url;
            } else {
                imageUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
            }

            const mode = interaction.options.getString('mode') ?? 'greyscale';
            const grainValue = interaction.options.getNumber('grain') ?? 0;
            const thresholdValue = interaction.options.getNumber('threshold') ?? 128;

            const image = await Canvas.loadImage(imageUrl);
            const canvas = Canvas.createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (mode === 'monochrome') {
                imageData = monochrome(imageData, thresholdValue);
            } else {
                imageData = greyscale(imageData);
            }
            
            if (grainValue > 0) {
                imageData = grain(imageData, grainValue);
            }

            ctx.putImageData(imageData, 0, 0);
            const buffer = canvas.toBuffer('image/png');
            const processedAttachment = new AttachmentBuilder(buffer, { name: `${mode}.png` });

            const modeText = mode === 'monochrome' ? `Monochrome (Threshold: ${thresholdValue})` : 'Greyscale';
            const grainText = grainValue > 0 ? ` with Grain: ${grainValue}` : '';

            await interaction.editReply({
                content: `✨ ${modeText} effect applied!${grainText}`,
                files: [processedAttachment]
            });
        } catch (error) {
            console.error('Error processing image:', error);
            await interaction.editReply({
                content: '❌ An error occurred while processing the image.'
            });
        }
    }
};