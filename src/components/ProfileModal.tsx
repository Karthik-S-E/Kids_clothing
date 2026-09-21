import { useState, useEffect, FormEvent } from "react";
import { X, User, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setPincodeMessage("");
      setFullName(profile?.displayName || user?.displayName || "");
      setPhone(profile?.phone || "");
      setStreetAddress(profile?.address || "");
      setCity(profile?.city || "");
      setState(profile?.state || "");
      setPincode(profile?.pincode || "");
    }
  }, [isOpen, profile, user]);

  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setPincodeMessage("");

    if (cleaned.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const offices = data[0].PostOffice;
          const po = offices.find((item: any) => item.DeliveryStatus === "Delivery") || offices[0];

          const talukOrTown = po.Block && po.Block !== "NA" ? po.Block : po.Name || "";
          const detectedDistrict = po.District || "";
          const detectedState = po.State || "";

          const formattedCity =
            talukOrTown && detectedDistrict && talukOrTown !== detectedDistrict
              ? `${talukOrTown}, ${detectedDistrict}`
              : detectedDistrict || talukOrTown;

          setCity(formattedCity);
          setState(detectedState);
          setPincodeMessage(`${formattedCity}, ${detectedState}`);
        } else {
          setPincodeMessage("Pincode not found. Please enter City & State manually.");
        }
      } catch {
        setPincodeMessage("Could not auto-fetch location. Please enter manually.");
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (pincode && pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        displayName: fullName.trim(),
        phone: cleanPhone,
        address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const resolvedRealEmail =
    user?.email && !user.email.endsWith("@kandamma.local")
      ? user.email
      : profile?.email && !profile.email.endsWith("@kandamma.local")
      ? profile.email
      : user?.providerData?.find((p) => p.email && !p.email.endsWith("@kandamma.local"))?.email ||
        null;

  const displayEmail =
    resolvedRealEmail ||
    (profile?.phone ? `+91 ${profile.phone}` : "Customer");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Delivery & Account Settings
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Save your delivery address for hassle-free order dispatch.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Email Address (Login ID)
            </label>
            <input
              type="text"
              disabled
              value={displayEmail}
              className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2.5 text-sm text-stone-600 cursor-not-allowed select-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 pl-9 focus:border-stone-900 focus:outline-none"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 pl-9 focus:border-stone-900 focus:outline-none"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Delivery Street Address
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="House/Flat No., Building Name, Street, Landmark"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 pl-9 focus:border-stone-900 focus:outline-none"
              />
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                City / Town
              </label>
              <input
                type="text"
                placeholder="e.g. Tarikere, Chikkamagaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Pin Code
                </label>
                {pincodeLoading && (
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit Pincode"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-[#ff3e6c] focus:ring-1 focus:ring-[#ff3e6c] focus:outline-none"
              />
            </div>
          </div>

          {pincodeMessage && (
            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Location: {pincodeMessage}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#ff3e6c] hover:bg-[#e6335f] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Delivery Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;