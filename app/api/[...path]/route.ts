import { CONFIG } from "@/services/config";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, path: string[]) {
  const baseUrl = CONFIG.BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  if (!path?.length) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
  }

  const targetUrl =
    baseUrl.replace(/\/$/, "") +
    "/" +
    path.join("/") +
    (req.nextUrl.search || "");

  console.log(`Proxying API request to: ${targetUrl}`);

  /* -------------------------
     HEADER SANITIZATION
  -------------------------- */

  const headers = new Headers(req.headers);

  const hopByHopHeaders = [
    "connection",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "upgrade",
    "host",
    "expect",
  ];

  hopByHopHeaders.forEach((h) => headers.delete(h));

  /* -------------------------
     BODY HANDLING
  -------------------------- */

  let body: BodyInit | undefined = undefined;

  if (req.method !== "GET" && req.method !== "DELETE") {
    body = req.body ?? undefined;
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    duplex: body ? "half" : undefined,
  } as RequestInit & { duplex?: "half" });

  /* -------------------------
     RESPONSE SANITIZATION
  -------------------------- */

  const responseHeaders = new Headers(response.headers);

  const removeHeaders = [
    "connection",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length", // let Next compute
  ];

  removeHeaders.forEach((h) => responseHeaders.delete(h));

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

/* ================= ROUTE HANDLERS ================= */

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
