const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Replies with the user\'s current level'),
    async execute(interaction, client) {
        interaction.reply({ ephemeral: true, content: 'This command is under development.' });
    },
};