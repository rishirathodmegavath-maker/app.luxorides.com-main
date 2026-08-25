"use client";

import { ExternalLink } from "lucide-react";
import { Policy } from "./policy.model";
import { openExternalUrl } from "@/lib/external-navigation";

type Props = {
  policy: Policy;
};

export default function PolicyCard({ policy }: Props) {
  return (
    <div
      className="
        lux-panel
        rounded-2xl
        p-4
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{policy.title}</h3>

        <span className="text-[10px] text-white/50">{policy.version}</span>
      </div>

      {/* Meta */}
      <p className="text-xs text-white/50 mt-1">
        Last updated: {policy.lastUpdated}
      </p>

      {/* Summary */}
      <ul className="mt-3 space-y-1 text-xs text-white/70 list-disc pl-4">
        {policy.summaryPoints.map((point, i) => {
          const isCritical =
            point.includes("100%") ||
            point.includes("liability") ||
            point.includes("charge");

          return (
            <li key={i} className={isCritical ? "text-rose-300" : ""}>
              {point}
            </li>
          );
        })}
      </ul>

      {/* CTA */}
      <button
        onClick={() => openExternalUrl(policy.fullUrl)}
        className="
          mt-4 flex items-center justify-center gap-2
          text-xs font-medium
          lux-control
          transition
          py-2 rounded-xl w-full
        "
      >
        Read Full Policy
        <ExternalLink size={14} />
      </button>
    </div>
  );
}
