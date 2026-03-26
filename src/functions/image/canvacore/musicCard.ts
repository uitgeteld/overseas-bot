import chalk from 'chalk';
import { createCanvas, loadImage, CanvasRenderingContext2D } from '@napi-rs/canvas';

interface ColorConfig {
    background: {
        type: string;
        data: string;
    }
    border: string;
    bar: {
        color: string;
        background: string;
    }
}

class MusicCard {
    song: string;
    artist: string;
    album: string;
    cover: string;
    songStart: number;
    songDuration: number;
    color: ColorConfig;
    font: string;

    /**
     * @hideconstructor
     */
    constructor() {
        this.song = '';
        this.artist = '';
        this.album = '';
        this.cover = '';
        this.songStart = 20;
        this.songDuration = 200;
        this.color = {
            background: {
                type: ['color', 'image'][0],
                data: '#1F1F1F',
            },
            border: '#111111',
            bar: {
                color: '#1DB954',
                background: '#555555bb'
            }
        };
        this.font = 'Arial';
    }

    /**
     * Set the song name
     * @param {string} song Song name
     * @returns {MusicCard}
     */
    setSong(song: string): MusicCard {
        this.song = song.toString();
        return this;
    }

    /**
     * Set the artist name
     * @param {string} artist Artist name
     * @returns {MusicCard}
     */
    setArtist(artist: string): MusicCard {
        this.artist = artist.toString();
        return this;
    }

    /**
     * Set the album name
     * @param {string} album Album name
     * @returns {MusicCard}
     */
    setAlbum(album: string): MusicCard {
        this.album = album.toString();
        return this;
    }

    /**
     * Set cover image
     * @param {string} image Cover image
     * @returns {MusicCard}
     */
    setCover(image: string): MusicCard {
        this.cover = image;
        return this;
    }

    /**
     * Set song start and duration time
     * @param {number} start Start time song
     * @param {number} duration Song duration
     * @returns {MusicCard}
     */
    setTime(start: number, duration: number): MusicCard {
        this.songStart = start;
        this.songDuration = duration;
        return this;
    }

    /**
     * Creating the MusicCard
     */
    async build(): Promise<Buffer | undefined> {
        const width: number = 1000;
        const height: number = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Background
        switch (this.color.background.type) {
            case 'color':
                ctx.fillStyle = this.color.background.data;
                ctx.fillRect(0, 0, width, height);
                break;
            case 'image':
                try {
                    const backgroundImage = await loadImage(this.color.background.data);
                    ctx.drawImage(backgroundImage, 0, 0, width, height);
                } catch (error) {
                    throw new Error(this.formatError(
                        'Failed to load background image. Please make sure the URL is correct and points to an image.',
                        error
                    ));
                }
                break;
            default:
                throw new Error(this.formatError(
                    'Invalid background type. Type must be either "color" or "image".'
                ));
        }

        // Border
        ctx.strokeStyle = this.color.border;
        ctx.lineWidth = 40;
        var radius = 45;
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, radius);
        ctx.stroke();

        // Used for inside border
        const borderMargin = 50

        // Cover
        try {
            const coverImage = await loadImage(this.cover);
            var radius = 20;
            var imageSize = 250;
            await this.drawRounded(ctx, borderMargin, borderMargin, imageSize, imageSize, radius, '', coverImage);
        } catch (error) {
            throw new Error(this.formatError(
                'Failed to load cover image. Please make sure the URL is correct and points to an image.',
                error
            ));
        }

