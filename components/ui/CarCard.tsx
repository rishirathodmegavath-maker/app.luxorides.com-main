"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { VehicleCatalog } from "@/types";
import { getFileUrl } from "@/utils/file-url";
import { displayMoney } from "@/lib/utils";
import { ArrowUpRight, Gauge, Users } from "lucide-react";

type Props = {
  car: VehicleCatalog;
  onClick?: () => void;
};

export function CarCard({ car, onClick }: Props) {
  const [prefix, highlight] = car.name.split(" ");

  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className="w-full cursor-pointer text-left"
    >
      <div className="lux-card-solid overflow-hidden rounded-[28px] p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide">
              <span className="font-extrabold text-neutral-700">
                {car.brand}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="truncate font-medium text-neutral-500">
                {car.category}
              </span>
            </div>
            <h3 className="text-xl leading-tight text-neutral-950">
              <span className="font-normal">{prefix} </span>
              <span className="font-semibold">{highlight}</span>
            </h3>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <ArrowUpRight size={16} />
          </span>
        </div>

        <div className="relative mb-3 h-32 w-full rounded-[22px] bg-white/60">
          <Image
            src={getFileUrl(car.pic) || "/placeholder-car-png.webp"}
            alt={car.name}
            fill
            className="object-contain p-3"
            unoptimized
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-2 text-neutral-700">
              <Users size={14} className="opacity-70" />
              <span className="text-xs font-medium">{car.seats || 5}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-2 text-neutral-700">
              <Gauge size={14} className="opacity-70" />
              <span className="text-xs font-medium">
                {car.horsePower || "NA"} HP
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-full bg-[#1a1a1a] px-4 py-2 leading-none text-[#f2d384]">
            <span className="text-[8px] font-medium leading-none opacity-60 tracking-wide">
              FROM
            </span>
            <span className="mt-1 text-sm font-semibold leading-none">
              {displayMoney(car.startingPrice)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
