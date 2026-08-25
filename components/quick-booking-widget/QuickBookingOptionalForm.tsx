"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VehicleItinerary, DutyType } from "@/types";
import { LocationInput } from "@/components/ui/LocationInput";
import PassengerSelector from "../ui/PassengerSelector";
import BillingEntitySelector from "../ui/BillingEntitySelector";

type Props = {
  value: VehicleItinerary;
  onSubmit: (v: VehicleItinerary) => void;
  onSkip: () => void;
};

export default function QuickBookingOptionalForm({
  value,
  onSubmit,
  onSkip,
}: Props) {
  const [draft, setDraft] = useState<VehicleItinerary>(value);
  const dutyType = value.dutyType;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="
         bg-gray-200 text-black
          p-6 md:p-8
          rounded-[40px]
          shadow-[0_30px_80px_rgba(0,0,0,0.5)]
          space-y-5
        "
      >
        {/* ================= TRANSFER ONLY ================= */}
        {dutyType === DutyType.TRANSFER && (
          <div className="relative w-full">
            <input
              placeholder="Flight number (optional)"
              value={draft.flightNumber || ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  flightNumber: e.target.value,
                })
              }
              className="
                w-full h-14
                px-4
                rounded-xl
                border border-neutral-200
                bg-neutral-50
                text-sm text-neutral-900
                placeholder:text-neutral-400

                transition-all duration-200
                shadow-sm

                focus:outline-none
                focus:bg-white
                focus:border-neutral-300
                focus:ring-4 focus:ring-black/5
              "
            />
          </div>
        )}

        {/* ================= LOCAL / OUTSTATION ================= */}
        {(dutyType === DutyType.LOCAL || dutyType === DutyType.OUTSTATION) && (
          <LocationInput
            placeholder="Drop location (optional)"
            value={draft.dropLocation || null}
            onChange={(v) =>
              setDraft({
                ...draft,
                dropLocation: v,
              })
            }
          />
        )}

        {/* ================= SHARED OPTIONAL ================= */}

        <PassengerSelector
          value={draft.passengerIds || []}
          onChange={(ids) =>
            setDraft({
              ...draft,
              passengerIds: ids,
            })
          }
        />

        <BillingEntitySelector
          value={draft.billingEntityId}
          onChange={(id) =>
            setDraft({
              ...draft,
              billingEntityId: id,
            })
          }
        />

        {/* ================= NOTES ================= */}
        <textarea
          placeholder="Special instructions (optional)"
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
            bg-neutral-50
            px-4 py-3
            text-sm text-neutral-900
            placeholder:text-neutral-400

            transition-all duration-200
            shadow-sm

            resize-none

            focus:outline-none
            focus:bg-white
            focus:border-neutral-300
            focus:ring-4 focus:ring-black/5
          "
        />

        {/* ================= ACTIONS ================= */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            className="w-full text-neutral-500 hover:text-neutral-700"
            onClick={onSkip}
          >
            Skip
          </Button>

          <Button
            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onSubmit(draft)}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
