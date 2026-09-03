import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminConfig } from "../config";

type AuthState = {
  authenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      login: (password) => {
        const ok = password === adminConfig.password;
        if (ok) set({ authenticated: true });
        return ok;
      },
      logout: () => set({ authenticated: false }),
    }),
    { name: "kandamma.admin" },
  ),
);
