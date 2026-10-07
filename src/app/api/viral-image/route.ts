/**
 * /api/viral-image — Generador dinámico de portadas limpias y de alto impacto para Facebook
 * Renders en 1200x675 (16:9) con composiciones fotográficas limpias, insignias sutiles y cintillo oficial.
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isSafeUrl } from "@/lib/security";
import { resolveMediaPath } from "@/lib/media";
import { renderHeadlineVector, renderBadgeVector, renderCintilloVector } from "@/lib/vector-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fetchImageBuffer(rawUrl: string): Promise<Buffer | null> {
  const url = rawUrl ? resolveMediaPath(rawUrl) : rawUrl;
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
  const badge = (req.nextUrl.searchParams.get("badge") || "").trim().toUpperCase();
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

  const buf2 = url2 ? await fetchImageBuffer(url2) : null;
  const buf3 = url3 ? await fetchImageBuffer(url3) : null;

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

    const escapeXml = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    const safeHeadline = escapeXml(headline);
    const safeBadge = escapeXml(badge);

    // ── 1. Divisor fino si es split (Vector puro) ──
    if (style === "split") {
      const splitSvg = Buffer.from(`
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadowSlight" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
            </filter>
          </defs>
          <polygon points="597,0 603,0 603,${bannerTop} 597,${bannerTop}" fill="#ffffff" opacity="0.95" filter="url(#shadowSlight)"/>
          <polygon points="599,0 601,0 601,${bannerTop} 599,${bannerTop}" fill="#BF1B23"/>
        </svg>
      `);
      compositeList.push({ input: splitSvg, left: 0, top: 0 });
    }

    // ── 2. Insignia en esquina superior izquierda (Trazados vectoriales <path>, CERO <text>) ──
    if (safeBadge) {
      const badgeObj = await renderBadgeVector(safeBadge, style === "play");
      compositeList.push({ input: badgeObj.buffer, left: 25, top: 22 });
    }

    // ── 3. Titular de Alto Impacto (Trazados vectoriales <path>, CERO <text>) ──
    if (safeHeadline) {
      const headlineObj = await renderHeadlineVector(safeHeadline);
      let headlineY: number;
      if (headlinePos === "top") {
        headlineY = 22;
      } else if (headlinePos === "center") {
        headlineY = Math.round(bannerTop / 2 - headlineObj.height / 2);
      } else {
        // "bottom" por defecto: sobre el cintillo sin tapar caras
        headlineY = bannerTop - headlineObj.height - 10;
      }
      compositeList.push({
        input: headlineObj.buffer,
        left: Math.round((width - headlineObj.width) / 2),
        top: headlineY,
      });
    }

    // ── 4. Cintillo Oficial Montecristi.net en la base (Trazados vectoriales <path>) ──
    const cintilloBuf = await renderCintilloVector(width, bannerH);
    compositeList.push({ input: cintilloBuf, left: 0, top: bannerTop });

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

  } catch (err) {
    console.error("[viral-image] Error generando imagen:", err);
    return NextResponse.json({ error: "Error al generar la imagen viral." }, { status: 500 });
  }
}
