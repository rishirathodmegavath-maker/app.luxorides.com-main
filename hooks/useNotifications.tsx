"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { NotificationService } from "@/services/notification.service";
import { NotificationResponse } from "@/types";

const POLL_MS = 30000;

/* =====================================================
   P1.2 -- single shared notification data source.

   Previously Navbar and NotificationsView each ran their own
   `NotificationService.list()` poll on an independent 30s interval,
   duplicating the exact same request (the endpoint already returns both
   the list and the unread count together). Navbar's poller also reset
   every time `view.name` changed, firing an extra fetch on every tab
   switch. This hook/provider is now the single owner of both the fetch
   and the interval; every consumer reads from the same state instead of
   polling independently. Mounted once in ClientRoot (same level Navbar
   already lived at), inside AuthGate, so it starts on login and is torn
   down (interval cleared, state discarded) on logout exactly like
   Navbar's poller already was -- no new auth-lifecycle code needed.
   ===================================================== */

type NotificationsContextValue = {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  /** One-shot re-fetch (e.g. when the notifications screen is opened) -- does NOT reset the shared interval. */
  refresh: () => void;
  markRead: (id: string) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  const refresh = useCallback(() => {
    NotificationService.list()
      .then((res) => {
        if (cancelledRef.current) return;
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // Best-effort -- leave the last known state on screen (same
        // fail-open behaviour both pollers already had independently).
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    refresh();
    const timer = setInterval(refresh, POLL_MS);

    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
    };
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.readAt) return;

      // Optimistic update -- the feed shouldn't feel laggy on tap. Updates
      // the one shared list, so both Navbar's badge and the notifications
      // screen reflect it instantly instead of waiting for the next poll.
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await NotificationService.markRead(id);
      } catch {
        // Best-effort -- next poll will reconcile the true state.
      }
    },
    [notifications]
  );

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);

  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }

  return ctx;
}
