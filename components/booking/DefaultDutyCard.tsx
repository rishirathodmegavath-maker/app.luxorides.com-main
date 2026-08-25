"use client";
import { instantToReadable } from "@/lib/date";
import {
  displayDutyStatus,
  displayMoney,
  displayPackageSummary,
} from "@/lib/utils";
import { ClientBookingEntry, DutyStatus } from "@/types";
import { CalendarDays, Car, MapPin } from "lucide-react";

export default function DefaultDutyCard({ entry }: { entry: ClientBookingEntry }) {
  return (
    <div
      className="
        lux-panel
        rounded-2xl
        p-4 space-y-3
      "
    >
      {/* Vehicle */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <Car size={16} />
        {entry.vehicleName}
        <span className="flex-auto text-end">
          <StatusBadge status={entry.status} />
        </span>
      </div>

      {/* Locations */}
      <div className="flex flex-col gap-2 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span  className="w-full line-clamp-1">{entry.reportingLocation}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          <span>{instantToReadable(entry.reportingTime)}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-white/60">
        <span>{displayPackageSummary(entry.packageSnapshot)}</span>
        <span className="text-neutral-200 text-lg flex-auto text-end">
          Total: {displayMoney(entry.dutyTotal)}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ClientBookingEntry["status"] }) {
  const base = "text-xs px-2.5 py-1 rounded-full capitalize font-medium";

  const variants: Record<DutyStatus, string> = {
    REQUESTED: "bg-amber-400/20 text-amber-300",
    ALLOTTED: "bg-emerald-400/20 text-emerald-300",
    RUNNING: "bg-blue-400/20 text-blue-300",
    COMPLETED: "bg-sky-400/20 text-sky-300",
  } as const;

  return (
    <span className={`${base} ${variants[status]}`}>
      {displayDutyStatus(status)}
    </span>
  );
}
