import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

function loadFromStorage(): Pick<AuthState, "user" | "token"> {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    return {
      user: JSON.parse(localStorage.getItem("user") || "null"),
      token: localStorage.getItem("access_token"),
    };
  } catch {
    return { user: null, token: null };
  }
}

function writeCookie(value: string, days: number) {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `access_token=${value}; expires=${exp}; path=/; SameSite=Lax`;
}

function eraseCookie() {
  if (typeof document === "undefined") return;
  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
}

const authSlice = createSlice({
  name: "auth",
  initialState: (): AuthState => ({ ...loadFromStorage(), isLoading: false }),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("access_token", action.payload.token);
        // Double sécurité : cookie côté client aussi
        writeCookie(action.payload.token, 7);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        eraseCookie();
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      }
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUser, setLoading } =
  authSlice.actions;
export default authSlice.reducer;