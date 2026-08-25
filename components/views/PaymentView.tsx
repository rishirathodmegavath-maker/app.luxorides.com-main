"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useView } from "@/components/views/ViewContext";
import { loadRazorpay } from "@/lib/razorpay";
import { ClientPaymentService } from "@/services/client-payment.service";
import {
  PaymentGateway,
  PaymentOrderResponse,
} from "@/types/payment";


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
          try {
            await ClientPaymentService.verify({
              bookingId,
              gateway: PaymentGateway.RAZORPAY,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          } catch (err) {
            console.error("Payment verification failed", err);
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
