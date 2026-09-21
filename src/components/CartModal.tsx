import { useState } from "react";
import { Link } from "react-router-dom";
import { X, AlertCircle, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";
import { whatsappCartUrl } from "../lib/whatsapp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { db, auth } from "../lib/firebase";

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resentSuccess, setResentSuccess] = useState(false);

  const currentUser = auth.currentUser;

  const handleResendVerification = async () => {
    if (!currentUser) return;
    try {
      await sendEmailVerification(currentUser);
      setResentSuccess(true);
      setVerificationError(null);
      setTimeout(() => setResentSuccess(false), 4000);
    } catch {
      setVerificationError("Please wait a moment before requesting another verification email.");
    }
  };

  const handleCheckout = async () => {
    setVerificationError(null);
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first so your order can be saved to your account!");
      return;
    }

    await user.reload();

    if (!user.emailVerified) {
      setVerificationError("Please verify your email before checking out. Click 'Resend Email' if needed.");
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
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[110] h-full w-full max-w-md bg-[var(--background,#fff)] shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[var(--border,#e5e5e5)] p-6">
                <h2 className="font-display text-3xl">Your Bag</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-[var(--border,#f5f5f5)] transition-colors cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-lg text-[var(--text-secondary,#666)]">Your bag is empty</p>
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
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="flex gap-4 border-b border-[var(--border,#e5e5e5)] pb-4"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-[var(--text-secondary,#666)]">Size: {item.size}</p>
                          <p className="text-sm font-semibold text-[var(--accent-primary,#ff3e6c)] mt-1">
                            {formatINR(item.product.price)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="w-12 h-12 rounded-full border border-[var(--border,#e5e5e5)] flex items-center justify-center hover:border-[var(--accent-primary,#ff3e6c)] transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="w-12 h-12 rounded-full border border-[var(--border,#e5e5e5)] flex items-center justify-center hover:border-[var(--accent-primary,#ff3e6c)] transition-colors cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              type="button"
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
                <div className="border-t border-[var(--border,#e5e5e5)] p-6 space-y-4">
                  {currentUser && !currentUser.emailVerified && (
                    <div className="rounded-xl border border-amber-300/80 bg-amber-50 p-3 text-xs text-amber-900">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Email Verification Required</p>
                          <p className="mt-0.5 text-amber-800">
                            Please verify <span className="font-medium underline">{currentUser.email}</span> to proceed with checkout.
                          </p>
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            className="mt-2 inline-flex items-center gap-1 font-bold text-amber-950 underline hover:text-black cursor-pointer"
                          >
                            Resend Verification Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {verificationError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  {resentSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                      <MailCheck className="h-4 w-4 shrink-0" />
                      <span>Verification email sent! Check your inbox.</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold text-[var(--accent-primary,#ff3e6c)]">
                      {formatINR(getTotalPrice())}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full rounded-full bg-[#25D366] py-3 text-sm font-semibold uppercase tracking-widest text-white whatsapp-glow cursor-pointer transition active:scale-[0.99]"
                  >
                    Checkout via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full rounded-full border border-[var(--border,#e5e5e5)] py-3 text-sm font-medium uppercase tracking-widest hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
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