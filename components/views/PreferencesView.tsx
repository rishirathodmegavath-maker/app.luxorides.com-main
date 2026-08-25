"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useView } from "./ViewContext";

export default function PreferencesView() {
  const { setView } = useView();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView({name:"account"})}
          className="lux-control p-2 rounded-full transition"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold">Preferences</h2>
      </div>

      {/* Content */}
      <div
        className="
          lux-card
          rounded-[28px]
          p-6
        "
      >
        <p className="text-red-400 text-center text-3xl">BETA</p>
        <p className="text-white/70 text-center">We are working on preferences.</p>
      </div>
    </motion.section>
  );
}
