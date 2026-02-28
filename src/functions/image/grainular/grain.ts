import { ImageData } from '@napi-rs/canvas';

function grain(imageData: ImageData, amount = 0) {
  if (!imageData || amount <= 0) return imageData;
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] += (Math.random() - 0.5) * amount * 2;
    data[i + 1] += (Math.random() - 0.5) * amount * 2;
    data[i + 2] += (Math.random() - 0.5) * amount * 2;
  }
  return imageData;
}

export default grain;