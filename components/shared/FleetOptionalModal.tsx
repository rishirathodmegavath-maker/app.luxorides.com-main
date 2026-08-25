"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { VehicleItinerary } from "@/types";
import FleetOptionalForm from "../shared/FleetOptionalForm";

type Props = {
  open: boolean;
  value: VehicleItinerary | null;
  onClose: () => void;
  onSubmit: (v: VehicleItinerary) => void;
};

export default function FleetOptionalModal({
  open,
  value,
  onClose,
  onSubmit,
}: Props) {
  return (
    <AnimatePresence>
      {open && value && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="lux-modal-backdrop fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* SHEET */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0 z-50
              max-h-[90vh]
              w-full
              md:w-[60%]
              md:left-1/2 md:-translate-x-1/2
              rounded-t-3xl md:rounded-3xl
              bg-gray-200
              border-t border-white/10
              overflow-y-auto
            "
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            {/* HEADER */}
            <div className="sticky top-0 bg-gray-200 px-5 pt-5 pb-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-950">
                Optional Details
              </h2>

              <button onClick={onClose}>
                <X className="text-white/70" size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-5 py-0">
              <FleetOptionalForm
                value={value}
                onSubmit={onSubmit}
                onSkip={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
