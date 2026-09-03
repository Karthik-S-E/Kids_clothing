import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useBrandStore } from "../store/brandStore";
import { NavItem } from "./SocialLinks";
import { NavbarSearch } from "./NavbarSearch";

export function Header() {
  const { theme, toggle } = useThemeStore();
  const { settings, fetchSettings } = useBrandStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
    } else {
      navigate("/shop");
    }
  };

  return (
    <header className="sticky top-0 z-[100] px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 pl-3 pr-3 sm:px-5 backdrop-blur-md bg-white/70 dark:bg-[#0a0f0d]/70">
        <Link to="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Kandamma Kids"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-gold/70 shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gold font-bold text-ink">
              KK
            </div>
          )}
          <div className="leading-tight">
            <p className="font-display text-xl sm:text-2xl font-bold">{settings.name}</p>
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[var(--muted)] sm:block">
              Vibe core · India
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/shop">Shop</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <NavbarSearch onSearch={handleSearch} />
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium uppercase tracking-widest cursor-pointer"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link
            to="/shop"
            className="rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink hover:bg-yellow-400 transition-colors"
          >
            Shop
          </Link>
        </div>
      </div>
      <nav className="mx-auto mt-2 flex max-w-6xl justify-center gap-5 rounded-full glass px-4 py-2 md:hidden backdrop-blur-md bg-white/70 dark:bg-[#0a0f0d]/70">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/shop">Shop</NavItem>
        <NavItem to="/contact">Contact</NavItem>
      </nav>
    </header>
  );
}