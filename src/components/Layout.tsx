import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { CartFloat } from "./CartFloat";
import { CartModal } from "./CartModal";

export function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartFloat onClick={() => setIsCartOpen(true)} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
