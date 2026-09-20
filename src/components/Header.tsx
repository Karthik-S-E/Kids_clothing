import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Heart, Menu, X, Package, LogOut, ShieldCheck, UserCheck, Truck } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useBrandStore } from "../store/brandStore";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { WishlistDrawer } from "./WishlistDrawer"; // Import directly so Header can control it as a fallback
import { social } from "../config";

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
  const { user, profile, logout } = useAuth();

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
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
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
    : user?.email
    ? user.email.split("@")[0]
    : "Customer";

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
            <Link
              to="/track"
              className={`text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#281E15] ${
                isActive("/track") ? "text-[#281E15] font-bold" : "text-[#5a5248]"
              }`}
            >
              TRACK PARCEL
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

            {/* Wishlist Button Opening Drawer */}
            <button
              type="button"
              onClick={handleWishlistClick}
              className="relative hover:opacity-70 transition-opacity cursor-pointer p-0.5"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3e6c] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Profile / Authentication Menu */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff3e6c] text-xs font-bold text-white hover:bg-[#e7335e] transition cursor-pointer uppercase tracking-tight"
                  title="My Account"
                >
                  {getUserInitials(displayName)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="hover:opacity-70 transition-opacity cursor-pointer p-0.5"
                  aria-label="Sign In or Register"
                  title="Sign In"
                >
                  <User className="h-5 w-5" />
                </button>
              )}

              {/* Account Dropdown */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="border-b border-stone-100 px-3 py-2">
                    <p className="text-xs font-bold text-stone-900 truncate capitalize">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 text-left cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 text-stone-500" />
                      <span>My Profile & Address</span>
                    </button>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      <Package className="h-4 w-4 text-stone-500" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/track"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      <Truck className="h-4 w-4 text-stone-500" />
                      <span>Track Any Parcel</span>
                    </Link>

                    <Link
                      to="/admin/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      <ShieldCheck className="h-4 w-4 text-stone-500" />
                      <span>Store Admin</span>
                    </Link>
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
              <button
                type="button"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleWishlistClick(e);
                }}
                className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 flex items-center justify-between text-left cursor-pointer w-full ${
                  isActive("/wishlist") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
                }`}
              >
                <span>WISHLIST</span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-[#ff3e6c] px-2 py-0.5 text-xs font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <Link
                to="/track"
                className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 flex items-center gap-2 ${
                  isActive("/track") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>TRACK PARCEL</span>
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
                className={`text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 ${
                  isActive("/contact") ? "text-[#281E15] font-bold" : "text-[#6E6259]"
                }`}
              >
                CONTACT
              </Link>

              {/* Mobile Account Section */}
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 flex items-center gap-2 text-[#281E15] text-left cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>MY PROFILE & ADDRESS</span>
                  </button>
                  <Link
                    to="/orders"
                    className="text-sm font-semibold tracking-widest uppercase py-1 border-b border-[#E8E2D9]/40 flex items-center gap-2 text-[#281E15]"
                  >
                    <Package className="h-4 w-4" />
                    <span>MY ORDERS</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    className="text-sm font-semibold tracking-widest uppercase py-1 text-left text-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>SIGN OUT ({displayName})</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="text-sm font-semibold tracking-widest uppercase py-1 text-left text-[#ff3e6c] flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>SIGN IN / REGISTER</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Customer Login & Sign Up Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Profile & Address Editor Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {/* Fallback Wishlist Drawer rendered directly inside Header if parent didn't provide prop */}
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