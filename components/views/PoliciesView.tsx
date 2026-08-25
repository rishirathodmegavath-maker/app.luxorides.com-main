"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { getPolicies } from "../policies/policy.service";
import { useView } from "./ViewContext";
import PolicyCard from "../policies/PolicyCard";

export default function PoliciesView() {
  const policies = getPolicies();
  const { setView } = useView();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView({ name: "account" })}
          className="lux-control p-2 rounded-full transition"
        >
          <ChevronLeft size={18} />
        </button>

        <h2 className="text-lg font-semibold">Policies & Legal</h2>
      </div>

      {/* ================= LIST ================= */}
      <div className="mx-auto max-w-2xl space-y-3">
        {policies.map((policy) => (
          <PolicyCard key={policy.type} policy={policy} />
        ))}
      </div>
    </motion.section>
  );
}
