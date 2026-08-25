"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginFlow from "@/components/auth/LoginFlow";
import InstallAppDialog from "@/components/auth/InstallAppDialog";
import { usePwaInstall } from "@/components/auth/usePwaInstall";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import LoadingState from "@/components/ui/LoadingState";

export default function AuthPageLayout() {
  const router = useRouter();
  const { client, loading } = useClientAuth();
  const { canInstall, install } = usePwaInstall();
  const [showDialog, setShowDialog] = useState(false);

  /* =====================================================
     SHOW INSTALL DIALOG EVERY TIME (IF ALLOWED)
     ===================================================== */
  useEffect(() => {
    if (loading || client || !canInstall) return;

    const timer = window.setTimeout(() => {
      setShowDialog(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canInstall, client, loading]);

  useEffect(() => {
    if (!loading && client) {
      router.replace("/");
    }
  }, [client, loading, router]);

  /* =====================================================
     HANDLERS (NO PERSISTENCE)
     ===================================================== */

  const handleSkip = () => {
    setShowDialog(false);
  };

  const handleInstall = async () => {
    await install();
    setShowDialog(false);
  };

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <>
      {(loading || client) && (
        <LoadingState label="Opening Luxorides" compact />
      )}

      {!loading && !client && (
        <>
          {showDialog && (
            <InstallAppDialog onInstall={handleInstall} onSkip={handleSkip} />
          )}

          <div className="w-full max-w-md max-h-full animate-fadeIn">
            <LoginFlow />
          </div>
        </>
      )}
    </>
  );
}
