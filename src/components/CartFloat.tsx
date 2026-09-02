import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cartStore";

export function CartFloat({ onClick }: { onClick: () => void }) {
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_32px_rgba(212,175,55,0.35)] transition hover:scale-110"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}