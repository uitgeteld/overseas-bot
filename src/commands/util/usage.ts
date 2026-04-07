import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('usage')
        .setDescription('Replies with information about the bot\'s usage and statistics'),
    dev: true,
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const toMB = (v: number) => `${(v / 1024 / 1024).toFixed(2)} MB`;

        const sampleCpuPercent = async (delay = 200) => {
            const cpus1 = os.cpus();
            const idle1 = cpus1.reduce((acc, c) => acc + c.times.idle, 0);
            const total1 = cpus1.reduce((acc, c) => acc + Object.values(c.times).reduce((a, b) => a + b, 0), 0);

            await new Promise((r) => setTimeout(r, delay));

            const cpus2 = os.cpus();
            const idle2 = cpus2.reduce((acc, c) => acc + c.times.idle, 0);
            const total2 = cpus2.reduce((acc, c) => acc + Object.values(c.times).reduce((a, b) => a + b, 0), 0);

            const idleDiff = idle2 - idle1;
            const totalDiff = total2 - total1;

            if (totalDiff === 0) return 0;
            const usage = (1 - idleDiff / totalDiff) * 100;
            return usage;
        };

        const cpuPercent = await sampleCpuPercent(200);

        const totalMem = os.totalmem();
        const mem = process.memoryUsage();

        const formatUptime = (secs: number) => {
            const s = Math.floor(secs % 60);
            const m = Math.floor((secs / 60) % 60);
            const h = Math.floor(secs / 3600);
            if (h > 0) return `${h}h ${m}m ${s}s`;
            if (m > 0) return `${m}m ${s}s`;
            return `${s}s`;
        };

        const embed = new EmbedBuilder()
            .setTitle('Bot Usage')
            .setColor('#C9C2B2')
            .addFields(
                { name: 'CPU Usage', value: `${cpuPercent.toFixed(2)}%`, inline: true },
                { name: 'Total RAM', value: toMB(totalMem), inline: true },
                { name: 'Bot RAM Used', value: toMB(mem.rss), inline: true },
                { name: "Uptime", value: `\`\`\`${formatUptime(process.uptime())}\`\`\`` }
            )
            .setFooter({ text: `Node ${process.version} | Platform ${process.platform}` });

        await interaction.editReply({ embeds: [embed] });
    }
};