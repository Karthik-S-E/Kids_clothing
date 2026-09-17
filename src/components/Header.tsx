import { Link, useLocation } from "react-router-dom";
import { User, ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { social } from "../config";

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

export function Header() {
  const location = useLocation();
  const cartItems = useCartStore((s) => s.items);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <Link to="/" className="font-serif text-2xl tracking-tight text-[#281E15]">
          Kandamma Kids
        </Link>

        {/* Center Nav */}
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
        <div className="flex items-center space-x-5 text-[#281E15]">
          <a
            href={social.instagram}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity"
            aria-label="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <Link to="/admin" className="hover:opacity-70 transition-opacity" aria-label="Admin">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/shop" className="relative hover:opacity-70 transition-opacity" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#281E15] text-[9px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}