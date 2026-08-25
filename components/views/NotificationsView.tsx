"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronLeft } from "lucide-react";

import { useView } from "./ViewContext";
import { NotificationService } from "@/services/notification.service";
import { NotificationResponse } from "@/types";
import { instantToReadable } from "@/lib/date";
import LoadingState from "../ui/LoadingState";

const POLL_MS = 30000;

export default function NotificationsView() {
  const { setView } = useView();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      NotificationService.list()
        .then((res) => {
          if (!cancelled) setNotifications(res.notifications);
        })
        .catch(() => {
          // Best-effort -- keep the last known list on screen.
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    refresh();
    const timer = setInterval(refresh, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleMarkRead = async (notification: NotificationResponse) => {
    if (notification.readAt) return;

    // Optimistic update -- the feed shouldn't feel laggy on tap.
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    );

    try {
      await NotificationService.markRead(notification.id);
    } catch {
      // Best-effort -- next poll will reconcile the true state.
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView({ name: "home" })}
          className="lux-control p-2 rounded-full transition"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>

        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {loading ? (
          <LoadingState label="Loading notifications" className="min-h-[200px]" />
        ) : notifications.length === 0 ? (
          <div className="lux-card rounded-[24px] px-6 py-12 text-center">
            <Bell size={22} className="mx-auto mb-3 text-white/35" />
            <p className="text-white/60">You&apos;re all caught up.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleMarkRead(notification)}
              className={`
                w-full text-left lux-card rounded-2xl p-4 transition
                hover:bg-[#202024]
                ${notification.readAt ? "" : "border-[#d8b25c]/30"}
              `}
            >
              <div className="flex items-start gap-3">
                {!notification.readAt && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d8b25c]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-white/68">{notification.body}</p>
                  <p className="mt-2 text-xs text-white/42">
                    {instantToReadable(notification.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.section>
  );
}
