import {
  BookingDraftForm,
  BookingListEntry,
  CancelPreviewResponse,
  ClientBookingDTO,
  DriverDutyLocationResponse,
  DutyRatingResponse,
  TripShareLinkResponse,
} from "@/types";
import { privateApi, privateFileApi } from "./api.private";

/* =====================================================
   CLIENT BOOKING SERVICE
   Backend: /api/client/bookings
   Auth: Bearer token (privateApi)
   ===================================================== */

export const ClientBookingService = {
  /* =========================
     GET – Booking History (List)
     ========================= */
  list(): Promise<BookingListEntry[]> {
    return privateApi<BookingListEntry[]>("/api/client/bookings", {
      method: "GET",
    });
  },

  /* =========================
     GET – Single Booking Detail
     ========================= */
  get(bookingId: string): Promise<ClientBookingDTO> {
    return privateApi<ClientBookingDTO>(`/api/client/bookings/${bookingId}`, {
      method: "GET",
    });
  },

  /* =========================
     POST – Draft Booking
     ========================= */
  draft(form: BookingDraftForm): Promise<ClientBookingDTO> {
    return privateApi<ClientBookingDTO>("/api/client/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
  },

  /* =========================
     GET – Download / View Invoice PDF
     ========================= */
  async downloadInvoicePdf(invoiceNumber: string): Promise<Blob> {
    return privateFileApi(`/api/client/bookings/invoice/${invoiceNumber}/pdf`);
  },

  /* =========================
     GET – Live driver location (REST fallback for the WS channel)
     ========================= */
  getDutyLocation(dutyId: string): Promise<DriverDutyLocationResponse | undefined> {
    return privateApi<DriverDutyLocationResponse | undefined>(
      `/api/client/bookings/duty/${dutyId}/location`,
      { method: "GET" }
    );
  },

  /* =========================
     POST – Create a trip-share link for a duty
     ========================= */
  createShareLink(dutyId: string): Promise<TripShareLinkResponse> {
    return privateApi<TripShareLinkResponse>(
      `/api/client/bookings/duty/${dutyId}/share`,
      { method: "POST" }
    );
  },

  /* =========================
     GET – Cancellation fee/refund preview
     ========================= */
  getCancelPreview(bookingId: string): Promise<CancelPreviewResponse> {
    return privateApi<CancelPreviewResponse>(
      `/api/client/bookings/${bookingId}/cancel-preview`,
      { method: "GET" }
    );
  },

  /* =========================
     POST – Cancel booking
     ========================= */
  cancelBooking(bookingId: string, reason: string): Promise<void> {
    return privateApi<void>(`/api/client/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
  },

  /* =========================
     POST – Submit a duty rating
     ========================= */
  submitRating(
    dutyId: string,
    stars: number,
    comment: string | null
  ): Promise<DutyRatingResponse> {
    return privateApi<DutyRatingResponse>(
      `/api/client/bookings/duty/${dutyId}/rating`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, comment }),
      }
    );
  },

  /* =========================
     GET – Existing duty rating (if any)
     ========================= */
  getRating(dutyId: string): Promise<DutyRatingResponse | undefined> {
    return privateApi<DutyRatingResponse | undefined>(
      `/api/client/bookings/duty/${dutyId}/rating`,
      { method: "GET" }
    );
  },
};
