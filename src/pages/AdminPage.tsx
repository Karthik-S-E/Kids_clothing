import { type FormEvent, useState, useEffect, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import {
  ChevronDown,
  Trash2,
  Package,
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Edit2,
  X,
  Box,
  Plus,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  genders,
  ageRanges as defaultAgeRanges,
  normaliseAgeRange,
  type Gender,
  type Product,
  type ProductInput,
} from "../config";
import { formatINR } from "../lib/formatINR";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";
import { useProductStore } from "../store/productStore";
import { useBrandStore } from "../store/brandStore";
import { db } from "../lib/firebase";

interface AppUser {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  role: "admin" | "customer";
  createdAt?: any;
}

interface Order {
  id: string;
  items: Array<{ name: string; price: number; size: string; quantity: number; image: string }>;
  totalAmount: number;
  status: string;
  userName?: string;
  userEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt?: any;
}

const empty: ProductInput = {
  name: "",
  image: "",
  images: [],
  price: 499,
  discountPercent: 20,
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
  colorImagesList: {},
  meeshoUrl: "",
  flipkartUrl: "",
};

export function AdminPage() {
  const { user, loading, logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { settings, fetchSettings, updateSettings } = useBrandStore();

  // Top Tabs ("orders" | "products" | "users")
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">("orders");

  // Product Form State
  const [form, setForm] = useState<ProductInput>(empty);
  const [rawSizes, setRawSizes] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [logoBusy, setLogoBusy] = useState(false);

  // Age Ranges
  const [customAgeList, setCustomAgeList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("kandamma_custom_age_ranges");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddingAge, setIsAddingAge] = useState(false);
  const [newAgeStart, setNewAgeStart] = useState("");
  const [newAgeEnd, setNewAgeEnd] = useState("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Orders State
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // User Management State
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userEditing, setUserEditing] = useState<AppUser | null>(null);
  const [userFormEmail, setUserFormEmail] = useState("");
  const [userFormName, setUserFormName] = useState("");
  const [userFormRole, setUserFormRole] = useState<"admin" | "customer">("customer");
  const [userActionBusy, setUserActionBusy] = useState(false);
  const [userMsg, setUserMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync users & orders in real-time from Firestore when admin is logged in
  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;

    // Users listener
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const list: AppUser[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppUser, "id">),
        }));
        setUsersList(list);
        setUsersLoading(false);
      },
      (err) => {
        console.error("Failed to load users:", err);
        setUsersLoading(false);
      }
    );

    // Orders listener
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const list: Order[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Order, "id">),
        }));
        setOrdersList(list);
        setOrdersLoading(false);
      },
      (err) => {
        console.error("Failed to load orders:", err);
        setOrdersLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, [user]);

  // Close custom dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableAgeRanges = useMemo(() => {
    const combined = Array.from(new Set([...defaultAgeRanges, ...customAgeList]));
    return combined.sort((a, b) => {
      const numA = parseInt(a, 10) || 0;
      const numB = parseInt(b, 10) || 0;
      return numA - numB;
    });
  }, [customAgeList]);

  const calculatedMrp = useMemo(() => {
    const p = Number(form.price) || 0;
    const d = Number(form.discountPercent) || 0;
    if (p <= 0 || d <= 0 || d >= 100) return p;
    return Math.round(p / (1 - d / 100));
  }, [form.price, form.discountPercent]);

  const sizeValidation = useMemo(() => {
    if (!rawSizes.trim()) return { isValid: true, error: "" };
    const sizeRegex = /^\d+Y$/i;
    const splitSizes = rawSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const invalid = splitSizes.filter((s) => !sizeRegex.test(s));
    if (invalid.length > 0) {
      return {
        isValid: false,
        error: `"${invalid.join(", ")}" is invalid. Sizes must strictly be in format <NUM>Y (e.g. 2Y or 2Y, 3Y).`,
      };
    }
    return { isValid: true, error: "" };
  }, [rawSizes]);

  function saveCustomAges(updated: string[]) {
    setCustomAgeList(updated);
    localStorage.setItem("kandamma_custom_age_ranges", JSON.stringify(updated));
  }

  function handleAddAgeRange() {
    setAgeError(null);
    const start = parseInt(newAgeStart, 10);
    const end = parseInt(newAgeEnd, 10);

    if (isNaN(start) || isNaN(end)) {
      setAgeError("Please enter valid start and end age numbers.");
      return;
    }

    if (start < 0 || end <= start) {
      setAgeError("End age must be greater than start age.");
      return;
    }

    const formatted = `${start}-${end} Years`;
    if (availableAgeRanges.includes(formatted)) {
      setAgeError("This age range already exists.");
      return;
    }

    const updated = [...customAgeList, formatted];
    saveCustomAges(updated);
    setForm((f) => ({ ...f, ageRange: formatted }));
    setNewAgeStart("");
    setNewAgeEnd("");
    setIsAddingAge(false);
  }

  function handleDeleteAgeRange(ageToDelete: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = customAgeList.filter((a) => a !== ageToDelete);
    saveCustomAges(updated);
    if (form.ageRange === ageToDelete) {
      setForm((f) => ({ ...f, ageRange: "" }));
    }
  }

  // --- Strict Route Protection ---
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-[var(--text-secondary)]">Verifying permissions...</p>
      </section>
    );
  }

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

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
    setForm((f) => {
      const currentImages = f.images && f.images.length > 0 ? f.images : (f.image ? [f.image] : []);
      return {
        ...f,
        image: f.image || base64,
        images: [...currentImages, base64],
      };
    });
  }

  function handleAddImageUrl() {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setForm((f) => {
      const currentImages = f.images && f.images.length > 0 ? f.images : (f.image ? [f.image] : []);
      return {
        ...f,
        image: f.image || url,
        images: [...currentImages, url],
      };
    });
    setNewImageUrl("");
  }

  function handleRemoveImage(index: number) {
    setForm((f) => {
      const imgs = [...(f.images || [])];
      imgs.splice(index, 1);
      return {
        ...f,
        images: imgs,
        image: imgs[0] || "",
      };
    });
  }

  async function onColorFile(colorName: string, file?: File) {
    if (!file) return;
    const base64 = await compressAndConvert(file, 600, 0.7);
    setForm((f) => {
      const currentList = f.colorImagesList?.[colorName] || [];
      const updatedList = [...currentList, base64];
      return {
        ...f,
        colorImages: {
          ...(f.colorImages || {}),
          [colorName]: base64,
        },
        colorImagesList: {
          ...(f.colorImagesList || {}),
          [colorName]: updatedList,
        },
      };
    });
  }

  function handleAddColorImageUrl(colorName: string, urlVal: string) {
    if (!urlVal.trim()) return;
    setForm((f) => {
      const currentList = f.colorImagesList?.[colorName] || [];
      const updatedList = [...currentList, urlVal.trim()];
      return {
        ...f,
        colorImages: {
          ...(f.colorImages || {}),
          [colorName]: f.colorImages?.[colorName] || urlVal.trim(),
        },
        colorImagesList: {
          ...(f.colorImagesList || {}),
          [colorName]: updatedList,
        },
      };
    });
  }

  function handleRemoveColorImage(colorName: string, index: number) {
    setForm((f) => {
      const currentList = [...(f.colorImagesList?.[colorName] || [])];
      currentList.splice(index, 1);
      return {
        ...f,
        colorImagesList: {
          ...(f.colorImagesList || {}),
          [colorName]: currentList,
        },
        colorImages: {
          ...(f.colorImages || {}),
          [colorName]: currentList[0] || "",
        },
      };
    });
  }

  function onEdit(product: Product) {
    const initialImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    setForm({
      name: product.name,
      image: product.image,
      images: initialImages,
      price: product.price,
      discountPercent: product.discountPercent ?? 0,
      gender: product.gender,
      ageRange: normaliseAgeRange(product.ageRange),
      description: product.description,
      sizes: product.sizes || [],
      stockStatus: product.stockStatus ?? true,
      stockQuantity: product.stockQuantity ?? 5,
      designNo: product.designNo || "",
      color: product.color || "",
      style: product.style || "",
      occasion: product.occasion || "Birthday Parties, Weddings, Functions & Special Occasions",
      colorImages: product.colorImages || {},
      colorImagesList: product.colorImagesList || {},
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
    const allImgs = form.images && form.images.length > 0 ? form.images : (form.image ? [form.image] : []);
    if (allImgs.length === 0) errors.push("At least one product image is required.");
    if (!form.description.trim()) errors.push("Description is required.");
    if (form.price <= 0) errors.push("Price must be greater than zero.");
    if ((form.discountPercent ?? 0) < 0 || (form.discountPercent ?? 0) >= 100) {
      errors.push("Discount percentage must be between 0 and 99.");
    }
    if (!form.ageRange || !form.ageRange.trim()) {
      errors.push("Age range is required. Please choose one from the dropdown.");
    }

    if (!rawSizes.trim()) {
      errors.push("At least one size is required (e.g. 2Y or 2Y, 3Y).");
    } else if (!sizeValidation.isValid) {
      errors.push(sizeValidation.error);
    }

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

      const allImgs = form.images && form.images.length > 0 ? form.images : (form.image ? [form.image] : []);

      const payload: ProductInput = {
        ...form,
        image: allImgs[0] || form.image,
        images: allImgs,
        discountPercent: Number(form.discountPercent) || 0,
        ageRange: normaliseAgeRange(form.ageRange),
        sizes: parsedSizes,
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

  // --- Order Status & Deletion Handlers ---
  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order.");
    }
  }

  // --- User CRUD Handlers ---
  function openAddUserModal() {
    setUserEditing(null);
    setUserFormEmail("");
    setUserFormName("");
    setUserFormRole("customer");
    setUserMsg(null);
    setUserModalOpen(true);
  }

  function openEditUserModal(u: AppUser) {
    setUserEditing(u);
    setUserFormEmail(u.email);
    setUserFormName(u.displayName || "");
    setUserFormRole(u.role || "customer");
    setUserMsg(null);
    setUserModalOpen(true);
  }

  async function handleSaveUser(e: FormEvent) {
    e.preventDefault();
    setUserActionBusy(true);
    setUserMsg(null);

    try {
      if (userEditing) {
        const userDocRef = doc(db, "users", userEditing.id);
        await updateDoc(userDocRef, {
          displayName: userFormName.trim() || "Valued Customer",
          role: userFormRole,
        });
        setUserMsg("User record updated successfully.");
      } else {
        const newId = `user_${Date.now()}`;
        const userDocRef = doc(db, "users", newId);
        await setDoc(userDocRef, {
          uid: newId,
          email: userFormEmail.trim().toLowerCase(),
          displayName: userFormName.trim() || "Valued Customer",
          role: userFormRole,
          createdAt: serverTimestamp(),
        });
        setUserMsg("User created successfully.");
      }
      setTimeout(() => {
        setUserModalOpen(false);
        setUserMsg(null);
      }, 1000);
    } catch (err) {
      setUserMsg(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setUserActionBusy(false);
    }
  }

  async function handleDeleteUser(targetUser: AppUser) {
    if (targetUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      alert("Primary Admin cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${targetUser.email}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", targetUser.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Header Bar */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#ff3e6c] font-semibold">
            Primary Store Administrator
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mt-1 text-stone-900">Management Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 font-mono hidden sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-800 transition hover:bg-stone-50 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Package className="h-4 w-4" /> Customer Orders ({ordersList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "products"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Box className="h-4 w-4" /> Products & Logo ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Users className="h-4 w-4" /> Registered Users ({usersList.length})
        </button>
      </div>

      {/* ================= TAB 1: CUSTOMER ORDERS MANAGEMENT ================= */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm text-stone-900">
          <h2 className="font-serif text-3xl mb-2 text-stone-900">Customer Orders</h2>
          <p className="text-xs text-stone-500 mb-6">
            Review incoming orders, customer details, and update delivery progression stages or cancel/delete orders.
          </p>

          {ordersLoading ? (
            <p className="text-stone-400 text-sm py-10 text-center">Loading orders...</p>
          ) : ordersList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center text-xs text-stone-500">
              No customer orders have been placed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {ordersList.map((ord) => (
                <div key={ord.id} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-stone-200 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-stone-900 text-base">Order #{ord.id}</span>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                          ord.status === "Cancelled" ? "bg-red-100 text-red-600" : "bg-pink-100 text-[#ff3e6c]"
                        }`}>
                          {ord.status || "Confirmed"}
                        </span>
                      </div>
                      {/* Customer Info Display */}
                      <div className="mt-1 text-xs text-stone-600 flex items-center gap-2">
                        <span className="font-semibold text-stone-900">Customer:</span>
                        <span>{ord.userName || ord.customerName || "Valued Customer"}</span>
                        {ord.userEmail && (
                          <span className="text-stone-400 font-mono">({ord.userEmail})</span>
                        )}
                      </div>
                    </div>

                    {/* Status Action Buttons & Delete */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-stone-600 mr-1">Status:</span>
                      {["Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, st)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                            ord.status === st
                              ? st === "Cancelled"
                                ? "bg-red-600 text-white shadow-sm"
                                : "bg-[#ff3e6c] text-white shadow-sm"
                              : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          {st}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="ml-2 rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 divide-y divide-stone-200">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3 text-xs">
                        <img src={item.image} alt={item.name} className="h-12 w-10 rounded-lg object-cover border border-stone-200" />
                        <div className="flex-1">
                          <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                          <p className="text-stone-500">Size: {item.size} · Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-stone-900 text-sm">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Total */}
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-xs">
                    <span className="text-stone-500 font-medium">Total Order Amount:</span>
                    <span className="font-bold text-stone-900 text-base">{formatINR(ord.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS & LOGO CRUD ================= */}
      {activeTab === "products" && (
        <>
          {/* Brand Logo Box */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-stone-900">
            <div className="flex items-center gap-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[#ff3e6c]/70 shadow"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-lg font-bold text-white">
                  KK
                </div>
              )}
              <div>
                <p className="font-bold text-stone-900 text-sm">Store Logo (Database)</p>
                <p className="text-xs text-stone-500">Upload your round brand logo here</p>
              </div>
            </div>
            <label className="cursor-pointer rounded-lg bg-[#ff3e6c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#e7335e] transition">
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
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm text-stone-900">
              <h2 className="font-serif text-3xl mb-6 text-stone-900">
                {editingId ? "Edit piece" : "Publish a piece"}
              </h2>

              {validationErrors.length > 0 && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Product name
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Peacock Silk Kurta"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Design No
                    <input
                      value={form.designNo || ""}
                      onChange={(e) => setForm({ ...form, designNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. KK-101"
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none uppercase"
                    />
                  </label>

                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Color (comma separated)
                    <input
                      value={form.color || ""}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="e.g. Yellow, Pink"
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                    />
                  </label>
                </div>

                {/* MULTIPLE PRODUCT PHOTOS FOR HOME / SHOWCASE */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Multiple Gallery Photos (Home / Product Screen)
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#ff3e6c]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-stone-800 shrink-0 cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-xl bg-stone-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-700 transition">
                      Upload Photos From Device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onMainFile(e.target.files?.[0])}
                      />
                    </label>
                    <span className="text-[11px] text-stone-500">Upload multiple photos to add to gallery</span>
                  </div>

                  {/* Thumbnail Previews */}
                  {form.images && form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.images.map((imgSrc, idx) => (
                        <div key={idx} className="relative group h-16 w-16 rounded-xl overflow-hidden border border-stone-300 bg-white shadow-xs">
                          <img src={imgSrc} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-0.5 text-white opacity-90 hover:opacity-100 cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DYNAMIC COLOR-SPECIFIC IMAGE UPLOAD SECTIONS */}
                {parsedColors.length > 0 && (
                  <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#ff3e6c]">
                      Color-Specific Image Galleries
                    </p>
                    <p className="text-[11px] text-stone-600">
                      When users select a specific color shade, these dedicated variant photos will be displayed.
                    </p>

                    {parsedColors.map((col) => {
                      const colImages = form.colorImagesList?.[col] || (form.colorImages?.[col] ? [form.colorImages[col]] : []);
                      return (
                        <div key={col} className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 uppercase">
                              Color: <span className="text-[#ff3e6c]">{col}</span>
                            </span>
                            <label className="cursor-pointer rounded-lg bg-[#ff3e6c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#e7335e] transition">
                              + Upload for {col}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onColorFile(col, e.target.files?.[0])}
                              />
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Paste image URL for ${col}`}
                              id={`color_url_${col}`}
                              className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs outline-none focus:border-[#ff3e6c]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const inputEl = e.currentTarget;
                                  handleAddColorImageUrl(col, inputEl.value);
                                  inputEl.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const inputEl = document.getElementById(`color_url_${col}`) as HTMLInputElement;
                                if (inputEl) {
                                  handleAddColorImageUrl(col, inputEl.value);
                                  inputEl.value = '';
                                }
                              }}
                              className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-stone-800 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>

                          {colImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {colImages.map((cImg, cIdx) => (
                                <div key={cIdx} className="relative group h-14 w-14 rounded-lg overflow-hidden border border-stone-300 bg-stone-50">
                                  <img src={cImg} alt={`${col} variant ${cIdx + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorImage(col, cIdx)}
                                    className="absolute top-0.5 right-0.5 rounded-full bg-red-600 p-0.5 text-white hover:opacity-100 cursor-pointer"
                                    title="Remove color photo"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PRICING & DISCOUNT */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Selling Price (₹)
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.price === 0 ? "" : form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                      />
                    </label>

                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Offer / Discount %
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={form.discountPercent ?? 0}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discountPercent: Math.min(99, Math.max(0, Number(e.target.value) || 0)),
                          })
                        }
                        placeholder="e.g. 20"
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-white px-3.5 py-2 text-xs border border-stone-200">
                    <span className="text-stone-500 font-medium">Storefront preview:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-stone-900 text-sm">{formatINR(form.price)}</span>
                      {(form.discountPercent ?? 0) > 0 ? (
                        <>
                          <span className="text-stone-400 line-through">MRP {formatINR(calculatedMrp)}</span>
                          <span className="font-bold text-[#ff3e6c]">({form.discountPercent}% OFF)</span>
                        </>
                      ) : (
                        <span className="text-stone-400 italic">No discount</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Gender
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                    >
                      {genders.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* AGE RANGE DROPDOWN */}
                  <div className="block text-xs font-bold uppercase tracking-wider text-stone-700 relative" ref={dropdownRef}>
                    <div className="flex items-center justify-between">
                      <span>Age Range</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAge(!isAddingAge);
                          setAgeError(null);
                        }}
                        className="text-[11px] font-bold text-[#ff3e6c] hover:underline cursor-pointer normal-case"
                      >
                        {isAddingAge ? "Close" : "+ New"}
                      </button>
                    </div>

                    {!isAddingAge ? (
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                          className="w-full flex items-center justify-between rounded-xl border border-stone-300 bg-white px-4 py-3 text-left text-xs font-normal text-stone-900 outline-none focus:border-[#ff3e6c] cursor-pointer"
                        >
                          <span className={form.ageRange ? "text-stone-900 font-medium" : "text-stone-400"}>
                            {form.ageRange || "Select age range"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-stone-500" />
                        </button>

                        {ageDropdownOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
                            {availableAgeRanges.map((a) => {
                              const isCustom = customAgeList.includes(a);
                              const isSelected = form.ageRange === a;

                              return (
                                <div
                                  key={a}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, ageRange: a }));
                                    setAgeDropdownOpen(false);
                                  }}
                                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                                    isSelected ? "bg-[#ff3e6c] text-white" : "text-stone-700 hover:bg-stone-50"
                                  }`}
                                >
                                  <span>{a}</span>
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteAgeRange(a, e)}
                                      className="p-1 rounded text-stone-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-2 rounded-xl border border-stone-300 p-2.5 bg-stone-50">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="From"
                            value={newAgeStart}
                            onChange={(e) => setNewAgeStart(e.target.value)}
                            className="w-1/2 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-900 outline-none"
                          />
                          <span className="text-stone-400">-</span>
                          <input
                            type="number"
                            placeholder="To"
                            value={newAgeEnd}
                            onChange={(e) => setNewAgeEnd(e.target.value)}
                            className="w-1/2 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-900 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddAgeRange}
                            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white shrink-0"
                          >
                            Add
                          </button>
                        </div>
                        {ageError && <p className="text-[11px] text-red-600">{ageError}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* SIZES */}
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  <div className="flex items-center justify-between">
                    <span>Sizes (format: 2Y, 3Y, 4Y)</span>
                    <span className="text-[11px] text-[#ff3e6c] font-mono">&lt;NUM&gt;Y</span>
                  </div>
                  <input
                    required
                    value={rawSizes}
                    onChange={(e) => setRawSizes(e.target.value.toUpperCase())}
                    placeholder="e.g. 2Y, 3Y, 4Y"
                    className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-xs outline-none uppercase font-mono ${
                      !sizeValidation.isValid
                        ? "border-red-500 text-red-600 font-semibold bg-red-50"
                        : "border-stone-300 text-stone-900 focus:border-[#ff3e6c]"
                    }`}
                  />
                  {!sizeValidation.isValid && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium normal-case">
                      {sizeValidation.error}
                    </p>
                  )}
                </label>

                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Description
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs text-stone-900 focus:border-[#ff3e6c] outline-none font-normal"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.stockStatus ?? true}
                      onChange={(e) => setForm({ ...form, stockStatus: e.target.checked })}
                      className="h-4 w-4 accent-[#ff3e6c] cursor-pointer"
                    />
                    <span>In Stock</span>
                  </label>

                  {(form.stockStatus ?? true) && (
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                      <span>Quantity:</span>
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
                        className="w-20 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-normal text-stone-900 outline-none"
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
                      className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy || ((!form.images || form.images.length === 0) && !form.image) || !sizeValidation.isValid}
                    className="flex-1 rounded-xl bg-[#ff3e6c] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#e7335e] disabled:opacity-50 cursor-pointer"
                  >
                    {busy ? "Saving..." : editingId ? "Update piece" : "Publish piece"}
                  </button>
                </div>
                {msg && <p className="text-xs font-bold text-emerald-600 mt-2">{msg}</p>}
              </form>
            </div>

            {/* List Panel */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm lg:sticky lg:top-6 flex flex-col max-h-[calc(100vh-3rem)] text-stone-900">
              <h2 className="font-serif text-3xl mb-6 shrink-0 text-stone-900">Live Pieces ({products.length})</h2>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {products.map((p) => {
                  const itemDiscount = p.discountPercent ?? 0;
                  const itemMrp =
                    itemDiscount > 0 && itemDiscount < 100
                      ? Math.round(p.price / (1 - itemDiscount / 100))
                      : p.price;

                  return (
                    <div key={p.id} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 shadow-xs">
                      <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover border border-stone-200" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-bold text-stone-900 text-sm">{p.name}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-sm font-extrabold text-[#ff3e6c]">{formatINR(p.price)}</span>
                          {itemDiscount > 0 && (
                            <>
                              <span className="text-xs text-stone-400 line-through">MRP {formatINR(itemMrp)}</span>
                              <span className="text-[11px] font-bold text-amber-600">({itemDiscount}% OFF)</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          {normaliseAgeRange(p.ageRange)} · Sizes: {(p.sizes || []).join(", ")}
                          {p.designNo && ` · #${p.designNo}`}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-800 hover:bg-stone-200 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(p)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold uppercase text-red-600 hover:bg-red-100 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= TAB 3: USER MANAGEMENT CRUD ================= */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm text-stone-900">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-3xl text-stone-900">Registered Users</h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage system accounts, elevate roles, or remove users.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddUserModal}
              className="flex items-center gap-2 rounded-lg bg-[#ff3e6c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#e7335e] transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> Add User
            </button>
          </div>

          {usersLoading ? (
            <p className="text-stone-400 text-sm py-10 text-center">Loading accounts...</p>
          ) : usersList.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-300 rounded-2xl">
              <p className="text-sm font-semibold text-stone-600">No users found in database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {usersList.map((u) => {
                    const isRootAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    return (
                      <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          {u.displayName || "Customer"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800 border border-amber-300">
                              <ShieldCheck className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-stone-700">
                              <UserCheck className="h-3 w-3" /> Customer
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "Recent"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                              title="Edit user"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {!isRootAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: User Create / Edit */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-2xl font-normal text-stone-900">
                {userEditing ? "Edit User Record" : "Add New User"}
              </h3>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Email Address
                <input
                  required
                  type="email"
                  disabled={!!userEditing}
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-[#ff3e6c] disabled:opacity-50"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Full / Display Name
                <input
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Assigned Role
                <select
                  value={userFormRole}
                  onChange={(e) => setUserFormRole(e.target.value as "admin" | "customer")}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>

              {userMsg && (
                <p className="text-xs font-bold text-[#ff3e6c]">{userMsg}</p>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  disabled={userActionBusy}
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionBusy}
                  className="flex-1 rounded-xl bg-[#ff3e6c] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#e7335e] cursor-pointer"
                >
                  {userActionBusy ? "Saving..." : userEditing ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Product Delete Confirmation */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-stone-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
                ✕
              </div>
              <div>
                <h3 className="font-serif text-2xl font-normal text-stone-900">Delete Product?</h3>
                <p className="text-xs text-stone-500">This cannot be recovered once removed.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
              <img
                src={deletingProduct.image}
                alt={deletingProduct.name}
                className="h-12 w-12 rounded-xl object-cover border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold text-stone-900">{deletingProduct.name}</p>
                <p className="text-xs font-extrabold text-[#ff3e6c]">{formatINR(deletingProduct.price)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeletingProduct(null)}
                className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 cursor-pointer"
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

export default AdminPage;