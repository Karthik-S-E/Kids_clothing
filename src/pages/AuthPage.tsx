import { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter a valid Email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() });
        }

        // Initialize user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: cleanEmail,
          displayName: name.trim() || "",
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      navigate("/");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password. Please verify and try again.");
      } else if (code === "auth/email-already-in-use") {
        setErrorMessage("An account with this email already exists. Try logging in.");
      } else if (code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col justify-center bg-[#f1f3f6] font-['Roboto',Arial,sans-serif] text-[#333333] antialiased py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[850px] px-4">
        <main className="flex min-h-[528px] overflow-hidden rounded-[2px] bg-[#ffffff] shadow-[0_2px_4px_0_rgba(0,0,0,0.2)]">
          {/* Left Split Panel */}
          <section className="hidden w-[40%] flex-col justify-between bg-[#2874f0] p-10 text-[#ffffff] md:flex">
            <div>
              <h1 className="text-[20px] font-medium leading-[28px]">
                {isSignUp ? "Looks like you're new here!" : "Login"}
              </h1>
              <p className="mt-4 text-[13.5px] font-normal leading-[22px] text-[#ffffff]/85">
                {isSignUp
                  ? "Sign up with your details to get started and track your festive orders."
                  : "Get access to your Orders, Wishlist, and personal recommendations."}
              </p>
            </div>

            <div className="mt-auto pt-8">
              <img
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
                alt="Secure onboarding illustration"
                className="mx-auto max-h-[140px] object-contain opacity-95"
                loading="lazy"
              />
            </div>
          </section>

          {/* Right Split Panel */}
          <section className="flex flex-1 flex-col justify-between p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              {/* Name Input (Sign Up only) */}
              {isSignUp && (
                <div className="relative pt-3">
                  <input
                    id={nameId}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    className="peer h-10 w-full border-b border-[#c2c2c2] bg-transparent text-[14px] text-[#333333] transition-colors focus:border-[#2874f0] focus:outline-none"
                  />
                  <label
                    htmlFor={nameId}
                    className="pointer-events-none absolute left-0 top-3 text-[14px] text-[#878787] transition-all duration-150 peer-focus:-top-2 peer-focus:text-[12px] peer-focus:text-[#2874f0] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[12px]"
                  >
                    Enter Full Name
                  </label>
                </div>
              )}

              {/* Email Input */}
              <div className="relative pt-3">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  aria-describedby={errorMessage ? "auth-error-text" : undefined}
                  className="peer h-10 w-full border-b border-[#c2c2c2] bg-transparent text-[14px] text-[#333333] transition-colors focus:border-[#2874f0] focus:outline-none"
                />
                <label
                  htmlFor={emailId}
                  className="pointer-events-none absolute left-0 top-3 text-[14px] text-[#878787] transition-all duration-150 peer-focus:-top-2 peer-focus:text-[12px] peer-focus:text-[#2874f0] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[12px]"
                >
                  Enter Email Address
                </label>
              </div>

              {/* Password Input */}
              <div className="relative pt-3">
                <input
                  id={passwordId}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                  className="peer h-10 w-full border-b border-[#c2c2c2] bg-transparent text-[14px] text-[#333333] transition-colors focus:border-[#2874f0] focus:outline-none"
                />
                <label
                  htmlFor={passwordId}
                  className="pointer-events-none absolute left-0 top-3 text-[14px] text-[#878787] transition-all duration-150 peer-focus:-top-2 peer-focus:text-[12px] peer-focus:text-[#2874f0] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[12px]"
                >
                  {isSignUp ? "Set Password (min 6 chars)" : "Enter Password"}
                </label>
              </div>

              {/* Validation Alert */}
              {errorMessage && (
                <div id="auth-error-text" role="alert" className="text-[12px] font-medium text-[#d32f2f]">
                  {errorMessage}
                </div>
              )}

              {/* Terms Microcopy */}
              <p className="text-[12px] leading-[18px] text-[#878787]">
                By continuing, you agree to Kandamma Kids'{" "}
                <span className="text-[#2874f0] hover:underline cursor-pointer">Terms of Use</span> and{" "}
                <span className="text-[#2874f0] hover:underline cursor-pointer">Privacy Policy</span>.
              </p>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-[2px] bg-[#fb641b] text-[14px] font-medium uppercase tracking-wider text-[#ffffff] shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#f45b10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Processing..." : isSignUp ? "Continue" : "Log In"}
              </button>

              {/* Secondary Switcher Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage(null);
                }}
                className="flex h-12 w-full items-center justify-center rounded-[2px] border border-[#c2c2c2] bg-[#ffffff] text-[14px] font-medium uppercase text-[#2874f0] shadow-[0_2px_4px_0_rgba(0,0,0,0.1)] transition-colors hover:border-[#2874f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2874f0] cursor-pointer"
              >
                {isSignUp ? "Existing User? Log In" : "New to Kandamma? Create an account"}
              </button>
            </form>

            <div className="pt-6 text-center">
              <Link to="/contact" className="text-[13px] font-medium text-[#2874f0] hover:underline">
                Need help with logging in or signing up?
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}