import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
  },
}));

/* Subscribe once so the loading state resolves before any component renders */
onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, loading: false });
});
