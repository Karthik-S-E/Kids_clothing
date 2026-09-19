import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to extract a clean string regardless of how it was nested or keyed
function extractField(source: any, keys: string[]): string {
  if (!source || typeof source !== "object") return "";

  // 1. Direct key match on top-level
  for (const key of keys) {
    const val = source[key];
    if (typeof val === "string" && val.trim()) return val.trim();
    if (typeof val === "number") return String(val);
  }

  // 2. Check if nested inside an 'address' or 'delivery' sub-object
  const nested = source.address || source.delivery;
  if (nested && typeof nested === "object") {
    for (const key of keys) {
      const val = nested[key];
      if (typeof val === "string" && val.trim()) return val.trim();
      if (typeof val === "number") return String(val);
    }
  }

  return "";
}

// Helper specifically for Street Address
function extractAddressString(source: any): string {
  if (!source) return "";
  const rawAddr = source.address;
  if (typeof rawAddr === "string") return rawAddr.trim();
  if (typeof rawAddr === "object" && rawAddr !== null) {
    return rawAddr.street || rawAddr.line1 || rawAddr.address || "";
  }
  return "";
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, updateUserProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile || user) {
      setName(extractField(profile, ["displayName", "name"]) || user?.displayName || "");
      setPhone(extractField(profile, ["phone", "phoneNumber", "mobile"]));
      setAddress(extractAddressString(profile));
      setCity(extractField(profile, ["city", "town", "district"]));
      setPincode(extractField(profile, ["pincode", "pin", "postalCode", "zip"]));
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      if (!name.trim()) throw new Error("Full name cannot be empty.");

      await updateUserProfile({
        displayName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-serif text-2xl font-normal text-[#1d1d1b]">Account Settings</h2>
        <p className="mt-1 text-xs text-stone-500">
          Update your personal details and delivery address
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Email Address (Login ID)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3.5 py-2.5 text-xs text-stone-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-xs outline-none focus:border-[#ff3e6c]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-xs outline-none focus:border-[#ff3e6c]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Delivery Street Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No, Street, Landmark"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-xs outline-none focus:border-[#ff3e6c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-xs outline-none focus:border-[#ff3e6c]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560001"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-xs outline-none focus:border-[#ff3e6c]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-stone-300 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#ff3e6c] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#e7335e] disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;