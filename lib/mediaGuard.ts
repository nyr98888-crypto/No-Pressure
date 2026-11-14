/** Hard size caps (decoded bytes). */
export const MEDIA_LIMITS = {
  image: 4 * 1024 * 1024,
  av: 15 * 1024 * 1024,
} as const;

export type AllowedMediaMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/webm"
  | "audio/webm"
  | "audio/mp4"
  | "audio/mpeg";

const ALLOWED = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
]);

function startsWithBytes(buf: Uint8Array, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  return sig.every((b, i) => buf[offset + i] === b);
}

function asciiAt(buf: Uint8Array, offset: number, len: number): string {
  return String.fromCharCode(
    ...Array.from(buf.subarray(offset, offset + len))
  );
}

/** Detect dangerous text/markup/executable signatures first. */
function isRejectedSignature(buf: Uint8Array): string | null {
  // Skip leading whitespace for text probes
  let i = 0;
  while (i < buf.length && (buf[i] === 0x20 || buf[i] === 0x09 || buf[i] === 0x0a || buf[i] === 0x0d)) {
    i++;
  }
  const head = asciiAt(buf, i, Math.min(64, buf.length - i)).toLowerCase();
  if (
    head.startsWith("<?xml") ||
    head.startsWith("<svg") ||
    head.startsWith("<!doctype html") ||
    head.startsWith("<html") ||
    head.startsWith("<script") ||
    head.includes("<svg")
  ) {
    return "Rejected markup/SVG payload";
  }
  // PE / DOS MZ
  if (startsWithBytes(buf, [0x4d, 0x5a])) return "Rejected executable signature";
  // ELF
  if (startsWithBytes(buf, [0x7f, 0x45, 0x4c, 0x46])) {
    return "Rejected executable signature";
  }
  // Mach-O
  if (
    startsWithBytes(buf, [0xfe, 0xed, 0xfa, 0xce]) ||
    startsWithBytes(buf, [0xce, 0xfa, 0xed, 0xfe]) ||
    startsWithBytes(buf, [0xfe, 0xed, 0xfa, 0xcf]) ||
    startsWithBytes(buf, [0xcf, 0xfa, 0xed, 0xfe])
  ) {
    return "Rejected executable signature";
  }
  return null;
}

export function detectMimeFromMagic(buf: Uint8Array): AllowedMediaMime | null {
  if (isRejectedSignature(buf)) return null;

  // JPEG
  if (startsWithBytes(buf, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // PNG
  if (
    startsWithBytes(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }
  // WEBP: RIFF....WEBP
  if (
    startsWithBytes(buf, [0x52, 0x49, 0x46, 0x46]) &&
    asciiAt(buf, 8, 4) === "WEBP"
  ) {
    return "image/webp";
  }
  // EBML (WebM / Matroska) — treat as webm A/V; refine below via ftyp/codecs not available
  if (startsWithBytes(buf, [0x1a, 0x45, 0xdf, 0xa3])) {
    // Prefer video/webm; audio/webm shares container — caller may narrow by mode
    return "video/webm";
  }
  // MP4 / M4A: ....ftyp
  if (buf.length >= 12 && asciiAt(buf, 4, 4) === "ftyp") {
    const brand = asciiAt(buf, 8, 4).toLowerCase();
    if (brand.includes("m4a") || brand === "mp4a") return "audio/mp4";
    return "video/mp4";
  }
  // MP3: ID3 or frame sync
  if (asciiAt(buf, 0, 3) === "ID3") return "audio/mpeg";
  if (buf.length >= 2 && buf[0] === 0xff && (buf[1]! & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }

  return null;
}

function decodeDataUrl(dataUrl: string): { mimeHint: string; bytes: Uint8Array } | null {
  const m = /^data:([^;,]+)?((?:;[^,]*)*);base64,([\s\S]+)$/i.exec(dataUrl);
  if (!m) return null;
  const mimeHint = (m[1] || "").toLowerCase().trim();
  const b64 = m[3]!.replace(/\s/g, "");
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mimeHint, bytes };
  } catch {
    return null;
  }
}

export type MediaCheckResult =
  | { ok: true; mime: AllowedMediaMime; bytes: number }
  | { ok: false; status: 400 | 413 | 415; error: string };

/**
 * Zero-trust media check: ignore claimed file.type / extension; use magic bytes.
 * `kind` narrows image vs av size caps and webm audio vs video labeling.
 */
export function validateMediaDataUrl(
  dataUrl: string,
  kind: "image" | "video" | "audio" | "any"
): MediaCheckResult {
  if (!dataUrl.startsWith("data:")) {
    return { ok: false, status: 400, error: "Media must be a data URL" };
  }

  // Cheap pre-check on encoded length before decode
  const approxDecoded = Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
  const hardCap = kind === "image" ? MEDIA_LIMITS.image : MEDIA_LIMITS.av;
  if (approxDecoded > hardCap + 64_000) {
    return { ok: false, status: 413, error: "Payload Too Large" };
  }

  const decoded = decodeDataUrl(dataUrl);
  if (!decoded) {
    return { ok: false, status: 400, error: "Invalid media encoding" };
  }

  const rejected = isRejectedSignature(decoded.bytes);
  if (rejected) {
    return { ok: false, status: 415, error: rejected };
  }

  let mime = detectMimeFromMagic(decoded.bytes);
  if (!mime) {
    return { ok: false, status: 415, error: "Unsupported or spoofed media type" };
  }

  // WebM container used for both audio and video recordings
  if (mime === "video/webm" && kind === "audio") {
    mime = "audio/webm";
  }
  // MP4 container for audio
  if (mime === "video/mp4" && kind === "audio") {
    mime = "audio/mp4";
  }

  if (!ALLOWED.has(mime)) {
    return { ok: false, status: 415, error: "Media type not allowed" };
  }

  // Never trust the data-URL mime hint if it disagrees with magic
  if (
    decoded.mimeHint &&
    !decoded.mimeHint.startsWith(mime.split("/")[0]!) &&
    decoded.mimeHint !== mime
  ) {
    // Allow image/jpg alias etc. only when magic says jpeg
    const hintOk =
      (mime === "image/jpeg" &&
        (decoded.mimeHint === "image/jpg" || decoded.mimeHint === "image/jpeg")) ||
      decoded.mimeHint === mime ||
      (mime.endsWith("/webm") && decoded.mimeHint.endsWith("/webm")) ||
      (mime.endsWith("/mp4") && decoded.mimeHint.endsWith("/mp4"));
    if (!hintOk && decoded.mimeHint.includes("svg")) {
      return { ok: false, status: 415, error: "Rejected SVG content-type" };
    }
  }

  if (kind === "image" && !mime.startsWith("image/")) {
    return { ok: false, status: 415, error: "Expected image media" };
  }
  if (kind === "video" && !mime.startsWith("video/")) {
    return { ok: false, status: 415, error: "Expected video media" };
  }
  if (kind === "audio" && !mime.startsWith("audio/")) {
    return { ok: false, status: 415, error: "Expected audio media" };
  }

  const max = mime.startsWith("image/") ? MEDIA_LIMITS.image : MEDIA_LIMITS.av;
  if (decoded.bytes.byteLength > max) {
    return { ok: false, status: 413, error: "Payload Too Large" };
  }

  return { ok: true, mime, bytes: decoded.bytes.byteLength };
}

export function mediaKindForMode(mode: string): "image" | "video" | "audio" | "any" {
  if (mode === "photo") return "image";
  if (mode === "video") return "video";
  if (mode === "voice") return "audio";
  return "any";
}
