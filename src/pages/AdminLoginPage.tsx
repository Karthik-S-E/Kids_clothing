import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AdminLoginPage() {
  const { user, loading, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </section>
    );
  }

  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (!ok) setError(true);
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kandammakids.com"
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
          />
        </label>
        {error ? (
          <p className="text-sm text-rose-400">Invalid email or password.</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink hover:bg-yellow-400 disabled:opacity-50 cursor-pointer"
        >
          {busy ? "Signing in…" : "Unlock dashboard"}
        </button>
      </form>
    </section>
  );
}
