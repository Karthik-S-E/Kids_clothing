import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface BrandSettings {
  name: string;
  tagline: string;
  logoUrl: string;
}

interface BrandState {
  settings: BrandSettings;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<BrandSettings>) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  settings: {
    name: "Kandamma Kids",
    tagline: "Cute styles, happy smiles",
    logoUrl: "",
  },
  fetchSettings: async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "brand"));
      if (snap.exists()) {
        set({ settings: snap.data() as BrandSettings });
      }
    } catch (err) {
      console.error(err);
    }
  },
  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    await setDoc(doc(db, "settings", "brand"), updated, { merge: true });
    set({ settings: updated });
  },
}));