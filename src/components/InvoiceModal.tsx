import { X, Printer, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatINR } from "../lib/formatINR";
import { useBrandStore } from "../store/brandStore";

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      size: string;
    }>;
    totalAmount: number;
    userName: string;
    userEmail: string;
    delivery?: {
      address?: string;
      city?: string;
      pincode?: string;
      phone?: string;
    };
    createdAt?: any;
  } | null;
}

export function InvoiceModal({ isOpen, onClose, orderData }: InvoiceModalProps) {
  const { settings } = useBrandStore();

  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${orderData.orderId}`;
  const orderDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
        
        {/* Close Button (Hidden when printing) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-500 hover:bg-stone-100 transition cursor-pointer print:hidden"
          aria-label="Close invoice"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Invoice Header with Logo & Proprietor */}
        <div className="border-b border-stone-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name || "Kandamma Kids"}
                  className="h-12 w-12 rounded-full object-cover border border-stone-200 shadow-xs"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#281E15] font-bold text-white text-sm">
                  KK
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#ff3e6c] uppercase block">
                  Official Tax Invoice / Bill of Supply
                </span>
                <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                  {settings.name || "Kandamma Kids"}
                </h1>
                <p className="text-[11px] font-semibold text-stone-600 mt-0.5">
                  Proprietor : Puneeth RH
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono font-bold text-stone-900">{invoiceNumber}</p>
              <p className="text-stone-500 mt-0.5">Date: {orderDate}</p>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100 print:bg-stone-50">
          <div>
            <p className="font-bold uppercase tracking-wider text-stone-400 mb-1">
              Billed To:
            </p>
            <p className="font-semibold text-stone-900">{orderData.userName}</p>
            <p className="text-stone-600">{orderData.userEmail}</p>
            {orderData.delivery?.phone && (
              <p className="text-stone-600">Phone: {orderData.delivery.phone}</p>
            )}
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-stone-400 mb-1">
              Shipping Address:
            </p>
            <p className="text-stone-700">
              {orderData.delivery?.address || "Registered Address"}, {orderData.delivery?.city || "Tarikere"} - {orderData.delivery?.pincode || "577228"}
            </p>
            <p className="mt-2 font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cash on Delivery (COD)
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 font-semibold">Item Description</th>
              <th className="py-2.5 font-semibold text-center">Size</th>
              <th className="py-2.5 font-semibold text-center">Qty</th>
              <th className="py-2.5 font-semibold text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orderData.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 font-medium text-stone-900">{item.name}</td>
                <td className="py-3 text-center text-stone-600">{item.size}</td>
                <td className="py-3 text-center text-stone-600">{item.quantity}</td>
                <td className="py-3 text-right font-medium text-stone-900">
                  {formatINR(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section with Verified Stamp */}
        <div className="border-t border-stone-200 pt-4 mb-6 flex justify-between items-end">
          {/* Verified / Checked Stamp */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-emerald-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Verified Stamp</p>
              <p className="text-xs font-bold font-mono">AUTHORIZED ORDER</p>
            </div>
          </div>

          <div className="w-56 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span>{formatINR(orderData.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping Fee:</span>
              <span className="font-medium text-emerald-600">FREE 🇮🇳</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
              <span>Grand Total:</span>
              <span className="text-[#ff3e6c]">{formatINR(orderData.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden during printing) */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-xl bg-[#281E15] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print / Download PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

export default InvoiceModal;