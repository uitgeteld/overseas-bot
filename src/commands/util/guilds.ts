import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('guilds')
        .setDescription('Replies with list of guilds the bot is in'),
    devOnly: true,
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        const guildLines: string[] = [];

        for (const guild of client.guilds.cache.values()) {
            let guildDisplay = guild.name;

            try {
                const invites = await guild.invites.fetch();
                if (invites.size > 0) {
                    const validInvite = invites.find(inv => !inv.channel || inv.channel.type !== 2);
                    if (validInvite) {
                        guildDisplay = `${guild.name} [➜](https://discord.gg/${validInvite.code})`;
                    }
                }
            } catch (error) {
                // No permission or invite fetch failed
            }

            guildLines.push(guildDisplay);
        }

        const guildsText = guildLines.join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`Guilds (${client.guilds.cache.size})`)
            .setDescription(guildsText || 'The bot is not in any guilds.')
            .setColor('#C9C2B2');

        await interaction.editReply({ embeds: [embed] });
    }
};