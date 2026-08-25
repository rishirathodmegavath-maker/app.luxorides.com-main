"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClientAuth } from "./ClientAuthContext";
import LoadingState from "../ui/LoadingState";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { client, loading } = useClientAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (loading) return;

    if (!client && !isAuthRoute) {
      router.replace("/auth");
    }

    if (client && isAuthRoute) {
      router.replace("/");
    }
  }, [client, loading, isAuthRoute, router]);

  if (loading || (!client && !isAuthRoute) || (client && isAuthRoute)) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <LoadingState label="Opening Luxorides" compact />
      </main>
    );
  }

  return <>{children}</>;
}
