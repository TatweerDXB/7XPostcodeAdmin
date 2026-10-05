/**
 * Authentication Service
 * Endpoints for 7X Identity Service:
 * - POST /api/auth/login
 * - GET  /api/auth/me
 * - POST /api/auth/logout
 * - POST /api/auth/refresh-token
 */

import Cookies from "js-cookie";
import { apiClient, ApiError } from "./apiClient";

export interface LoginPayload {
  username?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
  [key: string]: any;
}

export interface LoginResponse {
  success: boolean;
  id?: string;
  errorMessage?: string | null;
  userName?: string;
  email?: string;
  displayName?: string;
  jwtToken?: string;
  refreshToken?: string;
  refreshTokenExpiresOn?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: any;
  [key: string]: any;
}

export interface MeResponse {
  userId?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
  expiresAt?: string;
  [key: string]: any;
}

export interface LogoutResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface RefreshTokenPayload {
  refreshToken?: string;
  refresh_token?: string;
  [key: string]: any;
}

export interface RefreshTokenResponse {
  success?: boolean;
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwtToken?: string;
  refreshToken?: string;
  refreshTokenExpiresOn?: string;
  message?: string;
  [key: string]: any;
}

// Cookie Keys
export const JWT_TOKEN_COOKIE = "jwtToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const AUTH_SESSION_COOKIE = "auth_session";

export const ALL_AUTH_COOKIE_KEYS = [
  JWT_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AUTH_SESSION_COOKIE,
  "token",
  "accessToken",
  "access_token",
  "jwt",
  "session",
  "refresh_token",
  "connect.sid",
];

/**
 * Stores tokens ONLY in browser cookies.
 */
export const setAuthTokens = (
  jwtToken: string,
  refreshToken?: string,
  refreshTokenExpiresOn?: string,
  rememberMe: boolean = true
) => {
  if (typeof document === "undefined") return;

  const cookieOptions: Cookies.CookieAttributes = {
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  };

  // Set JWT Token (30 days if rememberMe, else 7 days)
  const days = rememberMe ? 30 : 7;
  Cookies.set(JWT_TOKEN_COOKIE, jwtToken, { ...cookieOptions, expires: days });
  Cookies.set("token", jwtToken, { ...cookieOptions, expires: days });
  Cookies.set(AUTH_SESSION_COOKIE, "true", { ...cookieOptions, expires: days });

  // Set Refresh Token if provided
  if (refreshToken) {
    let refreshExpires: number | Date = days;
    if (refreshTokenExpiresOn) {
      const parsedDate = new Date(refreshTokenExpiresOn);
      if (!isNaN(parsedDate.getTime())) {
        refreshExpires = parsedDate;
      }
    }
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      expires: refreshExpires,
    });
  }
};

/**
 * Retrieves the stored JWT token from cookies.
 */
export const getStoredToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(JWT_TOKEN_COOKIE) || Cookies.get("token") || Cookies.get("accessToken");
};

/**
 * Retrieves the stored Refresh Token from cookies.
 */
export const getStoredRefreshToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(REFRESH_TOKEN_COOKIE) || Cookies.get("refresh_token");
};

/**
 * Clears all authentication cookies from the browser.
 */
export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;

  ALL_AUTH_COOKIE_KEYS.forEach((key) => {
    Cookies.remove(key, { path: "/" });
    // Also remove with raw document.cookie for legacy domain/path coverage
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  });
};

export const authService = {
  /**
   * POST /api/auth/login
   * Authenticates user and sets token cookies.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const requestBody = {
      username: payload.username,
      email: payload.email || (payload.username?.includes("@") ? payload.username : undefined),
      password: payload.password,
      rememberMe: payload.rememberMe,
      ...payload,
    };

    const response = await apiClient.post<LoginResponse>("/api/auth/login", requestBody);

    // Save tokens in cookies
    const token =
      response?.jwtToken ||
      response?.token ||
      response?.accessToken ||
      response?.access_token;

    if (token) {
      setAuthTokens(
        token,
        response.refreshToken,
        response.refreshTokenExpiresOn,
        payload.rememberMe
      );
    }

    return response;
  },

  /**
   * GET /api/auth/me
   * Retrieves the current user profile from /me endpoint.
   */
  getMe: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>("/api/auth/me");
  },

  /**
   * POST /api/auth/logout
   * Logs out user and clears cookies.
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await apiClient.post<LogoutResponse>("/api/auth/logout", {});
      return response;
    } finally {
      clearAuthCookies();
    }
  },

  /**
   * POST /api/auth/refresh-token
   * Refreshes JWT token using stored refresh token.
   */
  refreshToken: async (payload?: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
    const currentRefreshToken = payload?.refreshToken || getStoredRefreshToken();
    const response = await apiClient.post<RefreshTokenResponse>(
      "/api/auth/refresh-token",
      payload || { refreshToken: currentRefreshToken }
    );

    const token =
      response?.jwtToken ||
      response?.token ||
      response?.accessToken ||
      response?.access_token;

    if (token) {
      setAuthTokens(
        token,
        response.refreshToken || currentRefreshToken,
        response.refreshTokenExpiresOn,
        true
      );
    }

    return response;
  },
};

export { ApiError };
