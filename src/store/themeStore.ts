import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "kandamma.theme",
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? "dark");
      },
    },
  ),
);
