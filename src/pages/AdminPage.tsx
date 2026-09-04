import { type FormEvent, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { genders, ageRanges as defaultAgeRanges, type Gender, type Product, type ProductInput } from "../config";
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
  stockQuantity: 5,
  designNo: "",
  color: "",
  style: "",
  occasion: "Birthday Parties, Weddings, Functions & Special Occasions",
  colorImages: {},
  meeshoUrl: "",
  flipkartUrl: "",
};

export function AdminPage() {
  const { user, loading } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { settings, fetchSettings, updateSettings } = useBrandStore();

  const [form, setForm] = useState<ProductInput>(empty);
  const [rawSizes, setRawSizes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [logoBusy, setLogoBusy] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-[var(--muted)]">Loading…</p>
      </section>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const parsedColors = (form.color || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  function compressAndConvert(file: File, maxWidth = 600, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function onUploadLogo(file?: File) {
    if (!file) return;
    setLogoBusy(true);
    const base64 = await compressAndConvert(file, 400, 0.85);
    await updateSettings({ logoUrl: base64 });
    setLogoBusy(false);
  }

  async function onMainFile(file?: File) {
    if (!file) return;
    const base64 = await compressAndConvert(file, 600, 0.7);
    setForm((f) => ({ ...f, image: base64 }));
  }

  async function onColorFile(colorName: string, file?: File) {
    if (!file) return;
    const base64 = await compressAndConvert(file, 600, 0.7);
    setForm((f) => ({
      ...f,
      colorImages: {
        ...(f.colorImages || {}),
        [colorName]: base64,
      },
    }));
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
      stockQuantity: product.stockQuantity ?? 5,
      designNo: product.designNo || "",
      color: product.color || "",
      style: product.style || "",
      occasion: product.occasion || "Birthday Parties, Weddings, Functions & Special Occasions",
      colorImages: product.colorImages || {},
      meeshoUrl: product.meeshoUrl || "",
      flipkartUrl: product.flipkartUrl || "",
    });
    setRawSizes((product.sizes || []).join(", ").toUpperCase());
    setEditingId(product.id);
    setMsg(null);
    setValidationErrors([]);
  }

  function onCancelEdit() {
    setForm(empty);
    setRawSizes("");
    setEditingId(null);
    setMsg(null);
    setValidationErrors([]);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Product name is required.");
    if (!form.image) errors.push("Product image is required (upload or URL).");
    if (!form.description.trim()) errors.push("Description is required.");
    if (form.price <= 0) errors.push("Price must be greater than zero.");
    if (!form.ageRange.trim()) errors.push("Age range is required.");
    const parsedSizes = rawSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedSizes.length === 0) errors.push("At least one size is required.");
    return errors;
  }

  async function handleConfirmDelete() {
    if (!deletingProduct) return;
    setDeleteBusy(true);

    try {
      await deleteProduct(deletingProduct.id);
      if (editingId === deletingProduct.id) {
        onCancelEdit();
      }
      setDeletingProduct(null);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setValidationErrors([]);

    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setBusy(false);
      return;
    }

    try {
      const parsedSizes = rawSizes
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload: ProductInput = {
        ...form,
        ageRange: form.ageRange.trim() || "All Ages",
        sizes: parsedSizes.length > 0 ? parsedSizes : ["Standard"],
        stockQuantity: Number(form.stockQuantity) || 0,
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
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer"
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

          {validationErrors.length > 0 && (
            <div className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">Please fix the following:</p>
              <ul className="list-disc list-inside text-xs text-red-300 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

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

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Design No
                <input
                  value={form.designNo || ""}
                  onChange={(e) => setForm({ ...form, designNo: e.target.value.toUpperCase() })}
                  placeholder="e.g. KK-101"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none uppercase"
                />
              </label>

              <label className="block text-sm">
                Color (comma separated)
                <input
                  value={form.color || ""}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g. Yellow, Pink, Blue"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                />
              </label>
            </div>

            {/* Individual Color Photo Uploads */}
            {parsedColors.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white/5 p-4 space-y-3">
                <p className="text-xs uppercase font-bold tracking-wider text-gold">
                  Photos for Each Color (Optional):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedColors.map((clr) => (
                    <div key={clr} className="rounded-xl border border-[var(--line)] p-2.5 bg-black/20 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{clr}</span>
                        {form.colorImages?.[clr] && (
                          <span className="text-[10px] text-emerald-400 font-bold">Uploaded ✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {form.colorImages?.[clr] ? (
                          <img
                            src={form.colorImages[clr]}
                            alt={clr}
                            className="h-10 w-10 rounded-lg object-cover border border-gold"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] text-[var(--muted)]">
                            None
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onColorFile(clr, e.target.files?.[0])}
                          className="w-full text-xs file:mr-2 file:rounded-full file:border-0 file:bg-gold file:px-2.5 file:py-1 file:text-[10px] file:font-semibold file:text-ink cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Style
                <input
                  value={form.style || ""}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  placeholder="e.g. Kurta Pajama, Frock, Gown"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                />
              </label>

              <label className="block text-sm">
                Occasion
                <input
                  value={form.occasion || ""}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  placeholder="e.g. Weddings, Parties & Festivals"
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                />
              </label>
            </div>

            <label className="block text-sm">
              Default Main Image URL
              <input
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
              />
            </label>

            <label className="block text-sm">
              Or upload main image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onMainFile(e.target.files?.[0])}
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
                Age Range / Group
                <select
                  required
                  value={form.ageRange}
                  onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none"
                >
                  <option value="" className="bg-zinc-900 text-white">Select age range</option>
                  {defaultAgeRanges.map((a) => (
                    <option key={a} value={a} className="bg-zinc-900 text-white">
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              Sizes (comma separated)
              <input
                required
                value={rawSizes}
                onChange={(e) => setRawSizes(e.target.value.toUpperCase())}
                placeholder="2Y, 3Y, 4Y, 5Y"
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-transparent px-4 py-3 focus:border-gold outline-none uppercase"
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

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.stockStatus ?? true}
                  onChange={(e) => setForm({ ...form, stockStatus: e.target.checked })}
                  className="h-5 w-5 accent-gold cursor-pointer"
                />
                <span>In Stock</span>
              </label>

              {(form.stockStatus ?? true) && (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--muted)]">Stock Quantity:</span>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stockQuantity: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-24 rounded-xl border border-[var(--line)] bg-transparent px-3 py-1.5 focus:border-gold outline-none"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={busy}
                  className="flex-1 rounded-full border border-[var(--line)] py-3 text-sm font-semibold uppercase tracking-widest hover:border-gold cursor-pointer"
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

        {/* List Panel - Sticky with independent scrolling */}
        <div className="glass rounded-[2rem] p-8 shadow-xl lg:sticky lg:top-6 flex flex-col max-h-[calc(100vh-3rem)]">
          <h2 className="font-display text-3xl mb-6 shrink-0">Live Pieces ({products.length})</h2>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {products.map((p) => (
              <div key={p.id} className="glass flex items-center gap-4 rounded-3xl p-4 border border-[var(--line)]">
                <img src={p.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-gold">{formatINR(p.price)}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {p.ageRange} · Sizes: {(p.sizes || []).join(", ")}
                    {p.designNo && ` · #${p.designNo}`}
                    {p.stockQuantity !== undefined && ` · Stock: ${p.stockQuantity}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs hover:border-gold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProduct(p)}
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-red-300 hover:border-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-md w-full rounded-[2rem] border border-[var(--line)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 font-bold">
                ✕
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Delete Product?</h3>
                <p className="text-xs text-[var(--muted)]">This cannot be recovered once removed.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/5 p-3">
              <img
                src={deletingProduct.image}
                alt={deletingProduct.name}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{deletingProduct.name}</p>
                <p className="text-xs text-gold">{formatINR(deletingProduct.price)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeletingProduct(null)}
                className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-xs font-semibold uppercase tracking-wider hover:border-gold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleteBusy ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
