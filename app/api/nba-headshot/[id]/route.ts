import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nbaId = parseInt(id, 10);
  if (!nbaId || isNaN(nbaId)) return new NextResponse(null, { status: 400 });

  try {
    const res = await fetch(
      `https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`,
      {
        headers: {
          Referer: "https://www.nba.com/",
          "User-Agent": "Mozilla/5.0 (compatible; NBA-Headshot-Proxy/1.0)",
        },
      }
    );

    if (!res.ok) return new NextResponse(null, { status: 404 });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
