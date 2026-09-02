import { Link } from "react-router-dom";
import { brand } from "../config";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/50">
            <span className="font-serif text-3xl font-bold text-gold">कृ</span>
          </div>
          <div>
            <p className="font-display text-3xl">{brand.name}</p>
            <p className="text-sm text-[var(--muted)]">{brand.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[var(--muted)]">
          <Link to="/shop">Shop</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin">Admin</Link>
        </div>
        <SocialLinks />
      </div>
      <p className="pb-8 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Kandamma Kids. Prices in Indian Rupees (₹).
      </p>
    </footer>
  );
}
