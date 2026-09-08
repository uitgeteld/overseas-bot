import chalk from "chalk";


export const errorMessages = {

    console: {
        DATABASE_CONNECTION: `${chalk.red("✗")} ${chalk.bold("Database:")} ${chalk.red("Failed to connect to the database. Continuing without database connection.")}`,
    },


    messages: {
        GUILD_ONLY: `✗ **Error:** This command can only be used in a server."`,
        DEV_ONLY: `✗ **Error:** This command can only be used by a developer of the bot."`,

        voice: {
            USER_NOT_IN_VOICE_CHANNEL: `✗ **Error:** You must be in a voice channel to use this command."`,
            BOT_NOT_IN_VOICE_CHANNEL: `✗ **Error:** The bot is not in a voice channel."`,
            BOT_ALREADY_IN_VOICE_CHANNEL: `✗ **Error:** The bot is already in a voice channel."`,
            VOICE_CONNECTION_FAILED: `✗ **Error:** Failed to connect to the voice channel."`,
        }
    }
}