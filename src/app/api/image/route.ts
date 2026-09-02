/**
 * /api/image — Proxy de imágenes con MULTI-marca de agua automática y CINTILLO inferior permanente
 * Salida en formato WEBP (Alta Calidad) para descargas y visualización.
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { siteConfig } from "@/config/site";
import { isSafeUrl } from "@/lib/security";

// Usamos el logo vectorial oficial para la marca de agua
const LOGO_SVG = join(process.cwd(), "public", "logo.svg");
const LOGO_BLANCO = join(process.cwd(), "public", "logoBlanco.png");
const LOGO_PATH = existsSync(LOGO_SVG) ? LOGO_SVG : (existsSync(LOGO_BLANCO) ? LOGO_BLANCO : join(process.cwd(), "public", "logo.png"));

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") || "montecristi";
  const download = req.nextUrl.searchParams.get("download") === "1";

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
      next: { revalidate: 0 },
    });
    if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
    imageBuffer = Buffer.from(await fetchRes.arrayBuffer());
  } catch (err) {
    return NextResponse.json({ error: "Error al obtener la imagen." }, { status: 502 });
  }

  // Si no hay logo o está desactivado, devolver original en WebP
  if (!siteConfig.watermark.enabled || !existsSync(LOGO_PATH)) {
    try {
      const originalWebp = await sharp(imageBuffer).webp({ quality: 90 }).toBuffer();
      return new NextResponse(new Uint8Array(originalWebp), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "no-store",
          ...(download ? { "Content-Disposition": `attachment; filename="${safeFilename}.webp"` } : { "Content-Disposition": "inline" }),
        },
      });
    } catch {
      return new NextResponse(new Uint8Array(imageBuffer), { headers: { "Content-Type": "image/jpeg" } });
    }
  }

  try {
    const mainImage = sharp(imageBuffer);
    const meta = await mainImage.metadata();
    const w = meta.width ?? 1200;
    const h = meta.height ?? 800;

    // Configuración Multi-Watermark EXTRA LARGE
    const logoWidth = Math.round(w * 0.50);
    const opacityValue = 0.20;

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

    const compositeList: sharp.OverlayOptions[] = positions.map(pos => ({
      input: logoProcessed,
      left: Math.max(0, pos.left),
      top: Math.max(0, pos.top),
      blend: "over" as const
    }));

    // ── Cintillo Oficial Inferior (Marca de Agua Permanente en la base de la foto) ──
    const bannerH = Math.max(44, Math.round(h * 0.08));
    const bannerTop = h - bannerH;
    const cintilloSvg = Buffer.from(`
      <svg width="${w}" height="${bannerH}" viewBox="0 0 ${w} ${bannerH}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${w}" height="${bannerH}" fill="#042564" />
        <polygon points="${w - bannerH * 2.8},0 ${w},0 ${w},${bannerH} ${w - bannerH * 3.5},${bannerH}" fill="#BF1B23" />
        <circle cx="${w - bannerH * 0.85}" cy="${bannerH / 2}" r="${bannerH * 0.28}" fill="#ffffff" />
        <circle cx="${w - bannerH * 0.85}" cy="${bannerH / 2}" r="${bannerH * 0.15}" fill="#BF1B23" />
        <text x="${w / 2}" y="${bannerH * 0.65}" font-family="system-ui, -apple-system, sans-serif" font-size="${bannerH * 0.44}px" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5px">
          MONTECRISTI<tspan font-weight="700" fill="#e2e8f0">.NET</tspan>
        </text>
      </svg>
    `);

    compositeList.push({
      input: cintilloSvg,
      left: 0,
      top: bannerTop,
      blend: "over" as const
    });

    const finalBuffer = await mainImage
      .composite(compositeList)
      .webp({ quality: 90, effort: 6 })
      .toBuffer();

    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
        ...(download ? { "Content-Disposition": `attachment; filename="${safeFilename}.webp"` } : { "Content-Disposition": "inline" }),
      },
    });

  } catch (err) {
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: { 
        "Content-Type": "image/webp", 
        ...(download ? { "Content-Disposition": `attachment; filename="${safeFilename}.webp"` } : { "Content-Disposition": "inline" }),
      },
    });
  }
}
