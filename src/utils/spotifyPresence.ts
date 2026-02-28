interface RGBColor {
    r: number;
    g: number;
    b: number;
}

function darkenRGBColor(color: RGBColor, factor: number = 0.8): RGBColor {
    const { r, g, b } = color;

    // Multiply each color channel by the darkening factor
    const newR = Math.max(0, Math.min(255, r * factor));
    const newG = Math.max(0, Math.min(255, g * factor));
    const newB = Math.max(0, Math.min(255, b * factor));

    return { r: Math.round(newR), g: Math.round(newG), b: Math.round(newB) };
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (component: number): string => component.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Parse the rgb() string to extract r, g, and b values
function parseRGB(rgbString: string): RGBColor {
    const rgbValues = rgbString.match(/\d+/g); // Extract numbers from the rgb() string
    return {
        r: parseInt(rgbValues![0]),
        g: parseInt(rgbValues![1]),
        b: parseInt(rgbValues![2])
    };
}

async function darkenImageColorToHex(rgbString: string): Promise<string> {

    const originalColor = parseRGB(rgbString);  // Parse the rgb string to get an RGB object
    // console.log("Parsed RGB Color:", originalColor);

    const darkenedColor = darkenRGBColor(originalColor, 0.8); // Darken the RGB color
    // console.log("Darkened Color (RGB):", darkenedColor);  // Output darkened RGB color

    // Convert the darkened RGB color to Hex
    const darkenedHexColor = rgbToHex(darkenedColor.r, darkenedColor.g, darkenedColor.b);
    // console.log("Darkened Color (Hex):", darkenedHexColor);  // Output darkened Hex color

    return `${darkenedHexColor}`;
}

function isPlayingSpotify(presence: any): any {
    if (!presence || !presence.activities) return null;
    return presence.activities.find((activity: any) => activity.type === 2 && activity.name === 'Spotify');
}

export { darkenRGBColor, rgbToHex, parseRGB, darkenImageColorToHex, isPlayingSpotify };