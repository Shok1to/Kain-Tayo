"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getListing } from "@/data/mock";

export type CartLine = { listingId: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  total: number;
  add: (listingId: string, qty: number) => void;
  setQty: (listingId: string, qty: number) => void;
  remove: (listingId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kaintayo_cart";
export const ORDER_KEY = "kaintayo_last_order";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart once, after the page appears in the browser.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setLines(JSON.parse(saved));
    } catch {
      // ignore broken saved data
    }
    setReady(true);
  }, []);

  // Save the cart every time it changes (but only after the first load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore storage problems
    }
  }, [lines, ready]);

  const add = useCallback((listingId: string, qty: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.listingId === listingId);
      if (existing) {
        return prev.map((l) =>
          l.listingId === listingId ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { listingId, qty }];
    });
  }, []);

  const setQty = useCallback((listingId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.listingId === listingId ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((listingId: string) => {
    setLines((prev) => prev.filter((l) => l.listingId !== listingId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const total = lines.reduce(
      (sum, l) => sum + (getListing(l.listingId)?.price ?? 0) * l.qty,
      0,
    );
    return { lines, ready, count, total, add, setQty, remove, clear };
  }, [lines, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
