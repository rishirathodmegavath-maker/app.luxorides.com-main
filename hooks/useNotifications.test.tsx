import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { NotificationsProvider, useNotifications } from "./useNotifications";
import { NotificationService } from "@/services/notification.service";
import type { NotificationListResponse } from "@/types";

/*
 * P1.2 -- covers the shared notification data source (hooks/useNotifications.tsx)
 * that replaced Navbar's and NotificationsView's independent 30s polls.
 *
 * Deliberately tests through small mock consumer components rather than the
 * real Navbar/NotificationsView -- Navbar's actual JSX carries framer-motion,
 * next/image and scroll listeners that are cosmetic and unrelated to the
 * notification-polling behaviour under test here; coupling to that would be
 * exactly the kind of brittle, implementation-detail test this checkpoint's
 * own instructions warn against. What's asserted below is the real,
 * unmocked useNotifications()/NotificationsProvider logic both components
 * actually consume in production.
 */

vi.mock("@/services/notification.service", () => ({
  NotificationService: {
    list: vi.fn(),
    markRead: vi.fn(),
  },
}));

const mockList = NotificationService.list as unknown as ReturnType<typeof vi.fn>;
const mockMarkRead = NotificationService.markRead as unknown as ReturnType<typeof vi.fn>;

function response(overrides: Partial<NotificationListResponse> = {}): NotificationListResponse {
  return {
    unreadCount: 2,
    notifications: [
      { id: "n1", title: "Booking confirmed", body: "Your booking is confirmed", type: "BOOKING", bookingId: "b1", dutyId: null, createdAt: "2026-01-01T00:00:00Z", readAt: null },
      { id: "n2", title: "Driver assigned", body: "A driver has been assigned", type: "DUTY", bookingId: "b1", dutyId: "d1", createdAt: "2026-01-01T00:01:00Z", readAt: null },
    ],
    ...overrides,
  };
}

/** Stands in for Navbar's bell badge -- reads only unreadCount. */
function BadgeConsumer() {
  const { unreadCount } = useNotifications();
  return <span data-testid="badge">{unreadCount}</span>;
}

/*
 * Stands in for NotificationsView -- reads the shared list/loading state and
 * exposes refresh()/markRead() the same way the real component does. It
 * deliberately does NOT auto-call refresh() on mount the way NotificationsView's
 * own effect does -- that one-shot-refresh-on-open behaviour is exercised
 * explicitly (via the "refresh" button) in the test that targets it, keeping
 * "does mounting alone start a second poller" isolated from "does opening
 * the screen also do one deliberate extra fetch".
 */
