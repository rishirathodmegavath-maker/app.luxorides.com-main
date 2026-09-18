import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, cleanup, waitFor, act } from "@testing-library/react";

import { useDutyLocationRealtime } from "./useDutyLocationRealtime";
import type { DriverDutyLocationResponse } from "@/types";

/*
 * Regression coverage for the stale-location-update race the E2E audit
 * flagged: a delayed REST-fallback response (or an out-of-order WS frame)
 * landing after a newer push must never regress the map to an older
 * position. useDutyLocationRealtime now compares capturedAt before applying
 * any incoming update -- see isNewerFix in the hook itself.
 */

vi.mock("@/services/config", () => ({
  WS_BASE_URL: "wss://api.fleetovo.com",
}));

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  close() {}
}

function locationAt(capturedAt: string | null, lat: number): DriverDutyLocationResponse {
  return {
    dutyId: "duty-1",
    latitude: lat,
    longitude: 77.0,
    headingDegrees: null,
    capturedAt,
    distanceRemainingKm: null,
    etaMinutes: null,
    etaEstimated: true,
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  FakeWebSocket.instances = [];
  localStorage.clear();
});

describe("useDutyLocationRealtime", () => {
  it("applies a newer push over the current position", async () => {
    localStorage.setItem("fleetovo_client_token", "test-token");
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useDutyLocationRealtime("duty-1", true));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.onmessage?.({ data: JSON.stringify(locationAt("2026-01-01T00:00:10.000Z", 1)) } as MessageEvent);
    });
    await waitFor(() => expect(result.current?.latitude).toBe(1));

    act(() => {
      socket.onmessage?.({ data: JSON.stringify(locationAt("2026-01-01T00:00:20.000Z", 2)) } as MessageEvent);
    });
    await waitFor(() => expect(result.current?.latitude).toBe(2));
  });

  it("ignores a push that is older than the currently displayed position", async () => {
    localStorage.setItem("fleetovo_client_token", "test-token");
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useDutyLocationRealtime("duty-1", true));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.onmessage?.({ data: JSON.stringify(locationAt("2026-01-01T00:00:20.000Z", 2)) } as MessageEvent);
    });
    await waitFor(() => expect(result.current?.latitude).toBe(2));

    act(() => {
      socket.onmessage?.({ data: JSON.stringify(locationAt("2026-01-01T00:00:10.000Z", 1)) } as MessageEvent);
    });

    // Stale update must not win -- position stays at the newer value.
    expect(result.current?.latitude).toBe(2);
  });

  it("applies an update with no capturedAt (never blocks on missing timestamps)", async () => {
    localStorage.setItem("fleetovo_client_token", "test-token");
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useDutyLocationRealtime("duty-1", true));
    const socket = FakeWebSocket.instances[0];

    act(() => {
      socket.onmessage?.({ data: JSON.stringify(locationAt(null, 5)) } as MessageEvent);
    });
    await waitFor(() => expect(result.current?.latitude).toBe(5));
  });
});
