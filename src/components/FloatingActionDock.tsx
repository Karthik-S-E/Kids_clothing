import { useState } from "react";
import { ShoppingBag, MessageCircle, X } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { whatsappChatUrl } from "../lib/whatsapp";

export function FloatingActionDock({ onCartClick }: { onCartClick: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const totalItems = getTotalItems();

  return (
    <div className="fixed bottom-6 right-6 z-[var(--z-floating)] flex flex-col items-end gap-2">
      {isExpanded && (
        <div className="flex flex-col gap-2 mb-2">
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg transition hover:scale-105 hover:shadow-xl"
        aria-label="Toggle actions"
      >
        {isExpanded ? (
          <X className="h-5 w-5" />
        ) : (
          <ShoppingBag className="h-5 w-5" />
        )}
        {!isExpanded && totalItems > 0 && (
          <span 
            onClick={(e) => {
              e.stopPropagation();
              onCartClick();
            }}
            className="absolute -top-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white"
          >
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}
