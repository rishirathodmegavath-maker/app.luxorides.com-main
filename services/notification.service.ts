import { NotificationListResponse } from "@/types";
import { privateApi } from "./api.private";

/* =====================================================
   CLIENT NOTIFICATION SERVICE
   Backend: /client/app/notifications
   Auth: Bearer token (privateApi)
   ===================================================== */

export const NotificationService = {
  /* =========================
     GET – Notification feed + unread count
     ========================= */
  list(): Promise<NotificationListResponse> {
    return privateApi<NotificationListResponse>("/client/app/notifications", {
      method: "GET",
    });
  },

  /* =========================
     POST – Mark a single notification read
     ========================= */
  markRead(id: string): Promise<void> {
    return privateApi<void>(`/client/app/notifications/${id}/read`, {
      method: "POST",
    });
  },

  // Device-token registration (POST /client/app/notifications/device-token)
  // is intentionally not wired up here -- it's for native push registration
  // and requires Firebase config not available for this web build.
};
