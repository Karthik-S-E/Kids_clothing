import { Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { NavItem } from "./SocialLinks";

export function Header() {
  const { theme, toggle } = useThemeStore();

  return (
    <header className="sticky top-0 z-[100] px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 pl-3 pr-3 sm:px-5 backdrop-blur-md bg-white/70 dark:bg-[#0a0f0d]/70">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 ring-2 ring-gold/70">
            <span className="font-serif text-2xl font-bold text-gold">कृ</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-xl sm:text-2xl">Kandamma Kids</p>
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[var(--muted)] sm:block">
              Vibe core · India
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/shop">Shop</NavItem>
          <NavItem to="/contact">Contact</NavItem>
          <NavItem to="/admin">Admin</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium uppercase tracking-widest"
            aria-label="Toggle dark and light mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link
            to="/shop"
            className="rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink"
          >
            Shop
          </Link>
        </div>
      </div>
      <nav className="mx-auto mt-2 flex max-w-6xl justify-center gap-5 rounded-full glass px-4 py-2 md:hidden backdrop-blur-md bg-white/70 dark:bg-[#0a0f0d]/70">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/shop">Shop</NavItem>
        <NavItem to="/contact">Contact</NavItem>
        <NavItem to="/admin">Admin</NavItem>
      </nav>
    </header>
  );
}
