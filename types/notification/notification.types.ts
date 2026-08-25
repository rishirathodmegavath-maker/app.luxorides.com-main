/* =====================================================
   CLIENT NOTIFICATIONS
   Backend: /client/app/notifications
   ===================================================== */

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  type: string;
  bookingId: string | null;
  dutyId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationListResponse {
  unreadCount: number;
  notifications: NotificationResponse[];
}
