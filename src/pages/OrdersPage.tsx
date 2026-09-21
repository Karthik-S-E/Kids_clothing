import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../lib/formatINR";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Truck, MapPin, FileText, Trash2, MessageCircle, AlertTriangle, X } from "lucide-react";
import { InvoiceModal } from "../components/InvoiceModal";
import { social } from "../config";

interface OrderItem {
  id: string;
  orderNumber?: string;
  orderId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  items: Array<{ name: string; price: number; size: string; quantity: number; image: string }>;
  totalAmount: number;
  status: string;
  delivery?: {
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  trackingNumber?: string;
  courierName?: string;
  createdAt: any;
}

export function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [fetching, setFetching] = useState(true);

  // Invoice modal states
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderItem | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Custom Confirmation Modal state for deletion
  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = async () => {
    if (!user) {
      setFetching(false);
      return;
    }

    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      
      const allOrders = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OrderItem));
      
      const userOrders = allOrders.filter((ord) => {
        return ord.userId === user?.uid || (ord.userEmail && ord.userEmail === user?.email);
      });

      setOrders(userOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const confirmDeleteOrder = async () => {
    if (!orderToDeleteId) return;
    
    const targetOrder = orders.find(o => o.id === orderToDeleteId);
    if (targetOrder) {
      const currentStatus = targetOrder.status || "Confirmed";
      if (currentStatus !== "Confirmed" && currentStatus !== "Pending WhatsApp Confirmation") {
        alert("This order can no longer be cancelled as it is already being processed.");
        setOrderToDeleteId(null);
        return;
      }
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "orders", orderToDeleteId));

      setOrders((prev) => prev.filter((o) => o.id !== orderToDeleteId));
      setOrderToDeleteId(null);
    } catch (err: any) {
      alert("Failed to delete order: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenInvoice = (ord: OrderItem) => {
    setSelectedOrderForInvoice(ord);
    setIsInvoiceOpen(true);
  };

  // Helper to map order status to local badge image assets
  const getStatusBadgeImage = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "pending whatsapp confirmation":
        return "/confirmed.png";
      case "packed":
      case "shipped":
        return "/Shipped.png";
      case "delivered":
        return "/delivered.png";
      case "saved for later":
        return "/saveforlater.png";
      case "cancelled":
        return "/cancelled.png";
      default:
        return "/confirmed.png";
    }
  };

  if (loading || fetching) {
    return (
      <div className="py-32 text-center text-xs font-bold uppercase tracking-wider text-stone-500">
        Loading orders...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
        <Package className="h-12 w-12 text-stone-400 mb-3" />
        <h2 className="font-serif text-2xl text-stone-900">Please sign in to view your orders</h2>
        <p className="mt-1 text-xs text-stone-500">Access your past order receipts and track delivery shipments.</p>
        <Link 
          to="/shop" 
          className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-16 font-sans text-stone-900">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b85a3c]">
              My Account
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">My Orders</h1>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 hover:underline"
          >
            Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <h3 className="font-serif text-xl text-stone-800">No Orders Placed Yet</h3>
            <p className="mt-1 text-xs text-stone-500">
              You have not placed any orders yet. Discover our handcrafted festive collections!
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const displayId = ord.orderNumber || ord.orderId || ord.id.slice(0, 8).toUpperCase();
              const dateStr = ord.createdAt?.toDate
                ? ord.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Recent";

              const status = ord.status || "Confirmed";
              const badgeImage = getStatusBadgeImage(status);
              
              const canCancel = status === "Confirmed" || status === "Pending WhatsApp Confirmation";
              const isDelivered = status === "Delivered";

              return (
                <div key={ord.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        Order #{displayId}
                      </span>
                      {/* Status Badge Image in the header */}
                      <img 
                        src={badgeImage} 
                        alt={status} 
                        className="h-6 w-auto object-contain drop-shadow-xs" 
                      />
                    </div>
                    <span className="text-stone-500 font-medium">Placed: {dateStr}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-stone-100 py-3">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3 text-xs">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-16 w-14 rounded-lg object-cover border border-stone-200 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 text-sm truncate">{item.name}</p>
                          <p className="text-stone-500 mt-0.5">Size: {item.size} · Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-stone-900 text-sm">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping & Delivery Preview with Middle Graphic Space */}
                  <div className="mt-2 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-stone-50 p-4">
                    <div className="flex items-start gap-2.5 text-xs text-stone-600 flex-1">
                      <MapPin className="h-4 w-4 text-[#ff3e6c] mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-800">Delivering to: </span>
                        <span>{ord.delivery?.customerName}, {ord.delivery?.address}, {ord.delivery?.city} - {ord.delivery?.pincode}</span>
                      </div>
                    </div>

                    {/* Filling the middle gap with a prominent status badge graphic */}
                    <div className="flex items-center justify-center shrink-0 px-4 py-1.5 bg-white rounded-xl border border-stone-200 shadow-2xs gap-2">
                      <img src={badgeImage} alt={status} className="h-8 w-8 object-contain" />
                      <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Fulfillment Status</span>
                        <span className="font-serif text-xs font-bold text-stone-800 capitalize">{status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer / Actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                    <div className="text-xs">
                      <span className="text-stone-500 font-medium">Total Amount: </span>
                      <span className="font-bold text-[#ff3e6c] text-base">{formatINR(ord.totalAmount)}</span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {ord.trackingNumber && (
                        <span className="flex items-center gap-1 font-mono text-xs text-stone-600">
                          <Truck className="h-3.5 w-3.5 text-stone-500" /> {ord.trackingNumber}
                        </span>
                      )}

                      {isDelivered ? (
                        <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                          Successfully Delivered
                        </span>
                      ) : canCancel ? (
                        <button
                          type="button"
                          onClick={() => setOrderToDeleteId(ord.id)}
                          className="rounded-lg bg-red-50 text-red-600 border border-red-200 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-100 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Cancel Order
                        </button>
                      ) : (
                        <div className="text-[11px] text-stone-500 italic flex items-center gap-1">
                          <span>Order is {status}. To modify,</span>
                          <a
                            href={`https://wa.me/${social.whatsappNumber}?text=Hi,%20regarding%20my%20order%20%23${displayId}%20(${status}),%20I%20would%20like%20to%20request%20modifications.`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-bold underline flex items-center gap-0.5 not-italic"
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp us
                          </a>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenInvoice(ord)}
                        className="rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-100 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#ff3e6c]" /> Invoice
                      </button>

                      <Link
                        to={`/track?orderId=${displayId}`}
                        className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-stone-50"
                      >
                        Track Parcel
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Custom Confirmation Modal for Deletion */}
      {orderToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" /> Delete Order
              </div>
              <button
                type="button"
                onClick={() => setOrderToDeleteId(null)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to cancel and completely delete this order? This action cannot be undone.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition cursor-pointer flex justify-center items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal Popup */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        orderData={selectedOrderForInvoice ? {
          orderId: selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.orderId || selectedOrderForInvoice.id,
          items: selectedOrderForInvoice.items,
          totalAmount: selectedOrderForInvoice.totalAmount,
          userName: selectedOrderForInvoice.userName || selectedOrderForInvoice.delivery?.customerName || "Customer",
          userEmail: selectedOrderForInvoice.userEmail || user?.email || "",
          delivery: selectedOrderForInvoice.delivery,
          createdAt: selectedOrderForInvoice.createdAt,
        } : null}
      />
    </>
  );
}

export default OrdersPage;