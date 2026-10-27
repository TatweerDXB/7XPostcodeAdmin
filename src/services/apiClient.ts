import Cookies from "js-cookie";
import { sanitizeErrorMessage } from "@/utils/security";

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
  process.env.AUTH_API_TARGET ||
  "https://identity-service-qh42.onrender.com";

export const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_PROXY_TARGET ||
  "https://epg-post-dev-gateway.onrender.com";

export const getApiBaseUrl = (endpoint?: string): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  const formatted = endpoint ? (endpoint.startsWith("/") ? endpoint : `/${endpoint}`) : "";
  if (formatted.startsWith("/api/auth")) {
    return AUTH_API_BASE_URL.replace(/\/+$/, "");
  }
  return DEFAULT_API_BASE_URL.replace(/\/+$/, "");
};

export const API_BASE_URL = DEFAULT_API_BASE_URL;

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

  const baseUrl = getApiBaseUrl(endpoint);
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
  let coldStartAttempt = 0;
  const maxAttempts = Math.max(0, retries);
  const maxColdStartAttempts = 8; // Render free containers take 30-50s to wake up

  while (attempt <= maxAttempts && coldStartAttempt <= maxColdStartAttempts) {
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
      if (isTransient) {
        if (coldStartAttempt < maxColdStartAttempts) {
          coldStartAttempt++;
          const coldBackoffDelays = [2000, 3000, 5000, 7000, 9000, 11000, 13000, 15000];
          const backoffMs = coldBackoffDelays[coldStartAttempt - 1] || 10000;
          console.warn(
            `[API] Cloud service waking up (${response.status}) at ${endpoint}. Retrying in ${backoffMs}ms (attempt ${coldStartAttempt}/${maxColdStartAttempts})...`
          );

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("render-service-waking", {
                detail: { endpoint, attempt: coldStartAttempt, maxAttempts: maxColdStartAttempts },
              })
            );
          }

          await sleep(backoffMs);
          continue;
        }
      }

      if (!response.ok) {
        if (typeof window !== "undefined" && isTransient) {
          window.dispatchEvent(new CustomEvent("render-service-failed"));
        }
        const dataObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
        let rawErrorMessage =
          dataObj?.detail ||
          dataObj?.title ||
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

      if (coldStartAttempt > 0 && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("render-service-ready"));
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

/**
 * Wakes up or checks the health of the 3 backend services on Render
 */
export async function warmupBackendServices(): Promise<{ gateway: boolean; auth: boolean; postcode: boolean }> {
  try {
    const urls = [
      getApiBaseUrl("/health/grid") ? `${getApiBaseUrl("/health/grid")}/health/grid` : "/health/grid",
      getApiBaseUrl("/api/auth/me") ? `${getApiBaseUrl("/api/auth/me")}/api/auth/me` : "/api/auth/me",
      "https://epg-post-dev-postcodegrid.onrender.com/health",
    ];

    const results = await Promise.allSettled(
      urls.map((u) => fetch(u, { method: "GET", credentials: "omit" }))
    );

    const isOk = (res: PromiseSettledResult<Response>) =>
      res.status === "fulfilled" && (res.value.status === 200 || res.value.status === 401);

    return {
      gateway: isOk(results[0]),
      auth: isOk(results[1]),
      postcode: isOk(results[2]),
    };
  } catch {
    return { gateway: false, auth: false, postcode: false };
  }
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
