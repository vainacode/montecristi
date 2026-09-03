/**
 * /api/viral-image — Generador dinámico de portadas limpias y de alto impacto para Facebook
 * Renders en 1200x675 (16:9) con composiciones fotográficas limpias, insignias sutiles y cintillo oficial.
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { isSafeUrl } from "@/lib/security";
import { getViralFontBase64 } from "@/lib/viral-font";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGO_SVG = join(process.cwd(), "public", "logo.svg");

let cachedIconSvg = "";
try {
  if (existsSync(LOGO_SVG)) {
    const raw = readFileSync(LOGO_SVG, "utf8");
    const match = raw.match(/<g id="icono">([\s\S]*?)<\/g>/);
    if (match) cachedIconSvg = match[1];
  }
} catch {}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  if (!url || !isSafeUrl(url)) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (MontecristiBot/1.0)", "Referer": new URL(url).origin },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url1 = req.nextUrl.searchParams.get("url1") || "";
  const url2 = req.nextUrl.searchParams.get("url2") || "";
  const url3 = req.nextUrl.searchParams.get("url3") || "";
  const style = req.nextUrl.searchParams.get("style") || (url2 ? "split" : "single");
  const headline = (req.nextUrl.searchParams.get("headline") || "").trim().toUpperCase();
  const headlinePos = (req.nextUrl.searchParams.get("headlinePos") || "bottom").toLowerCase();
  const subheadline = (req.nextUrl.searchParams.get("subheadline") || "").trim();
  const badge = (req.nextUrl.searchParams.get("badge") || "").trim().toUpperCase();
  const quote = (req.nextUrl.searchParams.get("quote") || "").trim();
  const quoteAuthor = (req.nextUrl.searchParams.get("author") || "").trim();
  const format = (req.nextUrl.searchParams.get("format") || "webp").toLowerCase();
  const download = req.nextUrl.searchParams.get("download") === "1";
  const title = req.nextUrl.searchParams.get("title") || "portada-facebook";

  const isPng = format === "png";
  const contentType = isPng ? "image/png" : "image/webp";
  const ext = isPng ? "png" : "webp";

  const safeFilename = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": contentType,
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    ...(download ? { "Content-Disposition": `attachment; filename="${safeFilename}.${ext}"` } : { "Content-Disposition": "inline" }),
  };

  const width = 1200;
  const height = 675; // 16:9

  let buf1 = await fetchImageBuffer(url1);
  if (!buf1) {
    buf1 = await sharp({
      create: { width, height, channels: 3, background: { r: 15, g: 23, b: 42 } }
    }).png().toBuffer();
  }

  let buf2 = url2 ? await fetchImageBuffer(url2) : null;
  let buf3 = url3 ? await fetchImageBuffer(url3) : null;

  try {
    const compositeList: sharp.OverlayOptions[] = [];

    // 1. Manejo de imágenes de fondo (Limpio y centrado)
    if (style === "split" && buf2) {
      const leftResized = await sharp(buf1)
        .resize(600, height, { fit: "cover", position: "center" })
        .toBuffer();

      const rightResized = await sharp(buf2)
        .resize(600, height, { fit: "cover", position: "center" })
        .toBuffer();

      compositeList.push({ input: leftResized, left: 0, top: 0 });
      compositeList.push({ input: rightResized, left: 600, top: 0 });
    } else if (style === "circle" && buf2) {
      // Foto 1 a la izquierda (50%)
      const leftResized = await sharp(buf1)
        .resize(600, height, { fit: "cover", position: "center" })
        .toBuffer();

      // Foto 2 a la derecha (50%)
      const rightResized = await sharp(buf2)
        .resize(600, height, { fit: "cover", position: "center" })
        .toBuffer();

      compositeList.push({ input: leftResized, left: 0, top: 0 });
      compositeList.push({ input: rightResized, left: 600, top: 0 });

      // Foto 3 en el CÍRCULO CENTRAL (Tercer protagonista del conflicto)
      const targetCircleBuf = buf3 || buf2;
      const circleSize = 230;
      const ringPadding = 16;
      const totalCircleSize = circleSize + ringPadding;

      const innerMask = Buffer.from(`
        <svg width="${circleSize}" height="${circleSize}">
          <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2 - 4}" fill="#ffffff"/>
        </svg>
      `);

      const circleMask = Buffer.from(`
        <svg width="${totalCircleSize}" height="${totalCircleSize}">
          <defs>
            <filter id="circleDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.95"/>
            </filter>
          </defs>
          <g filter="url(#circleDropShadow)">
            <circle cx="${totalCircleSize / 2}" cy="${totalCircleSize / 2}" r="${circleSize / 2 + 6}" fill="#ffffff"/>
            <circle cx="${totalCircleSize / 2}" cy="${totalCircleSize / 2}" r="${circleSize / 2 + 2}" fill="#BF1B23"/>
          </g>
        </svg>
      `);

      const circleInner = await sharp(targetCircleBuf)
        .resize(circleSize, circleSize, { fit: "cover", position: "top" })
        .composite([{ input: innerMask, blend: "dest-in" }])
        .png()
        .toBuffer();

      const circleFinal = await sharp(circleMask)
        .composite([{ input: circleInner, left: Math.round(ringPadding / 2), top: Math.round(ringPadding / 2) }])
        .png()
        .toBuffer();

      const bannerH = 54;
      const bannerTop = height - bannerH;
      compositeList.push({
        input: circleFinal,
        left: Math.round(600 - totalCircleSize / 2),
        top: Math.round(bannerTop / 2 - totalCircleSize / 2),
      });
    } else {
      // Foto única completa
      const singleResized = await sharp(buf1)
        .resize(width, height, { fit: "cover", position: "center" })
        .toBuffer();
      compositeList.push({ input: singleResized, left: 0, top: 0 });
    }

    // ── Cintillo Oficial Montecristi.net en la base ──
    const bannerH = 54;
    const bannerTop = height - bannerH;

    const iconSize = Math.round(bannerH * 0.60);
    const iconY = Math.round((bannerH - iconSize) / 2);
    const textFontSize = Math.round(bannerH * 0.40);
    const textY = Math.round(bannerH * 0.66);

    const textWidthApprox = Math.round(15 * 0.62 * textFontSize);
    const gap = Math.round(textFontSize * 0.45);
    const groupWidth = iconSize + gap + textWidthApprox;
    const rightBannerWidth = Math.round(bannerH * 2.8);
    const availableCenter = (width - rightBannerWidth / 2);
    const startX = Math.round((availableCenter - groupWidth) / 2);
    const textX = startX + iconSize + gap;

    const escapeXml = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    const safeHeadline = escapeXml(headline);
    const safeSub = escapeXml(subheadline);
    const safeBadge = escapeXml(badge);
    const safeQuote = escapeXml(quote);
    const safeAuthor = escapeXml(quoteAuthor);

    // Dynamic SVG Overlay — LIMPIO Y CON FUENTE EMBEBIDA (EVITA '[]' EN LINUX/VERCEL)
    const fontBase64 = getViralFontBase64();

    const overlaySvg = Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${fontBase64 ? `
          <style>
            @font-face {
              font-family: 'ViralFont';
              src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
              font-weight: 900;
              font-style: normal;
            }
            .viral-font {
              font-family: 'ViralFont', Roboto, DejaVu Sans, Arial, sans-serif;
            }
          </style>
          ` : `
          <style>
            .viral-font {
              font-family: Roboto, DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            }
          </style>
          `}
          <filter id="shadowSlight" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
          <filter id="shadowHeavy" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.95"/>
          </filter>
        </defs>

        ${style === "split" ? `
        <!-- Divisor fino y elegante entre fotos -->
        <polygon points="597,0 603,0 603,${bannerTop} 597,${bannerTop}" fill="#ffffff" opacity="0.95" filter="url(#shadowSlight)"/>
        <polygon points="599,0 601,0 601,${bannerTop} 599,${bannerTop}" fill="#BF1B23"/>
        ` : ''}

        ${safeBadge ? `
        <!-- Insignia mínima y discreta en esquina superior izquierda -->
        <g filter="url(#shadowSlight)">
          <rect x="25" y="22" width="${Math.max(110, safeBadge.length * 10 + 35)}" height="32" rx="6" fill="#BF1B23" fill-opacity="0.92" stroke="#ffffff" stroke-width="1"/>
          ${style === "play" ? `
          <polygon points="38,32 48,38 38,44" fill="#FFFFFF"/>
          <text x="54" y="43" class="viral-font" font-size="12px" font-weight="900" fill="#ffffff" letter-spacing="1px">
            ${safeBadge}
          </text>
          ` : `
          <circle cx="38" cy="38" r="4.5" fill="#FFE600"/>
          <text x="49" y="43" class="viral-font" font-size="12px" font-weight="900" fill="#ffffff" letter-spacing="1px">
            ${safeBadge}
          </text>
          `}
        </g>
        ` : ''}

        <!-- TITULAR AUTO-AJUSTABLE CUBIERTO 100% EN AMARILLO -->
        ${(() => {
          if (!safeHeadline) return "";
          const clean = safeHeadline.trim();

          const calcBoxY = (boxH: number) => {
            if (headlinePos === "top") return 22;
            if (headlinePos === "center") return Math.round(bannerTop / 2 - boxH / 2);
            // "bottom" por defecto: descansa elegantemente sobre el cintillo oficial sin tapar caras
            return Math.round(bannerTop - boxH - 10);
          };

          if (clean.length <= 32) {
            const fontSize = clean.length > 25 ? 26 : 30;
            const textW = Math.round(clean.length * fontSize * 0.62);
            const boxW = Math.min(width - 60, Math.max(360, textW + 65));
            const boxH = 58;
            const boxX = Math.round((width - boxW) / 2);
            const boxY = calcBoxY(boxH);

            return `
            <g filter="url(#shadowHeavy)">
              <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="10" fill="#FFE600" stroke="#000000" stroke-width="3"/>
              <text x="600" y="${boxY + 39}" class="viral-font" font-size="${fontSize}px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5px">
                ${clean}
              </text>
            </g>
            `;
          } else {
            const words = clean.split(" ");
            const line1: string[] = [];
            const line2: string[] = [];
            let curLen = 0;
            const half = clean.length / 2;

            for (const w of words) {
              if (curLen + w.length <= half || line1.length === 0) {
                line1.push(w);
                curLen += w.length + 1;
              } else {
                line2.push(w);
              }
            }

            const l1 = line1.join(" ");
            const l2 = line2.join(" ");
            const maxChars = Math.max(l1.length, l2.length);
            const fontSize = 24;
            const textW = Math.round(maxChars * fontSize * 0.62);
            const boxW = Math.min(width - 60, Math.max(380, textW + 65));
            const boxH = 92;
            const boxX = Math.round((width - boxW) / 2);
            const boxY = calcBoxY(boxH);

            return `
            <g filter="url(#shadowHeavy)">
              <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="12" fill="#FFE600" stroke="#000000" stroke-width="3.5"/>
              <text x="600" y="${boxY + 38}" class="viral-font" font-size="${fontSize}px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5px">
                ${l1}
              </text>
              <text x="600" y="${boxY + 74}" class="viral-font" font-size="${fontSize}px" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="0.5px">
                ${l2}
              </text>
            </g>
            `;
          }
        })()}

        ${safeQuote ? `
        <!-- Cita opcional en la parte inferior si se especifica -->
        <g filter="url(#shadowSlight)">
          <rect x="35" y="${height - bannerH - 60}" width="650" height="48" rx="8" fill="#042564" fill-opacity="0.9" stroke="#FFE600" stroke-width="1.5"/>
          <text x="50" y="${height - bannerH - 36}" class="viral-font" font-size="14px" font-weight="900" fill="#FFE600">
            «${safeQuote}»
          </text>
          ${safeAuthor ? `
          <text x="50" y="${height - bannerH - 18}" class="viral-font" font-size="11px" font-weight="700" fill="#E2E8F0">
            — ${safeAuthor}
          </text>
          ` : ''}
        </g>
        ` : ''}

        <!-- Cintillo Oficial Montecristi.net en la base (Siempre nítido) -->
        <g>
          <rect x="0" y="${bannerTop}" width="${width}" height="${bannerH}" fill="#042564" />
          <polygon points="${width - bannerH * 2.8},${bannerTop} ${width},${bannerTop} ${width},${height} ${width - bannerH * 3.5},${height}" fill="#BF1B23" />
          <circle cx="${width - bannerH * 0.85}" cy="${bannerTop + bannerH / 2}" r="${bannerH * 0.28}" fill="#ffffff" />
          <circle cx="${width - bannerH * 0.85}" cy="${bannerTop + bannerH / 2}" r="${bannerH * 0.15}" fill="#BF1B23" />
          
          ${cachedIconSvg ? `
          <svg x="${startX}" y="${bannerTop + iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 23010 34725">
            <g>${cachedIconSvg}</g>
          </svg>
          ` : ''}
          
          <text x="${cachedIconSvg ? textX : Math.round(availableCenter / 2)}" y="${bannerTop + textY}" class="viral-font" font-size="${textFontSize}px" font-weight="900" fill="#ffffff" text-anchor="${cachedIconSvg ? "start" : "middle"}" letter-spacing="1px">
            MONTECRISTI<tspan font-weight="700" fill="#e2e8f0">.NET</tspan>
          </text>
        </g>
      </svg>
    `);

    compositeList.push({ input: overlaySvg, left: 0, top: 0 });

    const baseSharp = sharp({
      create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } }
    });

    let finalBuffer: Buffer;
    if (isPng) {
      finalBuffer = await baseSharp
        .composite(compositeList)
        .png({ quality: 95 })
        .toBuffer();
    } else {
      finalBuffer = await baseSharp
        .composite(compositeList)
        .webp({ quality: 90, effort: 5 })
        .toBuffer();
    }

    return new NextResponse(new Uint8Array(finalBuffer), { headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({ error: "Error al generar imagen viral: " + (err?.message || "") }, { status: 500 });
  }
}
