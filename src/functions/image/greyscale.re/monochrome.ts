import Canvas from '@napi-rs/canvas';

function monochrome(imageData: Canvas.ImageData, threshold = 128) {
  if (!imageData) return imageData;
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    const value = avg >= threshold ? 255 : 0;
    data[i] = data[i+1] = data[i+2] = value;
  }
  return imageData;
}

export default monochrome;
