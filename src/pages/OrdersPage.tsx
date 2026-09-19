import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../lib/formatINR";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Truck, MapPin } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber?: string;
  orderId?: string;
  userId?: string;
  userEmail?: string;
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

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    async function loadOrders() {
      try {
        // Fetch recent orders to filter reliably on client side without index errors
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
        const snap = await getDocs(q);
        
        const allOrders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as OrderItem));
        
        // Filter matching current user UID or user email as a secure fallback
        const userOrders = allOrders.filter((ord) => {
          return ord.userId === user?.uid || (ord.userEmail && ord.userEmail === user?.email);
        });

        setOrders(userOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setFetching(false);
      }
    }
    loadOrders();
  }, [user]);

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
          to="/login" 
          className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
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

            const isCancelled = ord.status === "Cancelled";

            return (
              <div key={ord.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      Order #{displayId}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] border ${
                        isCancelled
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-emerald-50 text-[#03a685] border-emerald-200"
                      }`}
                    >
                      {ord.status || "Confirmed"}
                    </span>
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

                {/* Shipping & Delivery Preview */}
                {ord.delivery && (
                  <div className="mt-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-800">Delivering to: </span>
                      <span>{ord.delivery.customerName}, {ord.delivery.address}, {ord.delivery.city} - {ord.delivery.pincode}</span>
                    </div>
                  </div>
                )}

                {/* Footer / Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                  <div className="text-xs">
                    <span className="text-stone-500 font-medium">Total Amount: </span>
                    <span className="font-bold text-stone-900 text-base">{formatINR(ord.totalAmount)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {ord.trackingNumber && (
                      <span className="flex items-center gap-1 font-mono text-xs text-stone-600">
                        <Truck className="h-3.5 w-3.5 text-stone-500" /> {ord.trackingNumber}
                      </span>
                    )}
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
  );
}

export default OrdersPage;