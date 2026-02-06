import Canvas from '@napi-rs/canvas';

function brightness(imageData: Canvas.ImageData, brightness = 1) {
  if (!imageData || brightness === 1) return imageData;
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] *= brightness;
    data[i+1] *= brightness;
    data[i+2] *= brightness;
  }
  return imageData;
}

export default brightness;