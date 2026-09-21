import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, User, Heart, Menu, X, Package, LogOut, ShieldCheck, UserCheck, Truck } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useBrandStore } from "../store/brandStore";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { WishlistDrawer } from "./WishlistDrawer";
import { NavbarSearch } from "./NavbarSearch";
import { social } from "../config";
import { useScrollState } from "../hooks/useScrollState";

interface HeaderProps {
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

function getUserInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
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

export function Header({ onOpenCart, onOpenWishlist }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [internalWishlistOpen, setInternalWishlistOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { user, profile, isAdmin, logout } = useAuth();
  const isScrolled = useScrollState(50);

  const cartItems = useCartStore((s) => s.items);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const badgeAnimate = useCartStore((s) => s.badgeAnimate);

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
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const rawDisplayName = profile?.displayName || user?.displayName;
  const displayName = rawDisplayName && rawDisplayName.trim()
    ? rawDisplayName.trim()
    : "Customer";

  const getDisplaySubtitle = () => {
    if (user?.email && !user.email.endsWith("@kandamma.local")) {
      return user.email;
    }
    if (profile?.email && !profile.email.endsWith("@kandamma.local")) {
      return profile.email;
    }
    const providerEmail = user?.providerData?.find(
      (p) => p.email && !p.email.endsWith("@kandamma.local")
    )?.email;
    if (providerEmail) {
      return providerEmail;
    }
    if (profile?.phone) {
      return `+91 ${profile.phone}`;
    }
    if (user?.email?.endsWith("@kandamma.local")) {
      return `+91 ${user.email.split("@")[0]}`;
    }
    return "";
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenWishlist) {
      onOpenWishlist();
    } else {
      setInternalWishlistOpen(true);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all duration-300 shadow-xs ${
          isScrolled ? 'h-[58px]' : 'h-[72px]'
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 h-full">
          
          {/* Left Side: Mobile Menu + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#281E15] hover:opacity-70 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-[#D9B382]/50 shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#281E15] font-bold text-white text-xs flex-shrink-0 shadow-sm">
                  KK
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left justify-center">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#281E15] leading-none">
                  {settings.name || "Kandamma Kids"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#C27A6A] tracking-wider mt-1 leading-none">
                  ನಿಮ್ಮ ಮುದ್ದು ಕಂದಮ್ಮಗಳಿಗಾಗಿ
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/shop"
              className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#C27A6A] ${
                isActive("/shop") ? "text-[#C27A6A] border-b-2 border-[#C27A6A] pb-0.5" : "text-[#281E15]/80"
              }`}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#C27A6A] ${
                isActive("/about") ? "text-[#C27A6A] border-b-2 border-[#C27A6A] pb-0.5" : "text-[#281E15]/80"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#C27A6A] ${
                isActive("/contact") ? "text-[#C27A6A] border-b-2 border-[#C27A6A] pb-0.5" : "text-[#281E15]/80"
              }`}
            >
              Contact
            </Link>
            <Link
              to="/track"
              className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#C27A6A] ${
                isActive("/track") ? "text-[#C27A6A] border-b-2 border-[#C27A6A] pb-0.5" : "text-[#281E15]/80"
              }`}
            >
              Track Parcel
            </Link>
          </nav>

          {/* Right Actions: Search -> Instagram -> Wishlist -> Bag -> Profile */}
          <div className="flex items-center gap-2 sm:gap-3 text-[#281E15]">
            <NavbarSearch />

            <a
              href={social.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#C27A6A] transition-colors p-1.5 hidden lg:block"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={handleWishlistClick}
              className="relative hover:text-[#C27A6A] transition-colors cursor-pointer p-1.5"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3e6c] text-[9px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative cursor-pointer hover:text-[#C27A6A] transition-colors p-1.5"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#281E15] text-[9px] font-bold text-white shadow-xs"
                  animate={badgeAnimate ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {totalCount}
                </motion.span>
              )}
            </button>

            {/* User Profile / Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C27A6A] text-xs font-bold text-white hover:bg-[#b0695a] transition cursor-pointer uppercase tracking-tight shadow-xs"
                  title="My Account"
                >
                  {getUserInitials(displayName)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="hover:text-[#C27A6A] transition-colors cursor-pointer p-1.5"
                  aria-label="Sign In or Register"
                  title="Sign In"
                >
                  <User className="h-5 w-5" />
                </button>
              )}

              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E8E2D9] bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="border-b border-stone-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-stone-900 truncate capitalize">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate font-mono">
                      {getDisplaySubtitle()}
                    </p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] text-left cursor-pointer transition"
                    >
                      <UserCheck className="h-4 w-4 text-[#C27A6A]" />
                      <span>My Profile & Address</span>
                    </button>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] transition"
                    >
                      <Package className="h-4 w-4 text-[#C27A6A]" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/track"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] transition"
                    >
                      <Truck className="h-4 w-4 text-[#C27A6A]" />
                      <span>Track Any Parcel</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 transition"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-700" />
                        <span>Store Admin Hub</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-stone-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E2D9] bg-[#FAF7F2] px-6 py-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4 text-xs font-bold tracking-[0.15em] uppercase text-[#281E15]">
              <Link to="/shop" className="py-2 border-b border-[#E8E2D9]/60">Shop Collection</Link>
              <Link to="/about" className="py-2 border-b border-[#E8E2D9]/60">Our Heritage & Story</Link>
              <Link to="/contact" className="py-2 border-b border-[#E8E2D9]/60">Customer Care</Link>
              <Link to="/track" className="py-2 border-b border-[#E8E2D9]/60">Track Parcel</Link>
              
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="py-2 border-b border-[#E8E2D9]/60 text-left flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4 text-[#C27A6A]" /> My Profile & Address
                  </button>
                  <Link to="/orders" className="py-2 border-b border-[#E8E2D9]/60 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#C27A6A]" /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="py-2 border-b border-[#E8E2D9]/60 flex items-center gap-2 text-amber-800">
                      <ShieldCheck className="h-4 w-4 text-amber-700" /> Store Admin Hub
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    className="py-2 text-left text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="py-2 text-left text-[#C27A6A] flex items-center gap-2 font-bold"
                >
                  <User className="h-4 w-4" /> Sign In / Register
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {!onOpenWishlist && (
        <WishlistDrawer 
          isOpen={internalWishlistOpen} 
          onClose={() => setInternalWishlistOpen(false)} 
        />
      )}
    </>
  );
}

export default Header;