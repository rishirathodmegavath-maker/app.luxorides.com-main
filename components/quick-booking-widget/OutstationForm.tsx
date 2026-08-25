"use client";

import { LocationInput } from "@/components/ui/LocationInput";
import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { VehicleItinerary } from "@/types";
import { Hash } from "lucide-react";

type Props = {
  value?: VehicleItinerary;
  onChange: (v: VehicleItinerary) => void;
};

export default function OutstationForm({ value, onChange }: Props) {
  if (!value) return null;

  const { reportingLocation, reportingTime, bookingDays } = value;

  return (
    <div className="space-y-5">
      {/* LOCATION */}
      <LocationInput
        placeholder="Pickup location"
        value={reportingLocation}
        onChange={(v) =>
          onChange({ ...value, reportingLocation: v })
        }
      />

      {/* DATE TIME */}
      <DateTimeInput
        placeholder="Pickup date & time"
        value={reportingTime}
        onChange={(v) =>
          onChange({ ...value, reportingTime: v })
        }
      />

      {/* NUMBER OF DAYS */}
      <div className="relative w-full">
        <Hash
          size={18}
          className="
            pointer-events-none
            absolute left-4 top-1/2 -translate-y-1/2
            text-neutral-400
          "
        />

        <input
          type="number"
          min={1}
          placeholder="Number of days"
          value={bookingDays ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              bookingDays: Number(e.target.value) || undefined,
            })
          }
          className="
            lux-field w-full
            pl-12 pr-4
            text-sm text-neutral-900
            placeholder:text-neutral-400

            transition-all duration-200

            focus:outline-none
            focus:bg-white
            focus:border-neutral-300
            focus:ring-4 focus:ring-black/5
          "
        />
      </div>
    </div>
  );
}
