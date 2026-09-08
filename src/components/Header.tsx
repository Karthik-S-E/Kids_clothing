import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useBrandStore } from "../store/brandStore";
import { NavItem } from "./SocialLinks";
import { NavbarSearch } from "./NavbarSearch";
import { MessageCircle, ShoppingBag, Menu, X } from "lucide-react";
import { whatsappChatUrl } from "../lib/whatsapp";
import { useCartStore } from "../store/cartStore";

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { theme, toggle } = useThemeStore();
  const { settings, fetchSettings } = useBrandStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

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
    <header className="sticky top-0 z-[var(--z-sticky)] px-4 sm:px-8 pt-4">
      <div className="glass mx-auto flex max-w-7xl items-center justify-between px-6 py-4 rounded-2xl border border-[var(--border)] shadow-lg backdrop-blur-xl bg-[var(--surface-elevated)]">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3.5 group">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--accent-primary)]/70 shadow-md transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-primary)] font-display text-lg font-bold text-[var(--text-primary)] shadow-md">
              K
            </div>
          )}
          <div className="leading-tight">
            <p className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              {settings.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] font-medium">
              Luxury Atelier
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex text-sm font-medium uppercase tracking-[0.2em]">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/shop">Shop</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <NavbarSearch onSearch={handleSearch} />

          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors shadow-sm"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[10px] font-bold text-[var(--text-primary)]">
                {cartItemsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggle}
            className="hidden sm:inline-flex border border-[var(--border)] px-3 py-2 text-xs font-medium uppercase tracking-widest cursor-pointer rounded-lg hover:border-[var(--accent-primary)] transition-colors"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 md:hidden glass rounded-2xl p-6 border border-[var(--border)] shadow-xl flex flex-col gap-4 bg-[var(--surface-elevated)]">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-[0.2em] font-semibold py-2 border-b border-[var(--border)]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-[0.2em] font-semibold py-2 border-b border-[var(--border)]"
          >
            Shop Collection
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-[0.2em] font-semibold py-2 border-b border-[var(--border)]"
          >
            Contact Atelier
          </Link>
          <div className="flex items-center justify-between pt-2">
            <a
              href={whatsappChatUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Order
            </a>
            <button
              type="button"
              onClick={toggle}
              className="border border-[var(--border)] px-3 py-2 text-xs font-medium uppercase tracking-widest rounded-lg"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { settings } = useBrandStore();

  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16 grid gap-12 md:grid-cols-4">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--accent-primary)]/50 shadow-md"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-primary)] font-display text-xl font-bold text-[var(--text-primary)] shadow-md">
                K
              </div>
            )}
            <div>
              <p className="font-display text-2xl font-bold tracking-tight">{settings.name}</p>
              <p className="text-xs text-[var(--text-secondary)] tracking-wider uppercase">{settings.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-light max-w-md leading-relaxed">
            Creating timeless handcrafted children's ethnic wear with uncompromising devotion to comfort, quality, and royal traditional elegance.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent-primary)] mb-4">Navigation</p>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li>
              <Link to="/shop" className="hover:text-[var(--accent-primary)] transition-colors">Complete Collection</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[var(--accent-primary)] transition-colors">Atelier Contact</Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-[var(--accent-primary)] transition-colors">Admin Portal</Link>
            </li>
          </ul>
        </div>

        {/* WhatsApp Support & Hours */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent-primary)] mb-4">WhatsApp Concierge</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            Place orders and chat with our stylists instantly on WhatsApp.
          </p>
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#20ba59] transition-all"
          >
            <MessageCircle className="h-4 w-4" /> Open WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-8 px-6 text-center text-xs text-[var(--text-secondary)] tracking-widest uppercase">
        © {new Date().getFullYear()} {settings.name}. All Rights Reserved. Crafted with Elegance.
      </div>
    </footer>
  );
}
