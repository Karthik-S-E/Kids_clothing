import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ageRanges, genders, type Gender, type Product, type ProductInput } from "../config";
import { formatINR } from "../lib/formatINR";
import { useAuthStore } from "../store/authStore";
import { useProductStore } from "../store/productStore";

const empty: ProductInput = {
  name: "",
  image: "",
  price: 499,
  gender: "Girl",
  ageRange: "2-5 Years",
  description: "",
  sizes: ["2Y", "3Y", "4Y"],
  stockStatus: true,
  meeshoUrl: "",
  flipkartUrl: "",
};

export function AdminPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const logout = useAuthStore((s) => s.logout);
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [form, setForm] = useState<ProductInput>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!authenticated) return <Navigate to="/admin/login" replace />;

  function onFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function onEdit(product: Product) {
    setForm({
      name: product.name,
      image: product.image,
      price: product.price,
      gender: product.gender,
      ageRange: product.ageRange,
      description: product.description,
      sizes: product.sizes,
      stockStatus: product.stockStatus,
      meeshoUrl: product.meeshoUrl || "",
      flipkartUrl: product.flipkartUrl || "",
    });
    setEditingId(product.id);
    setMsg(null);
  }

  function onCancelEdit() {
    setForm(empty);
    setEditingId(null);
    setMsg(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (editingId) {
        await updateProduct(editingId, { ...form, sizes: form.sizes.length ? form.sizes : ["S"] });
        setMsg("Product updated successfully.");
        setEditingId(null);
      } else {
        await addProduct({ ...form, sizes: form.sizes.length ? form.sizes : ["S"] });
        setMsg("Published to the storefront.");
      }
      setForm(empty);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Protected</p>
          <h1 className="font-display text-5xl">Inventory</h1>
        </div>
        <button type="button" onClick={logout} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={onSubmit} className="glass space-y-4 rounded-[2rem] p-6">
          <h2 className="font-display text-3xl">
            {editingId ? "Edit piece" : "Publish a piece"}
          </h2>
          <label className="block text-sm">
            Product name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Image URL
            <input
              value={form.image.startsWith("data:") ? "" : form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://…"
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Or upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="mt-1 w-full text-sm"
            />
          </label>
          {form.image ? (
            <img src={form.image} alt="" className="h-28 w-28 rounded-2xl object-cover" />
          ) : null}
          <label className="block text-sm">
            Price (₹)
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Gender
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Age / size range
              <input
                list="ageRangeOptions"
                value={form.ageRange}
                onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                placeholder="Select or type custom range"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
              />
              <datalist id="ageRangeOptions">
                {ageRanges.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </datalist>
            </label>
          </div>
          <label className="block text-sm">
            Sizes (comma separated)
            <input
              value={form.sizes.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  sizes: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.stockStatus}
              onChange={(e) => setForm({ ...form, stockStatus: e.target.checked })}
              className="h-5 w-5 rounded border-[var(--line)] bg-transparent"
            />
            <span>In Stock</span>
          </label>
          <label className="block text-sm">
            Meesho URL (optional)
            <input
              value={form.meeshoUrl}
              onChange={(e) => setForm({ ...form, meeshoUrl: e.target.value })}
              placeholder="https://meesho.com/..."
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Flipkart URL (optional)
            <input
              value={form.flipkartUrl}
              onChange={(e) => setForm({ ...form, flipkartUrl: e.target.value })}
              placeholder="https://flipkart.com/..."
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </label>
          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={busy}
                className="flex-1 rounded-full border border-[var(--line)] py-3 text-sm font-semibold uppercase tracking-widest disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              disabled={busy || !form.image}
              className="flex-1 rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink disabled:opacity-50"
            >
              {busy ? (editingId ? "Updating…" : "Publishing…") : (editingId ? "Update piece" : "Publish inventory")}
            </button>
          </div>
          {msg ? <p className="text-sm text-[var(--accent)]">{msg}</p> : null}
        </form>

        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="glass flex items-center gap-4 rounded-3xl p-3">
              <img src={p.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-gold">{formatINR(p.price)}</p>
                <p className="text-xs text-[var(--muted)]">
                  {p.stockStatus ? "In Stock" : "Out of Stock"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs hover:border-gold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct(p.id)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs hover:border-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
