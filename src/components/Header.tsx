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
    <header className="sticky top-0 z-[var(--z-sticky)] px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 rounded-xl">
        <Link to="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Kandamma Kids"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-[var(--accent-primary)]/70 shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[var(--accent-primary)] font-bold text-[var(--text-primary)]">
              KK
            </div>
          )}
          <div className="leading-tight">
            <p className="font-display text-xl sm:text-2xl font-bold">{settings.name}</p>
            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:block">
              Vibe core · India
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/shop">Shop</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
        <div className="flex items-center gap-3">
          <NavbarSearch onSearch={handleSearch} />
          <button
            type="button"
            onClick={toggle}
            className="border border-[var(--border)] px-3 py-2 text-xs font-medium uppercase tracking-widest cursor-pointer rounded-lg hover:border-[var(--accent-primary)] transition-colors"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link
            to="/shop"
            className="bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--color-gold-light)] transition-colors rounded-lg"
          >
            Shop
          </Link>
        </div>
      </div>
      <nav className="mx-auto mt-2 flex max-w-6xl justify-center gap-6 glass px-4 py-2 md:hidden rounded-xl">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/shop">Shop</NavItem>
        <NavItem to="/contact">Contact</NavItem>
      </nav>
    </header>
  );
}