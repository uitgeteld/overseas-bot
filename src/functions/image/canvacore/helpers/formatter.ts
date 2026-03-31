import chalk from 'chalk';

class Formatter {
    
    /**
     * Format seconds into a minutes:seconds string.
     * @param {number} seconds Time in seconds to format
     * @returns {string} Formatted time as M:SS
     */
    formatTime(seconds: number): string {
        const minutes: number = Math.floor(seconds / 60);
        const remainingSeconds: number = Math.floor(seconds % 60);

        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    /**
     * Format error messages for consistent logging.
     * @param {string} message Custom error message to provide context
     * @param {unknown} [error] Optional error object to extract message from
     * @returns {string} Formatted error string with context and error details
     */
    formatError(message: string, error?: unknown): string {
        const errorMessage = error instanceof Error ? error.message : String(error ?? 'Unknown error');

        return [
            chalk.red('CANVACORE'),
            chalk.white(message),
            chalk.white(errorMessage),
        ].join('\n');
    }
}

export { Formatter };