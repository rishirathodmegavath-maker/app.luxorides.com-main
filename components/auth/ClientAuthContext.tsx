"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@/types/client";
import { ClientProfileService } from "@/services/client-profile.service";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

/* ===============================
   TYPES
   =============================== */

type ClientAuthContextType = {
  client: Client | null;
  loading: boolean;
  logout: () => void;
  setClient: (client: Client) => void;
};

/* ===============================
   CONTEXT
   =============================== */

const ClientAuthContext = createContext<ClientAuthContextType>({
  client: null,
  loading: true,
  logout: () => {},
  setClient: () => {},
});

/* ===============================
   PROVIDER
   =============================== */

export function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // 🔹 Read token synchronously (safe in "use client")
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("fleetovo_client_token")
      : null;

  // 🔹 Initial state derived, not mutated in effect
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    ClientProfileService.me()
      .then((data) => {
        if (!cancelled) setClient(data);
      })
      .catch(() => {
        localStorage.removeItem("fleetovo_client_token");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = () => {
    AuthService.logout();
    setClient(null);
    localStorage.removeItem("fleetovo_client_token");
    router.replace("/auth");
  };

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        loading,
        logout,
        setClient,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

/* ===============================
   HOOK
   =============================== */

export const useClientAuth = () => useContext(ClientAuthContext);
