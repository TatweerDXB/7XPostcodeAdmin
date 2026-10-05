/**
 * Base API Client configuration and request helper
 */

import Cookies from "js-cookie";

export const getApiBaseUrl = (): string => {
  // In the browser, use relative path ("") to route through Next.js rewrites proxy
  // This completely eliminates CORS / strict-origin-when-cross-origin issues.
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
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal request wrapper for all service calls
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers, ...customConfig } = options;

  // Build full URL using proxy base in browser or backend target in server
  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${formattedEndpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
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

  // Attach Bearer token from cookies if available in browser
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
    // Include credentials so backend cookies (session/token) are sent and received
    credentials: "include",
    ...customConfig,
  };

  if (body !== undefined) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Try to parse JSON response, fallback to text
    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => null);
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const errorMessage =
        data?.errorMessage ||
        data?.message ||
        data?.error ||
        data?.msg ||
        (typeof data === "string" ? data : `Request failed with status ${response.status}`);

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error?.message || "An unexpected network error occurred",
      error?.status || 500,
      error
    );
  }
}

export const apiClient = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "POST", body }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "PUT", body }),

  patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "PATCH", body }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
