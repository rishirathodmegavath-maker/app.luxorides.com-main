/* =====================================================
   CLIENT SUPPORT / TICKETS
   Backend: /client/app/support/tickets
   ===================================================== */

export enum SupportTicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
}

export type SupportMessageSenderType = "CLIENT" | "EMPLOYEE";

export interface SupportTicketMessage {
  id: string;
  senderType: SupportMessageSenderType;
  message: string;
  createdAt: string;
}

export interface SupportTicketResponse {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  messages: SupportTicketMessage[];
}
