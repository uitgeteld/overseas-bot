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
    name: "guildMemberAdd",
    async execute(member: GuildMember, client: Client) {
        const embed = new EmbedBuilder()
            .setColor("#C9C2B2")
            .setAuthor({ name: `${member.guild?.name}`, iconURL: member.guild?.iconURL() || undefined })
            .setTitle(`Welcome to ${member.guild?.name}`)
            .setDescription(`Hello ${member.user?.username}, welcome to our Discord server! We're glad to have you here.`)
            .setFooter({ text: `Member #${member.guild?.memberCount}` })
            .setThumbnail(member.user?.displayAvatarURL() || '');

        const options = loadOptions();
        const welcomeChannelId = options[member.guild.id]?.welcomeChannel;

        if (welcomeChannelId) {
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            if (welcomeChannel && welcomeChannel.isTextBased()) {
                try {
                    await welcomeChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send welcome message: ${error}`);
                }
            }
        }
    }
};