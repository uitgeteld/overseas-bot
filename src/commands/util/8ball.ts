import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, SlashCommandBuilder } from "discord.js";

type EightBallAnswer = {
    text: string;
    color: ColorResolvable;
};

const answers: EightBallAnswer[] = [
    { text: "It is certain.", color: "#56F39A" },
    { text: "Without a doubt.", color: "#56F39A" },
    { text: "You may rely on it.", color: "#56F39A" },
    { text: "Yes - definitely.", color: "#56F39A" },
    { text: "Most likely.", color: "#A7F3D0" },
    { text: "Outlook good.", color: "#A7F3D0" },
    { text: "Signs point to yes.", color: "#A7F3D0" },
    { text: "Absolutely.", color: "#A7F3D0" },
    { text: "Ask again later.", color: "#FFD166" },
    { text: "Cannot predict now.", color: "#FFD166" },
    { text: "Reply hazy, try again.", color: "#FFD166" },
    { text: "Better not tell you now.", color: "#FFD166" },
    { text: "Don't count on it.", color: "#EF476F" },
    { text: "My reply is no.", color: "#EF476F" },
    { text: "My sources say no.", color: "#EF476F" },
    { text: "Very doubtful.", color: "#EF476F" },
];

export default {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question you want answered')
                .setRequired(true)
                .setMaxLength(200)),
    async execute(interaction: ChatInputCommandInteraction) {
        const question = interaction.options.getString('question', true);
        const answer = answers[Math.floor(Math.random() * answers.length)];

        const embed = new EmbedBuilder()
            .setColor(answer.color)
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: 'Question', value: question },
                { name: 'Answer', value: answer.text }
            )
            .setFooter({ text: `Asked by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};