export function base64ToBuffer(base64String) {
  if (typeof base64String !== "string") {
    throw new TypeError("Expected base64 string, got " + typeof base64String);
  }
  const cleanBase64 = base64String.includes(";base64,")
    ? base64String.split(",")[1]
    : base64String;
  return Buffer.from(cleanBase64, "base64");
}

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // keep full "data:image/...;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Simple MIME type detection from buffer signature
function detectMimeFromBuffer(buffer) {
  if (!buffer || buffer.length < 12) return "application/octet-stream";

  const signature = buffer.subarray(0, 16); // Extended check range

  // === IMAGES ===
  if (signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff)
    return "image/jpeg";
  if (
    signature[0] === 0x89 &&
    signature[1] === 0x50 &&
    signature[2] === 0x4e &&
    signature[3] === 0x47
  )
    return "image/png";
  if (
    signature[0] === 0x47 &&
    signature[1] === 0x49 &&
    signature[2] === 0x46 &&
    signature[3] === 0x38
  )
    return "image/gif";
  if (
    signature[0] === 0x52 &&
    signature[1] === 0x49 &&
    signature[2] === 0x46 &&
    signature[3] === 0x46 &&
    signature[8] === 0x57 &&
    signature[9] === 0x45 &&
    signature[10] === 0x42 &&
    signature[11] === 0x50
  )
    return "image/webp";
  if (signature[0] === 0x42 && signature[1] === 0x4d) return "image/bmp";
  if (
    (signature[0] === 0x49 &&
      signature[1] === 0x49 &&
      signature[2] === 0x2a &&
      signature[3] === 0x00) ||
    (signature[0] === 0x4d &&
      signature[1] === 0x4d &&
      signature[2] === 0x00 &&
      signature[3] === 0x2a)
  )
    return "image/tiff";
  if (
    signature[0] === 0x00 &&
    signature[1] === 0x00 &&
    signature[2] === 0x01 &&
    signature[3] === 0x00
  )
    return "image/x-icon";

  const text = buffer.toString("utf8", 0, Math.min(100, buffer.length));
  if (text.includes("<svg") || text.includes("<?xml")) return "image/svg+xml";

  const sigStr = String.fromCharCode(...signature);

  // === VIDEOS ===
  // MP4: look for 'ftyp' anywhere in first 64 bytes
  if (sigStr.includes("ftyp")) return "video/mp4";

  // WebM: 1A 45 DF A3
  if (
    signature[0] === 0x1a &&
    signature[1] === 0x45 &&
    signature[2] === 0xdf &&
    signature[3] === 0xa3
  )
    return "video/webm";

  // MKV: same as WebM technically
  if (
    signature[0] === 0x1a &&
    signature[1] === 0x45 &&
    signature[2] === 0xdf &&
    signature[3] === 0xa3
  )
    return "video/x-matroska";

  // AVI: 52 49 46 46 .... 41 56 49 20
  if (
    signature[0] === 0x52 &&
    signature[1] === 0x49 &&
    signature[2] === 0x46 &&
    signature[3] === 0x46 &&
    signature[8] === 0x41 &&
    signature[9] === 0x56 &&
    signature[10] === 0x49 &&
    signature[11] === 0x20
  )
    return "video/x-msvideo";

  // MOV / QuickTime: 00 00 00 ?? 66 74 79 70 71 74
  if (
    signature[4] === 0x66 &&
    signature[5] === 0x74 &&
    signature[6] === 0x79 &&
    signature[7] === 0x70 &&
    signature[8] === 0x71 &&
    signature[9] === 0x74
  )
    return "video/quicktime";
}

export function bufferToBase64DataUrl(buffer) {
  if (!buffer) return null;

  // Ensure buffer is a Buffer instance
  if (!Buffer.isBuffer(buffer)) {
    // If it's a Uint8Array or similar, convert to Buffer
    if (buffer instanceof Uint8Array) {
      buffer = Buffer.from(buffer);
    } else {
      console.warn("Expected Buffer, got:", typeof buffer);
      return null;
    }
  }

  try {
    // Detect MIME type from buffer signature
    const mime = detectMimeFromBuffer(buffer);

    // Convert buffer to base64
    const base64 = buffer.toString("base64");

    // Return the data URL
    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.error("Error in bufferToBase64DataUrl:", error);

    // Fallback: assume it's an image and use a generic mime type
    try {
      const base64 = buffer.toString("base64");
      return `data:image/jpeg;base64,${base64}`;
    } catch (fallbackError) {
      console.error("Fallback conversion also failed:", fallbackError);
      return null;
    }
  }
}
