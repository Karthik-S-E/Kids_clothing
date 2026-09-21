import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Check, Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";

interface CheckoutAuthProps {
  onVerifiedSuccess: (userEmail: string) => void;
}

export function CheckoutAuth({ onVerifiedSuccess }: CheckoutAuthProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Periodically check if the user clicked the verification link
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (linkSent && !isVerified) {
      interval = setInterval(async () => {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            setIsVerified(true);
            clearInterval(interval);
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [linkSent, isVerified]);

  // Sign Up & Send Free Verification Link
  const handleSignUpAndSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCred.user);
      setLinkSent(true);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("An account already exists with this email. Please log in.");
      } else {
        setErrorMessage(err.message || "Failed to register.");
      }
    }
  };

  // Existing User Login
  const handleExistingUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!userCred.user.emailVerified) {
        setErrorMessage("Email not verified yet. Please check your inbox or resend link.");
        setLinkSent(true);
      } else {
        setIsVerified(true);
        onVerifiedSuccess(userCred.user.email || email);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed. Check your credentials.");
    }
  };

  // Manual Refresh Check Button
  const handleManualCheck = async () => {
    setCheckingStatus(true);
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setIsVerified(true);
      } else {
        setErrorMessage("Email is not verified yet. Open the link sent to your inbox.");
      }
    }
    setCheckingStatus(false);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 border-b border-stone-100 pb-4">
        <h2 className="text-lg font-bold text-stone-900">
          {isLoginMode ? "Log In to Your Account" : "Verify Email to Continue"}
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {isLoginMode
            ? "Enter your credentials to access your delivery profile."
            : "A quick one-time verification link will be sent to your real email."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={isLoginMode ? handleExistingUserLogin : handleSignUpAndSendLink} className="space-y-3.5">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-stone-400" />
            <input
              type="email"
              required
              disabled={linkSent || isVerified}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-xs outline-none focus:border-black disabled:bg-stone-50 disabled:text-stone-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-stone-400" />
            <input
              type="password"
              required
              disabled={linkSent || isVerified}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-xs outline-none focus:border-black disabled:bg-stone-50 disabled:text-stone-500"
            />
          </div>
        </div>

        {/* Action Button: Send Link / Login */}
        {!linkSent && (
          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-[#ff3e6c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#e7335e] transition cursor-pointer"
          >
            {isLoginMode ? "Log In" : "Send Free Verification Link"}
          </button>
        )}
      </form>

      {/* Verification Waiting Status Card */}
      {linkSent && !isVerified && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div className="text-xs text-stone-700 leading-relaxed">
              Verification email sent to <strong className="text-stone-900">{email}</strong>. Please check your inbox and tap the link to verify.
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualCheck}
            disabled={checkingStatus}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-stone-800 hover:bg-stone-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${checkingStatus ? "animate-spin" : ""}`} />
            I Have Clicked The Link
          </button>
        </div>
      )}

      {/* Success Badge */}
      {isVerified && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          Email successfully verified! You may now proceed.
        </div>
      )}

      {/* Step Next Button: Locked until verified */}
      <button
        type="button"
        disabled={!isVerified}
        onClick={() => onVerifiedSuccess(email)}
        className={`mt-4 w-full h-11 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
          isVerified
            ? "bg-stone-900 text-white hover:bg-black cursor-pointer shadow-sm"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
        }`}
      >
        Continue to Delivery Address <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* Toggle between Register & Log In */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setLinkSent(false);
            setErrorMessage("");
          }}
          className="text-xs text-stone-500 hover:text-stone-900 hover:underline cursor-pointer font-medium"
        >
          {isLoginMode ? "Need a new account? Register here" : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );
}

export default CheckoutAuth;