import { createCanvas, loadImage, CanvasRenderingContext2D } from '@napi-rs/canvas';
import { Formatter } from './helpers/formatter';
import { Drawer } from './helpers/drawer';
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
    private drawer: Drawer;
    private format: Formatter;

    /**
     * @hideconstructor
     */
    constructor() {
        this.format = new Formatter();
        this.drawer = new Drawer();
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
                background: '#414141'
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
                    throw new Error(this.format.formatError(
                        'Failed to load background image. Please make sure the URL is correct and points to an image.',
                        error
                    ));
                }
                break;
            default:
                throw new Error(this.format.formatError(
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
            await this.drawer.drawRounded(ctx, borderMargin, borderMargin, imageSize, imageSize, radius, '', coverImage);
        } catch (error) {
            throw new Error(this.format.formatError(
                'Failed to load cover image. Please make sure the URL is correct and points to an image.',
                error
            ));
        }

        // Playback icon
        const playSize = 28;
        const playX = imageSize + 12;
        const playY = imageSize - 182;
        this.drawer.drawPlaybackIcon(ctx, playX, playY, playSize);

        // Song Title
        // Typography settings
        const titleX = imageSize + 70;
        var titleY = borderMargin + 40;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 36px ${this.font}`;
        // truncate long title
        this.drawer.drawTruncatedText(ctx, this.song, titleX, titleY, canvas.width - titleX - borderMargin, 'bold 36px ' + this.font);

        // Artist Name
        var titleY = titleY + 34;
        ctx.fillStyle = '#bfbfbf';
        ctx.font = `22px ${this.font}`;
        this.drawer.drawTruncatedText(ctx, this.artist, titleX, titleY, canvas.width - titleX - borderMargin, '22px ' + this.font);

        // Album (optional)
        if (this.album && this.album.trim() !== '') {
            ctx.fillStyle = '#9a9a9a';
            ctx.font = `18px ${this.font}`;
            var titleY = titleY + 28;
            this.drawer.drawTruncatedText(ctx, this.album, titleX, titleY, canvas.width - titleX - borderMargin, '18px ' + this.font);
        }

        // Progress Bar
        const barWidth: number = canvas.width - borderMargin * 2;
        const barHeight: number = 20;
        const barX: number = borderMargin;
        const barY: number = canvas.height - borderMargin - barHeight;
        const progressPercent: number = this.songStart >= this.songDuration ? 1 : this.songStart / this.songDuration;
        const bufferedPercent = Math.min(progressPercent + 0.05, 1); // Simulate buffered area as 10% ahead of current progress
        var radius = 10;

        // Waveform visualization
        const wfX = titleX;
        const wfY = this.album && this.album.trim() !== '' ? imageSize - titleY / 2 + 18 : imageSize - titleY + 10;
        const wfWidth = canvas.width - titleX - borderMargin;
        const wfHeight = this.album && this.album.trim() !== '' ? 60 : 80;
        this.drawer.drawWaveform(ctx, wfX, wfY, wfWidth, wfHeight, progressPercent);

        // Draw background track
        this.drawer.drawRounded(ctx, barX, barY, barWidth, barHeight, radius, this.color.bar.background);

        // Draw buffered area
        ctx.save();
        ctx.globalAlpha = 0.6;
        this.drawer.drawRounded(ctx, barX, barY, barWidth * bufferedPercent, barHeight, radius, '#888888');
        ctx.restore();

        // Foreground of the progress bar
        this.drawer.drawRounded(ctx, barX, barY, barWidth * progressPercent, barHeight, radius, this.color.bar.color);

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
        const timeText = this.format.formatTime(this.songStart) + " / " + this.format.formatTime(this.songDuration);
        const timeWidth = ctx.measureText(timeText).width;
        ctx.fillText(timeText, barX + barWidth - timeWidth - 10, barY - 10);

        try {
            return await canvas.toBuffer('image/png');
        } catch (error) {
            throw new Error(this.format.formatError('Failed to build image.', error));
        }
    }
}

export { MusicCard };