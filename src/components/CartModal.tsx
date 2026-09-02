import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";
import { whatsappCartUrl } from "../lib/whatsapp";

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const handleCheckout = () => {
    const url = whatsappCartUrl(items);
    window.open(url, "_blank");
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[160] h-full w-full max-w-md bg-[var(--bg)] shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[var(--line)] p-6">
                <h2 className="font-display text-3xl">Your Bag</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[var(--line)] transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-lg text-[var(--muted)]">Your bag is empty</p>
                    <p className="text-sm text-[var(--muted)] mt-2">
                      Add some beautiful pieces for your little one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="flex gap-4 border-b border-[var(--line)] pb-4"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-[var(--muted)]">Size: {item.size}</p>
                          <p className="text-sm font-semibold text-gold mt-1">
                            {formatINR(item.product.price)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:border-gold transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:border-gold transition-colors"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="ml-auto text-sm text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-[var(--line)] p-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold text-gold">{formatINR(getTotalPrice())}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-full bg-[#25D366] py-3 text-sm font-semibold uppercase tracking-widest text-white whatsapp-glow"
                  >
                    Checkout via WhatsApp
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full rounded-full border border-[var(--line)] py-3 text-sm font-medium uppercase tracking-widest hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    Clear Bag
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}