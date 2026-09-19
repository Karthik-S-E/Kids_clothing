import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { formatINR } from "../lib/formatINR";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Package, 
  ExternalLink, 
  AlertCircle,
  Ban
} from "lucide-react";

interface OrderDocument {
  id: string;
  orderNumber?: string;
  orderId?: string;
  status?: string;
  totalAmount?: number;
  userId?: string;
  customerEmail?: string;
  trackingNumber?: string;
  courierName?: string;
  delivery?: {
    customerName?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  items?: Array<{
    name: string;
    image: string;
    size: string;
    quantity: number;
    price: number;
  }>;
}

const STATUS_STEPS = [
  "Pending Confirmation",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
];

export function TrackOrderPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const initialId = searchParams.get("orderId");
    if (initialId) {
      setOrderId(initialId);
      void runTracking(initialId);
    }
  }, [searchParams]);

  async function runTracking(searchId: string) {
    const cleanId = searchId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);
    setOrder(null);
    setPermissionError(null);

    try {
      const snap = await getDocs(collection(db, "orders"));
      const allOrders: OrderDocument[] = snap.docs.map((d) => {
        const data = d.data() as Partial<OrderDocument>;
        return {
          id: d.id,
          orderNumber: data.orderNumber,
          orderId: data.orderId,
          status: data.status,
          totalAmount: data.totalAmount,
          userId: data.userId,
          customerEmail: data.customerEmail,
          trackingNumber: data.trackingNumber,
          courierName: data.courierName,
          delivery: data.delivery,
          items: data.items,
        };
      });

      const found = allOrders.find((ord) => {
        const docId = ord.id.toUpperCase();
        const num = (ord.orderNumber || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const idField = (ord.orderId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

        return docId.includes(cleanId) || num.includes(cleanId) || idField.includes(cleanId);
      });

      if (!found) {
        setOrder(null);
        setLoading(false);
        return;
      }

      // Security Check: If not an admin, verify ownership of the order
      if (!isAdmin) {
        const matchesUid = found.userId && user?.uid && found.userId === user.uid;
        const matchesEmail = found.customerEmail && user?.email && found.customerEmail.toLowerCase() === user.email.toLowerCase();

        if (!matchesUid && !matchesEmail) {
          setPermissionError("You do not have permission to view or track this order.");
          setOrder(null);
          setLoading(false);
          return;
        }
      }

      setOrder(found);
    } catch (err) {
      console.error("Tracking lookup error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    void runTracking(orderId);
  };

  const isCancelled = order?.status === "Cancelled";
  const currentStepIdx = order ? STATUS_STEPS.indexOf(order.status || "Confirmed") : -1;

  return (
    <main className="min-h-[80vh] bg-[#faf6f2] px-4 py-16 font-sans text-stone-900">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b85a3c]">
            Live Tracking
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">
            Track Your Order
          </h1>
          <p className="text-xs text-stone-600 mt-1.5">
            Enter your Order ID (e.g. KK-5954) to check your live shipping status.
          </p>
        </div>

        {/* Tracking Lookup Box */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-12 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KK-5954"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-stone-900 outline-none focus:border-stone-800"
              />
            </div>

            <div className="sm:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-stone-900 py-2.5 px-4 text-xs font-bold text-white uppercase tracking-wider transition hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? "Searching..." : <><Search className="h-3.5 w-3.5" /> Track Order</>}
              </button>
            </div>
          </form>

          {/* Results Block */}
          {searched && !loading && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              {permissionError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-red-600 mb-1.5" />
                  <p className="text-xs font-bold text-red-900">{permissionError}</p>
                  <p className="text-xs text-red-700 mt-1">
                    You can only track orders placed from your active account profile.
                  </p>
                </div>
              ) : !order ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-amber-600 mb-1.5" />
                  <p className="text-xs font-bold text-amber-900">No active parcel found for "{orderId}"</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Tip: Go to your <a href="/orders" className="underline font-bold">My Orders</a> page to copy your exact active Order ID.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div>
                      <span className="font-mono font-bold text-sm text-stone-900">
                        Order #{order.orderNumber || order.orderId || order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Status: <span className={`font-bold ${isCancelled ? "text-red-600" : "text-emerald-700"}`}>{order.status || "Confirmed"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900">
                        {formatINR(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Stepper or Cancelled Notice */}
                  {isCancelled ? (
                    <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 text-center">
                      <Ban className="mx-auto h-8 w-8 text-red-600 mb-2" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">Order Cancelled</h4>
                      <p className="text-xs text-red-700 mt-1">
                        This order has been cancelled by store administration. Fulfillment and shipping have been stopped.
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-stone-200 z-0" />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
                          style={{
                            width: `${Math.max(0, (Math.min(currentStepIdx, 4) / 4) * 100)}%`,
                          }}
                        />

                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;
                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                                  isDone
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-stone-300 bg-white text-stone-400"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span className="text-[10px] font-bold">{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`mt-2 text-[10px] text-center font-medium max-w-[65px] ${
                                  isCurrent
                                    ? "font-bold text-stone-900"
                                    : isDone
                                    ? "text-emerald-700"
                                    : "text-stone-400"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Courier AWB details */}
                  {order.trackingNumber && !isCancelled && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-700" />
                        <div>
                          <p className="text-xs font-bold text-blue-950">
                            Shipped via {order.courierName || "Courier Partner"}
                          </p>
                          <p className="text-xs text-blue-800 font-mono">AWB: {order.trackingNumber}</p>
                        </div>
                      </div>
                      <a
                        href={`https://www.delhivery.com/track/package/${order.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
                      >
                        Live Tracking <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Destination & Package Items */}
                  <div className="grid gap-6 sm:grid-cols-2 pt-2 text-xs">
                    {order.delivery && (
                      <div className="rounded-xl border border-stone-200 p-4">
                        <p className="font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Destination
                        </p>
                        <p className="font-bold text-stone-900">{order.delivery.customerName || "Customer"}</p>
                        <p className="text-stone-600 mt-1">{order.delivery.address || "Standard Address"}</p>
                        <p className="text-stone-600">{order.delivery.city || "City"} - {order.delivery.pincode || "Pincode"}</p>
                      </div>
                    )}

                    <div className="rounded-xl border border-stone-200 p-4">
                      <p className="font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> Package Items
                      </p>
                      <div className="space-y-2">
                        {order.items?.map((it, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <img
                              src={it.image}
                              alt={it.name}
                              className="h-9 w-9 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-stone-900 truncate">{it.name}</p>
                              <p className="text-[11px] text-stone-500">
                                Size: {it.size} · Qty: {it.quantity}
                              </p>
                            </div>
                            <span className="font-bold text-stone-900">
                              {formatINR(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TrackOrderPage;