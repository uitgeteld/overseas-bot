import { GuildMember, Client, EmbedBuilder } from "discord.js";
import { query } from "../../utils/database";

export default {
    name: "guildMemberRemove",
    once: false,
    async execute(member: GuildMember, client: Client) {
        try {
            const settings = await query('SELECT goodbye_channel_id FROM guild_settings WHERE guild_id = ?', [member.guild.id]);
            if (settings.length && (settings[0] as any).goodbye_channel_id) {
                const goodbyeChannelId = (settings[0] as any).goodbye_channel_id;
                const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);
                if (goodbyeChannel && goodbyeChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor("#C9C2B2")
                        .setAuthor({ name: `${member.guild?.name}`, iconURL: member.guild?.iconURL() || undefined })
                        .setTitle(`Goodbye from ${member.guild?.name}`)
                        .setDescription(`Goodbye ${member.user?.username}, we're sorry to see you leave our Discord server.`)
                        .setFooter({ text: `Member #${member.guild?.memberCount}` })
                        .setThumbnail(member.user?.displayAvatarURL() || '');
                    try {
                        await goodbyeChannel.send({ embeds: [embed] });
                    } catch (error) {
                        console.error(`Failed to send goodbye message: ${error}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error in guildMemberRemove: ${error}`);
        }
    }
};