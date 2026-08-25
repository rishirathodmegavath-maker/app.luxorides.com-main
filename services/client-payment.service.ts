
import { PaymentOrderRequest, PaymentOrderResponse, VerifyPaymentRequest } from "@/types/payment";
import { privateApi } from "./api.private";

/* ================= TYPES ================= */

/* ================= SERVICE ================= */

export const ClientPaymentService = {
  createOrder(
    payload: PaymentOrderRequest
  ): Promise<PaymentOrderResponse> {
    return privateApi<PaymentOrderResponse>(
      "/client/app/payments/order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  },

  verify(
    payload: VerifyPaymentRequest
  ):  Promise<{ status: string }> {
    return privateApi<{ status: string }>(
      "/client/app/payments/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  },
};
