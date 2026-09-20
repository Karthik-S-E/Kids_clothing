import { X, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export function WishlistDrawer({ isOpen, onClose, onOpenCart }: WishlistDrawerProps) {
  const { items, toggleWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              My Wishlist ({items.length})
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Your wishlist is empty</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="mt-4 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800"
                >
                  Explore Shop
                </Link>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-stone-100">
                {items.map((product) => (
                  <div key={product.id} className="flex gap-4 pt-4 first:pt-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-16 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{product.name}</h3>
                        <p className="mt-0.5 text-xs font-extrabold text-stone-900">{formatINR(product.price)}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            addItemToCart(product, product.sizes?.[0] || "Standard");
                            toggleWishlist(product);
                            onClose();
                            if (onOpenCart) onOpenCart();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#ff3e6c] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#e7335e] cursor-pointer"
                        >
                          <ShoppingBag className="h-3 w-3" /> Move to Bag
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(product)}
                          className="text-stone-400 hover:text-red-600 cursor-pointer p-1"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}