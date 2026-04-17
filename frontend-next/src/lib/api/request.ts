import { clearStoredToken, getStoredToken, storeToken } from "@/lib/authToken";

const API_BASE = "/api";
let refreshInFlight: Promise<string | null> | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshAccessToken() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      clearStoredToken();
      return null;
    }

    const payload = (await res.json()) as {
      access_token?: string;
    };

    if (!payload.access_token) {
      clearStoredToken();
      return null;
    }

    storeToken(payload.access_token);
    return payload.access_token;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function executeRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const token = getStoredToken();
  const method = (options.method ?? "GET").toUpperCase();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: options.cache ?? (method === "GET" ? "no-store" : undefined),
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const shouldTryRefresh =
      res.status === 401 &&
      allowRefresh &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/sso") &&
      !path.startsWith("/auth/refresh");

    if (shouldTryRefresh) {
      const refreshedToken = await refreshAccessToken();

      if (refreshedToken) {
        return executeRequest<T>(path, options, false);
      }
    }

    const err = await res
      .json()
      .catch(() => ({ detail: res.statusText, message: res.statusText }));
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/sso") &&
      !path.startsWith("/auth/refresh")
    ) {
      clearStoredToken();
      window.location.href = "/login";
    }
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.detail || err.message || "Request failed";
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return executeRequest<T>(path, options);
}
