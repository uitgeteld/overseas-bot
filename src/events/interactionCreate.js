const { MessageFlags } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        if (command.devOnly) {
            const devIds = process.env.DEV_IDS ? process.env.DEV_IDS.split(',') : [];
            
            if (!devIds.includes(interaction.user.id)) {
                return await interaction.reply({ 
                    content: 'This command is only available to developers.', 
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};