import { X, AlertCircle, MailCheck, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";
import { whatsappCartUrl } from "../lib/whatsapp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { useState } from "react";

export function CartModal({
  isOpen,
  onClose,
  onOpenWishlist,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenWishlist?: () => void;
}) {
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

  const handleOpenWishlistFromCart = () => {
    onClose();
    if (onOpenWishlist) {
      onOpenWishlist();
    }
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
            className="fixed right-0 top-0 z-[110] h-full w-full max-w-md bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 p-6">
                <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900">Your Bag</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close cart"
                  className="rounded-full p-2 hover:bg-stone-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#faf9f9] text-[#696e79]">
                      <ShoppingBag className="h-10 w-10 stroke-1" />
                    </div>

                    <h3 className="text-base font-bold text-stone-900">
                      Hey, it feels so light!
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      There is nothing in your bag. Let&apos;s add some items.
                    </p>

                    <button
                      type="button"
                      onClick={handleOpenWishlistFromCart}
                      className="mt-6 inline-flex min-h-[44px] items-center justify-center border-2 border-[#ff3e6c] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#ff3e6c] hover:bg-[#ff3e6c] hover:text-white transition cursor-pointer"
                    >
                      ADD ITEMS FROM WISHLIST
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="flex gap-4 border-b border-stone-100 pb-4"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-lg object-cover border border-stone-100"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-stone-900 text-sm">{item.product.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">Size: {item.size}</p>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-bold text-[#ff3e6c]">
                              {formatINR(item.product.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-stone-400 font-medium">
                                (for {item.quantity} items)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center hover:border-black transition-colors cursor-pointer text-stone-700"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center hover:border-black transition-colors cursor-pointer text-stone-700"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="ml-auto text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer p-1"
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

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-stone-200 p-6 space-y-4 bg-white">
                  {currentUser && !currentUser.emailVerified && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Email Verification Required</p>
                          <p className="mt-0.5 text-amber-800">
                            Please verify <span className="underline font-medium">{currentUser.email}</span> to checkout.
                          </p>
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            className="mt-1.5 font-bold text-amber-950 underline cursor-pointer"
                          >
                            Resend Verification Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {verificationError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  {resentSuccess && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                      <MailCheck className="h-4 w-4 shrink-0" />
                      <span>Verification email sent! Check your inbox.</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-base">
                    <span className="font-medium text-stone-700">Total</span>
                    <span className="font-bold text-lg text-[#ff3e6c]">
                      {formatINR(getTotalPrice())}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full rounded-md bg-[#25D366] py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#20ba59] cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    Checkout via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full rounded-md border border-stone-200 py-2.5 text-xs font-medium uppercase tracking-wider text-stone-600 hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
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