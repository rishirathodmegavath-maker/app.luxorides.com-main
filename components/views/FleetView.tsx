"use client";

import Image from "next/image";
import { ArrowRight, Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/fleet/CartContext";
import { useView } from "@/components/views/ViewContext";
import { getFileUrl } from "@/utils/file-url";
import { Button } from "@/components/ui/button";
import { displayDutyType, displayMoney, displayPackageSummary } from "@/lib/utils";

import { DutyType, VehicleItinerary } from "@/types";
import FleetOptionalModal from "../shared/FleetOptionalModal";

/* ========================================================= */

function isItineraryComplete(it?: VehicleItinerary | null): boolean {
  if (!it) return false;

  if (!it.reportingLocation || !it.reportingTime) return false;

  if (it.dutyType === DutyType.TRANSFER) {
    return Boolean(it.dropLocation);
  }

  if (it.dutyType === DutyType.OUTSTATION) {
    return Boolean(it.bookingDays && it.bookingDays > 0);
  }

  return true;
}

/* ========================================================= */

export default function FleetView() {
  const { items, removeItem, updateItem } = useCart();
  const { setView } = useView();

  const [editingItem, setEditingItem] = useState<{
    id: string;
    itinerary: VehicleItinerary;
  } | null>(null);

  const allComplete = items.every((i) => isItineraryComplete(i.itinerary));

  if (items.length === 0) {
    return (
      <div className="app-screen text-center text-white/70">
        <div className="lux-card mx-auto max-w-sm rounded-[28px] p-8">
        <p className="mb-6">Your fleet is empty.</p>
        <Button onClick={() => setView({ name: "cars" })}>
          Browse Vehicles
        </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="app-screen space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b25c]">
            Checkout
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Review your fleet
          </h1>
          <p className="text-sm text-white/60">
            Review trip details and complete passenger information
          </p>
        </div>

        <Button
          variant="glass-outline"
          size="sm"
          onClick={() => setView({ name: "cars" })}
        >
          <Plus size={16} /> Add More Vehicles
        </Button>
      </div>

      {/* ================= CARDS ================= */}
      <div className="space-y-6">
        {items.map((item) => {
          const it = item.itinerary;
          const hasOptional =
            it?.passengerIds?.length ||
            it?.billingEntityId ||
            it?.clientNotes ||
            it?.flightNumber;

          return (
            <div
              key={item.id}
              className="
                lux-card
                rounded-[28px]
                p-4 sm:p-5
                space-y-5
              "
            >
              {/* ================= TOP SECTION ================= */}
              <div className="flex flex-col sm:flex-row gap-5">
                {/* IMAGE */}
                <div className="relative h-40 w-full overflow-hidden rounded-[22px] bg-[#24242a] sm:h-28 sm:w-44">
                  <Image
                    src={
                      getFileUrl(item.vehicle.pic) ||
                      "/placeholder-car-png.webp"
                    }
                    alt={item.vehicle.name}
                    fill
                    className="object-contain p-3"
                    unoptimized
                  />
                </div>

                {/* VEHICLE INFO */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {item.vehicle.name}
                      </h3>
                      <p className="text-sm text-white/50">
                        {item.vehicle.brand} / {item.vehicle.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-black">
                      {displayMoney(item.vehicle.startingPrice)}
                    </span>
                  </div>

                  {/* ================= DUTY BADGE ================= */}
                  {it && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[11px] px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                        {displayDutyType(it.dutyType)}
                      </span>

                      {hasOptional && (
                        <span className="text-[11px] px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300">
                          Optional Added
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ================= TRIP SUMMARY ================= */}
              {it && (
                <div className="rounded-[22px] border border-white/10 bg-[#101114] p-4 text-xs text-white/70 space-y-2">
                  <div>
                    <strong className="text-white/80">Reporting:</strong>{" "}
                    {it.reportingLocation?.formattedAddress} at{" "}
                    {it.reportingTime}
                  </div>

                  {it.dropLocation && (
                    <div>
                      <strong className="text-white/80">Drop:</strong>{" "}
                      {it.dropLocation.formattedAddress}
                    </div>
                  )}

                  {it.bookingDays && (
                    <div>
                      <strong className="text-white/80">Days:</strong>{" "}
                      {it.bookingDays}
                    </div>
                  )}

                  {item.vehicle.packages?.[0] && (
                    <div>
                      <strong className="text-white/80">Package:</strong>{" "}
                      {displayPackageSummary(item.vehicle.packages[0])}
                    </div>
                  )}
                </div>
              )}

              {/* ================= WARNING ================= */}
              {item.validation?.warning && (
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-yellow-300 text-xs">
                  {item.validation.warning}
                </div>
              )}

              {/* ================= ACTION BAR ================= */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                {/* OPTIONAL ACTION */}
                {it && (
                  <div
                    onClick={() =>
                      setEditingItem({
                        id: item.id,
                        itinerary: it,
                      })
                    }
                    className="lux-control inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm text-white/86 transition-all duration-200 sm:w-fit"
                  >
                    <Pencil size={15} />
                    {hasOptional
                      ? "Edit Passenger & Billing Details"
                      : "Add Passenger & Billing Details"}
                  </div>
                )}

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex items-center justify-center gap-1 rounded-full px-4 py-3 text-xs text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="lux-bottom-bar sticky bottom-[88px] z-20 flex flex-col gap-3 rounded-[28px] border p-3 sm:static sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <Button variant="ghost" onClick={() => setView({ name: "cars" })}>
          Continue Browsing
        </Button>

        <Button
          disabled={!allComplete}
          onClick={() => setView({ name: "booking-draft" })}
          className="bg-white text-black"
        >
          Proceed to Booking <ArrowRight size={16} />
        </Button>
      </div>

      {/* ================= OPTIONAL MODAL ================= */}
      <FleetOptionalModal
        open={!!editingItem}
        value={editingItem?.itinerary ?? null}
        onClose={() => setEditingItem(null)}
        onSubmit={(updated) => {
          if (editingItem) {
            updateItem(editingItem.id, {
              itinerary: updated,
            });
          }
          setEditingItem(null);
        }}
      />
    </section>
  );
}
