import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";

import { useBookingRealtime } from "./useBookingRealtime";

/*
 * P0 -- useBookingRealtime (and useDutyLocationRealtime, same pattern)
 * opens a WebSocket directly from the browser, constructed from WS_BASE_URL
 * (derived from CONFIG.BASE_URL -- see services/config.test.ts for how that
 * resolves). Mocks services/config directly to prove THIS hook actually
 * builds its connection URL from the canonical config rather than any
 * hardcoded host, without needing a real WebSocket server.
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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  FakeWebSocket.instances = [];
  localStorage.clear();
});

describe("useBookingRealtime", () => {
  it("connects using the canonical WS_BASE_URL, never a hardcoded localhost host", () => {
    localStorage.setItem("fleetovo_client_token", "test-token");
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    renderHook(() => useBookingRealtime("booking-1", true, () => {}));

    expect(FakeWebSocket.instances).toHaveLength(1);
    const url = FakeWebSocket.instances[0].url;
    expect(url).toBe("wss://api.fleetovo.com/ws/bookings/booking-1?token=test-token");
    expect(url).not.toMatch(/localhost/i);
    expect(url).not.toMatch(/127\.0\.0\.1/);
  });

  it("does not open a socket when there is no stored auth token", () => {
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    renderHook(() => useBookingRealtime("booking-1", true, () => {}));

    expect(FakeWebSocket.instances).toHaveLength(0);
  });
});
