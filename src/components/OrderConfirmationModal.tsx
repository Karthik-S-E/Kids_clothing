import { X, CheckCircle2, XCircle, Clock, Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  orderId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onSaveForLater: () => void;
  loading: boolean;
  feedbackMessage?: string | null; // Added for custom inline alerts
}

export function OrderConfirmationModal({
  isOpen,
  orderId,
  onConfirm,
  onCancel,
  onSaveForLater,
  loading,
  feedbackMessage,
}: OrderConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md rounded-2xl bg-[#FAF7F2] p-6 shadow-2xl border border-[#E8E2D9] text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#281E15]">
            Did you send the WhatsApp order?
          </h2>
          
          <p className="text-xs text-[#786E64] mt-1.5 leading-relaxed">
            Order Reference: <strong className="text-[#281E15]">{orderId}</strong>
            <br />
            Please confirm your action below so we can process your items correctly.
          </p>

          {/* Custom Inline Feedback Box (Replaces alert()) */}
          {feedbackMessage && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          <div className="mt-5 space-y-2.5">
            {/* Option 1: Confirm */}
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-700 transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Yes, Confirm Order
            </button>

            {/* Option 2: Order Later / Save to Drafts */}
            <button
              type="button"
              disabled={loading}
              onClick={onSaveForLater}
              className="w-full rounded-xl border border-[#D8CEBE] bg-white py-3 text-xs font-bold uppercase tracking-wider text-[#281E15] hover:bg-stone-50 transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
            >
              <Clock className="h-4 w-4 text-amber-600" />
              Order This Later (Save to Drafts)
            </button>

            {/* Option 3: Cancel */}
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="w-full rounded-xl border border-red-200 bg-red-50/50 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-100 transition cursor-pointer flex justify-center items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}