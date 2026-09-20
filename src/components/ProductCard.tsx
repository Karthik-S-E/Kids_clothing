import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, MessageCircle } from "lucide-react";
import { normaliseAgeRange, type Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { useWishlistStore } from "../store/wishlistStore";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

function getCardDescription(name: string, defaultDesc: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("sequin bodice")) return "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.";
  if (normalized.includes("floral lehenga")) return "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.";
  if (normalized.includes("floral printed") || normalized.includes("palazzo")) return "Floral kurta and palazzo set for girls with a soft dupatta. Light, comfy, and perfect for festivals.";
  return defaultDesc;
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus ?? true;
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] ?? "Standard");
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const displayDescription = getCardDescription(product.name, product.description);
  const displayAge = normaliseAgeRange(product.ageRange);

  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && discountPercent < 100;
  const mrp = hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : product.price;

  const allImages = [
    product.image,
    ...(product.images || []),
    ...Object.values(product.colorImages || {}),
  ].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(allImages));

  useEffect(() => {
    let interval: any;
    if (isHovered && uniqueImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % uniqueImages.length);
      }, 1200);
    } else {
      setCurrentImageIdx(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, uniqueImages.length]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleWhatsAppOrderClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first so your order can be saved to your account!");
      window.location.href = "/login";
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KK-${randomNum}`;

    try {
      await addDoc(collection(db, "orders"), {
        orderNumber,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "Customer",
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            quantity: 1,
            image: uniqueImages[0] || product.image,
          },
        ],
        totalAmount: product.price,
        status: "Confirmed",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save order record to database:", err);
    }

    const customOrderUrl = whatsappOrderUrl({
      orderId: orderNumber,
      productName: product.name,
      size: selectedSize,
      price: product.price,
      productId: product.id,
    });

    window.open(customOrderUrl, "_blank", "noreferrer");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full rounded-xl border border-stone-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-stone-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/shop/${product.id}`} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 block">
        <img
          src={uniqueImages[currentImageIdx] || product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-all duration-500 ${!inStock ? "grayscale opacity-50" : ""}`}
        />

        {/* Image Pagination Dots */}
        {uniqueImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-10">
            {uniqueImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentImageIdx === idx ? "w-4 bg-white shadow" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px]">
            Out of Stock
          </span>
        )}

        {/* Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md transition hover:scale-110 cursor-pointer z-10"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-[#ff3e6c] text-[#ff3e6c]" : "text-stone-600 hover:text-stone-900"
            }`}
          />
        </button>

        {/* Compact Myntra-Style Hover Overlay (Takes up only bottom 35% so image is clear) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md px-2.5 py-2 border-t border-stone-200 shadow-md z-20"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Sizes:</span>
              </div>

              {/* Compact Size Pills */}
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSize(s);
                      }}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition cursor-pointer shrink-0 ${
                        selectedSize === s
                          ? "bg-[#282c3f] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-stone-500 font-medium">Standard Fit</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#282c3f]">
              {product.gender}
            </span>
            {displayAge && (
              <span className="inline-block rounded border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                {displayAge}
              </span>
            )}
          </div>

          <div className="min-h-[2.5rem]">
            <Link to={`/shop/${product.id}`} className="hover:text-amber-800 transition-colors block">
              <h2 className="text-xs sm:text-sm font-bold leading-tight text-[#282c3f] line-clamp-2">
                {product.name}
              </h2>
            </Link>
          </div>

          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-[#282c3f]">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[11px] sm:text-xs text-stone-500 line-through font-medium">
                  MRP {formatINR(mrp)}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-amber-700">
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          <p className="mt-1.5 line-clamp-2 text-[11px] text-[#696b79] leading-relaxed min-h-[2rem]">
            {displayDescription}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <Link
            to={`/shop/${product.id}`}
            className="text-[11px] font-bold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>

          <a
            href="#order"
            onClick={handleWhatsAppOrderClick}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-xs hover:bg-[#20ba59] active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="h-3 w-3 fill-current" /> WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;