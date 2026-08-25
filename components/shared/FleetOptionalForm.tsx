"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { VehicleItinerary, DutyType } from "@/types";
import PassengerSelector from "../ui/PassengerSelector";
import BillingEntitySelector from "../ui/BillingEntitySelector";

type Props = {
  value: VehicleItinerary;
  onSubmit: (v: VehicleItinerary) => void;
  onSkip: () => void;
};

export default function FleetOptionalForm({
  value,
  onSubmit,
  onSkip,
}: Props) {
  const [draft, setDraft] = useState<VehicleItinerary>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const dutyType = value.dutyType;

  return (
    <div className="space-y-6 py-4">

      {/* ================= TRANSFER ONLY ================= */}
      {dutyType === DutyType.TRANSFER && (
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">
            Flight Number
          </label>
          <input
            placeholder="e.g. AI-202"
            value={draft.flightNumber || ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                flightNumber: e.target.value,
              })
            }
            className="
              w-full h-12 px-4
              rounded-xl
              border border-neutral-200
              bg-white
              text-sm text-neutral-900
              placeholder:text-neutral-400

              transition-all duration-200
              shadow-sm

              focus:outline-none
              focus:border-neutral-300
              focus:ring-2 focus:ring-black/5
            "
          />
        </div>
      )}

      {/* ================= PASSENGERS ================= */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-500">
          Passengers
        </label>
        <PassengerSelector
          value={draft.passengerIds || []}
          onChange={(ids) =>
            setDraft({
              ...draft,
              passengerIds: ids,
            })
          }
        />
      </div>

      {/* ================= BILLING ================= */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-500">
          Billing Entity
        </label>
        <BillingEntitySelector
          value={draft.billingEntityId}
          onChange={(id) =>
            setDraft({
              ...draft,
              billingEntityId: id,
            })
          }
        />
      </div>

      {/* ================= NOTES ================= */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-500">
          Special Instructions
        </label>
        <textarea
          placeholder="Add any driver notes, preferences, or special requests..."
          rows={4}
          value={draft.clientNotes || ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              clientNotes: e.target.value,
            })
          }
          className="
            w-full
            rounded-xl
            border border-neutral-200
            bg-white
            px-4 py-3
            text-sm text-neutral-900
            placeholder:text-neutral-400

            transition-all duration-200
            shadow-sm

            resize-none

            focus:outline-none
            focus:border-neutral-300
            focus:ring-2 focus:ring-black/5
          "
        />
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="pt-2 space-y-2">
        <Button
          className="
            w-full h-12
            bg-emerald-500 text-black
            hover:bg-emerald-400
            active:bg-emerald-600
            transition-all duration-200
            shadow-sm hover:shadow-md
            text-sm font-medium
          "
          onClick={() => onSubmit(draft)}
        >
          Save & Continue
        </Button>

        <Button
          variant="ghost"
          className="
            w-full h-11
            text-neutral-500
            hover:text-neutral-700
          "
          onClick={onSkip}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}