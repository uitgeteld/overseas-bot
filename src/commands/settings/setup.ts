import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits, EmbedBuilder, MessageFlags } from "discord.js";
import { query, insert, update, remove } from "../../utils/database";

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup settings for the server')
        .addSubcommand(subcommand =>
            subcommand.setName("set")
                .setDescription('Set welcome or goodbye channels')
                .addChannelOption(option =>
                    option.setName('welcomechannel')
                        .setDescription('The channel where welcome messages will be sent')
                )
                .addChannelOption(option =>
                    option.setName('goodbyechannel')
                        .setDescription('The channel where goodbye messages will be sent')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setDescription('Remove welcome or goodbye channels')
                .addChannelOption(option =>
                    option.setName('welcomechannel')
                        .setDescription('Remove the welcome channel')
                )
                .addChannelOption(option =>
                    option.setName('goodbyechannel')
                        .setDescription('Remove the goodbye channel')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("reset")
                .setDescription('Reset all settings for the server')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    guild: true,
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error('deferReply failed for setup command:', {
                id: interaction.id,
                guildId: interaction.guild?.id,
                replied: interaction.replied,
                deferred: interaction.deferred,
                error: err
            });
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'Processing...', flags: MessageFlags.Ephemeral });
                }
            } catch (replyErr) {
                console.error('Fallback reply also failed for setup command:', replyErr);
            }
        }

        const sub = interaction.options.getSubcommand();
        const welcomeChannel = interaction.options.getChannel('welcomechannel');
        const goodbyeChannel = interaction.options.getChannel('goodbyechannel');
        const guildId = interaction.guild?.id;

        if (!guildId) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription('❌ | **Guild not found**').setColor('#C9C2B2')
                ]
            });
        }

        const [settings] = await query('SELECT welcome_channel_id, goodbye_channel_id FROM guild_settings WHERE guild_id = ?', [guildId]);

        try {
            if (sub === 'set') {
                if (!welcomeChannel && !goodbyeChannel) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder().setDescription('❌ | **No channel provided to set**').setColor('#C9C2B2')
                        ]
                    });
                }

                if (welcomeChannel) {
                    if (settings) {
                        await update('UPDATE guild_settings SET welcome_channel_id = ? WHERE guild_id = ?', [welcomeChannel.id, guildId]);
                    } else {
                        await insert('INSERT INTO guild_settings (guild_id, welcome_channel_id) VALUES (?, ?)', [guildId, welcomeChannel.id]);
                    }
                }

                if (goodbyeChannel) {
                    if (settings) {
                        await update('UPDATE guild_settings SET goodbye_channel_id = ? WHERE guild_id = ?', [goodbyeChannel.id, guildId]);
                    } else {
                        await insert('INSERT INTO guild_settings (guild_id, goodbye_channel_id) VALUES (?, ?)', [guildId, goodbyeChannel.id]);
                    }
                }

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder().setTitle('Settings updated').setDescription('Channel(s) saved.').setColor('#C9C2B2')
                    ]
                });
            }

            if (sub === 'remove') {
                if (!welcomeChannel && !goodbyeChannel) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder().setDescription('❌ | **No channel provided to remove**').setColor('#C9C2B2')
                        ]
                    });
                }

                if (welcomeChannel) {
                    if (settings) {
                        await update('UPDATE guild_settings SET welcome_channel_id = NULL WHERE guild_id = ?', [guildId]);
                    }
                }

                if (goodbyeChannel) {
                    if (settings) {
                        await update('UPDATE guild_settings SET goodbye_channel_id = NULL WHERE guild_id = ?', [guildId]);
                    }
                }

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder().setTitle('Settings updated').setDescription('Channel(s) removed.').setColor('#C9C2B2')
                    ]
                });
            }

            if (sub === 'reset') {
                await remove('DELETE FROM guild_settings WHERE guild_id = ?', [guildId]);
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder().setTitle('Settings reset').setDescription('All settings for this server have been cleared.').setColor('#C9C2B2')
                    ]
                });
            }
        } catch (error) {
            console.error(`Error in setup command: ${error}`);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription('❌ | **An error occurred during setup**').setColor('#C9C2B2')
                ]
            });
        }
    }
};
