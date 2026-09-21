import { useState, useId, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  X 
} from "lucide-react";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

function getImagesForColor(prod: any, clr: string): string[] {
  if (!prod || !clr) return [];

  // 1. colorImagesList
  const list = prod.colorImagesList?.[clr];
  if (Array.isArray(list) && list.length > 0) return list.flat().filter(Boolean);

  // 2. colorGalleries / colorGallery
  const galleries = prod.colorGalleries?.[clr] || prod.colorGallery?.[clr];
  if (Array.isArray(galleries) && galleries.length > 0) return galleries.flat().filter(Boolean);

  // 3. colorImages (handles both string[] array or single string)
  const cImgs = prod.colorImages?.[clr];
  if (Array.isArray(cImgs) && cImgs.length > 0) return cImgs.flat().filter(Boolean);
  if (typeof cImgs === "string" && cImgs.trim()) return [cImgs.trim()];

  // 4. colorSpecificImages / colorPhotos
  const specific = prod.colorSpecificImages?.[clr] || prod.colorPhotos?.[clr];
  if (Array.isArray(specific) && specific.length > 0) return specific.flat().filter(Boolean);
  if (typeof specific === "string" && specific.trim()) return [specific.trim()];

  return [];
}

export function ProductPage() {
  const { id } = useParams();
  const product = useProductStore((s) => s.products.find((p) => p.id === id));
  const addItemToCart = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const availableColors = product?.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const [size, setSize] = useState<string>(product?.sizes[0] ?? "");
  // Default to first color if present
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] ?? "");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const colorGroupId = useId();
  const sizeGroupId = useId();

  // Reset to the product's primary color when navigating between different products
  useEffect(() => {
    setSelectedColor(availableColors[0] ?? "");
  }, [product?.id]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [availableColors]);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-stone-900">Piece Not Found</h1>
        <p className="mt-3 text-sm text-stone-700">The garment you are looking for is currently unavailable.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff3e6c] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#e7335e]"
        >
          Return to Shop
        </Link>
      </main>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const inStock = product.stockStatus ?? true;
  const quantity = product.stockQuantity ?? 5;

  // Retrieve all images for the selected color; fallback to default gallery if deselected
  let displayImages: string[] = [];
  if (selectedColor) {
    displayImages = getImagesForColor(product, selectedColor);
  }
  
  if (displayImages.length === 0) {
    if (product.images && product.images.length > 0) {
      displayImages = product.images;
    } else if (product.image) {
      displayImages = [product.image];
    }
  }

  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && discountPercent < 100;
  const mrp = hasDiscount
    ? Math.round(product.price / (1 - discountPercent / 100))
    : product.price;

  const itemTitle = [
    product.name,
    selectedColor ? `(${selectedColor})` : "",
    product.designNo ? `[#${product.designNo}]` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const scrollThumbnails = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 160;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToBag = () => {
    if (!inStock) return;
    addItemToCart(product, size || product.sizes[0] || "Standard");
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2200);
  };

  const handleWhatsAppOrderClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first so your order can be saved to your account!");
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KK-${randomNum}`;
    const selectedSize = size || product.sizes[0] || "Standard";

    try {
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
            name: itemTitle,
            price: product.price,
            size: selectedSize,
            quantity: 1,
            image: displayImages[0] || product.image,
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
    } catch (err: any) {
      console.error("FIRESTORE WRITE FAILED:", err);
      alert("Database error: " + (err.message || "Could not save order. Check Firestore rules."));
    }

    const customOrderUrl = whatsappOrderUrl({
      orderId,
      productName: itemTitle,
      size: selectedSize,
      price: product.price,
      productId: product.id,
    });

    window.open(customOrderUrl, "_blank", "noreferrer");
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus("Please enter a valid 6-digit postal code.");
      return;
    }
    setPincodeStatus("Delivery available! Usually arrives in 3-5 business days.");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 font-sans text-stone-900 pt-20">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone-700 font-medium">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="transition hover:text-black hover:underline">Home</Link></li>
          <ChevronRight className="h-3 w-3 text-stone-500" aria-hidden="true" />
          <li><Link to="/shop" className="transition hover:text-black hover:underline">Ethnic Wear</Link></li>
          <ChevronRight className="h-3 w-3 text-stone-500" aria-hidden="true" />
          <li><Link to={`/shop?gender=${product.gender}`} className="transition hover:text-black hover:underline">{product.gender} Clothing</Link></li>
          <ChevronRight className="h-3 w-3 text-stone-500" aria-hidden="true" />
          <li className="font-bold text-stone-900 truncate max-w-[240px]" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        
        {/* Left Panel: Vertical Stack showing all images for current color/state */}
        <section aria-label="Product Media Showcase" className="lg:col-span-6 flex flex-col gap-4 w-full">
          {displayImages.map((imgUrl, idx) => (
            <div key={idx} className="w-full overflow-hidden rounded-xl bg-white border border-stone-200 shadow-xs relative">
              <img
                src={imgUrl}
                alt={`${product.name} - View ${idx + 1}`}
                fetchPriority={idx === 0 ? "high" : "auto"}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`w-full h-auto object-cover block transition-transform duration-300 hover:scale-[1.01] ${!inStock ? "grayscale opacity-60" : ""}`}
              />
              {!inStock && idx === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">Out of Stock</span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Right Panel: Product Purchasing Options */}
        <section aria-label="Product Purchasing Options" className="lg:col-span-6 flex flex-col gap-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm lg:sticky lg:top-24">
          <div className="border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-black tracking-tight text-stone-900">Kandamma Kids</h1>
            <p className="text-lg font-medium text-stone-700 mt-1">{product.name}</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded border border-stone-300 bg-stone-50 px-2.5 py-1 text-xs shadow-2xs">
              <span className="font-extrabold text-stone-900">4.8</span>
              <Star className="h-3.5 w-3.5 fill-[#03a685] text-[#03a685]" />
              <span className="border-l border-stone-300 pl-2 font-medium text-stone-700">Verified Artisan Quality</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-col gap-1 border-b border-stone-200 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900">{formatINR(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-base text-stone-500 line-through font-medium">MRP {formatINR(mrp)}</span>
                  <span className="text-base font-bold text-amber-700">({discountPercent}% OFF)</span>
                </>
              )}
            </div>
            <span className="text-xs font-bold text-[#03a685] tracking-wide uppercase">inclusive of all taxes</span>
          </div>

          {/* Color Selector: Click to select, click again to deselect */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span id={colorGroupId} className="text-xs font-bold uppercase tracking-wider text-stone-900">
                More Colors: <span className="font-semibold text-[#ff3e6c] normal-case capitalize">{selectedColor || "All Images"}</span>
              </span>

              <div className="relative group">
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails("left")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md text-stone-700 hover:bg-stone-100 hover:text-black transition cursor-pointer border border-stone-200"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  role="radiogroup"
                  aria-labelledby={colorGroupId}
                  className="flex items-center gap-3 overflow-x-auto px-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                >
                  {availableColors.map((clr) => {
                    const colorImgs = getImagesForColor(product, clr);
                    const thumb = colorImgs[0] || (typeof product.colorImages?.[clr] === "string" ? product.colorImages[clr] : product.image);
                    const isSelected = selectedColor === clr;

                    return (
                      <button
                        key={clr}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedColor(isSelected ? "" : clr)}
                        style={{ width: "78px", minWidth: "78px", maxWidth: "78px", borderRadius: "14px", borderWidth: "1.6px" }}
                        className={`relative flex flex-col items-center overflow-hidden transition-all cursor-pointer bg-stone-50 ${
                          isSelected
                            ? "border-[#111] ring-2 ring-black/20 shadow-md scale-[1.02]"
                            : "border-stone-300 hover:border-stone-600"
                        }`}
                      >
                        <div className="relative h-[95px] w-full flex items-center justify-center overflow-hidden bg-stone-100">
                          <img src={thumb} alt={clr} className="h-full w-full object-cover object-center" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                              <span className="rounded-full bg-black text-white p-1">
                                <Check className="h-3 w-3" />
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="w-full py-1 px-1 bg-white text-center border-t border-stone-200">
                          <span className={`text-[10px] font-bold block truncate capitalize ${isSelected ? "text-black" : "text-stone-700"}`}>
                            {clr}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails("right")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md text-stone-700 hover:bg-stone-100 hover:text-black transition cursor-pointer border border-stone-200"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span id={sizeGroupId} className="text-xs font-bold uppercase tracking-wider text-stone-900">Select Size</span>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="text-xs font-bold uppercase tracking-wider text-[#ff3e6c] hover:underline cursor-pointer"
              >
                Size Chart &gt;
              </button>
            </div>

            <div role="radiogroup" aria-labelledby={sizeGroupId} className="flex flex-wrap gap-3">
              {product.sizes.map((sz) => {
                const isSelected = size === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!inStock}
                    onClick={() => setSize(sz)}
                    className={`flex h-12 min-w-[48px] px-3 items-center justify-center rounded-full border text-sm font-bold uppercase transition-all ${
                      isSelected
                        ? "border-2 border-[#ff3e6c] text-[#ff3e6c] bg-[#fff0f3]"
                        : "border-stone-300 text-stone-900 bg-white hover:border-stone-800"
                    } ${!inStock ? "cursor-not-allowed opacity-40 line-through bg-stone-100" : "cursor-pointer"}`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            <div className="mt-1">
              {inStock ? (
                quantity <= 3 ? (
                  <p className="text-xs font-bold text-amber-700">Hurry! Only {quantity} piece{quantity > 1 ? "s" : ""} left in stock.</p>
                ) : (
                  <p className="text-xs font-bold text-[#03a685]">In stock · Ready for dispatch</p>
                )
              ) : (
                <p className="text-xs font-bold text-red-600">Currently Out of Stock</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {inStock ? (
                <>
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#ff3e6c] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#e7335e] active:scale-[0.98] cursor-pointer"
                  >
                    {addedFeedback ? (
                      <><Check className="h-4 w-4" /> Added</>
                    ) : (
                      <><ShoppingBag className="h-4 w-4" /> Add to Bag</>
                    )}
                  </button>

                  <a
                    href="#order"
                    onClick={handleWhatsAppOrderClick}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#20bd5a] active:scale-[0.98] cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-stone-200 px-4 text-xs font-bold uppercase tracking-wider text-stone-500 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors active:scale-[0.98] cursor-pointer ${
                isWishlisted
                  ? "border-[#ff3e6c] text-[#ff3e6c] bg-[#fff0f3]"
                  : "border-stone-300 text-stone-800 bg-white hover:border-stone-800 hover:bg-stone-50"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#ff3e6c] text-[#ff3e6c]" : ""}`} />
              {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {/* External Marketplaces */}
          {(product.meeshoUrl || product.flipkartUrl) && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-stone-700 font-semibold">Also Available On:</span>
              {product.meeshoUrl && (
                <a
                  href={product.meeshoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[#f43397] bg-white px-2.5 py-1 font-bold text-[#f43397] hover:bg-[#f43397]/10 transition"
                >
                  Meesho <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {product.flipkartUrl && (
                <a
                  href={product.flipkartUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[#2874f0] bg-white px-2.5 py-1 font-bold text-[#2874f0] hover:bg-[#2874f0]/10 transition"
                >
                  Flipkart <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Delivery Checker */}
          <div className="border-t border-stone-200 pt-5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900 block mb-2">Delivery Options</span>
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit pincode"
                className="w-48 rounded border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-900 font-medium outline-none focus:border-stone-800"
              />
              <button
                type="submit"
                className="rounded px-4 py-2 text-xs font-bold uppercase text-[#ff3e6c] hover:bg-[#ff3e6c]/10 transition cursor-pointer"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`mt-2 text-xs font-medium ${pincodeStatus.includes("available") ? "text-[#03a685]" : "text-red-500"}`}>
                {pincodeStatus}
              </p>
            )}

            <div className="mt-4 space-y-2 text-xs font-medium text-stone-700">
              <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-stone-900" /> Fast Delivery Across All of India</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-stone-900" /> 100% Genuine Handcrafted Kids Wear</p>
              <p className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-stone-900" /> Easy Size Exchange Assistance via WhatsApp</p>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="border-t border-stone-200 pt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">Product Details</h2>
            <p className="text-xs leading-relaxed text-stone-700 mb-4 font-normal">{product.description}</p>

            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">Specifications</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-stone-200 pt-3 text-xs">
              <div>
                <span className="text-stone-500 font-medium block">Design Number</span>
                <span className="font-bold text-stone-900">{product.designNo || "Standard"}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Style</span>
                <span className="font-bold text-stone-900">{product.style || "Traditional Ethnic"}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Age Group</span>
                <span className="font-bold text-stone-900">{product.ageRange}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Occasion</span>
                <span className="font-bold text-stone-900">{product.occasion || "Festive & Ceremonial"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">Kandamma Kids Size Chart</h3>
              <button type="button" onClick={() => setSizeChartOpen(false)} className="rounded-full p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100 text-stone-900">
                    <th className="p-2.5 font-bold">Standard Size</th>
                    <th className="p-2.5 font-bold">Age Bracket</th>
                    <th className="p-2.5 font-bold">Chest (inches)</th>
                    <th className="p-2.5 font-bold">Length (inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  <tr><td className="p-2.5 font-bold text-stone-900">1Y - 2Y</td><td className="p-2.5">1-2 Years</td><td className="p-2.5">20 - 21</td><td className="p-2.5">18</td></tr>
                  <tr><td className="p-2.5 font-bold text-stone-900">2Y - 3Y</td><td className="p-2.5">2-3 Years</td><td className="p-2.5">22 - 23</td><td className="p-2.5">21</td></tr>
                  <tr><td className="p-2.5 font-bold text-stone-900">3Y - 4Y</td><td className="p-2.5">3-4 Years</td><td className="p-2.5">24</td><td className="p-2.5">24</td></tr>
                  <tr><td className="p-2.5 font-bold text-stone-900">4Y - 5Y</td><td className="p-2.5">4-5 Years</td><td className="p-2.5">25 - 26</td><td className="p-2.5">27</td></tr>
                  <tr><td className="p-2.5 font-bold text-stone-900">6Y - 8Y</td><td className="p-2.5">6-8 Years</td><td className="p-2.5">27 - 29</td><td className="p-2.5">31</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setSizeChartOpen(false)} className="rounded bg-[#ff3e6c] px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e7335e] cursor-pointer">
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductPage;