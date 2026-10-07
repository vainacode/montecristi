import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/wp";
import { sanitizeInput } from "@/lib/security";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  // Acotados: WordPress rechaza per_page > 100 y un offset enorme solo genera carga inútil.
  const offset = Math.min(Math.max(parseInt(sanitizeInput(searchParams.get("offset") ?? "0"), 10) || 0, 0), 500);
  const per_page = Math.min(Math.max(parseInt(sanitizeInput(searchParams.get("per_page") ?? "18"), 10) || 18, 1), 30);
  const categoryRaw = sanitizeInput(searchParams.get("category") ?? "");
  const parsedCategory = categoryRaw ? parseInt(categoryRaw, 10) : NaN;
  const category = Number.isFinite(parsedCategory) && parsedCategory > 0 ? parsedCategory : undefined;

  try {
    const posts = await getPosts({
      offset,
      per_page,
      category,
    });

    return NextResponse.json(posts, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
