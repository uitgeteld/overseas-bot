import { createCanvas, loadImage } from '@napi-rs/canvas';

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

    /**
     * @hideconstructor
     */
    constructor() {
        this.song = '';
        this.artist = '';
        this.album = '';
        this.cover = '';
        this.songStart = 50;
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
        const radius = 45;
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, radius);
        ctx.stroke();

        // Cover
        try {
            const coverImage = await loadImage(this.cover);
            ctx.drawImage(coverImage, 60, 60, 200, 200);
        } catch (error) {
            throw new TypeError('Failed to load cover image. Please make sure the URL is correct and points to an image.');
        }

        const barWidth: number = canvas.width - 120;
        const barHeight: number = 20;
        const barX: number = 60;
        const barY: number = canvas.height - 80;
        const progressPercent: number = this.songStart / this.songDuration;

        // Background of the progress bar
        ctx.fillStyle = `${this.color.bar.background}`;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground of the progress bar
        ctx.fillStyle = `${this.color.bar.color}`;
        ctx.fillRect(barX, barY, barWidth * progressPercent, barHeight);


        try {
            return await canvas.toBuffer('image/png');
        } catch (error) {
            throw new Error('Failed to generate MusicCard image.');
        }
    }
}

export { MusicCard };