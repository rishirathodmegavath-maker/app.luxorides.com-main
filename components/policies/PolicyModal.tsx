"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

import { Policy } from "./policy.model";
import { openExternalUrl } from "@/lib/external-navigation";

type Props = {
  open: boolean;
  policy: Policy | null;
  onClose: () => void;
};

export default function PolicyModal({ open, policy, onClose }: Props) {
  if (typeof window === "undefined") return null;

  const isCritical = (point: string) =>
    point.includes("100%") ||
    point.includes("liability") ||
    point.includes("charge");

  const hasCritical = policy?.summaryPoints.some((p) => isCritical(p)) ?? false;

  return createPortal(
    <AnimatePresence>
      {open && policy && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lux-modal-backdrop fixed inset-0 z-[999]"
          />

          {/* SHEET */}
          <motion.div
            initial={{ y: 140 }}
            animate={{ y: 0 }}
            exit={{ y: 140 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="
              fixed inset-x-0 bottom-0 z-[1000]
              max-h-[88vh] overflow-y-auto
              rounded-t-3xl
              bg-white text-black
              px-5 pt-4 pb-6 md:w-[60%]
               md:left-1/2 md:-translate-x-1/2
            "
          >
            {/* Drag Handle */}
            <div className="w-10 h-1.5 bg-black/20 rounded-full mx-auto mb-4" />

            {/* HEADER */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold leading-tight">
                  {policy.title}
                </h3>

                <p className="text-[11px] text-black/50 mt-1">
                  Version {policy.version} • Updated {policy.lastUpdated}
                </p>

                {hasCritical && (
                  <p className="mt-2 text-[11px] text-rose-600 font-medium">
                    Important conditions apply
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="
                  p-2 rounded-full 
                  bg-black/5 hover:bg-black/10
                  transition
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT (Clean, no lines, no pills) */}
            <div className="space-y-3">
              {policy.summaryPoints.map((point, i) => {
                const critical = isCritical(point);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="flex gap-3 items-start"
                  >
                    {/* Indicator */}
                    <div
                      className={`
                        mt-1.5 h-1.5 w-1.5 rounded-full
                        ${critical ? "bg-rose-500" : "bg-black/40"}
                      `}
                    />

                    {/* Text */}
                    <p
                      className={`
                        text-sm leading-relaxed
                        ${
                          critical
                            ? "text-rose-600 font-medium"
                            : "text-black/80"
                        }
                      `}
                    >
                      {point}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA SECTION */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => openExternalUrl(policy.fullUrl)}
                className="
                  w-full flex items-center justify-center gap-2
                  text-sm font-medium
                  bg-black/5 hover:bg-black/10
                  active:scale-[0.98]
                  transition
                  py-3 rounded-xl
                "
              >
                View Full Policy
                <ExternalLink size={16} />
              </button>

              <p className="text-[10px] text-black/40 text-center">
                Full legal document opens in browser
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
