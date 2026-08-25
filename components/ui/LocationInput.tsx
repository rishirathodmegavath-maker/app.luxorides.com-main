"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps";
import { AddressSnapshot } from "@/types";
import { CONFIG } from "@/services/config";

type Props = {
  value?: AddressSnapshot | null;
  onChange: (value: AddressSnapshot | null) => void;
  placeholder?: string;
};

export function LocationInput({
  value,
  onChange,
  placeholder = "Search pickup or drop location",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps(CONFIG.GOOGLE_MAPS_KEY).then(() => {
      if (!mounted || !inputRef.current) return;

      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        fields: [
          "formatted_address",
          "place_id",
          "geometry",
          "name",
          "types",
        ],
      });

      ac.setComponentRestrictions({ country: "in" });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.geometry?.location) return;

        const snapshot: AddressSnapshot = {
          formattedAddress: place.formatted_address || place.name || "",
          googlePlaceId: place.place_id!,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        };

        onChange(snapshot);
      });

      autocompleteRef.current = ac;
    });

    return () => {
      mounted = false;
    };
  }, [onChange]);

  return (
    <div className="relative w-full">
      {/* ICON */}
      <MapPin
        size={18}
        className="
          pointer-events-none
          absolute left-4 top-1/2 -translate-y-1/2
          text-neutral-400
        "
      />

      {/* INPUT */}
      <input
        ref={inputRef}
        type="text"
        defaultValue={value?.formattedAddress || ""}
        placeholder={placeholder}
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
  );
}
