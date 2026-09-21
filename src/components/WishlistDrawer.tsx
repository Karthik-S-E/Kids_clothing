import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../lib/formatINR";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const handleMoveToBag = (product: any) => {
    const defaultSize = product.sizes?.[0] || "2Y";
    const chosenSize = selectedSizes[product.id] || defaultSize;
    addItem(product, chosenSize);
    toggleWishlist(product);
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
                <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900">Wishlist</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close wishlist"
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
                      <Heart className="h-10 w-10 stroke-1" />
                    </div>

                    <h3 className="text-base font-bold text-stone-900">
                      YOUR WISHLIST IS EMPTY
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Add items that you like to your wishlist. Review them anytime and easily move them to the bag.
                    </p>

                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="mt-6 inline-flex min-h-[44px] items-center justify-center border-2 border-[#ff3e6c] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#ff3e6c] hover:bg-[#ff3e6c] hover:text-white transition cursor-pointer"
                    >
                      CONTINUE SHOPPING
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((product) => {
                      const availableSizes =
                        product.sizes && product.sizes.length > 0 ? product.sizes : ["2Y"];
                      const currentSize = selectedSizes[product.id] || availableSizes[0];

                      return (
                        <div
                          key={product.id}
                          className="flex gap-4 border-b border-stone-100 pb-4"
                        >
                          <Link
                            to={`/shop/${product.id}`}
                            onClick={onClose}
                            className="block h-20 w-20 flex-shrink-0"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full rounded-lg object-cover border border-stone-100"
                            />
                          </Link>

                          <div className="flex-1">
                            <h3 className="font-medium text-stone-900 text-sm">{product.name}</h3>
                            <p className="text-sm font-bold text-[#ff3e6c] mt-0.5">
                              {formatINR(product.price)}
                            </p>

                            <div className="mt-2">
                              <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                                Select Size
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {availableSizes.map((sz: string) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() =>
                                      setSelectedSizes((prev) => ({
                                        ...prev,
                                        [product.id]: sz,
                                      }))
                                    }
                                    className={`min-h-[26px] min-w-[26px] px-1.5 text-[11px] font-bold border transition cursor-pointer ${
                                      currentSize === sz
                                        ? "border-stone-900 bg-stone-900 text-white"
                                        : "border-stone-200 text-stone-700 hover:border-stone-400 bg-white"
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3 flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => handleMoveToBag(product)}
                                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#ff3e6c] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e7335e] transition cursor-pointer shadow-xs"
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>Move to Bag ({currentSize})</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => toggleWishlist(product)}
                                className="text-center text-xs text-stone-400 hover:text-red-500 font-semibold transition cursor-pointer py-0.5"
                              >
                                Remove from Wishlist
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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