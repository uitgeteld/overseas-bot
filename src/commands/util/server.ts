import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import os from 'os';
import { check } from 'diskusage';

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Shows the server specs'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.deferReply();

        const toGB = (v: number) => `${(v / 1024 / 1024 / 1024).toFixed(2)} GB`;

        // System info
        const platform = os.platform();
        const arch = os.arch();
        const cpuCount = os.cpus().length;
        const cpuModel = os.cpus()[0]?.model || 'Unknown';

        // Memory info
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

        // Disk info
        const drive = platform === 'win32' ? 'C:' : '/';
        let diskTotal = 'N/A';
        let diskUsed = 'N/A';
        let diskPercent = 'N/A';

        try {
            const diskInfo = await check(drive);
            diskTotal = toGB(diskInfo.total);
            diskUsed = toGB(diskInfo.total - diskInfo.free);
            diskPercent = ((((diskInfo.total - diskInfo.free) / diskInfo.total) * 100).toFixed(2)) + '%';
        } catch (error) {
            // Disk info not available
        }

        // Uptime
        const formatUptime = (secs: number) => {
            const s = Math.floor(secs % 60);
            const m = Math.floor((secs / 60) % 60);
            const h = Math.floor((secs / 3600) % 24);
            const d = Math.floor(secs / 86400);
            if (d > 0) return `${d}d ${h}h ${m}m`;
            if (h > 0) return `${h}h ${m}m ${s}s`;
            if (m > 0) return `${m}m ${s}s`;
            return `${s}s`;
        };

        const embed = new EmbedBuilder()
            .setTitle('Server Specs')
            .setColor('#C9C2B2')
            .addFields(
                { name: 'OS', value: `${platform} (${arch})`, inline: true },
                { name: 'CPU Cores', value: `${cpuCount}`, inline: true },
                { name: 'CPU Model', value: cpuModel, inline: false },
                { name: 'Total RAM', value: toGB(totalMem), inline: true },
                { name: 'Used RAM', value: `${toGB(usedMem)} (${memPercent}%)`, inline: true },
                { name: 'Free RAM', value: toGB(freeMem), inline: true },
                { name: 'Total Disk', value: diskTotal, inline: true },
                { name: 'Used Disk', value: `${diskUsed} (${diskPercent})`, inline: true },
                { name: 'Server Uptime', value: formatUptime(os.uptime()), inline: true },
                { name: 'Node Version', value: process.version, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}` });

        await interaction.editReply({ embeds: [embed] });
    }
};
