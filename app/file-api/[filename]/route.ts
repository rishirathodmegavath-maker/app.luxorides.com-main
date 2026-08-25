import { CONFIG } from "@/services/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ filename: string }> }
) {
  const { filename } = await ctx.params;

  const baseUrl = CONFIG.BASE_URL;

  if (!baseUrl) {
    return new NextResponse("API base URL not configured", { status: 500 });
  }

  if (!filename) {
    return new NextResponse("Missing filename", { status: 400 });
  }

  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/file/${encodeURIComponent(
    filename
  )}`;

  const upstream = await fetch(upstreamUrl, {
    headers: { Accept: "*/*" },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new NextResponse("File not found", {
      status: upstream.status,
    });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ??
        "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}