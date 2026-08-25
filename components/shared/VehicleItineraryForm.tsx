"use client";

import { useState } from "react";
import { Check, X, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { LocationInput } from "@/components/ui/LocationInput";

import {
  DutyType,
  VehicleCatalog,
  VehicleItinerary,
} from "@/types";

import { AddressSnapshot } from "@/types/booking";
import PassengerSelector from "../ui/PassengerSelector";

/* ===================================================== */

export const glassBtn =
  "lux-control rounded-xl text-white/80";

function isTransferDuty(duty: DutyType) {
  return (
    duty === DutyType.TRANSFER ||
    duty === DutyType.AIRPORT_PICKUP ||
    duty === DutyType.AIRPORT_DROP
  );
}

/* ===================================================== */

type Props = {

  value?: VehicleItinerary;
  loading?: boolean;

  onCancel: () => void;
  onSave: (itinerary: VehicleItinerary) => void;

  applyToAll?: boolean;
  onToggleApplyToAll?: (v: boolean) => void;
};

/* ===================================================== */

export default function VehicleItineraryForm({
  value,
  loading = false,
  onCancel,
  onSave,
  applyToAll,
  onToggleApplyToAll,
}: Props) {
  /* ================= STATE ================= */

  const [draft, setDraft] = useState<VehicleItinerary>(() => ({
    dutyType: value?.dutyType ?? DutyType.TRANSFER,
    reportingLocation: value?.reportingLocation ?? null,
    reportingTime: value?.reportingTime ?? "",
    dropLocation: value?.dropLocation ?? null,
    dropTime: value?.dropTime ?? "",
    bookingDays: value?.bookingDays,
    flightNumber: value?.flightNumber,
    passengerIds: value?.passengerIds ?? [],
    clientNotes: value?.clientNotes,
  }));

  const dutyType = draft.dutyType;

  /* ================= UI VALIDATION ================= */

  const isValid = () => {
    if (!draft.reportingLocation || !draft.reportingTime) return false;

    if (isTransferDuty(dutyType)) {
      return Boolean(draft.dropLocation);
    }

    if (dutyType === DutyType.OUTSTATION) {
      return Boolean(draft.bookingDays && draft.bookingDays > 0);
    }

    return true;
  };

  /* ================= STYLES ================= */

  const glassInput =
    "lux-input-dark w-full h-14 px-5 rounded-full text-sm placeholder:text-white/50 focus:outline-none focus:border-white/60";

  /* ================= RENDER ================= */

  return (
    <div className="border-t border-white/10 p-5 space-y-6 bg-[#101114]">
      {/* DUTY TYPE */}
      <div className="flex gap-2">
        {[
          { label: "Transfer", value: DutyType.TRANSFER },
          { label: "Local", value: DutyType.LOCAL },
          { label: "Outstation", value: DutyType.OUTSTATION },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                dutyType: opt.value,
                bookingDays:
                  opt.value === DutyType.OUTSTATION
                    ? d.bookingDays
                    : undefined,
                dropLocation: isTransferDuty(opt.value)
                  ? d.dropLocation
                  : null,
                flightNumber: isTransferDuty(opt.value)
                  ? d.flightNumber
                  : undefined,
              }))
            }
            className={`flex-1 h-12 rounded-full text-sm border ${
              dutyType === opt.value
                ? "border-white bg-white text-black"
                : "lux-control"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* REQUIRED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LocationInput
          value={draft.reportingLocation}
          placeholder="Pickup location"
          onChange={(loc: AddressSnapshot | null) =>
            setDraft((d) => ({ ...d, reportingLocation: loc }))
          }
        />

        <DateTimeInput
          value={draft.reportingTime}
          placeholder="Reporting date & time"
          onChange={(v) =>
            setDraft((d) => ({ ...d, reportingTime: v }))
          }
        />
      </div>

      {/* TRANSFER */}
      {isTransferDuty(dutyType) && (
        <>
          <LocationInput
            value={draft.dropLocation}
            placeholder="Drop location"
            onChange={(loc: AddressSnapshot | null) =>
              setDraft((d) => ({ ...d, dropLocation: loc }))
            }
          />

          <div className="relative">
            <Plane
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              placeholder="Flight number (optional)"
              className={`${glassInput} pl-11`}
              value={draft.flightNumber ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  flightNumber: e.target.value,
                }))
              }
            />
          </div>
        </>
      )}

      {/* OUTSTATION */}
      {dutyType === DutyType.OUTSTATION && (
        <input
          type="number"
          min={1}
          placeholder="Booking days"
          className={glassInput}
          value={draft.bookingDays ?? ""}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              bookingDays: Number(e.target.value),
            }))
          }
        />
      )}

      {/* PASSENGERS */}
      <PassengerSelector
        value={draft.passengerIds ?? []}
        onChange={(ids) =>
          setDraft((d) => ({ ...d, passengerIds: ids }))
        }
      />

      {/* NOTES */}
      <textarea
        placeholder="Client notes / instructions"
        className="lux-input-dark w-full min-h-[90px] px-5 py-4 rounded-3xl text-sm placeholder:text-white/50"
        value={draft.clientNotes ?? ""}
        onChange={(e) =>
          setDraft((d) => ({ ...d, clientNotes: e.target.value }))
        }
      />

      {/* APPLY TO ALL */}
      {onToggleApplyToAll && (
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={!!applyToAll}
            onChange={(e) =>
              onToggleApplyToAll(e.target.checked)
            }
            className="accent-white w-4 h-4"
          />
          Apply this itinerary to all selected vehicles
        </label>
      )}

      {!isValid() && (
        <p className="text-xs text-red-400">
          Please complete required fields for {dutyType}
        </p>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={14} /> Cancel
        </Button>

        <Button
          size="sm"
          disabled={!isValid() || loading}
          onClick={() => onSave(draft)}
        >
          {loading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
