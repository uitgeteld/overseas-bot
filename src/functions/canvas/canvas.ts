import Canvas from '@napi-rs/canvas';
import { Util } from '../../utils/util';

interface UsernameConfig {
    data: string;
    color: string;
}

interface BarConfig {
    pos: number;
    width: number;
    color: string;
    track: {
        color: string;
    };
}

interface BackgroundConfig {
    color: string;
    border: {
        color: string;
        alpha: number;
    };
}

interface AvatarConfig {
    border: {
        color: string;
        alpha: number;
    };
}

interface DataConfig {
    XP: { color: string };
    requiredXP: { data: number; color: string };
    currentXP: { data: number; color: string };
    minXP: { data: number };
    level: { data: number; color: string };
    rank: { data: number; color: string };
    bar: BarConfig;
    background: BackgroundConfig;
    avatar: AvatarConfig;
}

type Theme = "light" | "amoled";

export class RankCard {
    private username: UsernameConfig;
    private avatar: string;
    private data: DataConfig;

    constructor() {
        this.username = {
            data: "@uitgeteld",
            color: "#FFFFFF"
        };
        this.avatar = `${__dirname}/../../Assets/default-avatar.png`;

        this.data = {
            XP: {
                color: "#000000"
            },
            requiredXP: {
                data: 0,
                color: "#FFFFFF"
            },
            currentXP: {
                data: 0,
                color: "#FFFFFF"
            },
            minXP: {
                data: 0,
            },

            level: {
                data: 0,
                color: "#FFFFFF"
            },
            rank: {
                data: 0,
                color: "#FFFFFF"
            },

            bar: {
                pos: 240,
                width: 500,
                color: "#FFFFFF",
                track: {
                    color: "#F39C12"
                }
            },

            background: {
                color: "#313232",
                border: {
                    color: "#2c2c2c",
                    alpha: 0.5
                }
            },

            avatar: {
                border: {
                    color: "#F39C12",
                    alpha: 1
                }
            }
        }
    }

    /**
    * Set username
    * @param username The username
    * @returns {RankCard}
    */
    setUsername(username: string): RankCard {
        this.username.data = username;
        return this;
    }

    /**
    * Set avatar
    * @param avatar The avatar url
    * @returns {RankCard}
    */
    setAvatar(avatar: string): RankCard {
        this.avatar = avatar;
        return this;
    }

    /**
    * Set level
    * @param level The level
    * @returns {RankCard}
    */
    setLevel(level: number | string): RankCard {
        this.data.level.data = parseInt(level as string);
        return this;
    }
    
    /**
    * Set rank
    * @param rank The rank
    * @returns {RankCard}
    */
    setRank(rank: number | string): RankCard {
        this.data.rank.data = parseInt(rank as string)
        return this;
    }
 
    /**
    * Set current xp
    * @param xp The xp
    * @returns {RankCard}
    */
    setCurrentXP(xp: number | string): RankCard {
        this.data.currentXP.data = parseInt(xp as string);
        return this;
    }

    /**
    * Set minimal xp
    * @param xp The xp
    * @returns {RankCard}
    */
    setMinXP(xp: number | string): RankCard {
        this.data.minXP.data = parseInt(xp as string);
        return this;
    }

    /**
    * Set required xp
    * @param xp The xp
    * @returns {RankCard}
    */
    setRequiredXP(xp: number | string): RankCard {
        this.data.requiredXP.data = parseInt(xp as string);
        return this;
    }

    /**
     * Set background color
     * @param color The background color you want
     * @returns {RankCard}
     */
    setBackground(color: string): RankCard {
        this.data.background.color = color;
        return this;
    }

    /**
     * Set border color
     * @param color The border color you want
     * @returns {RankCard}
     */
    setBorder(color: string): RankCard {
        this.data.background.border.color = color;
        return this;
    }

    /**
     * Set theme
     * @param theme The variable to set the color of.
     * @returns {RankCard}
     */
    theme(theme: Theme): RankCard {
        switch (theme) {
            case "light":
                this.data.background.color = "#FFFFFF";
                this.data.background.border.color = "#f2f3f5";
                this.data.avatar.border.color = "#6DAC9E";
                this.data.bar.color = "#A7CBA7";
                this.data.bar.track.color = "#6DAC9E";
                this.data.XP.color = "#FFFFFF";
                this.data.level.color = "#000000";
                this.data.rank.color = "#000000";
                this.username.color = "#000000";
                break;
            case "amoled":
                this.data.background.color = "#0D0D0D";
                this.data.background.border.color = "#000000";
                this.data.avatar.border.color = "#000000";
                this.data.bar.color = "#4B4B4B";
                this.data.bar.track.color = "#2D2D2D";
                this.data.XP.color = "#FFFFFF";
                this.data.level.color = "#FFFFFF";
                this.data.rank.color = "#FFFFFF";
                this.username.color = "#FFFFFF";
        }
        return this;
    }

