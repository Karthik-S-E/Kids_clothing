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
      <Header 
        onOpenCart={() => setCartOpen(true)} 
        onOpenWishlist={onOpenWishlist || (() => setWishlistOpen(true))} 
      />
      <main className="flex-1 pt-16">
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
        onOpenCart={() => setCartOpen(true)} 
      />
      <AiStylistModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}