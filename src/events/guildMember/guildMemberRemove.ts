import { GuildMember, Client, EmbedBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const OPTIONS_FILE = path.join(__dirname, '../../..', 'options.json');

function loadOptions() {
    try {
        const data = fs.readFileSync(OPTIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export default {
    name: "guildMemberRemove",
    async execute(member: GuildMember, client: Client) {
        const embed = new EmbedBuilder()
            .setColor("#C9C2B2")
            .setAuthor({ name: `${member.guild?.name}`, iconURL: member.guild?.iconURL() || undefined })
            .setTitle(`Goodbye from ${member.guild?.name}`)
            .setDescription(`Goodbye ${member.user?.username}, we're sorry to see you leave our Discord server.`)
            .setFooter({ text: `Member #${member.guild?.memberCount}` })
            .setThumbnail(member.user?.displayAvatarURL() || '');

        const options = loadOptions();
        const goodbyeChannelId = options[member.guild.id]?.goodbyeChannel;

        if (goodbyeChannelId) {
            const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);
            if (goodbyeChannel && goodbyeChannel.isTextBased()) {
                try {
                    await goodbyeChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send goodbye message: ${error}`);
                }
            }
        }
    }
};