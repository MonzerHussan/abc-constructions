"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem } from "@/lib/marketplace";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (offeringId: string) => void;
  updateQuantity: (offeringId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  uniqueSuppliers: number;
}

const STORAGE_KEY = "abc-marketplace-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.offeringId === item.offeringId);
      if (existing) {
        return prev.map((i) =>
          i.offeringId === item.offeringId
            ? { ...i, quantity: Math.max(item.minOrderQty, i.quantity + item.quantity) }
            : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const removeItem = (offeringId: string) => {
    setItems((prev) => prev.filter((i) => i.offeringId !== offeringId));
  };

  const updateQuantity = (offeringId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.offeringId !== offeringId) return i;
        const q = Math.max(i.minOrderQty, quantity);
        return q > 0 ? { ...i, quantity: q } : i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const uniqueSuppliers = useMemo(
    () => new Set(items.map((i) => i.supplierId)).size,
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((v) => !v),
        totalItems,
        uniqueSuppliers,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
