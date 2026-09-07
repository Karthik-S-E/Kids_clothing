import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cartStore";

export function CartFloat({ onClick }: { onClick: () => void }) {
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-[var(--z-floating)] flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg transition hover:scale-105 hover:shadow-xl"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}