        // Song Title
        // Typography settings
        const titleX = imageSize + 70;
        const titleY = borderMargin + 40;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 36px ${this.font}`;
        // truncate long title
        this.drawTruncatedText(ctx, this.song, titleX, titleY, canvas.width - titleX - borderMargin, 'bold 36px ' + this.font);

        // Playback icon
        const playSize = 28;
        const playX = imageSize + 12;
        const playY = imageSize - 182;
        console.log(playX, playY);
        this.drawPlaybackIcon(ctx, playX, playY, playSize);

        // Artist Name
        ctx.fillStyle = '#bfbfbf';
        ctx.font = `22px ${this.font}`;
        this.drawTruncatedText(ctx, this.artist, titleX, titleY + 36, canvas.width - titleX - borderMargin, '22px ' + this.font);

        // Album (optional)
        if (this.album && this.album.trim() !== '') {
            ctx.fillStyle = '#9a9a9a';
            ctx.font = `18px ${this.font}`;
            this.drawTruncatedText(ctx, this.album, titleX, titleY + 62, canvas.width - titleX - borderMargin, '18px ' + this.font);
        }

        // Progress Bar
        const barWidth: number = canvas.width - borderMargin * 2;
        const barHeight: number = 20;
        const barX: number = borderMargin;
        const barY: number = canvas.height - borderMargin - barHeight;
        const progressPercent: number = this.songStart >= this.songDuration ? 1 : this.songStart / this.songDuration;
        const bufferedPercent = Math.min(progressPercent + 0.4, 0.7);
        var radius = 10;

        // Waveform visualization
        const wfX = titleX;
        const wfY = titleY + 90;
        const wfWidth = canvas.width - titleX - borderMargin;
        const wfHeight = this.album && this.album.trim() !== '' ? 60 : 80;
        this.drawWaveform(ctx, wfX, wfY, wfWidth, wfHeight, progressPercent);

        // Draw background track
        this.drawRounded(ctx, barX, barY, barWidth, barHeight, radius, this.color.bar.background);

        // Draw buffered area
        ctx.save();
        ctx.globalAlpha = 0.6;
        this.drawRounded(ctx, barX, barY, barWidth * bufferedPercent, barHeight, radius, '#888888');
        ctx.restore();

        // Foreground of the progress bar
        this.drawRounded(ctx, barX, barY, barWidth * progressPercent, barHeight, radius, this.color.bar.color);

        // Progress knob
        const knobX = barX + (barWidth * progressPercent) - 10;
        const knobY = barY + barHeight / 2;
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.arc(knobX, knobY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Time Text (right-aligned)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `16px ${this.font}`;
        const timeText = this.formatTime(this.songStart) + " / " + this.formatTime(this.songDuration);
        const timeWidth = ctx.measureText(timeText).width;
        ctx.fillText(timeText, barX + barWidth - timeWidth - 10, barY - 10);

        try {
            return await canvas.toBuffer('image/png');
        } catch (error) {
            throw new Error(this.formatError('Failed to build image.', error));
        }
    }

    /**
     * Draw a rounded rectangle and optionally draw an image clipped to it.
     * @private
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {number} x X coordinate of the rectangle
     * @param {number} y Y coordinate of the rectangle
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Corner radius for rounded corners
     * @param {string} fillStyle Fill color used when no `image` is provided
     * @param {CanvasImageSource} [image] Optional image to draw inside the rounded rectangle
     * @returns {Promise<void>} Resolves when drawing is complete
     */
    private async drawRounded(ctx: CanvasRenderingContext2D | any, x: number, y: number, width: number, height: number, radius: number, fillStyle: string, image?: CanvasImageSource | CanvasImageData | any): Promise<void> {
        const r = Math.min(radius, width / 2, height / 2);

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.arcTo(x + width, y, x + width, y + r, r);
        ctx.lineTo(x + width, y + height - r);
        ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
        ctx.lineTo(x + r, y + height);
        ctx.arcTo(x, y + height, x, y + height - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();

        if (image) {
            ctx.save();
            ctx.clip();
            ctx.drawImage(image, x, y, width, height);
            ctx.restore();
        } else {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
    }

    /**
     * Draw the play/pause icon based on the current playback state.
     * @private
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {number} x X coordinate of the top-left corner of the icon
     * @param {number} y Y coordinate of the top-left corner of the icon
     * @param {number} size Size of the icon (width and height)
     */
    private drawPlaybackIcon(ctx: CanvasRenderingContext2D | any, x: number, y: number, size: number) {
        ctx.save();
        ctx.fillStyle = '#1DB954';
        // draw two pause bars
        const bw = size * 0.28;
        const gap = bw * 0.6;
        ctx.fillRect(x, y, bw, size);
        ctx.fillRect(x + bw + gap, y, bw, size);
        ctx.restore();
    }

    /** 
     * Draw text that is truncated with ellipsis if it exceeds the specified max width. Optionally set font before measuring text.
     * @private
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {string} text Text to draw
     * @param {number} x X coordinate to start drawing text
     * @param {number} y Y coordinate to start drawing text
     * @param {number} maxWidth Maximum width in pixels before truncating text
     * @param {string} [font] Optional font to set before measuring text (e.g. "bold 24px Arial")
     */
    private drawTruncatedText(ctx: CanvasRenderingContext2D | any, text: string, x: number, y: number, maxWidth: number, font?: string) {
        if (font) ctx.font = font;
        let measured = ctx.measureText(text).width;
        if (measured <= maxWidth) {
            ctx.fillText(text, x, y);
            return;
        }
        let ell = '...';
        let len = text.length;
        while (len > 0) {
            text = text.substring(0, len) + ell;
            if (ctx.measureText(text).width <= maxWidth) break;
            len--;
            text = text.substring(0, len);
        }
        ctx.fillText(text, x, y);
    }

    /**
     * Draw a simple waveform visualization based on the current progress of the song.
     * @private
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {number} x X coordinate of the waveform area
     * @param {number} y Y coordinate of the waveform area
     * @param {number} width Width of the waveform area
     * @param {number} height Height of the waveform area
     * @param {number} progress Current progress of the song (0 to 1)
     */
    private drawWaveform(ctx: CanvasRenderingContext2D | any, x: number, y: number, width: number, height: number, progress: number) {
        const bars = 28;
        const gap = 4;
        const barWidth = (width - (bars - 1) * gap) / bars;
        for (let i = 0; i < bars; i++) {
            // simulate waveform with sinus + progress based variance
            const pos = i / bars;
            const sine = Math.abs(Math.sin((pos + progress) * Math.PI * 2));
            const h = 4 + sine * (height - 8);
            const bx = x + i * (barWidth + gap);
            const by = y + (height - h) / 2;
            ctx.fillStyle = '#8fbf8f';
            ctx.fillRect(bx, by, barWidth, h);
        }
    }

    /**
     * Format seconds into a minutes:seconds string.
     * @private
     * @param {number} seconds Time in seconds to format
     * @returns {string} Formatted time as M:SS
     */
    private formatTime(seconds: number): string {
        const minutes: number = Math.floor(seconds / 60);
        const remainingSeconds: number = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    /**
     * Format error messages for consistent logging.
     * @private
     * @param {string} message Custom error message to provide context
     * @param {unknown} [error] Optional error object to extract message from
     * @returns {string} Formatted error string with context and error details
     */
    private formatError(message: string, error?: unknown): string {
        const errorMessage = error instanceof Error ? error.message : String(error ?? 'Unknown error');

        return [
            chalk.red('CANVACORE'),
            chalk.white(message),
            chalk.white(errorMessage),
        ].join('\n');
    }
}

export { MusicCard };