import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export const ADMIN_EMAIL = "kandammakids@gmail.com";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  updateUserProfile: (data: { displayName: string; phone?: string; address?: string; city?: string; pincode?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const syncUserDoc = async (firebaseUser: User, customName?: string) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      const isDefaultAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (!snap.exists()) {
        const resolvedName = customName?.trim() || firebaseUser.displayName || "Customer";
        const initialData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: resolvedName,
          phone: "",
          address: "",
          city: "",
          pincode: "",
          role: isDefaultAdmin ? "admin" : "customer",
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, initialData);
        setProfile(initialData);
      }
    } catch (err) {
      console.error("Failed to sync user document:", err);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: data.displayName || currentUser.displayName || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              pincode: data.pincode || "",
              role: data.role,
            });
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || "",
            });
          }
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncUserDoc(cred.user);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name.trim() });
    await syncUserDoc(cred.user, name.trim());
  };

  const updateUserProfile = async (data: { displayName: string; phone?: string; address?: string; city?: string; pincode?: string }) => {
    if (!auth.currentUser) throw new Error("Not logged in");

    const trimmedName = data.displayName.trim();

    // 1. Update Firebase Auth display name
    await updateProfile(auth.currentUser, { displayName: trimmedName });

    // 2. Set/Merge in Firestore so it never fails if document was missing
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(
      userRef,
      {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: trimmedName,
        phone: data.phone?.trim() || "",
        address: data.address?.trim() || "",
        city: data.city?.trim() || "",
        pincode: data.pincode?.trim() || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setUser({ ...auth.currentUser });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        updateUserProfile,
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