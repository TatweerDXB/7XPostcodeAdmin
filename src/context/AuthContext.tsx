"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuth, clearAuth, AuthState } from "@/store/slices/authSlice";
import {
  authService,
  LoginPayload,
  LoginResponse,
  MeResponse,
  setAuthTokens,
  clearAuthCookies,
  getStoredToken,
} from "@/services/auth";
import { logSecurityEvent } from "@/utils/securityLogger";

export type AuthUser = AuthState;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionNotice: string | null;
  clearSessionNotice: () => void;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<AuthUser | null>;
  setUser: (user: Partial<AuthState>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const hasInitializedAuthRef = useRef<boolean>(false);
  const lastActivityTimeRef = useRef<number>(0);

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null);
  }, []);

  // Check for any stored session notice on mount (e.g. from 401 redirect)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedNotice = sessionStorage.getItem("auth_session_notice");
        if (storedNotice) {
          setSessionNotice(storedNotice);
          sessionStorage.removeItem("auth_session_notice");
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Listen for global session expiry events triggered by apiClient
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      clearAuthCookies();
      dispatch(clearAuth());
      setSessionNotice("Your session has expired. Please log in again.");
    };

    window.addEventListener("auth-session-expired", handleSessionExpiredEvent);
    return () => {
      window.removeEventListener("auth-session-expired", handleSessionExpiredEvent);
    };
  }, [dispatch]);

  const fetchCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const token = getStoredToken();
      if (!token) {
        dispatch(clearAuth());
        return null;
      }

      const meProfile: MeResponse = await authService.getMe();
      if (meProfile) {
        const userData: Partial<AuthState> = {
          userId: meProfile.userId,
          userName: meProfile.userName,
          email: meProfile.email,
          displayName:
            meProfile.userName && meProfile.userName.includes("@")
              ? meProfile.userName.split("@")[0]
              : meProfile.userName || "Administrator",
          roles: meProfile.roles || [],
          permissions: meProfile.permissions || [],
          isAdmin: meProfile.isAdmin ?? false,
          expiresAt: meProfile.expiresAt || null,
        };
        dispatch(setAuth(userData));
        return userData as AuthUser;
      }
      return null;
    } catch (err: unknown) {
      const status = typeof err === "object" && err !== null && "status" in err ? (err as { status: number }).status : 0;
      if (status === 401 || status === 403) {
        clearAuthCookies();
        dispatch(clearAuth());
      }
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    if (hasInitializedAuthRef.current) return;
    hasInitializedAuthRef.current = true;

    let isMounted = true;

    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          await fetchCurrentUser();
        } catch (err) {
          console.warn("Failed to initialize user session:", err);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
    } finally {
      clearAuthCookies();
      dispatch(clearAuth());
      setIsLoading(false);
      router.push("/");
    }
  }, [dispatch, router]);

  useEffect(() => {
    const isAuthed = Boolean(auth.userId || auth.userName || getStoredToken());
    if (!isAuthed) return;

    lastActivityTimeRef.current = Date.now();

    const handleUserActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityTimeRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        logSecurityEvent({
          action: "AUTH_SESSION_INACTIVITY_TIMEOUT",
          result: "SUCCESS",
          userId: auth.userId || auth.userName,
          object: "session",
          details: { idleDurationSeconds: Math.floor(idleTime / 1000) },
        });

        clearAuthCookies();
        dispatch(clearAuth());
        setSessionNotice("Your session expired after 15 minutes of inactivity. Please log in again.");
        router.push("/?reason=inactivity");
      }
    }, 15000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(checkInterval);
    };
  }, [auth.userId, auth.userName, dispatch, router]);

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    setSessionNotice(null);

    try {
      const response = await authService.login(payload);

      if (response.errorMessage) {
        throw new Error(response.errorMessage);
      }

      const token =
        response.jwtToken ||
        response.token ||
        response.accessToken ||
        response.access_token;

      if (token) {
        setAuthTokens(
          token,
          response.refreshToken,
          response.refreshTokenExpiresOn,
          payload.rememberMe
        );
      }

      const initialUserData: Partial<AuthState> = {
        userId: response.id || null,
        userName: response.userName || null,
        email: response.email || null,
        displayName: response.displayName || response.userName || null,
        refreshTokenExpiresOn: response.refreshTokenExpiresOn || null,
      };
      dispatch(setAuth(initialUserData));

      try {
        const meProfile: MeResponse = await authService.getMe();
        if (meProfile) {
          dispatch(
            setAuth({
              ...initialUserData,
              userId: meProfile.userId || response.id,
              userName: meProfile.userName || response.userName,
              email: meProfile.email || response.email,
              roles: meProfile.roles || [],
              permissions: meProfile.permissions || [],
              isAdmin: meProfile.isAdmin ?? false,
              expiresAt: meProfile.expiresAt || null,
            })
          );
        }
      } catch {
      }

      lastActivityTimeRef.current = Date.now();
      return response;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = useCallback(
    (userData: Partial<AuthState>) => {
      dispatch(setAuth(userData));
    },
    [dispatch]
  );

  const isAuthenticated = !isLoading && !!(auth.userId || auth.userName || getStoredToken());
  const currentUser: AuthUser | null =
    auth.userId || auth.userName ? auth : null;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        isLoading,
        error,
        sessionNotice,
        clearSessionNotice,
        login,
        logout,
        fetchCurrentUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
