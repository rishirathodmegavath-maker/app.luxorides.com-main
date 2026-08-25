"use client";

import { useEffect, useState } from "react";

/* ===============================
   TYPES
   =============================== */

// Minimal spec-compliant type for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

// Keep it module-scoped but typed
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/* ===============================
   HOOK
   =============================== */

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Runtime guard
      if (!("prompt" in e)) return;

      e.preventDefault();

      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler as EventListener,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    deferredPrompt = null;
    setCanInstall(false);

    return choice.outcome === "accepted";
  };

  return { canInstall, install };
}
