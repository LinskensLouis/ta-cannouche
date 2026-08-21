// Compression d'image côté client (S3-06 / SPECS §3.3). Une photo d'étiquette
// brute fait ~4 Mo, impraticable en 4G faible : on redimensionne à ~1200 px et
// on réencode en JPEG avant l'upload.
export async function compressImage(file: File, maxSize = 1200, quality = 0.8): Promise<Blob> {
  // `from-image` respecte l'orientation EXIF (photos prises en portrait).
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte canvas indisponible.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression échouée."))),
      "image/jpeg",
      quality,
    );
  });
}
