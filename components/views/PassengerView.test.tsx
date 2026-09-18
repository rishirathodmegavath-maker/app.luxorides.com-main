import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import PassengerView from "./PassengerView";
import { PassengerService } from "@/services/passenger.service";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import type { Client } from "@/types/client";

/*
 * Phase A -- confirmDelete() previously called PassengerService.delete()
 * then re-fetched the whole list with PassengerService.list(). These prove
 * the redundant list() call is gone (a local filter of the already-known
 * passengers produces the same result), and that a failed delete leaves the
 * passenger in place rather than being removed optimistically.
 */

vi.mock("@/services/passenger.service", () => ({
  PassengerService: { list: vi.fn(), add: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/components/auth/ClientAuthContext", () => ({
  useClientAuth: vi.fn(),
}));

vi.mock("@/components/views/ViewContext", () => ({
  useView: () => ({ setView: vi.fn() }),
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args), success: vi.fn() },
}));

const mockUseClientAuth = useClientAuth as unknown as ReturnType<typeof vi.fn>;

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: "c1",
    orgId: "org1",
    userId: "u1",
    name: { salutation: "Mr.", firstName: "Test", lastName: "Client" },
    phone: "+919999999999",
    passengers: [
      { id: "p1", name: { salutation: "Mr.", firstName: "John", lastName: "Doe" }, phone: "+911111111111" },
      { id: "p2", name: { salutation: "Ms.", firstName: "Jane", lastName: "Roe" }, phone: "+912222222222" },
    ],
    ...overrides,
  } as Client;
}

beforeEach(() => {
  (PassengerService.list as ReturnType<typeof vi.fn>).mockReset();
  (PassengerService.delete as ReturnType<typeof vi.fn>).mockReset();
  mockUseClientAuth.mockReset();
  toastError.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("PassengerView delete (local update, no refetch)", () => {
  it("removes only the deleted passenger locally and never calls PassengerService.list()", async () => {
    const setClient = vi.fn();
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient });
    (PassengerService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<PassengerView />);

    const johnCard = screen.getByText("Mr. John Doe").closest("div.lux-card")!;
    const johnButtons = within(johnCard).getAllByRole("button");
    fireEvent.click(johnButtons[johnButtons.length - 1]); // delete (trash) is the last button in the row

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(setClient).toHaveBeenCalledTimes(1));

    expect(PassengerService.delete).toHaveBeenCalledWith("p1");
    expect(PassengerService.list).not.toHaveBeenCalled();

    const updatedPassengers = setClient.mock.calls[0][0].passengers;
    expect(updatedPassengers.map((p: { id: string }) => p.id)).toEqual(["p2"]);
  });

  it("keeps the passenger and the dialog open when the delete request fails", async () => {
    const setClient = vi.fn();
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient });
    (PassengerService.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

    render(<PassengerView />);

    const johnCard = screen.getByText("Mr. John Doe").closest("div.lux-card")!;
    const johnButtons = within(johnCard).getAllByRole("button");
    fireEvent.click(johnButtons[johnButtons.length - 1]);
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(PassengerService.delete).toHaveBeenCalledTimes(1));

    // Never reaches the local-update/close-dialog step on failure.
    expect(setClient).not.toHaveBeenCalled();
    expect(screen.getByText("Mr. John Doe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();

    // The rejection is caught and surfaced, not left as an unhandled
    // promise rejection.
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
  });
});
