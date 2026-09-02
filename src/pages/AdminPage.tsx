import { type FormEvent, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { genders, type Gender, type Product, type ProductInput } from "../config";
import { formatINR } from "../lib/formatINR";
import { useAuthStore } from "../store/authStore";
import { useProductStore } from "../store/productStore";
import { useBrandStore } from "../store/brandStore";

const empty: ProductInput = {
  name: "",
  image: "",
  price: 499,
  gender: "Girl",
  ageRange: "",
  description: "",
  sizes: [],
  stockStatus: true,
  meeshoUrl: "",
  flipkartUrl: "",
};

export function AdminPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const logout = useAuthStore((s) => s.logout);
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { settings, fetchSettings, updateSettings } = useBrandStore();

  const [form, setForm] = useState<ProductInput>(empty);
  const [rawSizes, setRawSizes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!authenticated) return <Navigate to="/admin/login" replace />;

  function onUploadLogo(file?: File) {
    if (!file) return;
    setLogoBusy(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85);

        await updateSettings({ logoUrl: base64 });
        setLogoBusy(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function onFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setForm((f) => ({ ...f, image: compressedBase64 }));
      };
      img.src = e.target?.result as string;
    };
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
      sizes: product.sizes || [],
      stockStatus: product.stockStatus ?? true,
      meeshoUrl: product.meeshoUrl || "",
      flipkartUrl: product.flipkartUrl || "",
    });
    setRawSizes((product.sizes || []).join(", "));
    setEditingId(product.id);
    setMsg(null);
  }

  function onCancelEdit() {
    setForm(empty);
    setRawSizes("");
    setEditingId(null);
    setMsg(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const parsedSizes = rawSizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        ageRange: form.ageRange.trim() || "All Ages",
        sizes: parsedSizes.length > 0 ? parsedSizes : ["Standard"],
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        setMsg("Product updated successfully.");
        setEditingId(null);
      } else {
        await addProduct(payload);
        setMsg("Published live to storefront.");
      }

      setForm(empty);
      setRawSizes("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Protected</p>
          <h1 className="font-display text-5xl">Inventory Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Brand Logo Upload Box */}
      <div className="glass mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--line)] p-5">
        <div className="flex items-center gap-4">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gold/70 shadow"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-lg font-bold text-ink">
              KK
            </div>
          )}
          <div>
            <p className="font-medium">Store Logo (Database)</p>
            <p className="text-xs text-[var(--muted)]">Upload your round Krishna logo here</p>
          </div>
        </div>
        <label className="cursor-pointer rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-yellow-400 transition-colors">
          {logoBusy ? "Saving..." : "Upload Logo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUploadLogo(e.target.files?.[0])}
            disabled={logoBusy}
          />
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Form Panel */}
        <div className="glass rounded-[2rem] p-8 shadow-xl">
          <h2 className="font-display text-3xl mb-6">
            {editingId ? "Edit piece" : "Publish a piece"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm">
              Product name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Peacock Silk Kurta"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <label className="block text-sm">
              Image URL
              <input
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <label className="block text-sm">
              Or upload image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="mt-1 w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink cursor-pointer"
              />
            </label>

            {form.image && (
              <img src={form.image} alt="" className="h-28 w-28 rounded-2xl object-cover border border-[var(--line)]" />
            )}

            <label className="block text-sm">
              Price (₹)
              <input
                required
                type="number"
                min={1}
                value={form.price === 0 ? "" : form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Gender
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                >
                  {genders.map((g) => (
                    <option key={g} value={g} className="bg-zinc-900 text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                Age Range
                <input
                  required
                  value={form.ageRange}
                  onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                  placeholder="e.g. 2-5 Years"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                />
              </label>
            </div>

            <label className="block text-sm">
              Sizes (comma separated)
              <input
                required
                value={rawSizes}
                onChange={(e) => setRawSizes(e.target.value)}
                placeholder="2Y, 3Y, 4Y, 5Y"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <label className="block text-sm">
              Description
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.stockStatus ?? true}
                onChange={(e) => setForm({ ...form, stockStatus: e.target.checked })}
                className="h-5 w-5 accent-gold"
              />
              <span>In Stock</span>
            </label>

            <div className="flex gap-3 pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={busy}
                  className="flex-1 rounded-full border border-[var(--line)] py-3 text-sm font-semibold uppercase tracking-widest hover:border-gold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={busy || !form.image}
                className="flex-1 rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink disabled:opacity-50 hover:bg-yellow-400 cursor-pointer"
              >
                {busy ? "Saving..." : editingId ? "Update piece" : "Publish piece"}
              </button>
            </div>
            {msg && <p className="text-sm text-green-400 mt-2">{msg}</p>}
          </form>
        </div>

        {/* List Panel */}
        <div className="glass rounded-[2rem] p-8 shadow-xl">
          <h2 className="font-display text-3xl mb-6">Live Pieces ({products.length})</h2>
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="glass flex items-center gap-4 rounded-3xl p-4 border border-[var(--line)]">
                <img src={p.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-gold">{formatINR(p.price)}</p>
                  <p className="text-xs text-[var(--muted)]">{p.ageRange} · Sizes: {(p.sizes || []).join(", ")}</p>
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
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-red-300 hover:border-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}