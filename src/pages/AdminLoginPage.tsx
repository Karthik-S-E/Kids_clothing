import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AdminLoginPage() {
  const { authenticated, login } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (authenticated) return <Navigate to="/admin" replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = login(password);
    setError(!ok);
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Owners only</p>
      <h1 className="font-display text-5xl">Enter the atelier</h1>
      <form onSubmit={onSubmit} className="glass mt-8 space-y-4 rounded-[2rem] p-6">
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">Incorrect password.</p> : null}
        <button className="w-full rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink">
          Unlock dashboard
        </button>
      </form>
    </section>
  );
}
