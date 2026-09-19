import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useBrandStore } from "../store/brandStore";
import { social } from "../config";

interface HeaderProps {
  onOpenCart?: () => void;
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Header({ onOpenCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartItems = useCartStore((s) => s.items);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const wishlistItems = useWishlistStore((s) => s.items);
  const wishlistCount = wishlistItems.length;

  const { settings, fetchSettings } = useBrandStore();

  useEffect(() => {
    if (!settings.logoUrl) {
      fetchSettings();
    }
  }, [settings.logoUrl, fetchSettings]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Hamburger (Mobile) + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#281E15] hover:opacity-70 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-1 ring-[#D8CEBE] shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#281E15] font-bold text-white text-xs flex-shrink-0">
                KK
              </div>
            )}
            <div className="flex flex-col text-left justify-center">
              <span className="font-serif text-lg sm:text-xl tracking-tight text-[#281E15] leading-none">
                {settings.name || "Kandamma Kids"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#786E64] tracking-normal mt-0.5 leading-none">
                ನಿಮ್ಮ ಮುದ್ದು ಕಂದಮ್ಮಗಳಿಗಾಗಿ
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/shop"
            className={`text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#281E15] ${
              isActive("/shop") ? "text-[#281E15] font-bold" : "text-[#5a5248]"
            }`}
          >
            SHOP
          </Link>
          <Link
            to="/about"
            className={`text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#281E15] ${
              isActive("/about") ? "text-[#281E15] font-bold" : "text-[#5a5248]"
            }`}
          >
            ABOUT
          </Link>
          <Link
            to="/contact"
            className={`text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#281E15] ${
              isActive("/contact") ? "text-[#281E15] font-bold" : "text-[#5a5248]"
            }`}
          >
            CONTACT
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 sm:space-x-5 text-[#281E15]">
          <a
            href={social.instagram}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity"
            aria-label="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          {/* Wishlist Link with Live Badge */}
          <Link
            to="/wishlist"
            className="relative hover:opacity-70 transition-opacity"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3e6c] text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/login"
            className="hover:opacity-70 transition-opacity"
            aria-label="Admin Login"
            title="Admin Login"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Shopping Bag Button with Live Badge */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#281E15] text-[9px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D9] bg-[#FAF7F2] px-6 py-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/shop"
              className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 ${
                isActive("/shop") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
              }`}
            >
              SHOP
            </Link>
            <Link
              to="/wishlist"
              className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 flex items-center justify-between ${
                isActive("/wishlist") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
              }`}
            >
              <span>WISHLIST</span>
              {wishlistCount > 0 && (
                <span className="rounded-full bg-[#ff3e6c] px-2 py-0.5 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 ${
                isActive("/about") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
              }`}
            >
              ABOUT
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-semibold tracking-widest uppercase py-1 ${
                isActive("/contact") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
              }`}
            >
              CONTACT
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}