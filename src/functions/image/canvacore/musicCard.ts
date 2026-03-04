import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

interface ColorConfig {
    background: {
        color: string;
        image: string;
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
        this.songStart = 0;
        this.songDuration = 0;
        this.color = {
            background: {
                color: '#1F1F1F',
                image: ''
            },
            border: '#111111',
            bar: {
                color: '#FFFFFF',
                background: '#555555'
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
        ctx.fillStyle = this.color.background.image != "" ? this.color.background.image : this.color.background.color;
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = this.color.border;
        ctx.lineWidth = 40;
        const radius = 45;
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, radius);
        ctx.stroke();

        try {
            return await canvas.toBuffer('image/png');
        } catch (error) {
            console.log(error);
        }

        function formatTime(seconds: number): string {
            const minutes: number = Math.floor(seconds / 60);
            const remainingSeconds: number = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }
    }
}

export { MusicCard };