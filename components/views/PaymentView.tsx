"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useView } from "@/components/views/ViewContext";
import { loadRazorpay } from "@/lib/razorpay";
import { ClientPaymentService } from "@/services/client-payment.service";
import {
  PaymentGateway,
  PaymentOrderResponse,
  VerifyPaymentRequest,
} from "@/types/payment";

const VERIFY_RETRY_DELAYS_MS = [1000, 2000];

/*
 * verifyPayment is a locked, idempotent no-op on the backend once a payment
 * is CONFIRMED (see RazorpayPaymentService.verifyPayment) -- calling it more
 * than once for the same order/payment id is always safe, so retrying a
 * failed call here just recovers from a dropped network request/backend
 * blip right after Razorpay has already captured the money. It never risks
 * a duplicate charge either way.
 */
async function verifyWithRetry(payload: VerifyPaymentRequest): Promise<{ status: string }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= VERIFY_RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await ClientPaymentService.verify(payload);
    } catch (err) {
      lastError = err;
      const delay = VERIFY_RETRY_DELAYS_MS[attempt];
      if (delay !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default function PaymentView({ bookingId }: { bookingId: string }) {
  const { setView } = useView();
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  /* =========================
     REDIRECT
     ========================= */

  const redirectToBooking = useCallback(() => {
    setView({
      name: "booking-detail",
      bookingId,
    });
  }, [setView, bookingId]);

  /* =========================
     OPEN RAZORPAY
     ========================= */

  const openRazorpay = useCallback(
    (payload: PaymentOrderResponse) => {
      if (
        !payload?.key ||
        !payload?.orderId ||
        !payload?.amount ||
        !payload?.currency
      ) {
        console.error("Invalid Razorpay payload", payload);
        redirectToBooking();
        return;
      }

      if (!window.Razorpay) {
        console.error("Razorpay SDK not loaded");
        redirectToBooking();
        return;
      }

      const options: RazorpayOptions = {
        key: payload.key,
        order_id: payload.orderId,
        amount: payload.amount, // already paise
        currency: payload.currency,

        name: "Luxorides",
        description: "Booking Payment",

        prefill: payload.prefill ?? {},

        handler: async (response) => {
          // Razorpay has already captured the money by the time this fires --
          // the only thing that can still fail is *telling our backend*
          // (a dropped network request, a brief backend blip). verifyPayment
          // is safe to call more than once for the same orderId/paymentId
          // (it's a locked, idempotent no-op once CONFIRMED -- see
          // RazorpayPaymentService.verifyPayment), so a few quick retries
          // here recover the common "flaky network right after payment"
          // case without any new backend capability. If all retries fail,
          // there's still no duplicate-charge risk -- only a booking that
          // needs the customer/ops to notice it didn't confirm.
          try {
            await verifyWithRetry({
              bookingId,
              gateway: PaymentGateway.RAZORPAY,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          } catch (err) {
            console.error("Payment verification failed after retries", err);
          } finally {
            redirectToBooking();
          }
        },

        modal: {
          ondismiss: redirectToBooking,
        },

        theme: {
          color: "#111827",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [bookingId, redirectToBooking]
  );

  /* =========================
     SETTLE A DUMMY (MOCK) PAYMENT
     ========================= */

  const settleMockPayment = useCallback(
    async (payload: PaymentOrderResponse) => {
      try {
        // Brief pause so this doesn't look like a skipped step -- there's no real
        // checkout to wait on, but an instant redirect reads as broken.
        await new Promise((resolve) => setTimeout(resolve, 1200));

        await ClientPaymentService.verify({
          bookingId,
          gateway: PaymentGateway.MOCK,
          orderId: payload.orderId,
          paymentId: `mock_pay_client_${Date.now()}`,
          signature: "mock",
        });
      } catch (err) {
        console.error("Mock payment confirmation failed", err);
      } finally {
        redirectToBooking();
      }
    },
    [bookingId, redirectToBooking]
  );

  /* =========================
     AUTO START PAYMENT
     ========================= */

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const payload = await ClientPaymentService.createOrder({
          bookingId,
          gateway: PaymentGateway.RAZORPAY,
        });

        if (payload.gateway === "MOCK") {
          setIsMock(true);
          await settleMockPayment(payload);
          return;
        }

        const loaded = await loadRazorpay();
        if (!loaded) throw new Error("Failed to load Razorpay SDK");

        openRazorpay(payload);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to initiate payment"
        );
        redirectToBooking();
      }
    })();
  }, [bookingId, openRazorpay, redirectToBooking, settleMockPayment]);

  /* =========================
     RENDER
     ========================= */

  return (
    <section className="app-screen mx-auto max-w-xl text-center">
      <h1 className="text-xl font-semibold text-white mb-2">
        {isMock ? "Simulating payment (dev mode)…" : "Redirecting to payment…"}
      </h1>

      <p className="text-white/60 text-sm">
        {isMock
          ? "No real money is moved -- this is a local dummy payment."
          : "Please do not refresh or close this page"}
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </section>
  );
}
