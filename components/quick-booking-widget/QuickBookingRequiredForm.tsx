"use client";

import { VehicleItinerary, DutyType } from "@/types";
import { Button } from "@/components/ui/button";
import { isItineraryValid } from "@/lib/itinerary.validation";
import { ArrowRight, MapPin, Route, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import TransferForm from "../quick-booking-widget/TransferForm";
import LocalForm from "../quick-booking-widget/LocalForm";
import OutstationForm from "../quick-booking-widget/OutstationForm";

/* ================= ANIMATION ================= */

const TAB_ANIMATION = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
};

/* ================= DUTY TYPES ================= */

const DUTY_TYPES: { value: DutyType; label: string; helper: string }[] = [
  { value: DutyType.TRANSFER, label: "Transfer", helper: "Airport & point to point" },
  { value: DutyType.LOCAL, label: "Local", helper: "Hourly city chauffeur" },
  { value: DutyType.OUTSTATION, label: "Outstation", helper: "Multi-day intercity" },
];

/* ================= DEFAULT ================= */

function createEmptyItinerary(): VehicleItinerary {
  return {
    dutyType: DutyType.TRANSFER,
    reportingLocation: null,
    reportingTime: "",
    dropLocation: undefined,
    bookingDays: undefined,
    packageId: undefined,
    passengerIds: [],
    billingEntityId: undefined,
    clientNotes: undefined,
    flightNumber: undefined,
  };
}

/* ================= COMPONENT ================= */

type Props = {
  itinerary?: VehicleItinerary;
  onChange: (data: VehicleItinerary) => void;
  onContinue: () => void;
};

export default function QuickBookingRequiredForm({
  itinerary,
  onChange,
  onContinue,
}: Props) {
  const safeItinerary = itinerary ?? createEmptyItinerary();
  const canContinue = isItineraryValid(safeItinerary);
  const active = safeItinerary.dutyType;

  const handleDutyChange = (dutyType: DutyType) => {
    onChange({
      ...safeItinerary,
      dutyType,
      dropLocation: undefined,
      bookingDays: undefined,
      packageId: undefined,
    });
  };

  const renderForm = () => {
    switch (active) {
      case DutyType.TRANSFER:
        return <TransferForm value={safeItinerary} onChange={onChange} />;
      case DutyType.LOCAL:
        return <LocalForm value={safeItinerary} onChange={onChange} />;
      case DutyType.OUTSTATION:
        return <OutstationForm value={safeItinerary} onChange={onChange} />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="lux-card overflow-hidden rounded-[32px]">
        <div className="border-b border-white/10 px-4 pb-3 pt-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                Plan your Journey
              </p>
              <p className="text-base font-semibold text-white">Trip details</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8b25c]/16 text-[#f2d384]">
              <ShieldCheck size={19} />
            </div>
          </div>

        {/* ================= TABS ================= */}
        <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-black/22 p-1">
          {DUTY_TYPES.map((duty) => {
            const isActive = active === duty.value;
            const Icon =
              duty.value === DutyType.TRANSFER
                ? MapPin
                : duty.value === DutyType.LOCAL
                  ? Route
                  : ArrowRight;

            return (
              <motion.button
                key={duty.value}
                onClick={() => handleDutyChange(duty.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative min-h-[68px] overflow-hidden rounded-[18px] px-2 py-3 text-left transition",
                  isActive ? "text-black" : "text-white/58 hover:text-white",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    transition={TAB_ANIMATION}
                    className="absolute inset-0 z-10 rounded-[18px] bg-white"
                  />
                )}

                <span className="relative z-20 flex h-full flex-col justify-between gap-2">
                  <Icon size={16} />
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wide">
                      {duty.label}
                    </span>
                    <span className="hidden text-[10px] opacity-60 sm:block">
                      {duty.helper}
                    </span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
        </div>

        {/* ================= CARD ================= */}
        <motion.div
          layout
          className="relative z-20 min-h-[300px] bg-[#f5f1e8] p-4 text-black sm:p-5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {renderForm()}

              <Button
                className="mt-4 w-full bg-black text-white hover:bg-neutral-800"
                disabled={!canContinue}
                onClick={onContinue}
              >
                Find available cars <ArrowRight size={16} />
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
