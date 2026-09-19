import { useState, useId, useRef } from "react";
import { X, AlertCircle, Camera, CheckCircle2, ArrowRight, User as UserIcon } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../lib/firebase";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone");

  // Step 1: Held in React state only
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 details
  const [altContact, setAltContact] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const passId = useId();

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 1: VALIDATION ONLY (ZERO CALLS TO FIREBASE AUTH FOR SIGNUP)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    const resolvedEmail = authMethod === "email"
      ? email.trim().toLowerCase()
      : `${cleanPhone}@kandammakids.in`;

    if (authMethod === "phone" && cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (authMethod === "email" && !email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // If Sign In, authenticate immediately
    if (mode === "signin") {
      setSubmitting(true);
      try {
        await loginWithEmail(resolvedEmail, password);
        handleClose();
      } catch (err: any) {
        setError("Invalid credentials. Please verify your details.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // SIGN UP FLOW: Check if phone number is already registered
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    try {
      if (authMethod === "phone") {
        const phoneDoc = await getDoc(doc(db, "phone_lookup", cleanPhone));
        if (phoneDoc.exists()) {
          throw new Error("This mobile number is already registered. Please sign in.");
        }
      }

      // DO NOT CREATE FIREBASE USER HERE. Simply transition to Step 2.
      setStep(2);
    } catch (err: any) {
      setError(err?.message || "Validation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 2: FINALIZE & CREATE ACCOUNT ON "SAVE & FINISH"
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const cleanPhone = phone.replace(/\D/g, "");
    const primaryAuthEmail = authMethod === "email"
      ? email.trim().toLowerCase()
      : `${cleanPhone}@kandammakids.in`;

    const finalEmail = authMethod === "email"
      ? email.trim().toLowerCase()
      : (altContact.trim().toLowerCase() || primaryAuthEmail);

    let finalPhone = authMethod === "phone"
      ? cleanPhone
      : altContact.replace(/\D/g, "").slice(-10);

    try {
      // 1. If signing up via email but entered a phone in Step 2, check phone duplicate
      if (authMethod === "email" && finalPhone) {
        const phoneDoc = await getDoc(doc(db, "phone_lookup", finalPhone));
        if (phoneDoc.exists()) {
          throw new Error(`The mobile number "${finalPhone}" is already registered to another account.`);
        }
      }

      // 2. NOW CREATE USER IN FIREBASE AUTH
      await signUpWithEmail(primaryAuthEmail, password, fullName.trim());
      const newUser = auth.currentUser;
      if (!newUser) throw new Error("Could not initialize user. Please try again.");

      if (avatarUrl) {
        await updateProfile(newUser, { photoURL: avatarUrl }).catch(() => {});
      }

      // 3. Store in phone_lookup collection (rules allow write)
      if (finalPhone) {
        await setDoc(doc(db, "phone_lookup", finalPhone), {
          uid: newUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      // 4. Save full profile to Firestore
      await setDoc(
        doc(db, "users", newUser.uid),
        {
          uid: newUser.uid,
          displayName: fullName.trim(),
          email: finalEmail,
          phone: finalPhone ? `+91 ${finalPhone}` : "",
          photoURL: avatarUrl || "",
          address: streetAddress.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          deliveryAddress: {
            street: streetAddress.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      handleClose();
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email/phone already exists. Please Sign In.");
      } else {
        setError(err?.message?.replace("Firebase: ", "") || "Failed to create account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    }
  };

  const handleClose = () => {
    setStep(1);
    setMode("signin");
    setError(null);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs font-['Poppins',sans-serif]"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex w-full max-w-[820px] min-h-[500px] overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-30 rounded-full p-1.5 text-[#786E64] hover:bg-[#E8E2D9]/50 hover:text-[#281E15] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Editorial Left Column */}
        <div className="hidden w-[38%] flex-col justify-between bg-[#281E15] p-8 text-[#FAF7F2] md:flex relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#F2C1AE] uppercase block">
              Kandamma Kids
            </span>
            <h2 className="font-serif text-3xl font-normal leading-snug mt-2 text-white">
              {step === 2
                ? "Complete Your Wardrobe Profile"
                : mode === "signin"
                ? "Welcome Back to Kandamma"
                : "Handcrafted Festive Wear"}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#FAF7F2]/80 font-light">
              {step === 2
                ? "Add your delivery address so we can prepare zero-itch handcrafted attires for your little one."
                : mode === "signin"
                ? "Sign in to view orders, track dispatches, and save favorite festive dresses."
                : "Join us to shop 100% cotton-lined ethnic wear tailored for joyful celebrations."}
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-6 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs text-[#F2C1AE]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Free Delivery Across India 🇮🇳</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-1 flex-col justify-between p-6 sm:p-9 bg-white text-[#281E15]">
          <div>
            <div className="mb-4">
              <h3 className="font-serif text-2xl font-normal text-[#281E15]">
                {step === 2 ? "Delivery & Profile" : mode === "signin" ? "Sign In" : "Create Account"}
              </h3>
              <p className="text-xs text-[#786E64] mt-1">
                {step === 2
                  ? "Step 2 of 2: Shipping details for your orders"
                  : mode === "signin"
                  ? "Enter your credentials to continue"
                  : "Step 1 of 2: Sign up with Phone or Email"}
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIALS ONLY */}
            {step === 1 && (
              <>
                <div className="mb-5 flex rounded-lg bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("phone"); setError(null); }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition cursor-pointer ${
                      authMethod === "phone"
                        ? "bg-[#281E15] text-white shadow-xs"
                        : "text-[#786E64] hover:text-[#281E15]"
                    }`}
                  >
                    Phone (+91)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("email"); setError(null); }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition cursor-pointer ${
                      authMethod === "email"
                        ? "bg-[#281E15] text-white shadow-xs"
                        : "text-[#786E64] hover:text-[#281E15]"
                    }`}
                  >
                    Email Address
                  </button>
                </div>

                <form onSubmit={handleStep1Submit} className="flex flex-col gap-3.5">
                  {mode === "signup" && (
                    <div>
                      <label htmlFor={nameId} className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                        Full Name
                      </label>
                      <input
                        id={nameId}
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                      />
                    </div>
                  )}

                  {authMethod === "phone" ? (
                    <div>
                      <label htmlFor={phoneId} className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                        Mobile Number
                      </label>
                      <div className="flex h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 focus-within:border-[#281E15] focus-within:bg-white transition overflow-hidden">
                        <span className="flex items-center gap-1 bg-[#E8E2D9]/40 px-3 text-xs font-medium text-[#281E15] border-r border-[#E8E2D9] select-none">
                          🇮🇳 +91
                        </span>
                        <input
                          id={phoneId}
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="98765 43210"
                          className="h-full w-full bg-transparent px-3 text-xs text-[#281E15] outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={emailId} className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                        Email Address
                      </label>
                      <input
                        id={emailId}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor={passId} className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                      Password
                    </label>
                    <input
                      id={passId}
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#281E15] text-xs font-semibold tracking-widest uppercase text-white shadow-sm transition hover:bg-black active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Checking..." : mode === "signin" ? "Sign In" : "Continue to Step 2"}
                    {mode === "signup" && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                </form>

                <div className="my-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-[#E8E2D9]" />
                  <span className="text-[10px] uppercase tracking-wider text-[#786E64]">or</span>
                  <div className="h-px flex-1 bg-[#E8E2D9]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-medium text-[#281E15] transition hover:bg-[#E8E2D9]/60 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            {/* STEP 2: DETAILS ONLY */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="flex flex-col gap-3">
                <div className="flex items-center gap-3.5 pb-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] border-2 border-dashed border-[#E8E2D9] text-[#786E64] hover:border-[#281E15] transition cursor-pointer overflow-hidden"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-[#786E64]" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#281E15]">Profile Picture</p>
                    <p className="text-[10px] text-[#786E64]">Upload a photo for your account (Optional)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                    {authMethod === "phone" ? "Email Address (Optional)" : "Mobile Phone (+91)"}
                  </label>
                  <input
                    type={authMethod === "phone" ? "email" : "tel"}
                    value={altContact}
                    onChange={(e) => setAltContact(e.target.value)}
                    placeholder={authMethod === "phone" ? "your.email@example.com" : "9876543210"}
                    className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                    Full Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House/Flat No., Street, Landmark"
                    className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Tarikere / Bengaluru"
                      className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider text-[#786E64] uppercase block mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="577228"
                      className="h-10 w-full rounded-lg border border-[#E8E2D9] bg-[#FAF7F2]/50 px-3 text-xs text-[#281E15] outline-none focus:border-[#281E15] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-11 flex-1 rounded-lg border border-[#E8E2D9] text-xs font-semibold uppercase tracking-wider text-[#786E64] hover:bg-[#FAF7F2] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 flex-1 rounded-lg bg-[#281E15] text-xs font-semibold uppercase tracking-widest text-white shadow-sm hover:bg-black transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save & Finish"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {step === 1 && (
            <div className="pt-4 text-center text-xs text-[#786E64] border-t border-[#E8E2D9]/50 mt-4">
              {mode === "signin" ? (
                <>
                  New to Kandamma?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(null); }}
                    className="font-semibold text-[#281E15] hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setError(null); }}
                    className="font-semibold text-[#281E15] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;