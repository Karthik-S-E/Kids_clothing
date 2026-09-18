import { create } from "zustand";

type ThemeState = {
  theme: "light";
  toggle: () => void;
  setTheme: (theme: "light") => void;
};

function applyTheme() {
  document.documentElement.dataset.theme = "light";
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");
}

export const useThemeStore = create<ThemeState>(() => {
  // Clear any existing stored theme preference so it doesn't linger
  if (typeof window !== "undefined") {
    localStorage.removeItem("kandamma.theme");
    applyTheme();
  }

  return {
    theme: "light",
    toggle: () => applyTheme(),
    setTheme: () => applyTheme(),
  };
});