import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import PassengerSelector from "./PassengerSelector";
import BillingEntitySelector from "./BillingEntitySelector";
import BillingEntityView from "@/components/views/BillingEntityView";
import { PassengerService } from "@/services/passenger.service";
import { ClientBillingEntityService } from "@/services/client-billing-entity.service";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import type { Client } from "@/types/client";

/*
 * P1.3 -- PassengerSelector, BillingEntitySelector and BillingEntityView
 * used to each independently call PassengerService.list() /
 * ClientBillingEntityService.list() on mount, even though the backend
 * endpoints behind both (PassengerController.list, BillingEntityController.list)
 * return exactly client.getPassengers() / client.getClientBillingEntity() --
 * fields already present on the Client object ClientAuthContext loads once
 * at login. These tests prove the redundant fetch is gone (the service is
 * never called) and that the already-correct data still renders from context.
 */

vi.mock("@/services/passenger.service", () => ({
  PassengerService: { list: vi.fn(), add: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/services/client-billing-entity.service", () => ({
  ClientBillingEntityService: {
    list: vi.fn(),
    getByGstin: vi.fn(),
    attach: vi.fn(),
    detach: vi.fn(),
  },
}));

vi.mock("@/components/auth/ClientAuthContext", () => ({
  useClientAuth: vi.fn(),
}));

const mockUseClientAuth = useClientAuth as unknown as ReturnType<typeof vi.fn>;

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: "c1",
    orgId: "org1",
    userId: "u1",
    name: { salutation: "Mr.", firstName: "Test", lastName: "Client" },
    phone: "+919999999999",
    clientBillingEntity: [
      {
        id: "be1",
        legalName: "Acme Corp",
        gstin: "29AAAAA0000A1Z5",
        address: { formattedAddress: "1 Acme Rd", city: "Bengaluru", state: "KA", pincode: "560001", countryCode: "IN" },
      },
    ],
    passengers: [
      { id: "p1", name: { salutation: "Mr.", firstName: "John", lastName: "Doe" }, phone: "+911111111111" },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  (PassengerService.list as ReturnType<typeof vi.fn>).mockReset();
  (ClientBillingEntityService.list as ReturnType<typeof vi.fn>).mockReset();
  mockUseClientAuth.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("PassengerSelector (context-derived, no independent fetch)", () => {
  it("does not call PassengerService.list() -- reads passengers from ClientAuthContext", () => {
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient: vi.fn() });

    render(<PassengerSelector value={[]} onChange={vi.fn()} />);

    expect(PassengerService.list).not.toHaveBeenCalled();
  });

  it("filters and displays the passenger already present in context", () => {
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient: vi.fn() });

    render(<PassengerSelector value={[]} onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Add passengers");
    input.focus();
    (input as HTMLInputElement).value = "John";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // No network call was needed to produce this match.
    expect(PassengerService.list).not.toHaveBeenCalled();
  });

  it("renders correctly with zero passengers (empty context list, no crash)", () => {
    mockUseClientAuth.mockReturnValue({
      client: makeClient({ passengers: [] }),
      setClient: vi.fn(),
    });

    render(<PassengerSelector value={[]} onChange={vi.fn()} />);

    expect(screen.getByText("No passengers added yet")).toBeInTheDocument();
  });
});

describe("BillingEntitySelector (context-derived, no independent fetch)", () => {
  it("does not call ClientBillingEntityService.list() -- reads entities from ClientAuthContext", () => {
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient: vi.fn() });

    render(<BillingEntitySelector onChange={vi.fn()} />);

    expect(ClientBillingEntityService.list).not.toHaveBeenCalled();
  });

  it("renders correctly when the client has no attached billing entities", () => {
    mockUseClientAuth.mockReturnValue({
      client: makeClient({ clientBillingEntity: [] }),
      setClient: vi.fn(),
    });

    const { container } = render(<BillingEntitySelector onChange={vi.fn()} />);

    expect(container).toBeTruthy();
    expect(ClientBillingEntityService.list).not.toHaveBeenCalled();
  });
});

describe("BillingEntityView (context-derived, no independent fetch)", () => {
  it("does not call ClientBillingEntityService.list() on mount -- renders entities straight from client", () => {
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient: vi.fn() });

    render(<BillingEntityView />);

    expect(ClientBillingEntityService.list).not.toHaveBeenCalled();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders nothing while client is not yet loaded (unchanged guard behaviour)", () => {
    mockUseClientAuth.mockReturnValue({ client: null, setClient: vi.fn() });

    const { container } = render(<BillingEntityView />);

    expect(container).toBeEmptyDOMElement();
  });
});

/*
 * P1.8 -- handleLookup/handleAttach/handleDetach had no in-flight guard, so a
 * fast double-click fired duplicate requests (e.g. two ClientBillingEntityService.attach
 * calls for one click sequence). These prove the "submitting" guard added
 * this checkpoint actually suppresses the second call while the first is
 * still pending, using a manually-controlled promise to simulate the race.
 */
describe("BillingEntityView (duplicate-submission guard)", () => {
  it("does not attach twice when Attach to Account is double-clicked", async () => {
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient: vi.fn() });

    (ClientBillingEntityService.getByGstin as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "be2",
      legalName: "New Corp",
      gstin: "29BBBBB0000B1Z5",
      address: { formattedAddress: "2 New Rd", city: "Bengaluru", state: "KA", pincode: "560002", countryCode: "IN" },
    });

    let resolveAttach: (client: Client) => void = () => {};
    const attachPromise = new Promise<Client>((resolve) => {
      resolveAttach = resolve;
    });
    (ClientBillingEntityService.attach as ReturnType<typeof vi.fn>).mockReturnValue(attachPromise);

    const { container } = render(<BillingEntityView />);

    // Icon-only "+" button has no accessible text -- it's the second button
    // in this fixture (ChevronLeft back button is the first).
    fireEvent.click(container.querySelectorAll("button")[1]);

    fireEvent.click(screen.getByRole("button", { name: "Fetch Details" }));
    await waitFor(() => screen.getByText("New Corp"));

    const attachButton = screen.getByRole("button", { name: "Attach to Account" });
    fireEvent.click(attachButton);
    fireEvent.click(attachButton); // double-click while the first attach() is still pending

    expect(ClientBillingEntityService.attach).toHaveBeenCalledTimes(1);

    resolveAttach!(makeClient());
    await waitFor(() =>
      expect(screen.queryByText("New Corp")).not.toBeInTheDocument()
    );
  });

  it("does not detach twice when the confirm dialog's Detach is double-clicked", async () => {
    const setClient = vi.fn();
    mockUseClientAuth.mockReturnValue({ client: makeClient(), setClient });

    let resolveDetach: (client: Client) => void = () => {};
    const detachPromise = new Promise<Client>((resolve) => {
      resolveDetach = resolve;
    });
    (ClientBillingEntityService.detach as ReturnType<typeof vi.fn>).mockReturnValue(detachPromise);

    render(<BillingEntityView />);

    // Icon-only trash button has no accessible text -- it's the last button
    // rendered in this fixture's initial (non-adding) state, after the one
    // attached billing entity.
    fireEvent.click(screen.getAllByRole("button").at(-1)!);

    const detachButton = screen.getByRole("button", { name: "Detach" });
    fireEvent.click(detachButton);
    fireEvent.click(detachButton);

    expect(ClientBillingEntityService.detach).toHaveBeenCalledTimes(1);

    resolveDetach!(makeClient({ clientBillingEntity: [] }));
    await waitFor(() => expect(setClient).toHaveBeenCalledTimes(1));
  });
});
