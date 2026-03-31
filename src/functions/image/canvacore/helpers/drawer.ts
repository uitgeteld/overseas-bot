class Drawer {
    
    /**
     * Draw a rounded rectangle and optionally draw an image clipped to it.
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
    async drawRounded(ctx: CanvasRenderingContext2D | any, x: number, y: number, width: number, height: number, radius: number, fillStyle: string, image?: CanvasImageSource | CanvasImageData | any): Promise<void> {
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
     * Draw text that is truncated with ellipsis if it exceeds the specified max width. Optionally set font before measuring text.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {string} text Text to draw
     * @param {number} x X coordinate to start drawing text
     * @param {number} y Y coordinate to start drawing text
     * @param {number} maxWidth Maximum width in pixels before truncating text
     * @param {string} [font] Optional font to set before measuring text (e.g. "bold 24px Arial")
     */
    drawTruncatedText(ctx: CanvasRenderingContext2D | any, text: string, x: number, y: number, maxWidth: number, font?: string) {
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
     * Draw the play/pause icon based on the current playback state.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {number} x X coordinate of the top-left corner of the icon
     * @param {number} y Y coordinate of the top-left corner of the icon
     * @param {number} size Size of the icon (width and height)
     */
    drawPlaybackIcon(ctx: CanvasRenderingContext2D | any, x: number, y: number, size: number) {
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
     * Draw a simple waveform visualization based on the current progress of the song.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context
     * @param {number} x X coordinate of the waveform area
     * @param {number} y Y coordinate of the waveform area
     * @param {number} width Width of the waveform area
     * @param {number} height Height of the waveform area
     * @param {number} progress Current progress of the song (0 to 1)
     */
    drawWaveform(ctx: CanvasRenderingContext2D | any, x: number, y: number, width: number, height: number, progress: number) {
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
}

export { Drawer };