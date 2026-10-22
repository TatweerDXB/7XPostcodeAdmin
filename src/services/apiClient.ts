import Cookies from "js-cookie";
import { sanitizeErrorMessage } from "@/utils/security";

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://identity-service-qh42.onrender.com"
  );
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://identity-service-qh42.onrender.com";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  isTransient?: boolean;

  constructor(message: string, status: number, data?: unknown, isTransient?: boolean) {
    super(sanitizeErrorMessage(message));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isTransient = isTransient;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers, retries = 2, ...customConfig } = options;

  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${formattedEndpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === "token" || lowerKey === "key" || lowerKey === "apikey" || lowerKey === "access_token") {
        console.warn(`[SECURITY] Prohibited credential query parameter stripped: ${key}. Use Authorization header.`);
        return;
      }
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const customHeaders = (headers as Record<string, string>) || {};

  if (typeof window !== "undefined") {
    const token =
      Cookies.get("X-User-Token") ||
      Cookies.get("jwtToken") ||
      Cookies.get("token") ||
      Cookies.get("accessToken");

    if (token) {
      if (!customHeaders["Authorization"] && !customHeaders["authorization"]) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
      if (!customHeaders["X-User-Token"] && !customHeaders["x-user-token"]) {
        defaultHeaders["X-User-Token"] = token;
      }
    }
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
    credentials: "include",
    ...customConfig,
  };

  if (body !== undefined) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let attempt = 0;
  const maxAttempts = Math.max(0, retries);

  while (attempt <= maxAttempts) {
    try {
      const response = await fetch(url, config);

      let data: unknown = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => null);
        data = text ? { message: text } : null;
      }

      // Check for transient 502/503/504 errors on free Render instances
      const isTransient = response.status === 502 || response.status === 503 || response.status === 504;
      if (isTransient && attempt < maxAttempts) {
        attempt++;
        const backoffMs = attempt * 1500;
        console.warn(`[API] Transient ${response.status} from ${endpoint}. Retrying in ${backoffMs}ms (attempt ${attempt}/${maxAttempts})...`);
        await sleep(backoffMs);
        continue;
      }

      if (!response.ok) {
        const dataObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
        let rawErrorMessage =
          dataObj?.errorMessage ||
          dataObj?.message ||
          dataObj?.error ||
          dataObj?.msg ||
          (typeof data === "string" ? data : `Request failed with status ${response.status}`);

        if (isTransient) {
          rawErrorMessage = "Service is starting up (502 Bad Gateway). Please try again shortly.";
        }

        const safeMessage = sanitizeErrorMessage(rawErrorMessage, `Request failed with status ${response.status}`);
        throw new ApiError(safeMessage, response.status, data, isTransient);
      }

      return data as T;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (attempt < maxAttempts) {
        attempt++;
        const backoffMs = attempt * 1500;
        console.warn(`[API] Network failure calling ${endpoint}. Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        continue;
      }
      const safeMsg = sanitizeErrorMessage(error, "An unexpected network error occurred");
      throw new ApiError(safeMsg, 500, error);
    }
  }

  throw new ApiError("Maximum retries reached. Service unavailable.", 503, null, true);
}

export const apiClient = {
  get: <T = unknown>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "POST", body }),

  put: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "PUT", body }),

  patch: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
