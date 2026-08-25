"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useView, type AppView } from "@/components/views/ViewContext";

/* =====================================================
   TYPES
   ===================================================== */

type Tab = {
  id: AppView["name"];
  label: string;
  icon: LucideIcon;
};

/**
 * Tabs NEVER navigate to booking-detail.
 * This helper safely narrows the union for setView.
 */
function tabToView(name: Tab["id"]): AppView {
  return { name } as Exclude<AppView, { name: "booking-detail" }>;
}

function getPrimaryTabName(name: AppView["name"]): Tab["id"] {
  if (name === "product" || name === "fleet") return "cars";

  if (
    name === "booking-detail" ||
    name === "booking-draft" ||
    name === "payment"
  ) {
    return "booking";
  }

  if (
    name === "passengers" ||
    name === "corporates" ||
    name === "preferences" ||
    name === "policies"
  ) {
    return "account";
  }

  return name;
}

/* =====================================================
   COMPONENT
   ===================================================== */

export default function SmoothTabs({
  tabs,
  isMinimized = false,
  variant = "default",
}: {
  tabs: Tab[];
  isMinimized?: boolean;
  variant?: "default" | "mobile-pill";
}) {
  const { view, setView } = useView();
  const activeName = getPrimaryTabName(view.name);

  /* =====================================================
     HOOKS (ALWAYS CALLED)
     ===================================================== */

  const containerRef = useRef<HTMLDivElement | null>(null);

  const buttonRefs = useRef<Record<AppView["name"], HTMLButtonElement | null>>(
    {} as Record<AppView["name"], HTMLButtonElement | null>
  );

  const contentRefs = useRef<Record<AppView["name"], HTMLDivElement | null>>(
    {} as Record<AppView["name"], HTMLDivElement | null>
  );

  const iconRefs = useRef<Record<AppView["name"], HTMLElement | null>>(
    {} as Record<AppView["name"], HTMLElement | null>
  );

  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  /* =====================================================
     MEASURE (DESKTOP ONLY)
     ===================================================== */

  const measure = () => {
    if (variant === "mobile-pill") return;

    const container = containerRef.current;
    if (!container) return;

    const activeIdx = tabs.findIndex((t) => t.id === activeName);
    if (activeIdx === -1) {
      setIndicator(null);
      return;
    }

    const id = tabs[activeIdx].id;
    const targetEl = isMinimized
      ? iconRefs.current[id] ?? buttonRefs.current[id]
      : contentRefs.current[id] ?? buttonRefs.current[id];

    if (!targetEl) return;

    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const inset = isMinimized ? 8 : 10;

    let left = targetRect.left - containerRect.left - inset;
    let width = targetRect.width + inset * 2;

    if (left < 0) {
      width += left;
      left = 0;
    }

    if (left + width > containerRect.width) {
      width = containerRect.width - left;
    }

    setIndicator({ left, width });
  };

  useLayoutEffect(() => {
    if (variant === "mobile-pill") return;

    measure();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    if (ro && containerRef.current) {
      ro.observe(containerRef.current);

      tabs.forEach((t) => {
        const c = contentRefs.current[t.id];
        const i = iconRefs.current[t.id];
        if (c) ro.observe(c);
        if (i) ro.observe(i);
      });
    }

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeName, isMinimized, tabs, variant]);

  /* =====================================================
     RENDER — MOBILE PILL VARIANT
     ===================================================== */

  if (variant === "mobile-pill") {
    const activeIndex = Math.max(
      0,
      tabs.findIndex((t) => t.id === activeName)
    );

    return (
      <div
        className="relative flex w-full items-center justify-between px-1"
        role="tablist"
        aria-label="Mobile tabs"
      >
        {/* Sliding pill */}
        <motion.div
          layout
          layoutId="mobile-tab-pill"
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="absolute inset-y-1 rounded-[18px] bg-white text-black shadow-[0_8px_26px_rgba(255,255,255,0.12)]"
          style={{
            width: `${100 / tabs.length}%`,
            left: `${(100 / tabs.length) * activeIndex}%`,
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeName;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setView(tabToView(tab.id))}
              role="tab"
              aria-selected={isActive}
              className="
                relative z-10 flex flex-1 flex-col items-center justify-center
                min-h-[58px] py-2 gap-1 text-xs
              "
            >
              <Icon
                className={`h-6 w-6 ${
                  isActive ? "text-black" : "text-white/62"
                }`}
              />
              <span
                className={`text-[11px] ${
                  isActive ? "text-black font-semibold" : "text-white/62"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  /* =====================================================
     RENDER — DEFAULT / DESKTOP (UNCHANGED)
     ===================================================== */

  return (
    <div
      ref={containerRef}
      className="relative flex items-center w-full md:w-auto"
      role="tablist"
      aria-label="Primary tabs"
    >
      {indicator && (
        <motion.div
          layoutId="tab-indicator"
          initial={false}
          animate={{ left: indicator.left, width: indicator.width }}
          transition={{ type: "spring", stiffness: 320, damping: 36 }}
          className="lux-control pointer-events-none absolute top-1/2 -translate-y-1/2 h-[38px] rounded-full"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
        />
      )}

      <div className="relative z-10 flex items-center w-full md:w-auto">
        {tabs.map((tab) => {
          const isActive = activeName === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttonRefs.current[tab.id] = el;
              }}
              onClick={() => setView(tabToView(tab.id))}
              role="tab"
              aria-selected={isActive}
              className={`relative flex items-center justify-center rounded-lg transition-all
                w-full md:w-auto flex-1 md:flex-none
                ${isMinimized ? "px-2 py-2 gap-0" : "px-3 py-2 gap-2 min-w-16"}
                ${isActive ? "text-white font-medium" : "text-white/70"}`}
            >
              <div
                ref={(el) => {
                  contentRefs.current[tab.id] = el;
                }}
                className="flex items-center gap-2"
              >
                <span
                  ref={(el) => {
                    iconRefs.current[tab.id] = el;
                  }}
                  className="flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 md:w-[18px] md:h-[18px]" />
                </span>

                <span
                  className={`hidden lg:inline text-sm transition-all duration-150 ${
                    isMinimized
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100 w-auto"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