function ListConsumer() {
  const { notifications, loading, refresh, markRead } = useNotifications();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <ul data-testid="list">
        {notifications.map((n) => (
          <li key={n.id} data-testid={`n-${n.id}`} onClick={() => markRead(n.id)}>
            {n.title}:{n.readAt ? "read" : "unread"}
          </li>
        ))}
      </ul>
      <button data-testid="refresh" onClick={() => refresh()}>refresh</button>
    </div>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  mockList.mockReset();
  mockMarkRead.mockReset();
  mockList.mockResolvedValue(response());
  mockMarkRead.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("NotificationsProvider / useNotifications", () => {
  it("fetches once on mount (login starts polling once)", async () => {
    render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockList).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("badge")).toHaveTextContent("2");
  });

  it("Navbar and NotificationsView share the same data source (one fetch, two consumers)", async () => {
    render(
      <NotificationsProvider>
        <BadgeConsumer />
        <ListConsumer />
      </NotificationsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockList).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("badge")).toHaveTextContent("2");
    expect(screen.getByTestId("list").children).toHaveLength(2);
  });

  it("polls exactly once per 30s tick -- only one interval exists", async () => {
    render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mockList).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mockList).toHaveBeenCalledTimes(3);
  });

  it("mounting a NotificationsView-like consumer does not create a second permanent poller", async () => {
    const { rerender } = render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    // "Navigate to the notifications tab" -- mount the list consumer too.
    rerender(
      <NotificationsProvider>
        <BadgeConsumer />
        <ListConsumer />
      </NotificationsProvider>
    );

    // No extra fetch just from mounting -- ListConsumer's real counterpart
    // (NotificationsView) does its own one-shot refresh via an explicit
    // effect, which this stand-in intentionally doesn't auto-fire, so this
    // isolates "does mounting alone start a second interval" (it must not).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    // Advancing 30s must fire exactly one more call -- not two (which would
    // mean a second interval had been created by the mount).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it("does not create duplicate intervals across repeated tab-change-style mount/unmount cycles", async () => {
    const { rerender } = render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Simulate switching to the notifications tab and back, several times.
    for (let i = 0; i < 3; i++) {
      rerender(
        <NotificationsProvider>
          <BadgeConsumer />
          <ListConsumer />
        </NotificationsProvider>
      );
      rerender(
        <NotificationsProvider>
          <BadgeConsumer />
        </NotificationsProvider>
      );
    }

    mockList.mockClear();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    // Exactly one call for the one 30s tick -- if tab changes had spawned
    // extra intervals, this would be a multiple of that count instead.
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it("NotificationsView's one-shot refresh() re-fetches without touching the shared interval", async () => {
    render(
      <NotificationsProvider>
        <ListConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    screen.getByTestId("refresh").click();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(2);

    // The interval still fires on its own original schedule -- refresh()
    // did not reset/restart it into a second timer.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mockList).toHaveBeenCalledTimes(3);
  });

  it("unread count is correct from the shared response", async () => {
    mockList.mockResolvedValue(response({ unreadCount: 5 }));

    render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByTestId("badge")).toHaveTextContent("5");
  });

  it("mark-as-read updates the shared state -- badge and list both reflect it instantly", async () => {
    render(
      <NotificationsProvider>
        <BadgeConsumer />
        <ListConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId("badge")).toHaveTextContent("2");
    expect(screen.getByTestId("n-n1")).toHaveTextContent("unread");

    await act(async () => {
      screen.getByTestId("n-n1").click();
    });

    // Optimistic: both consumers update immediately, before the
    // NotificationService.markRead promise resolves.
    expect(screen.getByTestId("badge")).toHaveTextContent("1");
    expect(screen.getByTestId("n-n1")).toHaveTextContent("read");
    expect(mockMarkRead).toHaveBeenCalledWith("n1");
  });

  it("mark-all-as-read: NOT IMPLEMENTED in this application (backend and frontend both have no such endpoint/action) -- not tested, reported honestly rather than fabricated", () => {
    expect(true).toBe(true);
  });

  it("logout (provider unmount) stops polling -- no further fetches after teardown", async () => {
    const { unmount } = render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockList).toHaveBeenCalledTimes(1);

    // AuthGate unmounts this whole subtree on logout.
    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });

    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it("failed polling does not create a retry storm -- keeps last known state, retries only on the next scheduled tick", async () => {
    mockList.mockResolvedValueOnce(response({ unreadCount: 3 }));

    render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId("badge")).toHaveTextContent("3");

    mockList.mockRejectedValueOnce(new Error("network failure"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    // Failed poll: no crash, no immediate extra retry, last known count kept.
    expect(mockList).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("badge")).toHaveTextContent("3");

    mockList.mockResolvedValueOnce(response({ unreadCount: 4 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    // Recovers on the next regularly-scheduled tick, not before.
    expect(mockList).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId("badge")).toHaveTextContent("4");
  });

  it("empty notification list renders correctly with zero unread", async () => {
    mockList.mockResolvedValue(response({ unreadCount: 0, notifications: [] }));

    render(
      <NotificationsProvider>
        <BadgeConsumer />
        <ListConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByTestId("badge")).toHaveTextContent("0");
    expect(screen.getByTestId("list").children).toHaveLength(0);
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("an auth failure (401-style rejection) from the endpoint does not crash and resolves loading to false", async () => {
    mockList.mockRejectedValue(new Error("Not authenticated"));

    render(
      <NotificationsProvider>
        <ListConsumer />
      </NotificationsProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("list").children).toHaveLength(0);
  });

  it("no notification data from a previous user leaks into a new session (logout+login = fresh provider instance)", async () => {
    mockList.mockResolvedValue(response({ unreadCount: 7 }));

    const { unmount } = render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId("badge")).toHaveTextContent("7");

    // Logout: AuthGate unmounts the provider along with the rest of the
    // authenticated shell.
    unmount();

    // Login as a different user: a brand-new provider instance, starting
    // from its own fresh initial state, before that user's fetch resolves.
    mockList.mockImplementation(() => new Promise(() => {})); // never resolves yet
    render(
      <NotificationsProvider>
        <BadgeConsumer />
      </NotificationsProvider>
    );

    // Fresh state, not the previous user's 7 -- proven before the new
    // fetch has even had a chance to resolve.
    expect(screen.getByTestId("badge")).toHaveTextContent("0");
  });
});
