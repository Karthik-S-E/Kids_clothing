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
  MapPin,
  Phone,
  Copy,
  Check,
  Upload,
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
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
  deliveryAddress?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
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
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  shippingAddress?: any;
  deliveryAddress?: any;
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

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">("orders");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Product Form State
  const [form, setForm] = useState<ProductInput>(empty);
  const [rawSizes, setRawSizes] = useState("");
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
  const [userFormPhone, setUserFormPhone] = useState("");
  const [userFormAddress, setUserFormAddress] = useState("");
  const [userFormCity, setUserFormCity] = useState("");
  const [userFormPincode, setUserFormPincode] = useState("");
  const [userFormRole, setUserFormRole] = useState<"admin" | "customer">("customer");
  const [userActionBusy, setUserActionBusy] = useState(false);
  const [userMsg, setUserMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;

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

  // Clean deduplicated users list
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, AppUser>();
    for (const u of usersList) {
      const key = (u.email || u.id).toLowerCase().trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, u);
      } else {
        map.set(key, {
          ...existing,
          ...u,
          address: u.address || existing.address || u.deliveryAddress?.street || existing.deliveryAddress?.street || "",
          city: u.city || existing.city || u.deliveryAddress?.city || existing.deliveryAddress?.city || "",
          pincode: u.pincode || existing.pincode || u.deliveryAddress?.pincode || existing.deliveryAddress?.pincode || "",
          phone: u.phone || existing.phone || "",
        });
      }
    }
    return Array.from(map.values());
  }, [usersList]);

  // Parsed colors array - defaults to ["Standard"] if empty
  const parsedColors = useMemo(() => {
    if (!form.color || !form.color.trim()) return ["Standard"];
    return form.color.split(",").map((c) => c.trim()).filter(Boolean);
  }, [form.color]);

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

  function handleDeleteCustomAge(e: React.MouseEvent, ageToRemove: string) {
    e.stopPropagation();
    const updated = customAgeList.filter((a) => a !== ageToRemove);
    saveCustomAges(updated);
    if (form.ageRange === ageToRemove) {
      setForm((f) => ({ ...f, ageRange: "" }));
    }
  }

  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toUpperCase().replace(/[^0-9Y,\s]/g, "");
    setRawSizes(sanitized);
  };

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

  async function onColorFile(colorKey: string, file?: File) {
    if (!file) return;
    const base64 = await compressAndConvert(file, 600, 0.7);
    setForm((f) => {
      const existingList = f.colorImagesList?.[colorKey] || [];
      return {
        ...f,
        colorImagesList: {
          ...(f.colorImagesList || {}),
          [colorKey]: [...existingList, base64],
        },
        colorImages: {
          ...(f.colorImages || {}),
          [colorKey]: f.colorImages?.[colorKey] || base64,
        },
      };
    });
  }

  function handleAddColorImageUrl(colorKey: string, urlValue: string) {
    if (!urlValue.trim()) return;
    const url = urlValue.trim();
    setForm((f) => {
      const existingList = f.colorImagesList?.[colorKey] || [];
      return {
        ...f,
        colorImagesList: {
          ...(f.colorImagesList || {}),
          [colorKey]: [...existingList, url],
        },
        colorImages: {
          ...(f.colorImages || {}),
          [colorKey]: f.colorImages?.[colorKey] || url,
        },
      };
    });
  }

  function handleRemoveColorImage(colorKey: string, index: number) {
    setForm((f) => {
      const list = [...(f.colorImagesList?.[colorKey] || [])];
      list.splice(index, 1);
      const updatedMap = { ...(f.colorImagesList || {}) };
      if (list.length > 0) {
        updatedMap[colorKey] = list;
      } else {
        delete updatedMap[colorKey];
      }

      const updatedSingleMap = { ...(f.colorImages || {}) };
      if (list[0]) {
        updatedSingleMap[colorKey] = list[0];
      } else {
        delete updatedSingleMap[colorKey];
      }

      return {
        ...f,
        colorImagesList: updatedMap,
        colorImages: updatedSingleMap,
      };
    });
  }

  function onEdit(product: Product) {
    const initialImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    
    let colorImagesList = product.colorImagesList || {};
    let colorImages = product.colorImages || {};
    
    const colors = product.color ? product.color.split(",").map(c => c.trim()).filter(Boolean) : ["Standard"];
    if (Object.keys(colorImagesList).length === 0 && initialImages.length > 0) {
      colorImagesList = { [colors[0]]: initialImages };
      colorImages = { [colors[0]]: initialImages[0] };
    }

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
      colorImages: colorImages,
      colorImagesList: colorImagesList,
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
    
    const allVariantImages = parsedColors.flatMap((c) => form.colorImagesList?.[c] || []);
    if (allVariantImages.length === 0) {
      errors.push("At least one product image is required. Please add it to a color variant.");
    }
    
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

      const allImgs = parsedColors.flatMap((c) => form.colorImagesList?.[c] || []);
      const primaryColor = parsedColors[0];
      const primaryImage = form.colorImagesList?.[primaryColor]?.[0] || allImgs[0] || "";

      const payload: ProductInput = {
        ...form,
        color: form.color?.trim() || "",
        image: primaryImage,
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

  function getOrderShippingInfo(ord: Order) {
    const matchedUser = uniqueUsers.find(
      (u) =>
        (u.email && ord.userEmail && u.email.toLowerCase() === ord.userEmail.toLowerCase()) ||
        (u.phone && (ord.phone || ord.customerPhone) && u.phone === (ord.phone || ord.customerPhone))
    );

    const recipientName =
      ord.customerName ||
      ord.userName ||
      matchedUser?.displayName ||
      "Customer";

    const phone =
      ord.customerPhone ||
      ord.phone ||
      ord.shippingAddress?.phone ||
      ord.deliveryAddress?.phone ||
      matchedUser?.phone ||
      "";

    const street =
      ord.address ||
      (typeof ord.shippingAddress === "string" ? ord.shippingAddress : ord.shippingAddress?.address || ord.shippingAddress?.street) ||
      (typeof ord.deliveryAddress === "string" ? ord.deliveryAddress : ord.deliveryAddress?.street) ||
      matchedUser?.address ||
      matchedUser?.deliveryAddress?.street ||
      "";

    const city =
      ord.city ||
      ord.shippingAddress?.city ||
      ord.deliveryAddress?.city ||
      matchedUser?.city ||
      matchedUser?.deliveryAddress?.city ||
      "";

    const district =
      ord.district ||
      ord.shippingAddress?.district ||
      ord.deliveryAddress?.district ||
      "";

    const state =
      ord.state ||
      ord.shippingAddress?.state ||
      ord.deliveryAddress?.state ||
      matchedUser?.state ||
      "Karnataka";

    const pincode =
      ord.pincode ||
      ord.shippingAddress?.pincode ||
      ord.deliveryAddress?.pincode ||
      matchedUser?.pincode ||
      matchedUser?.deliveryAddress?.pincode ||
      "";

    return {
      recipientName,
      phone,
      street,
      city,
      district,
      state,
      pincode,
    };
  }

  function handleCopyCourierDetails(ord: Order) {
    const info = getOrderShippingInfo(ord);
    const locationParts = [info.city, info.district, info.state].filter(Boolean).join(", ");
    
    const label = `TO:\nName: ${info.recipientName}\nPhone: ${info.phone ? `+91 ${info.phone}` : "N/A"}\nAddress: ${info.street || "N/A"}\nCity/State: ${locationParts}\nPINCODE: ${info.pincode || "N/A"}\n\nOrder ID: #${ord.id}`;
    
    navigator.clipboard.writeText(label);
    setCopiedOrderId(ord.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  }

  function openAddUserModal() {
    setUserEditing(null);
    setUserFormEmail("");
    setUserFormName("");
    setUserFormPhone("");
    setUserFormAddress("");
    setUserFormCity("");
    setUserFormPincode("");
    setUserFormRole("customer");
    setUserMsg(null);
    setUserModalOpen(true);
  }

  function openEditUserModal(u: AppUser) {
    setUserEditing(u);
    setUserFormEmail(u.email);
    setUserFormName(u.displayName || "");
    setUserFormPhone(u.phone || "");
    setUserFormAddress(u.address || u.deliveryAddress?.street || "");
    setUserFormCity(u.city || u.deliveryAddress?.city || "");
    setUserFormPincode(u.pincode || u.deliveryAddress?.pincode || "");
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
          phone: userFormPhone.trim(),
          address: userFormAddress.trim(),
          city: userFormCity.trim(),
          pincode: userFormPincode.trim(),
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
          phone: userFormPhone.trim(),
          address: userFormAddress.trim(),
          city: userFormCity.trim(),
          pincode: userFormPincode.trim(),
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

      const duplicates = usersList.filter(
        (u) => u.id !== targetUser.id && u.email.toLowerCase() === targetUser.email.toLowerCase()
      );
      for (const dup of duplicates) {
        await deleteDoc(doc(db, "users", dup.id)).catch(() => {});
      }

      setUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== targetUser.email.toLowerCase()));
    } catch (err: any) {
      console.error("Firestore delete failed:", err);
      alert("Error deleting user document: " + (err?.message || "Check Firestore permissions."));
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 overflow-x-hidden">
      {/* Header Bar */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-200 pb-4 sm:pb-6">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-[#ff3e6c] font-semibold">
            Primary Store Administrator
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-1 text-stone-900 truncate">Management Hub</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-[10px] sm:text-xs text-stone-500 font-mono hidden sm:inline truncate">
            {user.email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-stone-300 bg-white px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-800 transition hover:bg-stone-50 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "orders"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Customer Orders ({ordersList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "products"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Products & Logo ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "users"
              ? "bg-[#ff3e6c] text-white shadow-md"
              : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Registered Users ({uniqueUsers.length})
        </button>
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm text-stone-900 overflow-x-hidden">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl mb-2 text-stone-900">Customer Orders</h2>
          <p className="text-[11px] sm:text-xs text-stone-500 mb-4 sm:mb-6">
            Review incoming orders, customer details, and update delivery progression stages.
          </p>

          {ordersLoading ? (
            <p className="text-stone-400 text-sm py-10 text-center">Loading orders...</p>
          ) : ordersList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 sm:p-12 text-center text-[11px] sm:text-xs text-stone-500">
              No customer orders have been placed yet.
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {ordersList.map((ord) => {
                const shipping = getOrderShippingInfo(ord);
                const locationDisplay = [shipping.city, shipping.district, shipping.state].filter(Boolean).join(", ");

                return (
                  <div key={ord.id} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 sm:p-6 shadow-xs">
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-stone-200 pb-3 sm:pb-4 gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-bold text-stone-900 text-sm sm:text-base truncate">Order #{ord.id}</span>
                          <span className={`rounded-full px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase shrink-0 ${
                            ord.status === "Cancelled" ? "bg-red-100 text-red-600" : "bg-pink-100 text-[#ff3e6c]"
                          }`}>
                            {ord.status || "Confirmed"}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] sm:text-xs text-stone-600 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-900">Customer:</span>
                          <span className="truncate">{shipping.recipientName}</span>
                          {ord.userEmail && (
                            <span className="text-stone-400 font-mono text-[10px] sm:text-xs truncate">({ord.userEmail})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-bold text-stone-600 mr-1 shrink-0">Status:</span>
                        {["Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, st)}
                            className={`rounded-lg px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${
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
                          className="ml-1 sm:ml-2 rounded-lg border border-red-200 bg-red-50 p-1 sm:p-1.5 text-red-600 hover:bg-red-100 transition cursor-pointer shrink-0"
                          title="Delete Order"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Delivery & Parcel Dispatch Box */}
                    <div className="mt-3 sm:mt-4 rounded-xl border border-amber-200/80 bg-white p-3 sm:p-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1 sm:gap-1.5 font-bold uppercase tracking-wider text-amber-900 text-[10px] sm:text-xs">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ff3e6c]" />
                          <span className="truncate">Delivery Address (Parcel Shipping Details)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCourierDetails(ord)}
                          className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-stone-700 hover:bg-stone-200 transition cursor-pointer shrink-0"
                          title="Copy address formatted for courier label"
                        >
                          {copiedOrderId === ord.id ? (
                            <>
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span>Copy for Courier</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs">
                        <div>
                          <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Recipient</span>
                          <span className="font-bold text-stone-900 text-xs sm:text-sm mt-0.5 block truncate">{shipping.recipientName}</span>
                        </div>

                        <div>
                          <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Phone Number</span>
                          {shipping.phone ? (
                            <a href={`tel:${shipping.phone}`} className="font-mono font-bold text-blue-600 hover:underline mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm">
                              <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> +91 {shipping.phone}
                            </a>
                          ) : (
                            <span className="text-stone-400 italic text-[10px] sm:text-xs mt-0.5 block">Not provided</span>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Street / House Address</span>
                          <span className="text-stone-800 font-medium mt-0.5 block leading-relaxed text-xs sm:text-sm break-words">
                            {shipping.street || <span className="text-stone-400 italic">Address not provided</span>}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider">City / District / State</span>
                          <span className="text-stone-800 font-medium mt-0.5 block text-xs sm:text-sm truncate">
                            {locationDisplay || "Karnataka"}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Delivery Pincode</span>
                          <span className="inline-block mt-0.5 rounded-md bg-amber-100/70 border border-amber-300/80 px-1.5 sm:px-2 py-0.5 font-mono font-bold text-amber-900 text-[10px] sm:text-xs">
                            {shipping.pincode || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="mt-3 sm:mt-4 divide-y divide-stone-200">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3 text-[11px] sm:text-xs">
                          <img src={item.image} alt={item.name} className="h-10 w-8 sm:h-12 sm:w-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</p>
                            <p className="text-stone-500 text-[10px] sm:text-xs">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-stone-900 text-xs sm:text-sm shrink-0">{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Amount */}
                    <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-stone-200 pt-3 sm:pt-4 text-[11px] sm:text-xs">
                      <span className="text-stone-500 font-medium">Total Order Amount:</span>
                      <span className="font-bold text-stone-900 text-sm sm:text-base">{formatINR(ord.totalAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS ================= */}
      {activeTab === "products" && (
        <>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm text-stone-900">
            <div className="flex items-center gap-3 sm:gap-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-[#ff3e6c]/70 shadow"
                />
              ) : (
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-stone-900 text-sm sm:text-lg font-bold text-white">
                  KK
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-xs sm:text-sm">Store Logo (Database)</p>
                <p className="text-[10px] sm:text-xs text-stone-500">Upload your round brand logo here</p>
              </div>
            </div>
            <label className="cursor-pointer rounded-lg bg-[#ff3e6c] px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#e7335e] transition shrink-0">
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

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-start">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm text-stone-900 overflow-x-hidden">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 text-stone-900">
                {editingId ? "Edit piece" : "Publish a piece"}
              </h2>

              {validationErrors.length > 0 && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
                  <ul className="list-disc list-inside text-[10px] sm:text-xs text-red-600 space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  Product name
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Peacock Silk Kurta"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                    Design No
                    <input
                      value={form.designNo || ""}
                      onChange={(e) => setForm({ ...form, designNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. KK-101"
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none uppercase"
                    />
                  </label>

                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                    Color (comma separated)
                    <input
                      value={form.color || ""}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="e.g. Yellow, Pink"
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                    />
                  </label>
                </div>

                {/* Color-Specific Image Uploads */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4 space-y-3">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-900">
                    Product Images (By Variant)
                  </p>
                  <p className="text-[10px] text-amber-800 -mt-2">
                    The first image of the first variant automatically becomes the main product cover.
                  </p>
                  
                  <div className="space-y-3">
                    {parsedColors.map((colorName) => {
                      const colorImagesList = form.colorImagesList?.[colorName] || [];
                      return (
                        <div key={colorName} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2 shadow-xs">
                          <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wide">
                            Variant: <span className="text-[#ff3e6c]">{colorName}</span>
                          </span>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Paste image URL for ${colorName}...`}
                              id={`url-input-${colorName}`}
                              className="flex-1 min-w-0 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] outline-none focus:border-[#ff3e6c]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  handleAddColorImageUrl(colorName, input.value);
                                  input.value = "";
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`url-input-${colorName}`) as HTMLInputElement;
                                if (input) {
                                  handleAddColorImageUrl(colorName, input.value);
                                  input.value = "";
                                }
                              }}
                              className="rounded-lg bg-stone-900 px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider hover:bg-stone-800 shrink-0 cursor-pointer"
                            >
                              Add URL
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-stone-700 transition">
                              <Upload className="h-3 w-3" />
                              <span>Upload for {colorName}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onColorFile(colorName, e.target.files?.[0])}
                              />
                            </label>
                          </div>

                          {colorImagesList.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {colorImagesList.map((imgSrc, imgIdx) => (
                                <div key={imgIdx} className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 shadow-2xs shrink-0">
                                  <img src={imgSrc} alt={`${colorName} ${imgIdx + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorImage(colorName, imgIdx)}
                                    className="absolute top-0.5 right-0.5 rounded-full bg-red-600 p-0.5 text-white hover:opacity-100 cursor-pointer"
                                  >
                                    <X className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                      Selling Price (₹)
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.price === 0 ? "" : form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                      />
                    </label>

                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
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
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                    Gender
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none"
                    >
                      {genders.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 relative" ref={dropdownRef}>
                    <div className="flex items-center justify-between">
                      <span>Age Range</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAge(!isAddingAge);
                          setAgeError(null);
                        }}
                        className="text-[10px] sm:text-[11px] font-bold text-[#ff3e6c] hover:underline cursor-pointer normal-case"
                      >
                        {isAddingAge ? "Close" : "+ New"}
                      </button>
                    </div>

                    {!isAddingAge ? (
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                          className="w-full flex items-center justify-between rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-left text-[11px] sm:text-xs font-normal text-stone-900 outline-none focus:border-[#ff3e6c] cursor-pointer"
                        >
                          <span className={form.ageRange ? "text-stone-900 font-medium" : "text-stone-400"}>
                            {form.ageRange || "Select age range"}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-500 shrink-0" />
                        </button>

                        {ageDropdownOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
                            {availableAgeRanges.map((a) => {
                              const isCustom = customAgeList.includes(a);
                              return (
                                <div
                                  key={a}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, ageRange: a }));
                                    setAgeDropdownOpen(false);
                                  }}
                                  className="flex items-center justify-between px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium cursor-pointer text-stone-700 hover:bg-stone-50 group"
                                >
                                  <span>{a}</span>
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteCustomAge(e, a)}
                                      className="p-1 text-stone-400 hover:text-red-600 transition cursor-pointer"
                                      title="Delete custom age range"
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
                      <div className="mt-1 space-y-2 rounded-xl border border-stone-300 p-2 sm:p-2.5 bg-stone-50">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <input
                            type="number"
                            placeholder="From"
                            value={newAgeStart}
                            onChange={(e) => setNewAgeStart(e.target.value)}
                            className="w-1/2 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-[11px] sm:text-xs text-stone-900 outline-none"
                          />
                          <span className="text-stone-400">-</span>
                          <input
                            type="number"
                            placeholder="To"
                            value={newAgeEnd}
                            onChange={(e) => setNewAgeEnd(e.target.value)}
                            className="w-1/2 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-[11px] sm:text-xs text-stone-900 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddAgeRange}
                            className="rounded-lg bg-stone-900 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white shrink-0"
                          >
                            Add
                          </button>
                        </div>
                        {ageError && <p className="text-[10px] sm:text-[11px] text-red-600">{ageError}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  Sizes (format: 2Y, 3Y, 4Y)
                  <input
                    required
                    value={rawSizes}
                    onChange={handleSizeInputChange}
                    placeholder="e.g. 2Y, 3Y, 4Y"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none uppercase font-mono"
                  />
                </label>

                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  Description
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs text-stone-900 focus:border-[#ff3e6c] outline-none font-normal resize-none"
                  />
                </label>

                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                  {editingId && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={busy}
                      className="flex-1 rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-xl bg-[#ff3e6c] px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#e7335e] cursor-pointer"
                  >
                    {busy ? "Saving..." : editingId ? "Update piece" : "Publish piece"}
                  </button>
                </div>
                {msg && <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-2">{msg}</p>}
              </form>
            </div>

            {/* List Panel */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm lg:sticky lg:top-6 flex flex-col max-h-[calc(100vh-3rem)] text-stone-900 overflow-x-hidden">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 shrink-0 text-stone-900">Live Pieces ({products.length})</h2>
              <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 sm:gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-3 sm:p-4 shadow-xs">
                    <img src={p.image} alt="" className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover border border-stone-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-bold text-stone-900 text-xs sm:text-sm">{p.name}</p>
                      <span className="text-xs sm:text-sm font-extrabold text-[#ff3e6c]">{formatINR(p.price)}</span>
                      <p className="text-[10px] sm:text-xs text-stone-500 mt-1">
                        {normaliseAgeRange(p.ageRange)} · Sizes: {(p.sizes || []).join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded-lg bg-stone-100 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase text-stone-800 hover:bg-stone-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(p)}
                        className="rounded-lg bg-red-50 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase text-red-600 hover:bg-red-100 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= TAB 3: REGISTERED USERS WITH ADDRESS ================= */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm text-stone-900 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-stone-900 truncate">Registered Users</h2>
              <p className="text-[10px] sm:text-xs text-stone-500 mt-1">
                View customer delivery addresses, contact details, and account credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddUserModal}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#ff3e6c] px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#e7335e] transition cursor-pointer shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add User
            </button>
          </div>

          {usersLoading ? (
            <p className="text-stone-400 text-sm py-10 text-center">Loading accounts...</p>
          ) : uniqueUsers.length === 0 ? (
            <div className="py-12 sm:py-16 text-center border border-dashed border-stone-300 rounded-2xl">
              <p className="text-xs sm:text-sm font-semibold text-stone-600">No users found in database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-[10px] sm:text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="py-2 sm:py-3 px-2 sm:px-4">Customer Details</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4">Email & Phone</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4">Delivery Address</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4">Role</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4">Joined</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {uniqueUsers.map((u) => {
                    const isRootAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    const street = u.address || u.deliveryAddress?.street;
                    const city = u.city || u.deliveryAddress?.city;
                    const pin = u.pincode || u.deliveryAddress?.pincode;

                    return (
                      <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 font-bold text-stone-900 truncate">
                          {u.displayName || "Customer"}
                        </td>
                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 font-mono text-stone-600">
                          <div className="truncate">{u.email}</div>
                          {u.phone ? (
                            <div className="text-[10px] sm:text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-stone-400" />
                              <span className="truncate">{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] text-stone-400 italic">No phone</span>
                          )}
                        </td>

                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-stone-600 max-w-[200px] sm:max-w-[280px]">
                          {street ? (
                            <div>
                              <div className="flex items-start gap-1 font-medium text-stone-900">
                                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#ff3e6c] shrink-0 mt-0.5" />
                                <span className="line-clamp-2 text-[10px] sm:text-xs">{street}</span>
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-stone-500 pl-3.5 sm:pl-4.5 mt-0.5 truncate">
                                {city} {pin ? `- ${pin}` : ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[10px] sm:text-xs">No address provided</span>
                          )}
                        </td>

                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase text-amber-800 border border-amber-300">
                              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase text-stone-700">
                              <UserCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Customer
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-stone-500 text-[10px] sm:text-xs">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "Recent"}
                        </td>
                        <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => openEditUserModal(u)}
                              className="p-1 sm:p-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                              title="Edit user"
                            >
                              <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                            {!isRootAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 sm:p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl space-y-3 sm:space-y-4 text-stone-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 sm:pb-3">
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-normal text-stone-900 truncate">
                {userEditing ? "Edit Customer Record" : "Add New Customer"}
              </h3>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-800 transition cursor-pointer shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-2 sm:space-y-3">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Email Address
                <input
                  required
                  type="email"
                  disabled={!!userEditing}
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c] disabled:opacity-50"
                />
              </label>

              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Full Name
                <input
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                />
              </label>

              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Phone Number
                <input
                  type="tel"
                  value={userFormPhone}
                  onChange={(e) => setUserFormPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                />
              </label>

              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Delivery Address
                <input
                  value={userFormAddress}
                  onChange={(e) => setUserFormAddress(e.target.value)}
                  placeholder="House/Flat No, Street, Area"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  City
                  <input
                    value={userFormCity}
                    onChange={(e) => setUserFormCity(e.target.value)}
                    placeholder="e.g. Tarikere"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                  />
                </label>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                  Pincode
                  <input
                    value={userFormPincode}
                    onChange={(e) => setUserFormPincode(e.target.value)}
                    placeholder="577228"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                  />
                </label>
              </div>

              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">
                Assigned Role
                <select
                  value={userFormRole}
                  onChange={(e) => setUserFormRole(e.target.value as "admin" | "customer")}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-stone-900 outline-none focus:border-[#ff3e6c]"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>

              {userMsg && <p className="text-[10px] sm:text-xs font-bold text-[#ff3e6c]">{userMsg}</p>}

              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  disabled={userActionBusy}
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionBusy}
                  className="flex-1 rounded-xl bg-[#ff3e6c] px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase text-white hover:bg-[#e7335e] cursor-pointer"
                >
                  {userActionBusy ? "Saving..." : userEditing ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Product Delete */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 text-stone-900">
            <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-stone-900">Delete Product?</h3>
            <p className="text-[10px] sm:text-xs text-stone-500">Are you sure you want to delete {deletingProduct.name}?</p>
            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 rounded-xl border border-stone-300 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteBusy}
                className="flex-1 rounded-xl bg-red-600 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase text-white hover:bg-red-700 cursor-pointer"
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