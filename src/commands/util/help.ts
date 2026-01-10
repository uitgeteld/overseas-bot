import { ChatInputCommandInteraction, SlashCommandBuilder, Client, MessageFlags, EmbedBuilder } from "discord.js";
import { categorizer } from "../../helpers/categorizer";
import fs from "node:fs";
import path from "node:path";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription('Replies with a list of available commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to get help for')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const commandName = interaction.options.getString('command');

        if (commandName) {
            const command = client.commands.get(commandName);

            if (!command) {
                return await interaction.reply({ content: `No command found with name "${commandName}".`, flags: MessageFlags.Ephemeral });
            }

            const embed = new EmbedBuilder()
                .setColor('#C9C2B2')
                .setTitle(`Command: /${commandName}`)
                .setDescription(command.data.description || 'No description available.')

            if (Array.isArray(command.data.options) && command.data.options.length > 0) {
                const optionsDescription = command.data.options.map((option: { name: string; description?: string }) => {
                    return `\`-${option.name}\`: ${option.description || 'No description'}`;
                }).join('\n');

                embed.addFields({ name: 'Options', value: optionsDescription });
            }
            if (command.aliases && Array.isArray(command.aliases) && command.aliases.length > 0) {
                embed.addFields({ name: 'Aliases', value: command.aliases.map((alias: string) => `\`/${alias}\``).join(', ') });
            }

            return await interaction.editReply({ embeds: [embed] });
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
            const category = categorizer.getCategoryName(folder);
            const commandList = Array.from(client.commands.values())
                .filter(cmd => {
                    const cmdPath = path.join(commandsPath, folder, `${cmd.data.name}.ts`);
                    if (cmd.devOnly) return false;
                    return fs.existsSync(cmdPath);
                })
                .filter((cmd, index, self) => {
                    return self.findIndex(c => c.data.name === cmd.data.name) === index;
                })
                .map(cmd => `\`/${cmd.data.name}\``)
                .join(', ') || false;
                
            if (commandList) {
                embed.addFields({ name: category, value: commandList });
            }
        }
        await interaction.editReply({ embeds: [embed] });
    }
};