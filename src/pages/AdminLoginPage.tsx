import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AdminLoginPage() {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (initializing) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6">
        <p className="text-sm text-[var(--muted)]">Checking your session…</p>
      </section>
    );
  }

  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(email, password);
    if (!res.ok) setError(res.error ?? "Could not sign in.");
    setBusy(false);
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Owners only</p>
      <h1 className="font-display text-5xl">Enter the atelier</h1>
      <form onSubmit={onSubmit} className="glass mt-8 space-y-4 rounded-[2rem] p-6">
        <label className="block text-sm">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-gold"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-yellow-400 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Unlock dashboard"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Accounts are managed in the Firebase console. There is no public sign-up.
      </p>
    </section>
  );
}
