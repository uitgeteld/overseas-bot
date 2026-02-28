import { ImageData } from '@napi-rs/canvas';

function saturate(imageData: ImageData, saturation = 1) {
  if (!imageData || saturation === 1) return imageData;
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray + (r - gray) * saturation;
    data[i + 1] = gray + (g - gray) * saturation;
    data[i + 2] = gray + (b - gray) * saturation;
  }
  return imageData;
}

export default saturate;