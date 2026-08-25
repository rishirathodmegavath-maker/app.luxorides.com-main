"use client";

import { LocationInput } from "@/components/ui/LocationInput";
import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { VehicleItinerary } from "@/types";

type Props = {
  value?: VehicleItinerary;
  onChange: (v: VehicleItinerary) => void;
};

export default function LocalForm({ value, onChange }: Props) {
  if (!value) return null;

  const {
    reportingLocation,
    reportingTime,
  } = value;

  return (
    <div className="space-y-5">
      <LocationInput
        placeholder="Pickup location"
        value={reportingLocation}
        onChange={(v) =>
          onChange({ ...value, reportingLocation: v })
        }
      />

      <DateTimeInput
        placeholder="Pickup date & time"
        value={reportingTime}
        onChange={(v) =>
          onChange({ ...value, reportingTime: v })
        }
      />

      {/* Static package preview */}
      <div className="flex gap-2">
        {["6H", "8H", "12H"].map((p) => (
          <div
            key={p}
            className={`flex-1 rounded-2xl px-3 py-3 text-sm border text-center ${
              p === "8H"
                ? "bg-black text-white border-black"
                : "bg-neutral-200 border-neutral-300 text-gray-500"
            }`}
          >
            {p}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">
        8 hours · 80 km included
      </p>
    </div>
  );
}
