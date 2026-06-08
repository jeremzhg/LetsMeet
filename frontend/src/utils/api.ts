import { API } from "../config";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const getErrorMessage = (data: unknown, fallback: string) => {
  if (isJsonObject(data)) {
    const message = data.message || data.error;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

export const apiFetch = async <T = unknown>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;

  if (hasBody && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, response.statusText || "Request failed"), response.status, data);
  }

  if (isJsonObject(data) && data.success === false) {
    throw new ApiError(getErrorMessage(data, "Request failed"), response.status, data);
  }

  return data as T;
};

export const apiJson = async <T = unknown>(path: string, body?: unknown, init: RequestInit = {}) => {
  return apiFetch<T>(path, {
    ...init,
    body: body === undefined ? init.body : JSON.stringify(body),
  });
};
