import { create } from "zustand";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    logout: async () => {
      await signOut(auth);
      set({ user: null });
    },
  };
});