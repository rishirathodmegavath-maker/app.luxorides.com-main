// app/components/navbar/Navbar.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Home,
  Car,
  CalendarCheck,
  User,
  LucideIcon,
  Bell,
} from "lucide-react";
import { AppView, useView } from "@/components/views/ViewContext";
import SlidingTabBar from "../shared/SlidingTabBar";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../fleet/CartContext";
import { NotificationService } from "@/services/notification.service";

const NOTIFICATION_POLL_MS = 30000;

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { setView, view } = useView();

  // Unread notification count, polled independently of the notifications
  // view itself so the bell badge stays current no matter which screen
  // the client is on.
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      NotificationService.list()
        .then((res) => {
          if (!cancelled) setUnreadCount(res.unreadCount);
        })
        .catch(() => {
          // Best-effort -- leave the last known count on screen.
        });
    };

    refresh();
    const timer = setInterval(refresh, NOTIFICATION_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [view.name]);

  // minimize state for desktop dock
  const [isMinimized, setIsMinimized] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        const wide = window.innerWidth >= 768; // md breakpoint
        const shouldMinimize = wide && y > 60;
        setIsMinimized(shouldMinimize);
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    function onResize() {
      const wide = window.innerWidth >= 768;
      if (!wide && isMinimized) setIsMinimized(false);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [isMinimized]);

  const tabs: { id: AppView["name"]; label: string; icon: LucideIcon }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "cars", label: "Cars", icon: Car },
    { id: "booking", label: "Trips", icon: CalendarCheck },
    { id: "account", label: "Profile", icon: User },
  ];

  // numeric values that correspond to your Tailwind classes
  const topPx = isMinimized ? 8 : 24; // top-2 => 8px, top-6 => 24px
  const paddingX = isMinimized ? 8 : 20; // px-2 => 8px, px-5 => 20px
  const paddingY = isMinimized ? 4 : 12; // py-1 => 4px, py-3 => 12px
  const gapPx = isMinimized ? 8 : 0; // gap-2 => 8px, gap-4 => 16px

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsLargeScreen(window.innerWidth >= 1400);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* -------------------- DESKTOP DOCK (FIXED CENTER) -------------------- */}
      <div className="hidden md:flex fixed left-1/2 -translate-x-1/2 z-50 pt-[env(safe-area-inset-top)]">
        <motion.div
          role="navigation"
          aria-label="Top dock navigation"
          initial={false}
          animate={{
            top: topPx,
            paddingInline: paddingX,
            paddingBlock: paddingY,
            columnGap: gapPx,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 260,
                  damping: 30,
                  mass: 0.8,
                }
          }
          className="lux-nav relative flex items-center rounded-full border"
          style={{
            position: "relative",
            columnGap: gapPx,
          }}
        >
          {/* Logo */}
          <button
            onClick={() => setView({ name: "home" })}
            className="text-white flex items-center font-semibold min-w-8"
          >
            <Image
              src={"/logo/luxorides-shield-white.png"}
              alt="Luxorides"
              width={30}
              height={30}
              className="lg:mr-2"
            />

            {isLargeScreen && (
              <motion.div
                initial={false}
                animate={{ width: isMinimized ? 0 : 90 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 30 }
                }
                style={{
                  overflow: "hidden",
                  display: "inline-flex",
                }}
              >
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isMinimized ? 0 : 1,
                    x: isMinimized ? -6 : 0,
                  }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.15, ease: "easeOut" }
                  }
                  style={{
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  LUXORIDES
                </motion.span>
              </motion.div>
            )}
          </button>

          {/* Tabs */}
          <motion.div
            initial={false}
            animate={{
              marginLeft: isMinimized ? 4 : 12,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 30 }
            }
          >
            <SlidingTabBar tabs={tabs} isMinimized={isMinimized} />
          </motion.div>

          {/* Cart */}
          <motion.button
            onClick={openCart}
            initial={false}
            animate={{
              backgroundColor: isMinimized
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.06)",
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8,
                  }
            }
            className="
    relative ml-1
    flex items-center justify-center
    w-9 h-9
    rounded-lg
    shrink-0
  "
          >
            {/* Icon wrapper (critical fix) */}
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <Image
                src="/fleet.svg"
                alt="Fleet"
                width={18}
                height={18}
                className="invert brightness-200 opacity-90 object-contain"
                priority
              />
            </div>

            {/* Badge */}
            {totalItems > 0 && (
              <span
                className="
      absolute -top-1 -right-1
      bg-rose-500 text-white text-[10px]
      rounded-full px-1.5 py-[1px]
      leading-none
      min-w-[16px] text-center
    "
              >
                {totalItems}
              </span>
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            onClick={() => setView({ name: "notifications" })}
            initial={false}
            animate={{
              backgroundColor: isMinimized
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.06)",
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8,
                  }
            }
            className="
    relative ml-1
    flex items-center justify-center
    w-9 h-9
    rounded-lg
    shrink-0
  "
            aria-label="Notifications"
          >
            <Bell size={18} className="text-white" />
            {unreadCount > 0 && (
              <span
                className="
      absolute -top-1 -right-1
      bg-rose-500 text-white text-[10px]
      rounded-full px-1.5 py-[1px]
      leading-none
      min-w-[16px] text-center
    "
              >
                {unreadCount}
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* -------------------- MOBILE TOP -------------------- */}
      <nav className="lux-nav md:hidden fixed left-0 top-0 z-40 flex h-[calc(58px+env(safe-area-inset-top))] w-full items-end justify-between border-b px-4 pb-3">
        <button
          onClick={() => setView({ name: "home" })}
          className="flex items-center gap-2 text-white"
          aria-label="Go to Home"
        >
          <Image
            src={"/logo/luxorides-shield-white.png"}
            alt={"Luxorides"}
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="text-sm font-semibold tracking-wide">LUXORIDES</span>
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setView({ name: "notifications" })}
            className="lux-control relative flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-white opacity-90" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={openCart}
            className="lux-control relative flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Open cart"
          >
            <Image
              src="/fleet.svg"
              alt="Fleet"
              width={20}
              height={20}
              className="invert opacity-90"
            />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* -------------------- MOBILE BOTTOM NAV -------------------- */}
      <div className="lux-bottom-safe lux-bottom-bar md:hidden fixed bottom-0 left-0 z-50 w-full border-t px-3 pt-2">
        <div className="relative mx-auto max-w-md">
          <SlidingTabBar
            tabs={tabs}
            isMinimized={false}
            variant="mobile-pill"
          />
        </div>
      </div>
    </>
  );
}
