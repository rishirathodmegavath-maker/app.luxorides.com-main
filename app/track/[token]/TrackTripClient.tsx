"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Car, Gauge, MapPin, Timer, TriangleAlert, UserRound } from "lucide-react";

import { CONFIG } from "@/services/config";
import { loadGoogleMaps } from "@/lib/google-maps";
import { DutyStatus, PublicTripStatusResponse } from "@/types";
import { displayDutyStatus } from "@/lib/utils";
import { instantToReadable } from "@/lib/date";
import LoadingState from "@/components/ui/LoadingState";

const POLL_MS = 10000;

// Standalone, unauthenticated trip-tracking page reached via a shared link
// (see "Share trip" on BookingDetailView). Deliberately has no app shell/nav
// -- it must work for anyone with the link, logged in or not. Polls the
// public REST endpoint directly rather than opening a WS channel, since this
// is a single throwaway view rather than a long-lived authenticated screen.
export default function TrackTripClient({ token }: { token: string }) {
  const [status, setStatus] = useState<PublicTripStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await fetch(`${CONFIG.BASE_URL}/public/trip/${token}`);

        if (!res.ok) {
          if (!cancelled) setInvalid(true);
          return;
        }

        const data = (await res.json()) as PublicTripStatusResponse;
        if (!cancelled) {
          setStatus(data);
          setInvalid(false);
        }
      } catch {
        if (!cancelled) setInvalid(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    refresh();
    const timer = setInterval(refresh, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  useEffect(() => {
    if (!status?.latitude || !status?.longitude || !containerRef.current) {
      return;
    }

    let cancelled = false;
    const position = { lat: status.latitude, lng: status.longitude };

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
  }, [status?.latitude, status?.longitude]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#08090b] px-4 text-white">
        <LoadingState label="Loading trip" compact />
      </main>
    );
  }

  if (invalid || !status) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#08090b] px-4 text-white">
        <div className="lux-card w-full max-w-sm rounded-[28px] p-6 text-center">
          <TriangleAlert size={22} className="mx-auto mb-3 text-white/40" />
          <p className="text-white/70">
            This tracking link is no longer valid.
          </p>
        </div>
      </main>
    );
  }

  const hasPosition = status.latitude != null && status.longitude != null;

  return (
    <main className="flex min-h-dvh flex-col items-center bg-[#08090b] px-4 py-8 text-white">
      <div className="w-full max-w-lg space-y-5">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo/luxorides-shield-white.png"
            alt="Luxorides"
            width={26}
            height={26}
          />
          <span className="text-sm font-semibold tracking-wide">LUXORIDES</span>
        </div>

        <div className="lux-card rounded-[28px] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8b25c]">
                Live trip
              </p>
              <h1 className="mt-1 text-lg font-semibold">
                {displayDutyStatus(status.dutyStatus)}
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              icon={<UserRound size={16} />}
              label="Driver"
              value={status.driverFirstName ?? "Not available"}
            />
            <InfoRow
              icon={<Car size={16} />}
              label="Vehicle"
              value={
                [status.vehicleName, status.vehicleNumber]
                  .filter(Boolean)
                  .join(" · ") || "Not available"
              }
            />
          </div>

          {status.dutyStatus === DutyStatus.RUNNING && hasPosition && (
            <div className="overflow-hidden rounded-2xl border border-[#d8b25c]/20">
              <div ref={containerRef} className="h-64 w-full" />
            </div>
          )}

          {status.dutyStatus === DutyStatus.RUNNING && !hasPosition && (
            <div className="rounded-2xl border border-white/10 bg-[#101114] p-4 text-center text-sm text-white/55">
              Waiting for the driver&apos;s location to come online…
            </div>
          )}

          {(status.distanceRemainingKm != null || status.etaMinutes != null) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {status.distanceRemainingKm != null && (
                <InfoRow
                  icon={<MapPin size={16} />}
                  label="Distance remaining"
                  value={`${status.distanceRemainingKm.toFixed(1)} km`}
                />
              )}
              {status.etaMinutes != null && (
                <InfoRow
                  icon={<Timer size={16} />}
                  label="ETA"
                  value={`${Math.round(status.etaMinutes)} min`}
                />
              )}
            </div>
          )}

          {status.capturedAt && (
            <p className="flex items-center gap-2 text-xs text-white/40">
              <Gauge size={13} />
              Last updated {instantToReadable(status.capturedAt)}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
      <div className="mb-1.5 flex items-center gap-2 text-[#d8b25c]">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
