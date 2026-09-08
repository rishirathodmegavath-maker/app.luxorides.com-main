import { afterEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import TrackTripClient from "./TrackTripClient";
import { DutyStatus } from "@/types/booking/booking.types";

/*
 * P0 -- the public, unauthenticated trip-share page fetches the backend
 * directly from the browser (bypassing the /api proxy, since this route has
 * no session token to attach), so it is one of the two client-side call
 * sites that actually need CONFIG.BASE_URL to resolve to a real, publicly
 * reachable backend in production rather than localhost. Mocks
 * services/config directly (rather than env vars) since that module is the
 * single already-tested source of truth for how BASE_URL itself resolves
 * (see services/config.test.ts) -- this test only proves TrackTripClient
 * actually uses whatever CONFIG.BASE_URL resolves to, not localhost.
 */

vi.mock("@/services/config", () => ({
  CONFIG: { BASE_URL: "https://api.fleetovo.com", GOOGLE_MAPS_KEY: "test-key" },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function pendingStatusResponse() {
  return {
    dutyStatus: DutyStatus.ALLOTTED,
    driverFirstName: null,
    vehicleName: null,
    vehicleNumber: null,
    latitude: null,
    longitude: null,
    headingDegrees: null,
    capturedAt: null,
    distanceRemainingKm: null,
    etaMinutes: null,
  };
}

describe("TrackTripClient (public trip-share page)", () => {
  it("fetches the configured backend base URL, never localhost", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => pendingStatusResponse(),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackTripClient token="share-token-123" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toBe("https://api.fleetovo.com/public/trip/share-token-123");
    expect(calledUrl).not.toMatch(/localhost/i);
    expect(calledUrl).not.toMatch(/127\.0\.0\.1/);
  });

  it("still renders the invalid-link state on a failed fetch (unauthenticated behaviour unchanged)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    const { findByText } = render(<TrackTripClient token="bad-token" />);

    expect(await findByText(/no longer valid/i)).toBeInTheDocument();
  });
});
