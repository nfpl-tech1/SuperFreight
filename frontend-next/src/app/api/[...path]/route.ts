import { NextRequest } from "next/server";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function normalizeBackendOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value
    .trim()
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
}

function getBackendApiOrigin() {
  return (
    normalizeBackendOrigin(process.env.BACKEND_API_ORIGIN) ||
    normalizeBackendOrigin(process.env.NEXT_PUBLIC_API_URL) ||
    "http://localhost:8000"
  );
}

function buildBackendUrl(request: NextRequest, path: string[]) {
  const backendUrl = new URL(`/api/${path.join("/")}`, getBackendApiOrigin());
  backendUrl.search = request.nextUrl.search;
  return backendUrl;
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (
      !HOP_BY_HOP_HEADERS.has(normalizedKey) &&
      normalizedKey !== "origin"
    ) {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const method = request.method.toUpperCase();
    const backendUrl = buildBackendUrl(request, path);
    const headers = copyRequestHeaders(request);
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : new Uint8Array(await request.arrayBuffer());

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody =
      method === "HEAD" ? null : await response.arrayBuffer();

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API proxy request failed", error);

    return Response.json(
      {
        detail: "API proxy request failed",
      },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}
