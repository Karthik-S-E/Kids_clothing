import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartModal } from "./CartModal";
import { AiStylistModal } from "./AiStylistModal";
import { FloatingActionDock } from "./FloatingActionDock";

export function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Header onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      
      {/* WhatsApp & AI Assistant floating buttons */}
      <FloatingActionDock onAiClick={() => setAiOpen((prev) => !prev)} />

      {/* Modals */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <AiStylistModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}