import { ApiError } from "@/lib/api/request";

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error) || error instanceof Error) {
    return error.message;
  }

  return fallback;
}
