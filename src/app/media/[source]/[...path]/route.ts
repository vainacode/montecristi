/**
 * /media/<clave>/<ruta> — sirve las fotos de las fuentes sin exponer su dominio.
 * Solo se permiten archivos bajo /wp-content/ o imágenes, para que no sea un proxy abierto.
 */
import { NextRequest, NextResponse } from "next/server";
import { mediaOrigins } from "@/config/sources";
import { isMediaPath } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ source: string; path: string[] }> }) {
  const { source, path } = await params;
  const origin = mediaOrigins[source];
  const cleanPath = path.map((p) => encodeURIComponent(decodeURIComponent(p))).join("/");

  if (!origin || !isMediaPath(`/${cleanPath}`) || path.some((p) => p === ".." || p === ".")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const upstream = await fetch(`${origin}/${cleanPath}${req.nextUrl.search}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      next: { revalidate: 86400 },
    });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Not found", { status: upstream.status === 404 ? 404 : 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Bad gateway", { status: 502 });
  }
}
