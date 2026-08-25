"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import DefaultDutyCard from "./DefaultDutyCard";
import ExpandedDutyCard from "./ExpandedDutyCard";
import { ClientBookingEntry } from "@/types";

type Props = {
  duties: ClientBookingEntry[];
};

export default function DutyCardManager({ duties }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {duties.map((entry) => {
        const expanded = activeId === entry.dutyId;

        return (
          <motion.div
            key={entry.dutyId}
            layout
            layoutId={`duty-${entry.dutyId}`}
            onClick={() =>
              setActiveId(expanded ? null : entry.dutyId)
            }
            transition={{
              layout: {
                type: "spring",
                stiffness: 260,
                damping: 30,
                mass: 0.8,
              },
            }}
            initial={false}
            animate={{
              scale: expanded ? 1.02 : 1,
              boxShadow: expanded
                ? "0 20px 40px rgba(0,0,0,0.35)"
                : "0 4px 12px rgba(0,0,0,0.12)",
              borderRadius: expanded ? "20px" : "16px",
            }}
            className="cursor-pointer will-change-transform"
          >
            <AnimatePresence mode="wait" initial={false}>
              {!expanded ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <DefaultDutyCard entry={entry} />
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <ExpandedDutyCard entry={entry} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
