"use client";

import { motion, LayoutGroup } from "framer-motion";
import Image from "next/image";

import { VehicleCatalog } from "@/types";
import { getFileUrl } from "@/utils/file-url";
import { useView } from "../views/ViewContext";

interface ExpandableCardGridProps {
  cards: VehicleCatalog[];
  renderCard?: (item: VehicleCatalog, onClick: () => void) => React.ReactNode;
  onAction?: (item: VehicleCatalog, action: "fleet" | "rent") => void;
}

export default function ExpandableCardGrid({
  cards,
  renderCard,
}: ExpandableCardGridProps) {
  const { setView } = useView();

  /* ================= OPEN ================= */
  const openCard = (item: VehicleCatalog) => {
    setView({
      name: "product",
      vehicle: item,
    });
  };

  /* ================= GRID ITEM ================= */
  const renderItem = (item: VehicleCatalog) => {
    return (
      <motion.div
        key={item.id}
        layoutId={`card-${item.id}`}
        className="w-full flex justify-center"
      >
        {renderCard ? (
          renderCard(item, () => openCard(item))
        ) : (
          <DefaultCard item={item} />
        )}
      </motion.div>
    );
  };

  return (
    <LayoutGroup>
      <div className="grid gap-6 px-2 sm:px-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {cards.map(renderItem)}
      </div>
    </LayoutGroup>
  );
}

/* ========================================================= */

function DefaultCard({ item }: { item: VehicleCatalog }) {
  return (
    <div className="lux-panel w-full max-w-[16rem] rounded-2xl overflow-hidden">
      <motion.div
        layoutId={`image-${item.id}`}
        className="relative w-full aspect-3/2"
      >
        <Image
          src={getFileUrl(item.pic) || "/placeholder-car-png.webp"}
          alt={item.name}
          fill
          className="object-contain"
        />
      </motion.div>

      <div className="p-4">
        <h3 className="text-white">{item.name}</h3>
        <p className="text-white/60">{item.brand}</p>
      </div>
    </div>
  );
}
