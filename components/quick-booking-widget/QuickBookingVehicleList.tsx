"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { VehicleCatalog } from "@/types";
import { getFileUrl } from "@/utils/file-url";
import { displayMoney } from "@/lib/utils";

type Props = {
  vehicles: VehicleCatalog[];
  loading: boolean;
  hasMore: boolean;
  onScrollEnd: () => void;
  onSelect: (vehicle: VehicleCatalog) => void;
  onBack: () => void;
};

export default function QuickBookingVehicleList({
  vehicles,
  loading,
  hasMore,
  onScrollEnd,
  onSelect,
  onBack,
}: Props) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="
          bg-gray-200  text-black
          p-5 md:p-6
          rounded-[40px]
          shadow-[0_30px_80px_rgba(0,0,0,0.5)]
          space-y-4
        "
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="
              p-2 rounded-lg
              border border-neutral-200
              hover:bg-neutral-100
              transition
            "
          >
            <ArrowLeft size={16} />
          </button>

          <h2 className="text-base font-semibold text-neutral-800">
            Available vehicles
          </h2>
        </div>

        {/* ================= LIST ================= */}
        <div
          className="space-y-3 max-h-[360px] overflow-y-auto pr-1"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (
              hasMore &&
              !loading &&
              el.scrollTop + el.clientHeight >= el.scrollHeight - 120
            ) {
              onScrollEnd();
            }
          }}
        >
          {vehicles.map((v) => {
            const price = v.packages?.[0]?.baseFare;

            return (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className="
                  w-full
                  rounded-xl
                  border border-neutral-200
                  bg-neutral-50
                  px-4 py-3
                  text-left

                  transition-all duration-200
                  hover:bg-white
                  hover:border-neutral-300
                  hover:shadow-sm
                "
              >
                <div className="flex gap-4">
                  {/* IMAGE */}
                  <div className="relative h-14 w-20 overflow-hidden rounded-md bg-white">
                    <Image
                      src={getFileUrl(v.pic) || "/placeholder-car-png.webp"}
                      alt={v.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {v.name}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {v.category} · {v.seats} seats
                    </p>

                    {price && (
                      <p className="mt-1 text-sm font-semibold text-neutral-900">
                        {displayMoney(price)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* ================= STATES ================= */}

          {loading && (
            <p className="text-center text-xs text-neutral-500">
              Loading vehicles…
            </p>
          )}

          {!loading && vehicles.length === 0 && (
            <p className="text-center text-sm text-neutral-500">
              No vehicles available
            </p>
          )}

          {!hasMore && vehicles.length > 0 && (
            <p className="text-center text-xs text-neutral-400">
              End of results
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
