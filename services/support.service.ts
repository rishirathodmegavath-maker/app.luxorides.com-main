import { SupportTicketResponse } from "@/types";
import { privateApi } from "./api.private";

/* =====================================================
   CLIENT SUPPORT SERVICE
   Backend: /client/app/support/tickets
   Auth: Bearer token (privateApi)
   ===================================================== */

export const SupportService = {
  /* =========================
     GET – List tickets
     ========================= */
  listTickets(): Promise<SupportTicketResponse[]> {
    return privateApi<SupportTicketResponse[]>("/client/app/support/tickets", {
      method: "GET",
    });
  },

  /* =========================
     POST – Create a new ticket
     ========================= */
  createTicket(subject: string, message: string): Promise<SupportTicketResponse> {
    return privateApi<SupportTicketResponse>("/client/app/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
  },

  /* =========================
     POST – Reply on a ticket
     ========================= */
  sendMessage(ticketId: string, message: string): Promise<SupportTicketResponse> {
    return privateApi<SupportTicketResponse>(
      `/client/app/support/tickets/${ticketId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    );
  },
};
