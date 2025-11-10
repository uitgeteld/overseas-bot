const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information'),
    async execute(interaction, client) {
        const apiPing = Math.round(client.ws.ping);
        await interaction.reply(`Pong! 🏓 API: ${apiPing}ms`);
    },
};
