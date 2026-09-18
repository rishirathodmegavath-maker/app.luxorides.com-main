import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { SupportTicketsProvider, useSupportTickets } from "./useSupportTickets";
import { SupportService } from "@/services/support.service";
import type { SupportTicketResponse } from "@/types";

/*
 * P1.3 -- covers the shared support-ticket data source that replaced
 * SupportView's and SupportThreadView's independent
 * GET /client/app/support/tickets fetches.
 *
 * Tested through small stand-in consumer components (same approach as
 * hooks/useNotifications.test.tsx from P1.2) rather than the real
 * SupportView/SupportThreadView -- their JSX carries framer-motion and
 * unrelated form state that isn't part of what changed here. What's
 * exercised is the real, unmocked SupportTicketsProvider/useSupportTickets
 * logic both screens actually consume.
 */

vi.mock("@/services/support.service", () => ({
  SupportService: {
    listTickets: vi.fn(),
    createTicket: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

const mockList = SupportService.listTickets as unknown as ReturnType<typeof vi.fn>;
const mockCreate = SupportService.createTicket as unknown as ReturnType<typeof vi.fn>;
const mockSendMessage = SupportService.sendMessage as unknown as ReturnType<typeof vi.fn>;

function ticket(overrides: Partial<SupportTicketResponse> = {}): SupportTicketResponse {
  return {
    id: "t1",
    subject: "Lost item",
    status: "OPEN" as SupportTicketResponse["status"],
    createdAt: "2026-01-01T00:00:00Z",
    messages: [
      { id: "m1", senderType: "CLIENT", message: "I left my bag in the car", createdAt: "2026-01-01T00:00:00Z" },
    ],
    ...overrides,
  };
}

/** Stands in for SupportView -- the ticket list + its own refresh-on-open. */
function ListConsumer() {
  const { tickets, loading, refresh } = useSupportTickets();

  return (
    <div>
      <span data-testid="list-loading">{String(loading)}</span>
      <ul data-testid="list">
        {tickets.map((t) => (
          <li key={t.id} data-testid={`t-${t.id}`}>{t.subject}</li>
        ))}
      </ul>
      <button data-testid="list-refresh" onClick={() => refresh()}>refresh list</button>
    </div>
  );
}

/** Stands in for SupportThreadView -- reads one ticket out of the shared array. */
function ThreadConsumer({ ticketId }: { ticketId: string }) {
  const { tickets, loading, refresh, sendMessage } = useSupportTickets();
  const t = tickets.find((x) => x.id === ticketId) ?? null;

  return (
    <div>
      <span data-testid="thread-loading">{String(loading)}</span>
      <span data-testid="thread-found">{String(!!t)}</span>
      <span data-testid="thread-messages">{t?.messages.length ?? 0}</span>
      <button data-testid="thread-refresh" onClick={() => refresh()}>refresh thread</button>
      <button data-testid="thread-send" onClick={() => sendMessage(ticketId, "reply")}>send</button>
    </div>
  );
}

beforeEach(() => {
  mockList.mockReset();
  mockCreate.mockReset();
  mockSendMessage.mockReset();
  mockList.mockResolvedValue([ticket()]);
});

afterEach(() => {
  cleanup();
});

describe("SupportTicketsProvider / useSupportTickets", () => {
  it("does not fetch anything until a consumer explicitly refreshes (lazy, unlike notifications)", async () => {
    render(
      <SupportTicketsProvider>
        <span>idle</span>
      </SupportTicketsProvider>
    );

    // Give any accidental eager effect a chance to fire.
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockList).not.toHaveBeenCalled();
  });

  it("SupportView and SupportThreadView share the same data source (one fetch serves both)", async () => {
    render(
      <SupportTicketsProvider>
        <ListConsumer />
        <ThreadConsumer ticketId="t1" />
      </SupportTicketsProvider>
    );

    await act(async () => {
      screen.getByTestId("list-refresh").click();
      await Promise.resolve();
    });

    expect(mockList).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("t-t1")).toHaveTextContent("Lost item");
    expect(screen.getByTestId("thread-found")).toHaveTextContent("true");
    expect(screen.getByTestId("thread-messages")).toHaveTextContent("1");
  });

  it("opening the thread renders instantly from the shared list already fetched by SupportView (no loading flash)", async () => {
    render(
      <SupportTicketsProvider>
        <ListConsumer />
        <ThreadConsumer ticketId="t1" />
      </SupportTicketsProvider>
    );

    // Simulate SupportView's own mount-time refresh already resolving,
    // exactly as would have happened before the user clicked into the thread.
    await act(async () => {
      screen.getByTestId("list-refresh").click();
      await Promise.resolve();
    });
    expect(screen.getByTestId("thread-found")).toHaveTextContent("true");

    // The thread's own one-shot refresh (its mount effect) still fires for
    // freshness, but the ticket was already visible before that resolves.
    expect(screen.getByTestId("thread-loading")).toHaveTextContent("false");
  });

  it("a reply sent from the thread updates the shared list -- SupportView reflects it without its own refetch", async () => {
    render(
      <SupportTicketsProvider>
        <ListConsumer />
        <ThreadConsumer ticketId="t1" />
      </SupportTicketsProvider>
    );

    await act(async () => {
      screen.getByTestId("list-refresh").click();
      await Promise.resolve();
    });

    mockSendMessage.mockResolvedValue(
      ticket({
        messages: [
          { id: "m1", senderType: "CLIENT", message: "I left my bag in the car", createdAt: "2026-01-01T00:00:00Z" },
          { id: "m2", senderType: "EMPLOYEE", message: "Found it, on its way back to you", createdAt: "2026-01-01T00:05:00Z" },
        ],
      })
    );

    await act(async () => {
      screen.getByTestId("thread-send").click();
      await Promise.resolve();
    });

    expect(mockSendMessage).toHaveBeenCalledWith("t1", "reply");
    // ListConsumer (SupportView's stand-in) never called refresh again --
    // it sees the update purely because sendMessage wrote into the one
    // shared array.
    expect(mockList).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("thread-messages")).toHaveTextContent("2");
  });

  it("createTicket adds to the shared list without a full refetch", async () => {
    mockCreate.mockResolvedValue(ticket({ id: "t2", subject: "New ticket" }));

    function CreateConsumer() {
      const { tickets, createTicket } = useSupportTickets();
      return (
        <div>
          <span data-testid="count">{tickets.length}</span>
          <button data-testid="create" onClick={() => createTicket("New ticket", "body")}>create</button>
        </div>
      );
    }

    render(
      <SupportTicketsProvider>
        <CreateConsumer />
      </SupportTicketsProvider>
    );

    await act(async () => {
      screen.getByTestId("create").click();
      await Promise.resolve();
    });

    expect(mockList).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith("New ticket", "body");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("failed refresh does not crash and leaves loading resolved", async () => {
    mockList.mockRejectedValue(new Error("network failure"));

    render(
      <SupportTicketsProvider>
        <ListConsumer />
      </SupportTicketsProvider>
    );

    await act(async () => {
      screen.getByTestId("list-refresh").click();
      await Promise.resolve();
    });

    expect(screen.getByTestId("list-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("list").children).toHaveLength(0);
  });

  it("logout (provider unmount) then a fresh login does not leak the previous user's tickets", async () => {
    mockList.mockResolvedValue([ticket({ id: "t1", subject: "User A's ticket" })]);

    const { unmount } = render(
      <SupportTicketsProvider>
        <ListConsumer />
      </SupportTicketsProvider>
    );
    await act(async () => {
      screen.getByTestId("list-refresh").click();
      await Promise.resolve();
    });
    expect(screen.getByTestId("t-t1")).toHaveTextContent("User A's ticket");

    unmount();

    // New session -- brand-new provider instance, before any refresh.
    render(
      <SupportTicketsProvider>
        <ListConsumer />
      </SupportTicketsProvider>
    );

    expect(screen.getByTestId("list").children).toHaveLength(0);
  });
});
