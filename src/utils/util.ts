export class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Converts numbers into units like `1K`, `1M`, `1B` etc.
     * @param num - The number to convert
     * @returns Abbreviated number string
     */
    static toAbbrev(num: number | string): string {
        if (!num || isNaN(Number(num))) return "0";
        if (typeof num === "string") num = parseInt(num);

        if (typeof Intl !== "undefined") {
            return new Intl.NumberFormat("en", { notation: "compact" }).format(num);
        } else {
            let decPlaces = Math.pow(10, 1);
            const abbrev = ["K", "M", "B", "T"];
            for (let i = abbrev.length - 1; i >= 0; i--) {
                const size = Math.pow(10, (i + 1) * 3);
                if (size <= num) {
                    num = Math.round((num * decPlaces) / size) / decPlaces;
                    if (num == 1000 && i < abbrev.length - 1) {
                        num = 1;
                        i++;
                    }
                    num = (num as number) + abbrev[i];
                    break;
                }
            }
            return `${num}`;
        }
    }

    /**
     * Formats variable names by converting kebab-case to camelCase
     * @param prefix - The prefix to add to the variable
     * @param variable - The variable name to format
     * @returns The formatted variable name
     */
    static formatVariable(prefix: string, variable: string): string {
        const formattedVariable = variable
            .toLowerCase()
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.substr(1, word.length).toLowerCase())
            .join("");
        return prefix + formattedVariable;
    }

    /**
     * Applies text to a canvas by adjusting font size to fit width
     * @param canvas - The canvas element
     * @param text - The text to apply
     * @param defaultFontSize - The starting font size
     * @param width - The maximum width for the text
     * @param font - The font family to use
     * @returns The calculated font string
     */
    static applyText(
        canvas: HTMLCanvasElement,
        text: string,
        defaultFontSize: number,
        width: number,
        font: string
    ): string {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        do {
            ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
        } while (ctx.measureText(text).width > width);
        return ctx.font;
    }

    /**
     * Draws a rounded rectangle on a canvas
     * @param ctx - The canvas rendering context
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @param width - The rectangle width
     * @param height - The rectangle height
     * @param radius - The corner radius (default: 5)
     * @param fill - Whether to fill the rectangle (default: true)
     * @param stroke - Whether to stroke the rectangle (default: true)
     */
    static roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number = 5,
        fill: boolean = true,
        stroke: boolean = true
    ): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
        ctx.clip();
    }
}
