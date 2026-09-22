import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartModal } from "./CartModal";
import { WishlistDrawer } from "./WishlistDrawer";
import { AiStylistModal } from "./AiStylistModal";
import { FloatingActionDock } from "./FloatingActionDock";

// 1. Explicitly define the interface here
interface LayoutProps {
  onOpenWishlist?: () => void;
}

// 2. Destructure the prop in the function parameters
export function Layout({ onOpenWishlist }: LayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Announcement Banner */}
      <div className="flex items-center justify-center gap-2.5 bg-[#f6b49e] px-4 py-2 text-center text-[12.5px] font-medium tracking-wide text-[#1d1d1b]">
        <span>Free Express Delivery Across India on Orders Over ₹999</span>
      </div>
      
      <Header
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={onOpenWishlist || (() => setWishlistOpen(true))}
      />

      <main className="flex-1 pt-28">
        <Outlet />
      </main>
      <Footer />
      
      {/* WhatsApp & AI Assistant floating buttons */}
      <FloatingActionDock onAiClick={() => setAiOpen((prev) => !prev)} />

      {/* Modals & Drawers */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer 
        isOpen={wishlistOpen} 
        onClose={() => setWishlistOpen(false)} 
      />
      <AiStylistModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default Layout;