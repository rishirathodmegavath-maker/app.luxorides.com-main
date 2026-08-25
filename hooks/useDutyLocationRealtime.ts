"use client";

import { useEffect, useState } from "react";
import { WS_BASE_URL } from "@/services/config";
import { ClientBookingService } from "@/services/client-booking.service";
import { DriverDutyLocationResponse } from "@/types";

const CLIENT_TOKEN_KEY = "fleetovo_client_token";
const MAX_BACKOFF_MS = 30000;
const AUTH_REJECT_STREAK_THRESHOLD = 3;
const REST_FALLBACK_AFTER_FAILURES = 5;
const REST_FALLBACK_POLL_MS = 20000;

// Live driver position for the booking-detail map. Unlike useBookingRealtime
// (a bare signal that triggers a REST refetch), this channel pushes the real
// coordinate payload directly -- see DutyLocationChannelRegistry's class
// comment on the backend for why that deliberately breaks the signal-only
// pattern. Never fabricates a position: stays null until a real push or a
// real REST fallback response arrives.
export function useDutyLocationRealtime(
  dutyId: string,
  enabled: boolean
): DriverDutyLocationResponse | null {
  const [location, setLocation] = useState<DriverDutyLocationResponse | null>(null);

  useEffect(() => {
    if (!enabled || !dutyId || typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!token) return;

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
        ClientBookingService.getDutyLocation(dutyId)
          .then((loc) => {
            if (loc) setLocation(loc);
          })
          .catch(() => {
            // Best-effort -- keep the last known position on screen.
          });
      }, REST_FALLBACK_POLL_MS);
    };

    const connect = () => {
      if (stopped) return;

      openedThisAttempt = false;
      const url = `${WS_BASE_URL}/ws/duty-location/${dutyId}?token=${encodeURIComponent(token)}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        openedThisAttempt = true;
        attempt = 0;
        neverOpenedStreak = 0;
        consecutiveFailures = 0;
        stopFallbackPoll();
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as DriverDutyLocationResponse;
          setLocation(payload);
        } catch {
          // Ignore a malformed push -- keep the last known position.
        }
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
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopFallbackPoll();
      socket?.close();
    };
  }, [dutyId, enabled]);

  return location;
}
