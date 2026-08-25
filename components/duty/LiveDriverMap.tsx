"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";
import { CONFIG } from "@/services/config";
import { useDutyLocationRealtime } from "@/hooks/useDutyLocationRealtime";
import { ClientBookingService } from "@/services/client-booking.service";
import { DriverDutyLocationResponse } from "@/types";

type Props = {
  dutyId: string;
};

// Renders a live driver marker over the Google Maps JS API already loaded
// for Places Autocomplete (see lib/google-maps.ts) -- no new dependency, no
// new API key usage. Mounted only while a duty is RUNNING (see
// BookingDetailView). Never renders anything until a real position exists,
// from either the WS push or the one-time REST fallback fetch on mount.
export function LiveDriverMap({ dutyId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [initialLocation, setInitialLocation] =
    useState<DriverDutyLocationResponse | null>(null);

  const live = useDutyLocationRealtime(dutyId, true);
  const location = live ?? initialLocation;

  useEffect(() => {
    ClientBookingService.getDutyLocation(dutyId)
      .then((loc) => {
        if (loc) setInitialLocation(loc);
      })
      .catch(() => {
        // Best-effort -- the WS push will populate this once it arrives.
      });
  }, [dutyId]);

  useEffect(() => {
    if (!location?.latitude || !location?.longitude || !containerRef.current) {
      return;
    }

    let cancelled = false;
    const position = { lat: location.latitude, lng: location.longitude };

    loadGoogleMaps(CONFIG.GOOGLE_MAPS_KEY).then(() => {
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: position,
          zoom: 15,
          disableDefaultUI: true,
        });
      }

      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          position,
          map: mapRef.current,
        });
      } else {
        markerRef.current.setPosition(position);
      }

      mapRef.current.panTo(position);
    });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  if (!location?.latitude || !location?.longitude) {
    return null;
  }

  // Straight-line ETA/distance from the same location payload -- only
  // surfaced when etaMinutes is present (the backend leaves it null when the
  // driver is stationary or moving too slowly to estimate meaningfully). In
  // that case fall back to distance alone if we have it, or show nothing.
  const etaLabel =
    location.etaMinutes != null
      ? `${Math.round(location.etaMinutes)} min` +
        (location.distanceRemainingKm != null
          ? ` · ${location.distanceRemainingKm.toFixed(1)} km`
          : "")
      : location.distanceRemainingKm != null
        ? `${location.distanceRemainingKm.toFixed(1)} km away`
        : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d8b25c]/20">
      <div ref={containerRef} className="h-56 w-full" />
      {etaLabel && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          {etaLabel}
        </div>
      )}
    </div>
  );
}