    /**
     * Creating the RankCard
     */
    async build(): Promise<Buffer> {
        const barWidth = 90 + 18.5 + 36.25

        const canvas = Canvas.createCanvas(800, 200);
        const ctx = canvas.getContext("2d");

        //Creating background color
        ctx.fillStyle = this.data.background.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Creating background border
        ctx.strokeStyle = this.data.background.border.color;
        ctx.lineWidth = 37.5
        ctx.globalAlpha = 1
        // ctx.globalAlpha = this.color.border.alpha
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        // bg
        ctx.fillStyle = this.data.bar.color;
        ctx.arc(this.data.bar.pos, barWidth, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
        ctx.fill();
        ctx.fillRect(this.data.bar.pos, barWidth - 19, canvas.width - 300, 37.5);
        ctx.arc(this.data.bar.pos + 500, barWidth, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        // apply color
        ctx.fillStyle = this.data.bar.track.color;
        // progress bar
        ctx.arc(this.data.bar.pos, barWidth, 18.5, 1.5 * Math.PI, 0.5 * Math.PI, true);
        ctx.fill();
        ctx.fillRect(this.data.bar.pos, barWidth - 19, this._calculateBarProgress, 37.5);
        ctx.arc(this.data.bar.pos + this._calculateBarProgress, barWidth, 18.75, 1.5 * Math.PI, 0.5 * Math.PI, false);
        ctx.fill();
        ctx.save();

        // Drawing avatar
        ctx.beginPath();
        ctx.arc(110, 100, 75, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(await Canvas.loadImage(this.avatar), 37, 27, 146, 146);
        ctx.restore();

        //Drawing circle around the avatar
        ctx.beginPath();
        ctx.arc(110, 100, 75, 0, Math.PI * 2, true);
        ctx.strokeStyle = this.data.avatar.border.color;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = this.data.avatar.border.alpha;
        ctx.closePath();
        ctx.stroke();

        // Drawing translucent shadow
        ctx.beginPath();
        ctx.arc(110, 100, 75, 0, Math.PI * 2, true);
        ctx.shadowColor = '#000000'; // Shadow color
        ctx.shadowBlur = 0.3; // Shadow intensity
        ctx.closePath();
        ctx.stroke();

        //Drawing Name
        ctx.fillStyle = `${this.username.color}`;
        ctx.font = `30px "Arial"`;
        ctx.fillText(`${this.username.data}`, 230, 115);

        //Drawing XP
        ctx.fillStyle = `${this.data.XP.color}`;
        ctx.font = '30px Arial';
        // if (this.data.currentXP.data < 1000) ctx.fillText(`${this.data.currentXP.data} / ${Util.toAbbrev(this.data.requiredXP.data)}`, 230, 156);
        ctx.fillText(`${Util.toAbbrev(this.data.currentXP.data)} / ${Util.toAbbrev(this.data.requiredXP.data)}`, 230, 156);

        //Drawing Level & Rank
        ctx.fillStyle = `${this.data.level.color}`;
        ctx.font = `30px "Arial"`;
        ctx.fillText(`Level: ${Util.toAbbrev(parseInt(this.data.level.data as any))}`, 600, 115)
        ctx.fillStyle = `${this.data.rank.color}`;
        ctx.font = `30px "Arial"`;
        ctx.fillText(`#${Util.toAbbrev(parseInt(this.data.rank.data as any))}`, ctx.measureText(`${this.username.data}`).width + 240, 115)

        return await canvas.toBuffer("image/png");

    }

    /**
    * Calculates bar progress
    * @type {number}
    * @private
    * @ignore
    */
    get _calculateBarProgress(): number {
        const cx = this.data.currentXP.data;
        const rx = this.data.requiredXP.data;

        if (rx <= 0) return 1;
        if (cx > rx) return parseInt(this.data.bar.width as any) || 0;

        if (this.data.minXP.data > 0) {
            const mx = this.data.minXP.data;
            if (cx < mx) return 0;

            const nx = cx - mx;
            const nr = rx - mx;
            return (nx * this.data.bar.width) / nr;
        }

        let width = (cx * this.data.bar.width) / rx;
        if (width > this.data.bar.width) width = this.data.bar.width;
        return parseInt(width as any) || 0;
    }

}
