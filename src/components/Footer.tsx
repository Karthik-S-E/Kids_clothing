import { Link } from "react-router-dom";
import { useBrandStore } from "../store/brandStore";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const { settings } = useBrandStore();

  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/50 shadow-md"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-bold text-ink text-sm">
              KK
            </div>
          )}
          <div>
            <p className="font-display text-2xl font-bold">{settings.name}</p>
            <p className="text-xs text-[var(--muted)]">{settings.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[var(--muted)]">
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
        </div>
        <SocialLinks />
      </div>
      <p className="pb-8 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {settings.name}.ನಿಮ್ಮ ಸೇವೆಗಾಗಿ.
      </p>
    </footer>
  );
}