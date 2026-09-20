import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";
import { whatsappCartUrl } from "../lib/whatsapp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const handleCheckout = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first so your order can be saved to your account!");
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KK-${randomNum}`;
    const totalPrice = getTotalPrice();

    try {
      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, {
        orderId: orderId,
        orderNumber: orderId,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "Customer",
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          size: item.size,
          quantity: item.quantity,
          image: item.product.image,
        })),
        totalAmount: totalPrice,
        status: "Confirmed",
        delivery: {
          customerName: user.displayName || "Customer",
          phone: "9999999999",
          address: "Registered Address",
          city: "Tarikere",
          pincode: "577228",
        },
        createdAt: serverTimestamp(),
      });
      console.log("SUCCESSFULLY SAVED CART ORDER:", orderId);
    } catch (err: any) {
      console.error("FIRESTORE WRITE FAILED:", err);
      alert("Database error: " + (err.message || "Could not save order. Check Firestore rules."));
    }

    const url = whatsappCartUrl(items, orderId);
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
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[var(--z-modal)] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[var(--z-navigation)] h-full w-full max-w-md bg-[var(--background)] shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
                <h2 className="font-display text-3xl">Your Bag</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[var(--border)] transition-colors cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-lg text-[var(--text-secondary)]">Your bag is empty</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Add some beautiful pieces for your little one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="flex gap-4 border-b border-[var(--border)] pb-4"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">Size: {item.size}</p>
                          <p className="text-sm font-semibold text-[var(--accent-primary)] mt-1">
                            {formatINR(item.product.price)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="ml-auto text-sm text-red-400 hover:text-red-300 cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
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
                <div className="border-t border-[var(--border)] p-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold text-[var(--accent-primary)]">{formatINR(getTotalPrice())}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-full bg-[#25D366] py-3 text-sm font-semibold uppercase tracking-widest text-white whatsapp-glow cursor-pointer"
                  >
                    Checkout via WhatsApp
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full rounded-full border border-[var(--border)] py-3 text-sm font-medium uppercase tracking-widest hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
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

export default CartModal;