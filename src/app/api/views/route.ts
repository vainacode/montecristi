import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    // Silently track internal view without external 404s
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
