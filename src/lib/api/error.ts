import axios from "axios";

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const getApiErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred",
): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | string | undefined;
    if (isNonEmptyString(payload)) {
      return payload.trim();
    }

    if (payload && typeof payload === "object") {
      if (isNonEmptyString(payload.error)) {
        return payload.error.trim();
      }
      if (isNonEmptyString(payload.message)) {
        return payload.message.trim();
      }
    }

    if (isNonEmptyString(error.message)) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && isNonEmptyString(error.message)) {
    return error.message.trim();
  }

  return fallback;
};

