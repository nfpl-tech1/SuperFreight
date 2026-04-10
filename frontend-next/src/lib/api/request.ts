import { clearStoredToken, getStoredToken } from "@/lib/authToken";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
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
    headers,
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: res.statusText, message: res.statusText }));
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/sso")
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
