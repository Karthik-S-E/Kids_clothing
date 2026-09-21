import { X, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer: Placed at fixed right-0 top-0 z-[110] so it never hides behind the navbar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[110] h-full w-full max-w-md bg-[var(--background,#fff)] shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border,#e5e5e5)] p-6">
                <h2 className="font-display text-3xl">Your Wishlist</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[var(--border,#f5f5f5)] transition-colors cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Items List / Empty State */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-lg text-[var(--text-secondary,#666)]">Your wishlist is empty</p>
                    <p className="text-sm text-[var(--text-secondary,#888)] mt-2">
                      Save pieces you love to review them anytime.
                    </p>
                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="mt-6 rounded-full border border-[var(--border,#e5e5e5)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-[var(--accent-primary,#ff3e6c)] transition-colors"
                    >
                      Explore Shop
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-4 border-b border-[var(--border,#e5e5e5)] pb-4"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm font-semibold text-[var(--accent-primary,#ff3e6c)] mt-1">
                              {formatINR(product.price)}
                            </p>
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
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff3e6c] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#e7335e] transition cursor-pointer"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Move to Bag</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleWishlist(product)}
                              className="text-stone-400 hover:text-red-500 transition cursor-pointer p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistDrawer;