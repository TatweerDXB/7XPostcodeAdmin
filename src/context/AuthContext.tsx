"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

export type AuthUser = AuthState;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<AuthUser | null>;
  setUser: (user: Partial<AuthState>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Manage UI state (loading, errors) locally in component context
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user details from /api/auth/me
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
        return { ...auth, ...userData };
      }
      return null;
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        clearAuthCookies();
        dispatch(clearAuth());
      }
      return null;
    }
  }, [dispatch, auth]);

  // Screen refresh & initial mount authentication
  useEffect(() => {
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

  // Login action
  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(payload);

      if (response.errorMessage) {
        throw new Error(response.errorMessage);
      }

      // 1. Tokens stored in cookies ONLY
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

      // 2. Set user info from login in Redux store
      const initialUserData: Partial<AuthState> = {
        userId: response.id || null,
        userName: response.userName || null,
        email: response.email || null,
        displayName: response.displayName || response.userName || null,
        refreshTokenExpiresOn: response.refreshTokenExpiresOn || null,
      };
      dispatch(setAuth(initialUserData));

      // 3. Enrich user info with /me endpoint (roles, permissions, isAdmin, etc.)
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
        // Continue with login response metadata if /me is pending
      }

      return response;
    } catch (err: any) {
      const msg = err?.message || "Login failed. Please check your credentials.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout action
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthCookies();
      dispatch(clearAuth());
      setIsLoading(false);
      router.push("/");
    }
  };

  const setUser = useCallback(
    (userData: Partial<AuthState>) => {
      dispatch(setAuth(userData));
    },
    [dispatch]
  );

  const isAuthenticated = !!(auth.userId || auth.userName || getStoredToken());
  const currentUser: AuthUser | null =
    auth.userId || auth.userName ? auth : null;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        isLoading,
        error,
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
