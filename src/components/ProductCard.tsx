import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { normaliseAgeRange, type Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";

function getCardDescription(name: string, defaultDesc: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("sequin bodice")) return "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.";
  if (normalized.includes("floral lehenga")) return "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.";
  if (normalized.includes("floral printed") || normalized.includes("palazzo")) return "Floral kurta and palazzo set for girls with a soft dupatta. Light, comfy, and perfect for festivals.";
  return defaultDesc;
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus ?? true;
  const size = product.sizes?.[0] ?? "Standard";

  const displayDescription = getCardDescription(product.name, product.description);
  const displayAge = normaliseAgeRange(product.ageRange);

  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && discountPercent < 100;
  const mrp = hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : product.price;

  const handleWhatsAppOrderClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first so your order can be saved to your account!");
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KK-${randomNum}`;

    try {
      // Use setDoc with a specific ID to ensure it writes cleanly every time
      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, {
        orderId: orderId,
        orderNumber: orderId,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "Customer",
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            size,
            quantity: 1,
            image: product.image,
          },
        ],
        totalAmount: product.price,
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
      console.log("SUCCESSFULLY SAVED ORDER:", orderId);
    } catch (err: any) {
      console.error("FIRESTORE WRITE FAILED:", err);
      alert("Database error: " + (err.message || "Could not save order. Check Firestore rules."));
    }

    const customOrderUrl = whatsappOrderUrl({
      orderId,
      productName: product.name,
      size,
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
    >
      <Link to={`/shop/${product.id}`} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 block">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${!inStock ? "grayscale opacity-50" : ""}`}
        />
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px]">
            Out of Stock
          </span>
        )}
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
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-xs hover:bg-[#20ba59] active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-current" /> Order via WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}