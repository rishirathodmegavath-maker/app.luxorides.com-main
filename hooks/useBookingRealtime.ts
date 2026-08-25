"use client";

import { useEffect, useRef } from "react";
import { WS_BASE_URL } from "@/services/config";

const CLIENT_TOKEN_KEY = "fleetovo_client_token";
const MAX_BACKOFF_MS = 30000;
const AUTH_REJECT_STREAK_THRESHOLD = 3;
const REST_FALLBACK_AFTER_FAILURES = 5;
const REST_FALLBACK_POLL_MS = 20000;

// Replaces the old 12s setInterval poll in BookingDetailView -- opens a
// WebSocket to /ws/bookings/{bookingId} and calls onUpdate whenever the
// backend pushes a change. Never trusts the socket payload itself: on
// every message it just triggers the same ClientBookingService.get(bookingId)
// refetch the poll used to call, so there is one source of truth for
// booking shape.
export function useBookingRealtime(
  bookingId: string,
  enabled: boolean,
  onUpdate: () => void
) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!enabled || !bookingId || typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem(CLIENT_TOKEN_KEY);

    if (!token) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    let attempt = 0;
    let neverOpenedStreak = 0;
    let consecutiveFailures = 0;
    let stopped = false;
    let openedThisAttempt = false;

    const stopFallbackPoll = () => {
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const startFallbackPoll = () => {
      if (fallbackTimer) return;
      fallbackTimer = setInterval(() => {
        onUpdateRef.current();
      }, REST_FALLBACK_POLL_MS);
    };

    const connect = () => {
      if (stopped) return;

      openedThisAttempt = false;
      const url = `${WS_BASE_URL}/ws/bookings/${bookingId}?token=${encodeURIComponent(
        token
      )}`;

      socket = new WebSocket(url);

      socket.onopen = () => {
        openedThisAttempt = true;
        attempt = 0;
        neverOpenedStreak = 0;
        consecutiveFailures = 0;
        stopFallbackPoll();
      };

      socket.onmessage = () => {
        onUpdateRef.current();
      };

      socket.onclose = () => {
        if (stopped) return;

        if (!openedThisAttempt) {
          neverOpenedStreak += 1;
          if (neverOpenedStreak >= AUTH_REJECT_STREAK_THRESHOLD) {
            // The handshake itself is being rejected (expired/invalid
            // token) -- retrying on a timer won't help until the customer
            // re-authenticates, so stop reconnecting.
            return;
          }
        }

        consecutiveFailures += 1;
        if (consecutiveFailures >= REST_FALLBACK_AFTER_FAILURES) {
          startFallbackPoll();
        }

        const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
        attempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      stopped = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      stopFallbackPoll();
      socket?.close();
    };
  }, [bookingId, enabled]);
}
