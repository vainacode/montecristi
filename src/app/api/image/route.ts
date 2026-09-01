/**
 * /api/image — Proxy de imágenes con MULTI-marca de agua automática (Protección Total)
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
    const opacityValue = 0.20; // Mantener el valor que puso el usuario

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

    const compositeList = positions.map(pos => ({
      input: logoProcessed,
      left: Math.max(0, pos.left),
      top: Math.max(0, pos.top),
      blend: "over" as const
    }));

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
