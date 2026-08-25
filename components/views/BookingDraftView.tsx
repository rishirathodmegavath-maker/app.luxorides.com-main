"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ClientBookingService } from "@/services/client-booking.service";
import { ClientBookingDTO } from "@/types/booking/booking.types";
import { BookingDraftForm, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/utils/file-url";
import { useView } from "@/components/views/ViewContext";
import { inputValueToInstant, instantToReadable } from "@/lib/date";
import { useCart } from "../fleet/CartContext";
import {
  displayDutyType,
  displayDutyStatus,
  displayMoney,
  displayPackageSummary,
} from "@/lib/utils";
import LoadingState from "../ui/LoadingState";
import { CONFIG } from "@/services/config";

export default function BookingDraftView() {
  const { setView } = useView();
  const { clearCart } = useCart();

  const [booking, setBooking] = useState<ClientBookingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasDraftedRef = useRef(false);

  /* ======================================================
     CREATE DRAFT (RUNS ONCE)
     ====================================================== */
  useEffect(() => {
    if (hasDraftedRef.current) return;
    hasDraftedRef.current = true;

    try {
      const raw = localStorage.getItem(CONFIG.CART_STORAGE_KEY);
      if (!raw) throw new Error("Cart empty");

      const cart: CartItem[] = JSON.parse(raw);
      if (!cart.length) throw new Error("No cart items");

      const form: BookingDraftForm = {
        clientBillingEntityId:
          cart[0].itinerary?.billingEntityId ?? undefined,

        entries: cart.map((item) => {
          const it = item.itinerary;
          if (!it) throw new Error("Missing itinerary");

          if (!it.reportingLocation) {
            throw new Error("Pickup location is required");
          }

          if (!it.reportingTime) {
            throw new Error("Pickup time is required");
          }

          const reportingTimeInstant =
            inputValueToInstant(it.reportingTime);

          if (!reportingTimeInstant) {
            throw new Error("Invalid reporting time");
          }

          return {
            vehicleId: item.vehicleId,
            packageId: it.packageId,

            reportingLocation: it.reportingLocation,
            reportingTime: reportingTimeInstant,

            dropLocation: it.dropLocation ?? undefined,
            dropTime: it.dropTime
              ? inputValueToInstant(it.dropTime) ?? undefined
              : undefined,

            bookingDays: it.bookingDays,
            flightNumber: it.flightNumber,

            passengerIds: it.passengerIds ?? [],
            clientNotes: it.clientNotes,
          };
        }),
      };

      ClientBookingService.draft(form)
        .then(setBooking)
        .catch(() => setError("Failed to create booking"))
        .finally(() => {
          setLoading(false);
          clearCart();
        });
    } catch (err) {
      console.error(err);
      setError("Invalid cart state");
      setLoading(false);
    }
  }, [clearCart]);

  /* ======================================================
     LOADING / ERROR STATES
     ====================================================== */

  if (loading) {
    return (
      <section className="app-screen">
        <LoadingState
          label="Preparing booking summary"
          className="min-h-[320px]"
        />
      </section>
    );
  }

  if (error) {
    return (
      <div className="app-screen text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!booking) return null;

  /* ======================================================
     CALCULATIONS
     ====================================================== */

  const taxableAmount = booking.entries.reduce(
    (sum, e) => sum + e.dutyTotal.amount,
    0,
  );

  const gst = booking.gstSnapshot;

  /* ======================================================
     RENDER
     ====================================================== */

  return (
    <section className="app-screen space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d8b25c]">
          Booking summary
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-white">
          Booking #{booking.bookingId}
        </h1>
        <p className="text-sm text-white/60">
          Review your reservation details before proceeding to payment.
        </p>
      </div>

      <div className="space-y-4">
        {booking.entries.map((e) => (
          <div
            key={e.dutyId}
            className="lux-card rounded-[24px] p-4 space-y-3"
          >
            {/* Vehicle Row */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-30 flex items-center">
                <Image
                  src={
                    getFileUrl(e.vehiclePic) ||
                    "/placeholder-car-png.webp"
                  }
                  alt={e.vehicleName ?? "Vehicle"}
                  width={120}
                  height={80}
                  className="object-contain rounded-xl"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {e.vehicleName ?? "Vehicle requested"}
                </p>
                <p className="text-white/60 text-sm truncate">
                  {[e.brand, e.category].filter(Boolean).join(" / ") ||
                    "Allocation pending"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#d8b25c]/15 px-3 py-1 text-[11px] text-[#f2d384]">
                    {displayDutyType(e.packageSnapshot.dutyType)}
                  </span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] text-white/70">
                    {displayDutyStatus(e.status)}
                  </span>
                </div>
              </div>

              <div className="text-right text-white font-semibold">
                {displayMoney(e.dutyTotal)}
              </div>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InfoItem label="Package" value={displayPackageSummary(e.packageSnapshot)} />
              <InfoItem label="Base fare" value={displayMoney(e.packageSnapshot.baseFare)} />
              <InfoItem label="Pickup location" value={e.reportingLocation} />
              <InfoItem
                label="Pickup time"
                value={e.reportingTime ? instantToReadable(e.reportingTime) : "Not set"}
              />
              {e.dropLocation && <InfoItem label="Drop location" value={e.dropLocation} />}
              {e.dropTime && (
                <InfoItem label="Drop time" value={instantToReadable(e.dropTime)} />
              )}
              {e.flightNumber && (
                <InfoItem label="Flight number" value={e.flightNumber} />
              )}
              {e.runningDays != null && (
                <InfoItem label="Running days" value={`${e.runningDays}`} />
              )}
              {e.passengers?.length > 0 && (
                <InfoItem label="Passengers" value={e.passengers.join(", ")} />
              )}
              {e.clientNotes && <InfoItem label="Notes" value={e.clientNotes} />}
              {e.vehicleNumber && (
                <InfoItem label="Vehicle number" value={e.vehicleNumber} />
              )}
              {e.driverName && (
                <InfoItem
                  label="Driver"
                  value={`${e.driverName}${e.driverPhone ? ` / ${e.driverPhone}` : ""}`}
                />
              )}
              {e.startingKM != null && (
                <InfoItem label="Starting KM" value={`${e.startingKM}`} />
              )}
              {e.closingKM != null && (
                <InfoItem label="Closing KM" value={`${e.closingKM}`} />
              )}
              {e.extraChargebleDistance != null &&
                e.extraChargebleDistance > 0 && (
                  <InfoItem
                    label="Extra distance"
                    value={`${e.extraChargebleDistance} km`}
                  />
                )}
              {e.extraChargebleTime != null && e.extraChargebleTime > 0 && (
                <InfoItem label="Extra time" value={`${e.extraChargebleTime} hr`} />
              )}
              {e.nightChargeble && <InfoItem label="Night charge" value="Applicable" />}
            </div>

            {e.charges?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
                  Extra charges
                </p>
                <div className="space-y-2">
                  {e.charges.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-white/65">{charge.description}</span>
                      <span className="font-medium text-white">
                        {displayMoney(charge.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Amount Breakdown */}
        <div className="lux-card rounded-[24px] p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Taxable Amount</span>
            <span className="font-semibold">
              {displayMoney({
                amount: taxableAmount,
                currency: booking.total.currency,
              })}
            </span>
          </div>

          {gst.igstAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">IGST</span>
              <span>
                {displayMoney({
                  amount: gst.igstAmount,
                  currency: booking.total.currency,
                })}
              </span>
            </div>
          )}

          {gst.cgstAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">CGST</span>
              <span>
                {displayMoney({
                  amount: gst.cgstAmount,
                  currency: booking.total.currency,
                })}
              </span>
            </div>
          )}

          {gst.sgstAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">SGST</span>
              <span>
                {displayMoney({
                  amount: gst.sgstAmount,
                  currency: booking.total.currency,
                })}
              </span>
            </div>
          )}

          <div className="border-t border-white/10 my-2" />

          <div className="flex justify-between text-base font-semibold">
            <span>Total Payable</span>
            <span>{displayMoney(booking.total)}</span>
          </div>
        </div>
      </div>

      <div className="lux-bottom-bar sticky bottom-[88px] z-20 flex justify-end rounded-[28px] border p-3 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <Button
          className="bg-white text-black"
          onClick={() =>
            setView({
              name: "payment",
              bookingId: booking.bookingId,
            })
          }
        >
          Proceed to Payment
        </Button>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
      <p className="text-[11px] uppercase tracking-wide text-white/42">
        {label}
      </p>
      <p className="mt-1 text-sm text-white/82">{value}</p>
    </div>
  );
}
