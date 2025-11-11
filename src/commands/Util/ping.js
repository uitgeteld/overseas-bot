const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information'),
    async execute(interaction, client) {
        const start = Date.now();
        await interaction.reply({ content: 'Pinging... 🏓', fetchReply: true });
        await interaction.editReply(`Pong! 🏓 Latency: ${Date.now() - start}ms. API: ${client.ws.ping}ms`);
    },
};