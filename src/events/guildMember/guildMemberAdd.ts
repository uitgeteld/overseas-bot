import { GuildMember, Client, EmbedBuilder } from "discord.js";
import { query } from "../../utils/database";

export default {
    name: "guildMemberAdd",
    once: false,
    async execute(member: GuildMember) {
        try {
            const settings = await query('SELECT welcome_channel_id FROM guild_settings WHERE guild_id = ?', [member.guild.id]);
            if (settings.length && (settings[0] as any).welcome_channel_id) {
                const welcomeChannelId = (settings[0] as any).welcome_channel_id;
                const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
                if (welcomeChannel && welcomeChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor("#C9C2B2")
                        .setAuthor({ name: `${member.guild?.name}`, iconURL: member.guild?.iconURL() || undefined })
                        .setTitle(`Welcome to ${member.guild?.name}`)
                        .setDescription(`Hello ${member.user?.username}, welcome to our Discord server! We're glad to have you here.`)
                        .setFooter({ text: `Member #${member.guild?.memberCount}` })
                        .setThumbnail(member.user?.displayAvatarURL() || '');
                    try {
                        await welcomeChannel.send({ embeds: [embed] });
                    } catch (error) {
                        console.error(`Failed to send welcome message: ${error}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error in guildMemberAdd: ${error}`);
        }
    }
};