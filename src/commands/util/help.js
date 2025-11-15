const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const categorizer = require('../../helpers/categorizerHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with a list of available commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Info of a specific command')
                .setRequired(false)
        ),
    async execute(interaction, client) {
        const commandName = interaction.options.getString('command');
        if (commandName) {
            const command = client.commands.get(commandName);
            if (!command) {
                return await interaction.reply({ content: 'That command does not exist.', ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setColor('#C9C2B2')
                .setTitle(`Command: /${command.data.name}`)
                .setDescription(command.data.description || 'No description available');
            if (command.data.options && command.data.options.length > 0) {
                const optionsDescription = command.data.options.map(option => {
                    return `\`-${option.name}\`: ${option.description || 'No description'}`;
                }).join('\n');
                embed.addFields({ name: 'Options', value: optionsDescription });
            }
            return await interaction.reply({ embeds: [embed] });
        }
        const embed = new EmbedBuilder()
            .setColor('#C9C2B2')
            .setTitle('📚 Bot Commands')
            .setDescription('Here are all the available commands organized by category:')
            .setFooter({ text: 'Use /help <command> to get info on a specific command.' });

        const commandsPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(commandsPath).filter(file => {
            return fs.statSync(path.join(commandsPath, file)).isDirectory();
        });

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
            const commandList = commandFiles.map(file => {
                const command = client.commands.get(file.replace('.js', ''));
                if (command && !command.devOnly) {
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