import { Interaction, Client, MessageFlags } from "discord.js";

export default {
  name: "interactionCreate",
  once: false,
  async execute(interaction: Interaction, client: Client) {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        if (command.dev) {
          const devIds = process.env.DEV_IDS?.split(",") || [];

          if (!devIds.includes(interaction.user.id)) {
            return await interaction.reply({
              content: 'This command is only available to developers.',
              flags: MessageFlags.Ephemeral
            });
          }
        } else if (command.guild && !interaction.guild) {
          return await interaction.reply({
            content: 'This command can only be used in a server.'
          });
        }
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "There was an error while executing this command!" });
          } else {
            await interaction.reply({ content: "There was an error while executing this command!" });
          }
        } catch (replyError) {
          console.error("Failed to send error message:", replyError);
        }
      }
    }
  }
};