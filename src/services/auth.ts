import Cookies from "js-cookie";
import { apiClient, ApiError } from "./apiClient";
import { logSecurityEvent } from "@/utils/securityLogger";

export interface LoginPayload {
  username?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
  [key: string]: unknown;
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
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MeResponse {
  userId?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
  expiresAt?: string;
  [key: string]: unknown;
}

export interface LogoutResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface RefreshTokenPayload {
  refreshToken?: string;
  refresh_token?: string;
  [key: string]: unknown;
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
  [key: string]: unknown;
}

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
  "X-User-Token",
  "x-user-token",
  "X-Refresh-Token",
];

export const setAuthTokens = (
  jwtToken: string,
  refreshToken?: string,
  refreshTokenExpiresOn?: string,
  rememberMe: boolean = true
) => {
  if (typeof document === "undefined") return;

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieOptions: Cookies.CookieAttributes = {
    path: "/",
    sameSite: "lax",
    secure: isHttps || process.env.NODE_ENV === "production",
  };

  const ACCESS_TOKEN_EXPIRY_DAYS = 1 / 24;

  Cookies.set(JWT_TOKEN_COOKIE, jwtToken, { ...cookieOptions, expires: ACCESS_TOKEN_EXPIRY_DAYS });
  Cookies.set("token", jwtToken, { ...cookieOptions, expires: ACCESS_TOKEN_EXPIRY_DAYS });
  Cookies.set(AUTH_SESSION_COOKIE, "true", { ...cookieOptions, expires: rememberMe ? 7 : ACCESS_TOKEN_EXPIRY_DAYS });

  if (refreshToken) {
    let refreshExpires: number | Date = rememberMe ? 7 : 1;
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

export const getStoredToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(JWT_TOKEN_COOKIE) || Cookies.get("token") || Cookies.get("accessToken");
};

export const getStoredRefreshToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(REFRESH_TOKEN_COOKIE) || Cookies.get("refresh_token");
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;

  ALL_AUTH_COOKIE_KEYS.forEach((key) => {
    Cookies.remove(key, { path: "/" });
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  });
};

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const userNameVal =
      (payload.userName as string) ||
      payload.username ||
      payload.email;
    const requestBody = {
      userName: userNameVal,
      username: userNameVal,
      email: payload.email || (userNameVal?.includes("@") ? userNameVal : undefined),
      password: payload.password,
      rememberMe: payload.rememberMe,
      ...payload,
    };

    try {
      const response = await apiClient.post<LoginResponse>("/api/auth/login", requestBody);

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

        logSecurityEvent({
          action: "AUTH_LOGIN_SUCCESS",
          result: "SUCCESS",
          userId: response.id || response.userName || (typeof payload.username === "string" ? payload.username : "unknown"),
          object: "/api/auth/login",
          details: { rememberMe: payload.rememberMe },
        });
      }

      return response;
    } catch (error: unknown) {
      logSecurityEvent({
        action: "AUTH_LOGIN_FAILURE",
        result: "FAILURE",
        userId: typeof payload.username === "string" ? payload.username : "anonymous",
        object: "/api/auth/login",
        details: { reason: "Invalid credentials or request error" },
      });
      throw error;
    }
  },

  getMe: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>("/api/auth/me");
  },

  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await apiClient.post<LogoutResponse>("/api/auth/logout", {});
      logSecurityEvent({
        action: "AUTH_LOGOUT",
        result: "SUCCESS",
        object: "/api/auth/logout",
      });
      return response;
    } finally {
      clearAuthCookies();
    }
  },

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
