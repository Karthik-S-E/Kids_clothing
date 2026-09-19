import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin");
    } catch (err: any) {
      // Displays the exact Firebase Auth error code
      console.error("Firebase Login Error:", err);
      const code = err?.code || "";
      
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Wrong password entered. Please reset it in Firebase Console.");
      } else if (code === "auth/user-not-found") {
        setError("Email not found in Firebase Authentication.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a few minutes.");
      } else {
        setError(err.message || "Failed to sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="glass w-full max-w-sm rounded-2xl border border-[var(--border)] p-8 shadow-2xl space-y-5"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-primary)] font-semibold">
            Atelier Portal
          </p>
          <h1 className="font-display text-3xl font-normal text-[var(--text-primary)] mt-1">
            Admin Login
          </h1>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@kandammakids.com"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-admin-primary mt-2 flex items-center justify-center"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}