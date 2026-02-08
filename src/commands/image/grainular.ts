import { SlashCommandBuilder, ChatInputCommandInteraction, Client, AttachmentBuilder } from "discord.js";
import Canvas from '@napi-rs/canvas';
import brightness from "../../functions/image/grainular/brightness";
import grain from "../../functions/image/grainular/grain";
import saturate from "../../functions/image/grainular/saturate";

export default {
    data: new SlashCommandBuilder()
        .setName('grainular')
        .setDescription('Apply grainular effects to an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to process')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User whose avatar to process')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('brightness')
                .setDescription('Brightness multiplier (0.1-3.0, default: 1.0)')
                .setMinValue(0.1)
                .setMaxValue(3.0)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('grain')
                .setDescription('Grain amount (0-255, default: 0)')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('saturation')
                .setDescription('Saturation multiplier (0.0-3.0, default: 1.0)')
                .setMinValue(0.0)
                .setMaxValue(3.0)
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

            const brightnessValue = interaction.options.getNumber('brightness') ?? 1.0;
            const grainValue = interaction.options.getNumber('grain') ?? 0;
            const saturationValue = interaction.options.getNumber('saturation') ?? 1.0;

            const image = await Canvas.loadImage(imageUrl);
            const canvas = Canvas.createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            imageData = brightness(imageData, brightnessValue);
            imageData = saturate(imageData, saturationValue);
            imageData = grain(imageData, grainValue);

            ctx.putImageData(imageData, 0, 0);
            const buffer = canvas.toBuffer('image/png');
            const processedAttachment = new AttachmentBuilder(buffer, { name: 'grainular.png' });

            await interaction.editReply({
                content: `✨ Grainular effect applied! (Brightness: ${brightnessValue}, Saturation: ${saturationValue}, Grain: ${grainValue})`,
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