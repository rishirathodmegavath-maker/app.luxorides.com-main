"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { SupportService } from "@/services/support.service";
import { SupportTicketResponse } from "@/types";

/* =====================================================
   P1.3 -- single shared support-ticket data source.

   SupportView (the ticket list) and SupportThreadView (one conversation)
   previously each ran their own independent
   GET /client/app/support/tickets fetch on mount -- the same endpoint,
   returning the full ticket collection with every ticket's full message
   thread already embedded (SupportTicketResponse.messages), even though
   SupportThreadView only ever needs one ticket out of it. There is no
   backend GET-by-id endpoint to fetch just the one ticket instead (see the
   P1.3 report -- noted as a backend optimization candidate, not built
   here), so the full-collection fetch is kept as the freshness mechanism,
   but it is no longer duplicated: both screens now read/write one shared
   array, so navigating List -> Detail renders instantly from what was
   just fetched instead of a second full-collection round trip's worth of
   loading skeleton, and a reply sent from the thread updates the one
   shared array so the list reflects it too without its own refetch.

   Deliberately NOT eager on mount (unlike useNotifications): support
   tickets are only relevant while the client is actually in the Support
   area, so nothing should fetch this data for a session that never opens
   it. SupportView/SupportThreadView each still call refresh() once on
   their own mount, same as before -- this hook only removes the
   duplication, not the freshness guarantee.
   ===================================================== */

type SupportTicketsContextValue = {
  tickets: SupportTicketResponse[];
  loading: boolean;
  refresh: () => Promise<void>;
  createTicket: (subject: string, message: string) => Promise<SupportTicketResponse>;
  sendMessage: (ticketId: string, message: string) => Promise<SupportTicketResponse>;
};

const SupportTicketsContext = createContext<SupportTicketsContextValue | null>(null);

export function SupportTicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await SupportService.listTickets();
      setTickets(res);
    } catch {
      // Best-effort -- leave the last known list on screen.
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (subject: string, message: string) => {
    const ticket = await SupportService.createTicket(subject, message);
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  }, []);

  const sendMessage = useCallback(async (ticketId: string, message: string) => {
    const updated = await SupportService.sendMessage(ticketId, message);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  }, []);

  return (
    <SupportTicketsContext.Provider
      value={{ tickets, loading, refresh, createTicket, sendMessage }}
    >
      {children}
    </SupportTicketsContext.Provider>
  );
}

export function useSupportTickets() {
  const ctx = useContext(SupportTicketsContext);

  if (!ctx) {
    throw new Error("useSupportTickets must be used within a SupportTicketsProvider");
  }

  return ctx;
}
