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
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(sanitizeErrorMessage(message));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers, ...customConfig } = options;

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
      Cookies.get("jwtToken") ||
      Cookies.get("token") ||
      Cookies.get("accessToken");

    if (token && !customHeaders["Authorization"] && !customHeaders["authorization"]) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
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

    if (!response.ok) {
      const dataObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
      const rawErrorMessage =
        dataObj?.errorMessage ||
        dataObj?.message ||
        dataObj?.error ||
        dataObj?.msg ||
        (typeof data === "string" ? data : `Request failed with status ${response.status}`);

      const safeMessage = sanitizeErrorMessage(rawErrorMessage, `Request failed with status ${response.status}`);
      throw new ApiError(safeMessage, response.status, data);
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const safeMsg = sanitizeErrorMessage(error, "An unexpected network error occurred");
    throw new ApiError(safeMsg, 500, error);
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
