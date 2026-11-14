import { HEAT_COLORS, type HeatLevel } from "./types";

/** Strip emoji / symbol fallbacks so PNG never paints OS emoji fonts. */
function sanitizeTypography(input: string) {
  return input
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\uFE0F\u200D]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function triggerPngDownload(dataUrl: string, filename: string) {
  const safeName = filename.toLowerCase().endsWith(".png")
    ? filename
    : `${filename.replace(/\.[^.]+$/, "") || "no-pressure-card"}.png`;

  const binary = atob(dataUrl.split(",")[1] || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/png" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

type StampKind =
  | "open"
  | "locked"
  | "chickened"
  | "cooked"
  | "certified"
  | "capped"
  | "scoreboard"
  | "generic";

function classifyStamp(stamp: string): StampKind {
  const s = stamp.toUpperCase();
  if (s.includes("SCOREBOARD")) return "scoreboard";
  if (s.includes("CHICKEN")) return "chickened";
  if (s.includes("CERTIFIED") || s.includes("NO CAP")) return "certified";
  if (s.includes("COOKED") || s.includes("PROVED")) return "cooked";
  if (s.includes("ALL CAP") || s.includes("WEAK")) return "capped";
  if (s.includes("LOCKED")) return "locked";
  if (s.includes("BET YOU")) return "open";
  return "generic";
}

/** Uniform-stroke vector icons (lucide-style) drawn on canvas — no emoji fonts. */
function drawStampIcon(
  ctx: CanvasRenderingContext2D,
  kind: StampKind,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.translate(-12, -12);
  ctx.strokeStyle = color;
  ctx.fillStyle = "transparent";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (kind === "open") {
    // Eye
    ctx.beginPath();
    ctx.moveTo(2, 12);
    ctx.bezierCurveTo(6, 6, 10, 4, 12, 4);
    ctx.bezierCurveTo(14, 4, 18, 6, 22, 12);
    ctx.bezierCurveTo(18, 18, 14, 20, 12, 20);
    ctx.bezierCurveTo(10, 20, 6, 18, 2, 12);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "locked") {
    // Zap
    ctx.beginPath();
    ctx.moveTo(13, 2);
    ctx.lineTo(4, 14);
    ctx.lineTo(11, 14);
    ctx.lineTo(11, 22);
    ctx.lineTo(20, 10);
    ctx.lineTo(13, 10);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === "chickened") {
    // Alert triangle
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.lineTo(22, 20);
    ctx.lineTo(2, 20);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 9);
    ctx.lineTo(12, 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 17, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  } else if (kind === "cooked") {
    // Check circle
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(11, 15);
    ctx.lineTo(16, 9);
    ctx.stroke();
  } else if (kind === "certified" || kind === "scoreboard") {
    // Crown
    ctx.beginPath();
    ctx.moveTo(2, 18);
    ctx.lineTo(4, 8);
    ctx.lineTo(8, 12);
    ctx.lineTo(12, 5);
    ctx.lineTo(16, 12);
    ctx.lineTo(20, 8);
    ctx.lineTo(22, 18);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === "capped") {
    // Ban
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(18, 18);
    ctx.stroke();
  } else {
    // Sparkles / generic mark
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.lineTo(13.5, 9);
    ctx.lineTo(19, 10.5);
    ctx.lineTo(13.5, 12);
    ctx.lineTo(12, 18);
    ctx.lineTo(10.5, 12);
    ctx.lineTo(5, 10.5);
    ctx.lineTo(10.5, 9);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

function drawStampBadge(
  ctx: CanvasRenderingContext2D,
  stampRaw: string,
  heat: string,
  x: number,
  y: number
) {
  const stamp = sanitizeTypography(stampRaw).toUpperCase() || "NO PRESSURE";
  const kind = classifyStamp(stamp);
  const chicken = kind === "chickened";
  const stroke = chicken ? "#FFD600" : heat;
  const fill = chicken ? "#FFD600" : "rgba(0,0,0,0.72)";
  const textColor = chicken ? "#111111" : "#FFFFFF";
  const iconColor = chicken ? "#111111" : "#FFFFFF";

  ctx.save();
  ctx.font = "900 22px Bebas Neue, Impact, Arial Black, sans-serif";
  const textW = Math.min(ctx.measureText(stamp).width, 360);
  const padX = 18;
  const iconSlot = 34;
  const bw = Math.max(220, textW + padX * 2 + iconSlot);
  const bh = 72;

  // Sharp dashed badge frame
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 10;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 5;
  roundRect(ctx, x, y, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = chicken ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  roundRect(ctx, x + 6, y + 6, bw - 12, bh - 12, 5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  drawStampIcon(ctx, kind, x + 28, y + bh / 2, 22, iconColor);

  ctx.fillStyle = textColor;
  ctx.font = "900 22px Bebas Neue, Impact, Arial Black, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(stamp.slice(0, 32), x + iconSlot + 14, y + bh / 2 + 1);
  ctx.restore();
}

/** Draw a clean shareable PNG from a dare/scoreboard card element onto canvas. */
export async function downloadCardPng(
  el: HTMLElement,
  filename = "no-pressure-dare.png"
) {
  const level = (Number(el.dataset.npLevel || "1") || 1) as HeatLevel;
  const heat = HEAT_COLORS[level] || HEAT_COLORS[1];
  const stamp = sanitizeTypography(
    el.dataset.npStamp ||
      el.querySelector("[data-stamp-text]")?.textContent?.trim() ||
      ""
  );
  const title = sanitizeTypography(
    el.dataset.npTitle ||
      el.querySelector("[data-export-title]")?.textContent?.trim() ||
      "NO PRESSURE"
  );
  const body = sanitizeTypography(
    el.dataset.npBody ||
      el.querySelector("[data-export-body]")?.textContent?.trim() ||
      el.innerText.replace(/\s+/g, " ").trim().slice(0, 280)
  );
  const mediaImg = el.querySelector("img") as HTMLImageElement | null;

  const W = 1080;
  const H = mediaImg ? 1600 : 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  // Obsidian base
  ctx.fillStyle = "#05070D";
  ctx.fillRect(0, 0, W, H);

  // Outer heat glow
  ctx.save();
  ctx.shadowColor = heat;
  ctx.shadowBlur = 48;
  ctx.strokeStyle = heat;
  ctx.lineWidth = 10;
  roundRect(ctx, 36, 36, W - 72, H - 72, 42);
  ctx.stroke();
  ctx.restore();

  // Inner card
  const grad = ctx.createLinearGradient(0, 60, 0, H - 60);
  grad.addColorStop(0, "#121826");
  grad.addColorStop(1, "#05070D");
  ctx.fillStyle = grad;
  roundRect(ctx, 56, 56, W - 112, H - 112, 34);
  ctx.fill();

  // Specular top edge
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 70);
  ctx.lineTo(W - 90, 70);
  ctx.stroke();

  // Brand — crisp Latin fonts only
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "800 28px Bebas Neue, Impact, Arial Black, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("NO PRESSURE", 96, 120);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 56px Bebas Neue, Impact, Arial Black, sans-serif";
  ctx.fillText(title.slice(0, 42), 96, 190);

  // Level pill
  ctx.fillStyle = heat;
  roundRect(ctx, 96, 220, 170, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#05070D";
  ctx.font = "900 26px Manrope, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`LVL ${level}`, 181, 250);
  ctx.textAlign = "left";

  let y = 300;

  if (mediaImg?.src) {
    try {
      const img = await loadImage(mediaImg.currentSrc || mediaImg.src);
      const maxW = W - 192;
      const maxH = 720;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (W - dw) / 2;
      ctx.save();
      roundRect(ctx, dx, y, dw, dh, 24);
      ctx.clip();
      ctx.drawImage(img, dx, y, dw, dh);
      ctx.restore();
      y += dh + 40;
    } catch {
      /* skip media */
    }
  }

  // Body text
  ctx.fillStyle = "rgba(244,247,255,0.95)";
  ctx.font = "600 34px Manrope, Arial, sans-serif";
  y = wrapText(ctx, body, 96, y, W - 192, 44) + 36;

  // Stamp badge with vector icon
  if (stamp) {
    const stampY = Math.min(y + 12, H - 180);
    drawStampBadge(ctx, stamp, heat, W - 420, stampY);
  }

  // Footer brand
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "800 22px Bebas Neue, Impact, Arial Black, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("NO PRESSURE", W - 96, H - 88);

  const dataUrl = canvas.toDataURL("image/png");
  triggerPngDownload(dataUrl, filename);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
      if (cy > y + lineHeight * 8) break;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}
