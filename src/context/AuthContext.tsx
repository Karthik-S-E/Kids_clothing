import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

export const ADMIN_EMAIL = "kandammakids@gmail.com";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  loginWithPhoneOrEmail: (identifier: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithPhone: (
    phone: string,
    pass: string,
    name: string,
    addressInfo: { address: string; city: string; state: string; pincode: string },
    userEmail?: string
  ) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  updateUserProfile: (data: {
    displayName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => Promise<void>;
  linkPasswordToAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function normalizeAuthIdentifier(val: string): string {
  const cleaned = val.trim();
  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length === 10 && !cleaned.includes("@")) {
    return `${digitsOnly}@kandamma.local`;
  }
  return cleaned;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isRestoringRef = useRef(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const checkPhoneExists = async (rawPhone: string): Promise<boolean> => {
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(0, 10);
    if (!cleanPhone || cleanPhone.length !== 10) return false;
    const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const syncUserDoc = async (firebaseUser: User, customName?: string): Promise<UserProfile> => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);
    const isDefaultAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const resolvedEmail =
      firebaseUser.email ||
      firebaseUser.providerData?.find((p) => p.email)?.email ||
      null;

    const resolvedName = customName?.trim() || firebaseUser.displayName || "Customer";

    if (!snap.exists()) {
      const initialData: UserProfile = {
        uid: firebaseUser.uid,
        email: resolvedEmail,
        displayName: resolvedName,
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        role: isDefaultAdmin ? "admin" : "customer",
      };
      await setDoc(userRef, { ...initialData, createdAt: serverTimestamp() });
      setProfile(initialData);
      return initialData;
    } else {
      const existing = snap.data() as UserProfile;
      if (!existing.email && resolvedEmail) {
        await setDoc(userRef, { email: resolvedEmail }, { merge: true });
        existing.email = resolvedEmail;
      }
      setProfile(existing);
      return existing;
    }
  };

  // 1. Restore Cart & Wishlist from Firestore on login, clear on logout
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        // Fetch user data including saved cart and wishlist
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            isRestoringRef.current = true;

            if (Array.isArray(data.cart) && data.cart.length > 0) {
              useCartStore.setState({ items: data.cart });
            }
            if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
              useWishlistStore.setState({ items: data.wishlist });
            }

            setTimeout(() => {
              isRestoringRef.current = false;
            }, 300);
          }
        } catch (err) {
          console.error("Failed to restore cart/wishlist from Firestore:", err);
          isRestoringRef.current = false;
        }

        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const realEmail =
              currentUser.email ||
              data.email ||
              currentUser.providerData?.find((p) => p.email)?.email ||
              null;

            setProfile({
              uid: currentUser.uid,
              email: realEmail,
              displayName: data.displayName || currentUser.displayName || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              pincode: data.pincode || "",
              role: data.role,
            });
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || null,
              displayName: currentUser.displayName || "",
            });
          }
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setProfile(null);

        // Clear active screen view on logout so guests do not see the prior user's items
        useCartStore.setState({ items: [] });
        useWishlistStore.setState({ items: [] });
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 2. Automatically save cart & wishlist changes to Firestore when logged in
  useEffect(() => {
    const unsubCart = useCartStore.subscribe((state) => {
      if (isRestoringRef.current || !auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      setDoc(userRef, { cart: state.items }, { merge: true }).catch(() => {});
    });

    const unsubWishlist = useWishlistStore.subscribe((state) => {
      if (isRestoringRef.current || !auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      setDoc(userRef, { wishlist: state.items }, { merge: true }).catch(() => {});
    });

    return () => {
      unsubCart();
      unsubWishlist();
    };
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });

    const cred = await signInWithPopup(auth, provider);
    await syncUserDoc(cred.user);
    return cred.user;
  };

  const loginWithPhoneOrEmail = async (identifier: string, pass: string) => {
    const authEmail = normalizeAuthIdentifier(identifier);
    await signInWithEmailAndPassword(auth, authEmail, pass);
  };

  const signUpWithPhone = async (
    phone: string,
    pass: string,
    name: string,
    addressInfo: { address: string; city: string; state: string; pincode: string },
    userEmail?: string
  ) => {
    const cleanPhone = phone.replace(/\D/g, "");

    const exists = await checkPhoneExists(cleanPhone);
    if (exists) {
      throw new Error("This mobile number is already registered with another account. Please Sign In.");
    }

    const trimmedEmail = userEmail?.trim();
    const authEmail =
      trimmedEmail && trimmedEmail.length > 0
        ? trimmedEmail
        : `${cleanPhone}@kandamma.local`;
    const trimmedName = name.trim();

    const cred = await createUserWithEmailAndPassword(auth, authEmail, pass);
    await updateProfile(cred.user, { displayName: trimmedName });

    const userRef = doc(db, "users", cred.user.uid);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: trimmedEmail || cred.user.email,
      displayName: trimmedName,
      phone: cleanPhone,
      address: addressInfo.address.trim(),
      city: addressInfo.city.trim(),
      state: addressInfo.state.trim(),
      pincode: addressInfo.pincode.trim(),
      role: "customer",
    };

    await setDoc(userRef, { ...newProfile, createdAt: serverTimestamp() });
    setProfile(newProfile);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name.trim() });
    await syncUserDoc(cred.user, name.trim());
  };

  const linkPasswordToAccount = async (password: string) => {
    if (!auth.currentUser) throw new Error("No active session found.");
    const userEmail =
      auth.currentUser.email ||
      auth.currentUser.providerData?.find((p) => p.email)?.email;

    if (!userEmail) {
      throw new Error("Cannot link password: No email found on this Google profile.");
    }

    const credential = EmailAuthProvider.credential(userEmail, password);
    try {
      await linkWithCredential(auth.currentUser, credential);
    } catch (err: any) {
      if (err.code !== "auth/provider-already-linked") {
        throw err;
      }
    }
  };

  const updateUserProfile = async (data: {
    displayName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    if (!auth.currentUser) throw new Error("Not logged in");

    const cleanPhone = data.phone?.replace(/\D/g, "") || "";
    if (cleanPhone) {
      const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
      const snap = await getDocs(q);
      const duplicate = snap.docs.find((d) => d.id !== auth.currentUser?.uid);
      if (duplicate) {
        throw new Error("This mobile number is already used by another account.");
      }
    }

    const trimmedName = data.displayName.trim();
    await updateProfile(auth.currentUser, { displayName: trimmedName });

    const userRef = doc(db, "users", auth.currentUser.uid);
    const emailToSave =
      auth.currentUser.email ||
      profile?.email ||
      auth.currentUser.providerData?.find((p) => p.email)?.email ||
      null;

    await setDoc(
      userRef,
      {
        uid: auth.currentUser.uid,
        email: emailToSave,
        displayName: trimmedName,
        phone: cleanPhone,
        address: data.address?.trim() || "",
        city: data.city?.trim() || "",
        state: data.state?.trim() || "",
        pincode: data.pincode?.trim() || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await auth.currentUser.reload();
    setUser(auth.currentUser);
  };

  const resetPassword = async (rawEmail: string) => {
    const cleanEmail = rawEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid email address to receive the password reset link.");
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  };

const logout = async () => {
    try {
      if (auth.currentUser) {
        // 1. Save current items to Firestore before session terminates
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            cart: useCartStore.getState().items,
            wishlist: useWishlistStore.getState().items,
          },
          { merge: true }
        ).catch(() => {});
      }

      // 2. Terminate Firebase session
      await signOut(auth);

      // 3. Clear in-memory cart & wishlist state
      useCartStore.setState({ items: [] });
      useWishlistStore.setState({ items: [] });
    } catch (err) {
      console.error("Error during sign out:", err);
    } finally {
      // 4. Force redirect to home page at any cost
      window.location.replace("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        checkPhoneExists,
        loginWithPhoneOrEmail,
        loginWithEmail: loginWithPhoneOrEmail,
        signUpWithPhone,
        signUpWithEmail,
        updateUserProfile,
        linkPasswordToAccount,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

export default AuthProvider;