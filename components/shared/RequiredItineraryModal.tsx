"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { DutyType, VehicleItinerary } from "@/types";
import { Button } from "@/components/ui/button";
import { isItineraryValid } from "@/lib/itinerary.validation";

import TransferForm from "../quick-booking-widget/TransferForm";
import LocalForm from "../quick-booking-widget/LocalForm";
import OutstationForm from "../quick-booking-widget/OutstationForm";

/* ================= DUTY TYPES ================= */

const DUTY_TYPES: { value: DutyType; label: string }[] = [
  { value: DutyType.TRANSFER, label: "Transfer" },
  { value: DutyType.LOCAL, label: "Local" },
  { value: DutyType.OUTSTATION, label: "Outstation" },
];

/* ================= PROPS ================= */

type Props = {
  open: boolean;
  initialValue?: Partial<VehicleItinerary>;
  onClose: () => void;
  onConfirm: (v: VehicleItinerary) => void;
};

/* ================= INTERNAL CONTENT ================= */

function ModalContent({
  initialValue,
  onClose,
  onConfirm,
}: {
  initialValue?: Partial<VehicleItinerary>;
  onClose: () => void;
  onConfirm: (v: VehicleItinerary) => void;
}) {
  const initialSnapshot = useMemo<VehicleItinerary>(
    () => ({
      dutyType: initialValue?.dutyType ?? DutyType.TRANSFER,
      reportingLocation: initialValue?.reportingLocation ?? null,
      reportingTime: initialValue?.reportingTime ?? "",
      dropLocation: initialValue?.dropLocation,
      bookingDays: initialValue?.bookingDays,
      passengerIds: initialValue?.passengerIds ?? [],
      billingEntityId: initialValue?.billingEntityId,
      clientNotes: initialValue?.clientNotes,
      flightNumber: initialValue?.flightNumber,
      packageId: initialValue?.packageId,
    }),
    [initialValue],
  );

  const [value, setValue] = useState<VehicleItinerary>(initialSnapshot);
  const canContinue = useMemo(() => isItineraryValid(value), [value]);

  const handleDutyChange = (dutyType: DutyType) => {
    setValue((prev) => ({
      dutyType,
      reportingLocation: prev.reportingLocation,
      reportingTime: prev.reportingTime,
      dropLocation: undefined,
      bookingDays: undefined,
      packageId: undefined,
      passengerIds: prev.passengerIds ?? [],
      billingEntityId: prev.billingEntityId,
      clientNotes: prev.clientNotes,
      flightNumber: prev.flightNumber,
    }));
  };

  return (
    <motion.div
      className="
        fixed bottom-0 left-0 right-0 z-50
        max-h-[90vh]

        w-full
        md:w-[60%]
        md:left-1/2 md:-translate-x-1/2

        rounded-t-3xl md:rounded-3xl
        bg-gray-200
        border-t border-neutral-200
        overflow-y-auto
      "
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 260 }}
    >
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10  bg-gray-200 px-5 pt-5 pb-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Trip details
          </h2>

          <button onClick={onClose}>
            <X className="text-neutral-500 hover:text-neutral-800" size={18} />
          </button>
        </div>

        {/* Duty Selector */}
        <div className="mt-4 flex gap-2">
          {DUTY_TYPES.map((duty) => (
            <button
              key={duty.value}
              type="button"
              onClick={() => handleDutyChange(duty.value)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm border transition
                ${
                  value.dutyType === duty.value
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                }
              `}
            >
              {duty.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-5 py-5 space-y-6">
        {value.dutyType === DutyType.TRANSFER && (
          <TransferForm value={value} onChange={setValue} />
        )}

        {value.dutyType === DutyType.LOCAL && (
          <LocalForm value={value} onChange={setValue} />
        )}

        {value.dutyType === DutyType.OUTSTATION && (
          <OutstationForm value={value} onChange={setValue} />
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="sticky bottom-0 px-5 py-4  bg-gray-200 border-t border-neutral-200">
        <Button
          className="
            w-full
            bg-neutral-900 text-white
            hover:bg-neutral-800
            active:bg-neutral-950
            transition-all duration-200
            shadow-sm hover:shadow-md

            disabled:opacity-40
            disabled:cursor-not-allowed
          "
          disabled={!canContinue}
          onClick={() => onConfirm(value)}
        >
          Continue
        </Button>
      </div>

      <div className="md:h-20"></div>
    </motion.div>
  );
}

/* ================= WRAPPER ================= */

export default function RequiredItineraryModal({
  open,
  initialValue,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="lux-modal-backdrop fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <ModalContent
            key={String(open)}
            initialValue={initialValue}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        </>
      )}
    </AnimatePresence>
  );
}
