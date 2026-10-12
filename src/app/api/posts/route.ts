import { NextRequest, NextResponse } from "next/server";
import { getMontecristiPosts, getPosts } from "@/lib/wp";
import { sanitizeInput } from "@/lib/security";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const offset = parseInt(sanitizeInput(searchParams.get("offset") ?? "0"), 10) || 0;
  const per_page = parseInt(sanitizeInput(searchParams.get("per_page") ?? "18"), 10) || 18;
  const categoryRaw = sanitizeInput(searchParams.get("category") ?? "");
  const category = categoryRaw ? parseInt(categoryRaw, 10) : undefined;
  const source = searchParams.get("source") === "montecristi" ? "montecristi" : "primary";

  try {
    const validCategory = Number.isNaN(category) ? undefined : category;
    const posts = source === "montecristi"
      ? await getMontecristiPosts({ offset, per_page, category: validCategory })
      : await getPosts({ offset, per_page, category: validCategory });

    return NextResponse.json(posts, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
