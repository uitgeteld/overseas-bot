const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const categorizer = require('../../helpers/categorizerHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with a list of available commands'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor('#C9C2B2')
            .setTitle('📚 Bot Commands')
            .setDescription('Here are all the available commands organized by category:')

        const commandsPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(commandsPath).filter(file => {
            return fs.statSync(path.join(commandsPath, file)).isDirectory();
        });

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
            const commandList = commandFiles.map(file => {
                const command = client.commands.get(file.replace('.js', ''));
                if (command) {
                    return `\`/${command.data.name}\` - ${command.data.description}`;
                }
                return null;
            }).filter(cmd => cmd !== null).join('\n');

            if (commandList) {
                embed.addFields({
                    name: categorizer.getCategoryName(folder),
                    value: commandList,
                    inline: false
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};