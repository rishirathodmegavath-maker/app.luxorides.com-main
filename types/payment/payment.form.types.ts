/* =========================
   PAYMENT GATEWAYS
   ========================= */

export enum PaymentGateway {
  RAZORPAY = "RAZORPAY",
  MANUAL_ENTRY = "MANUAL_ENTRY",
  /** Dev/local-only dummy gateway -- see backend MockPaymentService. No real money moves. */
  MOCK = "MOCK",
}

/* =========================
   CREATE PAYMENT ORDER
   ========================= */

export interface PaymentOrderRequest {
  bookingId: string;
  gateway: PaymentGateway;
}

/**
 * Razorpay checkout payload
 * (matches backend RazorpayCheckoutPayload exactly)
 */
export interface RazorpayCheckoutResponse {
  /** "RAZORPAY" for a real order, "MOCK" for the dev-only dummy gateway. */
  gateway: "RAZORPAY" | "MOCK";
  key: string | null;
  orderId: string;
  amount: number; // paise
  currency: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

/**
 * Union for future gateways
 */
export type PaymentOrderResponse = RazorpayCheckoutResponse;

/* =========================
   VERIFY PAYMENT
   ========================= */

export interface VerifyPaymentRequest {
  bookingId: string;
  gateway: PaymentGateway;
  orderId: string;
  paymentId: string;
  signature: string;
}

/* =========================
   PAYMENT DOMAIN (UNCHANGED)
   ========================= */

export enum PaymentMode {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  UPI = "UPI",
  CARD = "CARD",
  WALLET = "WALLET",
  NET_BANKING = "NET_BANKING",
  GATEWAY = "GATEWAY",
  UNKNOWN = "UNKNOWN",
}

export enum PaymentStatus {
  INITIATED = "INITIATED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}
