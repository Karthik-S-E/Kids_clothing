import { create } from "zustand";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthState = {
  /** The signed-in Firebase user, or null. Never trust this alone for writes —
   *  Firestore security rules are the real gate. */
  user: User | null;
  /** True until the first onAuthStateChanged callback fires, so the admin route
   *  can show a spinner instead of bouncing a signed-in owner to /login. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  subscribe: () => () => void;
};

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Could not sign in. Please try again.";
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  initializing: true,

  login: async (email, password) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      set({ user: cred.user, initializing: false });
      return { ok: true };
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      return { ok: false, error: friendlyError(code) };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  subscribe: () =>
    onAuthStateChanged(auth, (user) => {
      set({ user, initializing: false });
    }),
}));
