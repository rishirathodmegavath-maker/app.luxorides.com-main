"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, VehicleCatalog, VehicleItinerary } from "@/types";
import { CONFIG } from "@/services/config";

type AddVehiclePayload = {
  vehicleId: string;
  vehicle: VehicleCatalog;
  itinerary?: VehicleItinerary;
  validation?: {
    warning?: string | null;
    validatedAt: string;
  };
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;

  addVehicle: (payload: AddVehiclePayload) => CartItem;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, patch: Partial<CartItem>) => void;
  clearCart: () => void;

  open: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function generateId() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* ================= ADD VEHICLE ================= */

  const addVehicle = (payload: AddVehiclePayload): CartItem => {
    const item: CartItem = {
      id: generateId(),
      vehicleId: payload.vehicleId,
      vehicle: payload.vehicle,
      itinerary: payload.itinerary,
      validation: payload.validation,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [item, ...prev]);

    return item;
  };

  /* ================= REMOVE ================= */

  const removeItem = (itemId: string) =>
    setItems((prev) => prev.filter((i) => i.id !== itemId));

  /* ================= UPDATE ================= */

  const updateItem = (itemId: string, patch: Partial<CartItem>) =>
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
    );

  /* ================= CLEAR ================= */

  const clearCart = () => setItems([]);

  const totalItems = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addVehicle,
        removeItem,
        updateItem,
        clearCart,
        open,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
