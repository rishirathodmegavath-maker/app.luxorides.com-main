import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, act, cleanup } from "@testing-library/react";

import TrackTripClient from "./TrackTripClient";

/*
 * Phase A -- previously polled GET /public/trip/{token} unconditionally
 * every 10s for as long as the tab stayed open. These lock in the three
 * new behaviors: stop for good once the duty is COMPLETED, pause while the
 * tab is hidden and refresh immediately on becoming visible again, and back
 * off (not retry every 10s) on repeated fetch failures. None of the mocked
 * responses include latitude/longitude, so the Google Maps loading effect
 * never engages -- keeps these tests focused on the polling behavior itself.
 *
 * Uses fake timers throughout; `flush()` advances by 0ms to drain the
 * pending fetch/json microtask chain from the synchronous initial refresh()
 * call, since that first call isn't gated behind setTimeout at all.
 * testing-library's own `waitFor` polls with real timers internally and
 * hangs under vi.useFakeTimers(), so it's deliberately not used here.
 */

vi.mock("@/services/config", () => ({
  CONFIG: {
    BASE_URL: "https://api.fleetovo.test",
    GOOGLE_MAPS_KEY: "test-key",
  },
}));

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

function jsonResponse(body: unknown) {
  return { ok: true, json: async () => body } as Response;
}

async function flush(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility("visible");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("TrackTripClient polling", () => {
  it("stops polling once the duty reaches COMPLETED", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ dutyStatus: "COMPLETED" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackTripClient token="tok-1" />);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await flush(120000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("pauses while hidden and refreshes immediately when visible again", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ dutyStatus: "ALLOTTED" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackTripClient token="tok-2" />);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setVisibility("hidden");
    await flush(60000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      setVisibility("visible");
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("backs off instead of retrying every 10s after a fetch failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackTripClient token="tok-3" />);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Still within the backoff window -- a healthy poller would have
    // retried by 10s; the first backoff step is longer than that.
    await flush(15000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Eventually retries.
    await flush(20000);
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps polling at the base cadence on healthy (non-terminal) responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ dutyStatus: "RUNNING" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackTripClient token="tok-4" />);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await flush(10000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await flush(10000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
