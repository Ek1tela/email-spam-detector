import { create } from "zustand";
import type { ScanResult, ScanRecord } from "@/types";

interface AppState {
  results: ScanResult[];
  history: ScanRecord[];
  loading: boolean;
  error: string | null;
  setResults: (r: ScanResult[]) => void;
  setHistory: (h: ScanRecord[]) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  removeResult: (emailId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  results: [],
  history: [],
  loading: false,
  error: null,
  setResults: (results) => set({ results }),
  setHistory: (history) => set({ history }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  removeResult: (emailId) =>
    set((s) => ({ results: s.results.filter((r) => r.email.id !== emailId) })),
}));
