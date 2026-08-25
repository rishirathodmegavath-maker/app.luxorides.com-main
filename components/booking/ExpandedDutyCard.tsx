import { motion } from "motion/react";
import { ClientBookingEntry, DutyStatus } from "@/types";
import { CalendarDays, MapPin } from "lucide-react";
import { instantToReadable } from "@/lib/date";
import React from "react";
import { getFileUrl } from "@/utils/file-url";
import Image from "next/image";
import {
  displayDutyStatus,
  displayMoney,
  displayPackageSummary,
} from "@/lib/utils";

export default function ExpandedDutyCard({ entry }: { entry: ClientBookingEntry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        lux-panel
        rounded-2xl
        p-5 space-y-4
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Duty Details</h3>
        <span className="text-xs text-white/50">
          <StatusBadge status={entry.status} />
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {entry.passengers.length > 0 && (
          <>
            <div>
              <b>Passenger(s)</b>
            </div>
            {entry.passengers?.map((p, idx) => (
              <React.Fragment key={`${p}-${idx}`}>
                {idx !== 0 && <div></div>}
                <div>{p}</div>
              </React.Fragment>
            ))}
          </>
        )}
        <div>
          <b>Duty Type</b>
        </div>
        <div>{displayPackageSummary(entry.packageSnapshot)}</div>
        <div>
          <b>Reporting</b>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="w-full line-clamp-2">{entry.reportingLocation}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>{instantToReadable(entry.reportingTime)}</span>
          </div>
        </div>
      {(entry.dropLocation||entry.dropTime)&&(
        <>
          <div>
          <b>Drop</b>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span  className="w-full line-clamp-2">{entry.dropLocation}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>{instantToReadable(entry.dropTime)}</span>
          </div>
        </div>
        </>
      )

      }
        {entry.flightNumber && (
          <>
            <div>
              <b>Flight Number</b>
            </div>
            <div>{entry.flightNumber}</div>
          </>
        )}
        {entry.status === "REQUESTED" ? (
          <>
            {/* Requested Vehicle (text-only) */}
            <div>
              <b>Requested Vehicle</b>
            </div>
            <div>{entry.vehicleName}</div>
          </>
        ) : (
          <>
            {/* Allocated / Running / Completed vehicle */}
            <div>
              <Image
                src={
                  getFileUrl(entry.vehiclePic) || "/placeholder-car-png.webp"
                }
                alt={entry.vehicleName||"Vehicle Image"}
                width={120}
                height={90}
                className="h-auto w-30 object-contain"
                unoptimized
              />
            </div>
            <div>
              <span>Vehicle Details:</span>
              <br />
              <b>{entry.vehicleName}</b>
              <br />
              {entry.vehicleNumber}
              <br />
              {entry.brand}
              <br />
              {entry.category}
            </div>
            <div>
              <Image
                src={getFileUrl(entry.driverPic) || "/user.png"}
                alt={entry.driverName||"Driver Image"}
                width={100}
                height={90}
                className="h-auto w-25 object-contain"
                unoptimized
              />
            </div>
            <div>
              <span>Driver Details:</span>
              <br />
              <b>{entry.driverName}</b>
              <br />
              {entry.driverPhone}
              <br />
              {entry.driverGender}
            </div>
          </>
        )}
        {entry.status === "COMPLETED" ? (
          <>
            <div>
              <b>Starting Meter</b>
            </div>
            <div>{entry.startingKM}</div>
            <div>
              <b>Closing Meter</b>
            </div>
            <div>{entry.closingKM}</div>
            <div>
              <b>Base Fare</b>
            </div>
            <div>{displayMoney(entry.packageSnapshot.baseFare)}</div>

            {entry.extraChargebleDistance! > 0 && (
              <>
                <div>
                  <b>Extra Distance Charge</b>
                </div>
                <div>
                  {displayMoney({
                    amount:
                      entry.extraChargebleDistance! *
                      entry.packageSnapshot.extraPerKM.amount,
                    currency: entry.packageSnapshot.extraPerKM.currency,
                  })}
                </div>
              </>
            )}

            {entry.extraChargebleTime! > 0 && (
              <>
                <div>
                  <b>Extra Time Charge</b>
                </div>
                <div>
                  {displayMoney({
                    amount:
                      entry.extraChargebleTime! *
                      entry.packageSnapshot.extraPerHS.amount,
                    currency: entry.packageSnapshot.extraPerHS.currency,
                  })}
                </div>
              </>
            )}

            {entry.nightChargeble && (
              <>
                <div>
                  <b>Night Charge</b>
                </div>
                <div>{displayMoney(entry.packageSnapshot.nightCharge)}</div>
              </>
            )}

            {entry.charges?.map((c) => (
              <React.Fragment key={c.id}>
                <div>
                  <b>{c.description}</b>
                </div>
                <div>{displayMoney(c.amount)}</div>
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            <div>
              <b></b>
            </div>
            <div></div>
          </>
        )}
        <div>
          <b></b>
        </div>
        <div></div>
      </div>
      {/* Footer */}
      <div className="pt-3 border-t border-white/10 flex justify-between">
        <span>Total</span>
        <span className="text-lg font-semibold">{displayMoney(entry.dutyTotal)}</span>
      </div>
    </motion.div>
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
