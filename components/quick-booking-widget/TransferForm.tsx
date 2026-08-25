"use client";

import { LocationInput } from "@/components/ui/LocationInput";
import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { VehicleItinerary } from "@/types";

type Props = {
  value?: VehicleItinerary;
  onChange: (v: VehicleItinerary) => void;
};

export default function TransferForm({ value, onChange }: Props) {
  if (!value) return null;

  const {
    reportingLocation,
    reportingTime,
    dropLocation,
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

      <LocationInput
        placeholder="Drop location"
        value={dropLocation}
        onChange={(v) =>
          onChange({ ...value, dropLocation: v })
        }
      />

      <DateTimeInput
        placeholder="Pickup date & time"
        value={reportingTime}
        onChange={(v) =>
          onChange({ ...value, reportingTime: v })
        }
      />
    </div>
  );
}
