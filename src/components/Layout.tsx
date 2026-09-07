import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { FloatingActionDock } from "./FloatingActionDock";
import { CartModal } from "./CartModal";
import { AiStylistModal } from "./AiStylistModal";

export function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      <FloatingActionDock onCartClick={() => setIsCartOpen(true)} />
      <AiStylistModal />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}