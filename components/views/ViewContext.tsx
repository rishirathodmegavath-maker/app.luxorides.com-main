// components/views/ViewContext.tsx
"use client";

import { VehicleCatalog } from "@/types";
import { createContext, useContext, useState } from "react";

export type AppView =
  | { name: "home" }
  | { name: "cars" }
  | { name: "booking" }
  | { name: "booking-detail"; bookingId: string }
  | { name: "fleet" }
  | { name: "account" }
  | { name: "passengers" }
  | { name: "corporates" }
  | { name: "preferences" }
  | { name: "booking-draft" }
  | { name: "payment"; bookingId: string }
  | { name: "policies" }
  | { name: "product"; vehicle: VehicleCatalog }
  | { name: "notifications" }
  | { name: "support" }
  | { name: "support-thread"; ticketId: string }
  | { name: "faq" };

type ViewContextValue = {
  view: AppView;
  setView: (v: AppView) => void;
};

const ViewContext = createContext<ViewContextValue>({
  view: { name: "home" },
  setView: () => {},
});

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>({ name: "home" });

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => useContext(ViewContext);
