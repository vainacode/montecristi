/**
 * /api/image — Proxy de imágenes con marca de agua y CINTILLO oficial de Montecristi.net
 * Soporta formatos WEBP (para web/descargas) y PNG (para copiado directo a portapapeles).
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { siteConfig } from "@/config/site";
import { isSafeUrl } from "@/lib/security";
import { renderCintilloVector } from "@/lib/vector-text";

// Usamos el logo vectorial oficial para la marca de agua
const LOGO_SVG = join(process.cwd(), "public", "logo.svg");
const LOGO_BLANCO = join(process.cwd(), "public", "logoBlanco.png");
const LOGO_PATH = existsSync(LOGO_SVG) ? LOGO_SVG : (existsSync(LOGO_BLANCO) ? LOGO_BLANCO : join(process.cwd(), "public", "logo.png"));

// Extraer el icono del logo SVG para el cintillo
let cachedIconSvg = "";
try {
  if (existsSync(LOGO_SVG)) {
    const raw = readFileSync(LOGO_SVG, "utf8");
    const match = raw.match(/<g id="icono">([\s\S]*?)<\/g>/);
    if (match) cachedIconSvg = match[1];
  }
} catch {
  // Fallback si no se puede leer
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") || "montecristi";
  const download = req.nextUrl.searchParams.get("download") === "1";
  const format = req.nextUrl.searchParams.get("format") || "webp"; // "png" | "webp"
  const cintilloOnly = req.nextUrl.searchParams.get("cintilloOnly") === "1" || req.nextUrl.searchParams.get("cintillo") === "1";

  if (!rawUrl || !isSafeUrl(rawUrl)) {
    return NextResponse.json({ error: "URL inválida o no permitida." }, { status: 403 });
  }

  // Sanitize title for filename
  const safeFilename = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let imageBuffer: Buffer;
  try {
    const fetchRes = await fetch(rawUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (MontecristiBot/1.0)", "Referer": new URL(rawUrl).origin },
      next: { revalidate: 3600 },
    });
    if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
    imageBuffer = Buffer.from(await fetchRes.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Error al obtener la imagen." }, { status: 502 });
  }

  const isPng = format.toLowerCase() === "png";
  const contentType = isPng ? "image/png" : "image/webp";
  const ext = isPng ? "png" : "webp";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": contentType,
    "Cache-Control": download ? "no-store" : "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    ...(download ? { "Content-Disposition": `attachment; filename="${safeFilename}.${ext}"` } : { "Content-Disposition": "inline" }),
  };

  try {
    const mainImage = sharp(imageBuffer);
    const meta = await mainImage.metadata();
    const w = meta.width ?? 1200;
    const h = meta.height ?? 800;

    const compositeList: sharp.OverlayOptions[] = [];

    // Si NO es solo cintillo y watermark está activado, incluir logos de agua centrales
    if (!cintilloOnly && siteConfig.watermark.enabled && existsSync(LOGO_PATH)) {
      const logoWidth = Math.round(w * 0.45);
      const opacityValue = 0.18;

      const logoSvg = readFileSync(LOGO_PATH);
      const logoProcessed = await sharp(logoSvg)
        .resize({ width: logoWidth })
        .composite([{
          input: Buffer.from([255, 255, 255, Math.round(opacityValue * 255)]),
          tile: true,
          blend: 'dest-in',
          raw: { width: 1, height: 1, channels: 4 }
        }])
        .png()
        .toBuffer();

      const logoMeta = await sharp(logoProcessed).metadata();
      const logoW = logoMeta.width ?? 100;
      const logoH = logoMeta.height ?? 40;

      const positions = [
        { left: Math.round(w * 0.1), top: Math.round(h * 0.15) },
        { left: Math.round((w - logoW) / 2), top: Math.round((h - logoH) / 2) },
        { left: Math.round(w * 0.9 - logoW), top: Math.round(h * 0.85 - logoH) }
      ];

      for (const pos of positions) {
        compositeList.push({
          input: logoProcessed,
          left: Math.max(0, pos.left),
          top: Math.max(0, pos.top),
          blend: "over"
        });
      }
    }

    // ── Cintillo Oficial Inferior (Marca de Agua Permanente en la base de la foto) ──
    const bannerH = Math.max(44, Math.round(h * 0.08));
    const bannerTop = h - bannerH;

    const cintilloBuf = await renderCintilloVector(w, bannerH, cachedIconSvg);

    compositeList.push({
      input: cintilloBuf,
      left: 0,
      top: bannerTop,
      blend: "over"
    });

    let finalBuffer: Buffer;
    if (isPng) {
      finalBuffer = await mainImage
        .composite(compositeList)
        .png({ compressionLevel: 6 })
        .toBuffer();
    } else {
      finalBuffer = await mainImage
        .composite(compositeList)
        .webp({ quality: 90, effort: 6 })
        .toBuffer();
    }

    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: corsHeaders,
    });

  } catch {
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: corsHeaders,
    });
  }
}
