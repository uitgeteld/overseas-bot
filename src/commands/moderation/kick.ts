import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a player from the server')

    .addUserOption(option =>
        option.setName('player')
            .setDescription('Enter the name of the player who you want to kick')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Enter the reason for kicking the player')
            .setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {

    const member = interaction.options.getUser('player');
    const reason = interaction.options.getString('reason');

    const memberTarget = interaction.guild?.members.cache.get(member?.id as string);

    if (!memberTarget) {
        return interaction.reply({ content: `User not found`, flags: MessageFlags.Ephemeral });
    }

    if (!memberTarget.kickable) {
        return interaction.reply({ content: `You cannot kick this user`, flags: MessageFlags.Ephemeral });
    }

    try {
        await memberTarget.send(`You have been kicked from ${interaction.guild?.name} for reason: ${reason}`);
    } catch (error) {
        console.error("Could not send DM to the user.");
    }

    try {
        await memberTarget.kick(reason as string).then(() => {
            interaction.reply(`Kicked member ${member} for reason: ${reason}`);
        });
    } catch (error) {
        console.error(`Failed to kick member: ${error}`);
    }
}