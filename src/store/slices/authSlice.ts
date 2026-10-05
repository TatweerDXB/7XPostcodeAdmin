import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  userId: string | null;
  userName: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  expiresAt: string | null;
  refreshTokenExpiresOn: string | null;
}

const initialState: AuthState = {
  userId: null,
  userName: null,
  email: null,
  displayName: null,
  roles: [],
  permissions: [],
  isAdmin: false,
  expiresAt: null,
  refreshTokenExpiresOn: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      return {
        ...state,
        ...action.payload,
        roles: action.payload.roles ?? state.roles ?? [],
        permissions: action.payload.permissions ?? state.permissions ?? [],
        isAdmin: action.payload.isAdmin ?? state.isAdmin ?? false,
      };
    },
    clearAuth: () => initialState,
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
