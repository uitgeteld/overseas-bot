import Canvas from '@napi-rs/canvas';

function grain(imageData: Canvas.ImageData, amount = 0) {
  if (!imageData || amount <= 0) return imageData;
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount * 2;
      data[i] += noise;
      data[i+1] += noise;
      data[i+2] += noise;
  }
  return imageData;
}

export default grain;