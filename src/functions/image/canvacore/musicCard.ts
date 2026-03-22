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
        this.songStart = 201;
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
                    throw new TypeError('Failed to load background image. Please make sure the URL is correct and points to an image.');
                }
                break;
            default:
                throw new Error('Invalid background type. Type must be either "color" or "image".');
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
            await this.drawRounded(ctx, borderMargin, borderMargin, 225, 225, 25, '', coverImage);
        } catch (error) {
            throw new TypeError('Failed to load cover image. Please make sure the URL is correct and points to an image.');
        }

        // Progress Bar
        const barWidth: number = canvas.width - borderMargin * 2;
        const barHeight: number = 20;
        const barX: number = borderMargin;
        const barY: number = canvas.height - borderMargin - barHeight;
        const progressPercent: number = this.songStart >= this.songDuration ? 1 : this.songStart / this.songDuration;
        var radius = 10;

        // Background of the progress bar
        this.drawRounded(ctx, barX, barY, barWidth, barHeight, radius, this.color.bar.background);

        // Foreground of the progress bar
        this.drawRounded(ctx, barX, barY, barWidth * progressPercent, barHeight, radius, this.color.bar.color);

        // Time Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `16px ${this.font}`;
        ctx.textAlign = 'left';
        ctx.fillText(this.formatTime(this.songStart) + " / " + this.formatTime(this.songDuration), barX + 10, barY - 10);
        // ctx.textAlign = 'right';
        // ctx.fillText(this.formatTime(this.songStart), barX + barWidth, barY - 10);
        // ctx.textAlign = 'left';
        // ctx.fillText(this.formatTime(this.songDuration), barX, barY - 10);

        try {
            return await canvas.toBuffer('image/png');
        } catch (error) {
            throw new Error('Failed to generate MusicCard image.');
        }
    }

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

    private formatTime(seconds: number): string {
        const minutes: number = Math.floor(seconds / 60);
        const remainingSeconds: number = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}

export { MusicCard };