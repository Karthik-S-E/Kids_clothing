import { useState, useEffect, FormEvent } from "react";
import {
  X,
  User,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    loginWithPhoneOrEmail,
    signUpWithPhone,
    signInWithGoogle,
    checkPhoneExists,
    linkPasswordToAccount,
    resetPassword,
    user,
    profile,
    updateUserProfile,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "complete_google" | "forgot_password">("login");
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Step 1: Personal Credentials (Sign up)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Complete Google Profile Fields
  const [googlePassword, setGooglePassword] = useState("");
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);

  // Address Fields
  const [pincode, setPincode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  // Login & Forgot Password Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // UI State & Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStep1, setCheckingStep1] = useState(false);

  const handleInputChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (globalError) setGlobalError("");
  };

  useEffect(() => {
    if (isOpen) {
      setGlobalError("");
      setResetSuccessMessage("");
      setFieldErrors({});
      setSignupStep(1);
      setGooglePassword("");
      setGoogleConfirmPassword("");
      if (user && profile && (!profile.phone || !profile.address)) {
        setMode("complete_google");
        setFullName(profile.displayName || user.displayName || "");
      } else {
        setMode("login");
      }
    }
  }, [isOpen, user, profile]);

  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setPincodeMessage("");
    if (fieldErrors.pincode) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.pincode;
        return next;
      });
    }

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

          setCity(talukOrTown);
          setDistrict(detectedDistrict);
          setState(detectedState);
          setPincodeMessage(`${talukOrTown ? talukOrTown + ", " : ""}${detectedDistrict}, ${detectedState}`);
        } else {
          setPincodeMessage("Pincode not found. Enter location manually.");
        }
      } catch {
        setPincodeMessage("Could not auto-fetch location. Enter manually.");
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleProceedToStep2 = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Please enter your full name";

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phone = "Mobile number is required";
    } else if (cleanPhone.length !== 10) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setCheckingStep1(true);
    try {
      const phoneTaken = await checkPhoneExists(cleanPhone);
      if (phoneTaken) {
        setFieldErrors({
          phone: "This mobile number is already registered. Please Sign In.",
        });
        setCheckingStep1(false);
        return;
      }

      setFieldErrors({});
      setSignupStep(2);
    } catch {
      setSignupStep(2);
    } finally {
      setCheckingStep1(false);
    }
  };

  const handleFinalSignUp = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!pincode) {
      errors.pincode = "Pincode is required";
    } else if (pincode.length !== 6) {
      errors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!streetAddress.trim()) {
      errors.streetAddress = "Please enter your street address / flat details";
    }

    if (!city.trim()) errors.city = "City is required";
    if (!district.trim()) errors.district = "District is required";
    if (!state.trim()) errors.state = "State is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const combinedCity = city === district ? city : `${city}, ${district}`;

      await signUpWithPhone(
        cleanPhone,
        password,
        fullName,
        {
          address: streetAddress.trim(),
          city: combinedCity,
          state: state.trim(),
          pincode: pincode.trim(),
        },
        email.trim() || undefined
      );

      onClose();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setGlobalError("An account with this email already exists. Please Sign In.");
      } else {
        setGlobalError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!loginIdentifier.trim()) {
      errors.loginIdentifier = "Enter your mobile number or email";
    }
    if (!loginPassword) {
      errors.loginPassword = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      await loginWithPhoneOrEmail(loginIdentifier, loginPassword);
      onClose();
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setGlobalError("Incorrect mobile number/email or password.");
      } else {
        setGlobalError(err.message || "Failed to log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGlobalError("");
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (profile?.phone && profile?.address) {
        onClose();
      } else {
        setFullName(googleUser.displayName || "");
        setMode("complete_google");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Google Sign-In was cancelled.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!googlePassword) {
      errors.googlePassword = "Create a password for your account";
    } else if (googlePassword.length < 6) {
      errors.googlePassword = "Password must be at least 6 characters";
    }

    if (googlePassword !== googleConfirmPassword) {
      errors.googleConfirmPassword = "Passwords do not match";
    }

    if (!pincode || pincode.length !== 6) {
      errors.pincode = "Enter a valid 6-digit pincode";
    }
    if (!streetAddress.trim()) {
      errors.streetAddress = "Please enter street / house address";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      await linkPasswordToAccount(googlePassword);

      const combinedCity = city === district ? city : `${city}, ${district}`;
      await updateUserProfile({
        displayName: fullName,
        phone: cleanPhone,
        address: streetAddress.trim(),
        city: combinedCity,
        state: state.trim(),
        pincode: pincode.trim(),
      });

      onClose();
    } catch (err: any) {
      setGlobalError(err.message || "Could not save details.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim();

    if (!cleanEmail) {
      setFieldErrors({ resetEmail: "Please enter your email address" });
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setFieldErrors({ resetEmail: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    setGlobalError("");
    setResetSuccessMessage("");
    try {
      await resetPassword(cleanEmail);
      setResetSuccessMessage(
        `A password link has been sent to ${cleanEmail}. Click the link in your inbox to set or reset your password.`
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setGlobalError("No account found with this email address.");
      } else {
        setGlobalError(err.message || "Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openForgotPasswordMode = () => {
    setGlobalError("");
    setFieldErrors({});
    setResetSuccessMessage("");
    if (loginIdentifier.includes("@")) {
      setResetEmail(loginIdentifier.trim());
    }
    setMode("forgot_password");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF7F2] p-6 shadow-2xl border border-[#E8E2D9] max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-[#786E64] hover:bg-[#E8E2D9]/50 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-5">
          <h2 className="font-serif text-2xl font-bold text-[#281E15]">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && (signupStep === 1 ? "Create Account" : "Delivery Address")}
            {mode === "complete_google" && "Complete Account Profile"}
            {mode === "forgot_password" && "Reset Password"}
          </h2>
          <p className="text-xs text-[#786E64] mt-1">
            {mode === "login" && "Sign in with your mobile number or email"}
            {mode === "signup" &&
              (signupStep === 1
                ? "Step 1 of 2: Personal Details"
                : "Step 2 of 2: Shipping Address")}
            {mode === "complete_google" && "Set a password & address for all future logins"}
            {mode === "forgot_password" && "Enter your registered email to receive a password reset link"}
          </p>
        </div>

        {globalError && (
          <div className="mb-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
            {globalError}
          </div>
        )}

        {/* 1. LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLogin} noValidate className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">
                Mobile Number or Email
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or name@gmail.com"
                value={loginIdentifier}
                onChange={(e) => handleInputChange("loginIdentifier", e.target.value, setLoginIdentifier)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] placeholder-stone-400 focus:outline-none ${
                  fieldErrors.loginIdentifier
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.loginIdentifier && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.loginIdentifier}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#281E15]">Password</label>
                <button
                  type="button"
                  onClick={openForgotPasswordMode}
                  className="text-[11px] font-medium text-stone-500 hover:text-[#281E15] underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => handleInputChange("loginPassword", e.target.value, setLoginPassword)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-[#281E15] placeholder-stone-400 focus:outline-none ${
                    fieldErrors.loginPassword
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.loginPassword && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.loginPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-[#E8E2D9] w-full" />
              <span className="bg-[#FAF7F2] px-3 text-[10px] uppercase font-bold text-[#786E64] absolute">
                OR
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-lg border border-[#D8CEBE] bg-white py-2.5 text-xs font-semibold text-[#281E15] hover:bg-stone-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-[#786E64] mt-3">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setGlobalError("");
                  setFieldErrors({});
                  setMode("signup");
                  setSignupStep(1);
                }}
                className="font-bold text-[#281E15] underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* 2. FORGOT PASSWORD */}
        {mode === "forgot_password" && (
          <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
            {resetSuccessMessage ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">Email Sent!</h4>
                      <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                        {resetSuccessMessage}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetSuccessMessage("");
                    setMode("login");
                  }}
                  className="w-full rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#786E64] leading-relaxed">
                  Registered using Google or Email? Enter your email address below to receive a secure link to create or update your password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#281E15] mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. name@gmail.com"
                      value={resetEmail}
                      onChange={(e) => handleInputChange("resetEmail", e.target.value, setResetEmail)}
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                        fieldErrors.resetEmail
                          ? "border-red-500 bg-red-50/10 focus:border-red-500"
                          : "border-[#D8CEBE] focus:border-[#281E15]"
                      }`}
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
                  </div>
                  {fieldErrors.resetEmail && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      {fieldErrors.resetEmail}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFieldErrors({});
                      setGlobalError("");
                      setMode("login");
                    }}
                    className="w-1/3 rounded-lg border border-[#D8CEBE] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#281E15] hover:bg-stone-50 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5" /> Send Reset Link
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* 3. SIGN UP STEP 1 */}
        {mode === "signup" && signupStep === 1 && (
          <form onSubmit={handleProceedToStep2} noValidate className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Karthik S"
                  value={fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value, setFullName)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                    fieldErrors.fullName
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">
                Email Address <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
                  className="w-full rounded-lg border border-[#D8CEBE] bg-white px-3 py-2 text-sm text-[#281E15] focus:border-[#281E15] focus:outline-none"
                />
                <Mail className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">
                Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-[#D8CEBE] bg-stone-100 text-xs font-bold text-[#281E15]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10), setPhone)
                  }
                  className={`w-full rounded-r-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                    fieldErrors.phone
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-[#281E15] focus:outline-none ${
                    fieldErrors.password
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] font-medium text-red-600 leading-tight">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value, setConfirmPassword)
                  }
                  className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-[#281E15] focus:outline-none ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] font-medium text-red-600 leading-tight">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={checkingStep1}
              className="w-full mt-2 rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {checkingStep1 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying Mobile...
                </>
              ) : (
                <>
                  Continue to Address <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#786E64] pt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setGlobalError("");
                  setFieldErrors({});
                  setMode("login");
                }}
                className="font-bold text-[#281E15] underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* 4. SIGN UP STEP 2 */}
        {mode === "signup" && signupStep === 2 && (
          <form onSubmit={handleFinalSignUp} noValidate className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#281E15]">
                  Delivery Pincode
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
                placeholder="Enter 6-digit Pincode (e.g. 577228)"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] placeholder-stone-400 focus:outline-none ${
                  fieldErrors.pincode
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.pincode ? (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.pincode}</p>
              ) : pincodeMessage ? (
                <p className="mt-1 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {pincodeMessage}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">
                Street Address & Landmark
              </label>
              <input
                type="text"
                placeholder="House/Flat No., Building Name, Street, Landmark"
                value={streetAddress}
                onChange={(e) => handleInputChange("streetAddress", e.target.value, setStreetAddress)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-[#281E15] focus:outline-none ${
                  fieldErrors.streetAddress
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.streetAddress && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.streetAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tarikere"
                  value={city}
                  onChange={(e) => handleInputChange("city", e.target.value, setCity)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-[#281E15] focus:outline-none ${
                    fieldErrors.city
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chikkamagaluru"
                  value={district}
                  onChange={(e) => handleInputChange("district", e.target.value, setDistrict)}
                  className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-[#281E15] focus:outline-none ${
                    fieldErrors.district
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
                {fieldErrors.district && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">
                    {fieldErrors.district}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => handleInputChange("state", e.target.value, setState)}
                className={`w-full rounded-lg border bg-white px-3 py-1.5 text-xs text-[#281E15] focus:outline-none ${
                  fieldErrors.state
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.state && (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.state}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFieldErrors({});
                  setSignupStep(1);
                }}
                className="w-1/3 rounded-lg border border-[#D8CEBE] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#281E15] hover:bg-stone-50 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-2/3 rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer flex justify-center items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete & Register"}
              </button>
            </div>
          </form>
        )}

        {/* 5. COMPLETE GOOGLE PROFILE (With Hybrid Password Setup) */}
        {mode === "complete_google" && (
          <form onSubmit={handleCompleteGoogleProfile} noValidate className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value, setFullName)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                  fieldErrors.fullName
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">Mobile Number</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-[#D8CEBE] bg-stone-100 text-xs font-bold text-[#281E15]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10), setPhone)
                  }
                  className={`w-full rounded-r-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                    fieldErrors.phone
                      ? "border-red-500 bg-red-50/10 focus:border-red-500"
                      : "border-[#D8CEBE] focus:border-[#281E15]"
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password linking inputs for cross-device support */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showGooglePassword ? "text" : "password"}
                    placeholder="Min 6 chars"
                    value={googlePassword}
                    onChange={(e) =>
                      handleInputChange("googlePassword", e.target.value, setGooglePassword)
                    }
                    className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-[#281E15] focus:outline-none ${
                      fieldErrors.googlePassword
                        ? "border-red-500 bg-red-50/10 focus:border-red-500"
                        : "border-[#D8CEBE] focus:border-[#281E15]"
                    }`}
                  />
                </div>
                {fieldErrors.googlePassword && (
                  <p className="mt-1 text-[11px] font-medium text-red-600 leading-tight">
                    {fieldErrors.googlePassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showGooglePassword ? "text" : "password"}
                    placeholder="Re-type password"
                    value={googleConfirmPassword}
                    onChange={(e) =>
                      handleInputChange(
                        "googleConfirmPassword",
                        e.target.value,
                        setGoogleConfirmPassword
                      )
                    }
                    className={`w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-[#281E15] focus:outline-none ${
                      fieldErrors.googleConfirmPassword
                        ? "border-red-500 bg-red-50/10 focus:border-red-500"
                        : "border-[#D8CEBE] focus:border-[#281E15]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePassword(!showGooglePassword)}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showGooglePassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {fieldErrors.googleConfirmPassword && (
                  <p className="mt-1 text-[11px] font-medium text-red-600 leading-tight">
                    {fieldErrors.googleConfirmPassword}
                  </p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              This password allows you to sign in with your email on any other device without needing Google Sign-In.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#281E15]">Delivery Pincode</label>
                {pincodeLoading && (
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode (e.g. 577228)"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#281E15] focus:outline-none ${
                  fieldErrors.pincode
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.pincode ? (
                <p className="mt-1 text-[11px] font-medium text-red-600">{fieldErrors.pincode}</p>
              ) : pincodeMessage ? (
                <p className="mt-1 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {pincodeMessage}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">Street Address</label>
              <input
                type="text"
                placeholder="House/Flat No., Street Name, Area"
                value={streetAddress}
                onChange={(e) => handleInputChange("streetAddress", e.target.value, setStreetAddress)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-[#281E15] focus:outline-none ${
                  fieldErrors.streetAddress
                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#281E15]"
                }`}
              />
              {fieldErrors.streetAddress && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.streetAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">City / Town</label>
                <input
                  type="text"
                  placeholder="City / Taluk"
                  value={city}
                  onChange={(e) => handleInputChange("city", e.target.value, setCity)}
                  className="w-full rounded-lg border border-[#D8CEBE] bg-white px-2.5 py-1.5 text-xs text-[#281E15] focus:border-[#281E15] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#281E15] mb-1">District</label>
                <input
                  type="text"
                  placeholder="District"
                  value={district}
                  onChange={(e) => handleInputChange("district", e.target.value, setDistrict)}
                  className="w-full rounded-lg border border-[#D8CEBE] bg-white px-2.5 py-1.5 text-xs text-[#281E15] focus:border-[#281E15] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#281E15] mb-1">State</label>
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => handleInputChange("state", e.target.value, setState)}
                className="w-full rounded-lg border border-[#D8CEBE] bg-white px-3 py-1.5 text-xs text-[#281E15] focus:border-[#281E15] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#281E15] py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition cursor-pointer flex justify-center items-center gap-2 mt-2 shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;