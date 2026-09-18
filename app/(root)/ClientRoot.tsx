"use client";

import { useEffect, useRef, useState } from "react";
import { useView } from "@/components/views/ViewContext";

import Navbar from "@/components/navbar/navbar";
import AppFooter from "@/components/shared/footer";
import CartDrawer from "@/components/fleet/CartDrawer";
import { CartProvider } from "@/components/fleet/CartContext";
import { ViewProvider } from "@/components/views/ViewContext";
import AuthGate from "@/components/auth/AuthGate";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { SupportTicketsProvider } from "@/hooks/useSupportTickets";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <CartProvider>
        <ViewProvider>
          <NotificationsProvider>
            <SupportTicketsProvider>
              <Shell>{children}</Shell>
            </SupportTicketsProvider>
          </NotificationsProvider>
        </ViewProvider>
      </CartProvider>
    </AuthGate>
  );
}

/* =========================================================
   PROPER INTERNAL STACK NAVIGATION
========================================================= */

function Shell({ children }: { children: React.ReactNode }) {
  const { view, setView } = useView();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  type ViewType = typeof view;

  const stackRef = useRef<ViewType[]>([]);
  const allowBrowserExitRef = useRef(false);

  /* ===============================
     PUSH INTO STACK ON VIEW CHANGE
  =============================== */

  useEffect(() => {
    const stack = stackRef.current;

    if (stack.length === 0) {
      stack.push(view);
      window.history.replaceState({ internal: true }, "");
      return;
    }

    const last = stack[stack.length - 1];

    if (last.name !== view.name) {
      stack.push(view);
      window.history.pushState({ internal: true }, "");
    }
  }, [view]);

  /* ===============================
     BACK HANDLER
  =============================== */

  useEffect(() => {
    const handlePopState = () => {
      // If we explicitly allow browser exit → do nothing
      if (allowBrowserExitRef.current) return;

      const stack = stackRef.current;

      if (stack.length > 1) {
        stack.pop();
        const previous = stack[stack.length - 1];
        setView(previous);
      } else {
        setShowExitConfirm(true);
        window.history.pushState({ internal: true }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setView]);

  const confirmExit = () => {
    setShowExitConfirm(false);
    allowBrowserExitRef.current = true;

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close(); // may not work in browser, works in some PWA cases
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col text-white">
      <Navbar />
      <CartDrawer />

      <main className="relative flex w-full flex-1 flex-col overflow-x-hidden">
        {children}
      </main>

      <AppFooter />

      {showExitConfirm && (
        <div className="lux-modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="lux-card w-full max-w-sm rounded-[28px] p-6 text-center space-y-5">
            <h2 className="text-lg font-semibold">Close Luxorides?</h2>

            <p className="text-sm text-white/70">
              Are you sure you want to exit the app?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="lux-control flex-1 py-2.5 rounded-xl transition"
              >
                Stay
              </button>

              <button
                onClick={confirmExit}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-medium hover:opacity-90 transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
