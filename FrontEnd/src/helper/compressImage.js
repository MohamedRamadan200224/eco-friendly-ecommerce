// Client-side image compression (canvas) before upload, so submitting a
// product with a phone photo doesn't push a multi-MB file up on a slow
// connection. Downscales to a max dimension and re-encodes as JPEG.
// Falls back to the original file on any failure — compression must never
// break the submit.
export async function compressImage(
  file,
  maxDimension = 1200,
  quality = 0.8
) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );
    const needsResize = scale < 1;
    const needsReencode = file.size > 500 * 1024;
    if (!needsResize && !needsReencode) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}
