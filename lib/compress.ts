export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function compressImageFile(
  file: Blob,
  maxBytes = 150 * 1024,
  maxWidth = 1080
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.85;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length * 0.75 > maxBytes && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

export async function stampIDareYou(
  imageDataUrl: string,
  bannerText: string
): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageDataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, 0, 0);

  const pad = Math.round(img.height * 0.04);
  const boxH = Math.round(img.height * 0.16);
  ctx.fillStyle = "rgba(7,10,18,0.82)";
  ctx.fillRect(0, img.height - boxH - pad, img.width, boxH);

  ctx.fillStyle = "#FF1744";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(2, img.width * 0.004);
  ctx.font = `900 ${Math.round(img.width * 0.055)}px Impact, Haettenschweiler, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = bannerText.toUpperCase();
  const x = img.width / 2;
  const y = img.height - boxH / 2 - pad / 2;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function compressVideoBlob(
  blob: Blob,
  maxBytes = 1.2 * 1024 * 1024
): Promise<string> {
  if (blob.size <= maxBytes) return blobToDataUrl(blob);
  // Client can't re-encode reliably without WASM; trim by rejecting oversized
  // and asking for a shorter take. Still return if reasonably close.
  if (blob.size > maxBytes * 1.35) {
    throw new Error("Video too large — keep it under 10s and try again.");
  }
  return blobToDataUrl(blob);
}

export async function compressAudioBlob(
  blob: Blob,
  maxBytes = 150 * 1024
): Promise<string> {
  if (blob.size > maxBytes * 1.4) {
    throw new Error("Voice note too large — keep it under 12s.");
  }
  return blobToDataUrl(blob);
}
