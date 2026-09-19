import { create } from "zustand";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  type User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type CustomerProfile = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
};

type CustomerAuthState = {
  customer: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
  init: () => void;
  signUpWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<CustomerProfile>) => Promise<void>;
};

let initialized = false;

export const useCustomerAuthStore = create<CustomerAuthState>((set, get) => ({
  customer: null,
  profile: null,
  loading: true,
  error: null,

  init: () => {
    if (initialized) return;
    initialized = true;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ customer: user });
        const ref = doc(db, "customers", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          set({ profile: snap.data() as CustomerProfile, loading: false });
        } else {
          const newProf: CustomerProfile = {
            uid: user.uid,
            name: user.displayName || "Valued Customer",
            email: user.email || "",
            createdAt: new Date().toISOString(),
          };
          await setDoc(ref, newProf);
          set({ profile: newProf, loading: false });
        }
      } else {
        set({ customer: null, profile: null, loading: false });
      }
    });
  },

  signUpWithEmail: async (name, email, pass, phone) => {
    set({ loading: true, error: null });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      
      const newProf: CustomerProfile = {
        uid: res.user.uid,
        name,
        email,
        phone: phone || "",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "customers", res.user.uid), newProf);
      set({ customer: res.user, profile: newProf, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Registration failed", loading: false });
      throw err;
    }
  },

  loginWithEmail: async (email, pass) => {
    set({ loading: true, error: null });
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      set({ customer: res.user, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed", loading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      const ref = doc(db, "customers", res.user.uid);
      const snap = await getDoc(ref);

      let profileData: CustomerProfile;
      if (!snap.exists()) {
        profileData = {
          uid: res.user.uid,
          name: res.user.displayName || "Valued Customer",
          email: res.user.email || "",
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, profileData);
      } else {
        profileData = snap.data() as CustomerProfile;
      }

      set({ customer: res.user, profile: profileData, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Google sign-in failed", loading: false });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ customer: null, profile: null });
  },

  updateCustomerProfile: async (data) => {
    const { customer, profile } = get();
    if (!customer || !profile) return;
    const updated = { ...profile, ...data };
    await setDoc(doc(db, "customers", customer.uid), updated, { merge: true });
    set({ profile: updated });
  }
}));